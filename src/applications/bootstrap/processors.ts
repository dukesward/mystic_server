import { ApplicationContext, ApplicationEnvironment, ApplicationPropertySource } from "@core/application";
import { ConfigDataContributor, ConfigDataContributorKind, ConfigDataImporter, ConfigDataProperties, ConfigDataResolver } from "@core/config";
import { ObjectBinder } from "@core/object_properties";
import { ObjectList, ObjectMap, SimpleLinkedList } from "@core/data_structure";
import { EnvironmentPostProcessor } from "@core/processors";
import { ObjectClassExport, ObjectConfigLocation } from "@core/types";
import { ConfigDataContributors, ObjectBindableProperty } from "./config";
import { AppLogger } from "@core/logger";
import { ObjectConfigPropertyBinder } from "./object_properties";

const CONFIG_LOCATION_PROPERTY = "default.config.location";


class ConfigDataEnvironmentPostProcessor implements EnvironmentPostProcessor {
  private contributors?: ConfigDataContributors
  postProcessEnvironment(context: ApplicationContext, environment: ApplicationEnvironment): void {
    let binder: ObjectBinder = new ObjectConfigPropertyBinder(environment);
    let importer: ConfigDataImporter = new ConfigDataImporter(this.createConfigDataResolvers(context));
    let contributors: ConfigDataContributors = this.getContributors(environment, binder, importer);
    this.applyToEnvironment(environment, contributors, importer.getLoadedLocations());
  }
  createConfigDataResolvers(context: ApplicationContext): ConfigDataResolver[] {
    let resolvers: ConfigDataResolver[] = [];
    context.getResourceLoader().getResources("configDataResolver", (clazzes: ObjectClassExport[]) => {
      for(let clazz of clazzes) {
        resolvers.push(new clazz.object());
      }
    });
    return resolvers;
  }
  getContributors(
    environment: ApplicationEnvironment, binder: ObjectBinder, importer: ConfigDataImporter): ConfigDataContributors {
    if(!this.contributors) {
      let list: ObjectList<ConfigDataContributor> = new SimpleLinkedList();
      let sources: ObjectMap<ApplicationPropertySource<any>> = environment.getPropertySources();
      for(let source of sources) {
        if(source) {
          list.add(new ConfigDataContributor(ConfigDataContributorKind.EXISTING, source, null));
        }
      }
      let initialContributors: ConfigDataContributor[] = [];
      let defaultConfigLocations: ObjectConfigLocation[] = [];
      let initialLocations: ObjectConfigLocation[] | null = binder
      .bind<ObjectConfigLocation[]>(CONFIG_LOCATION_PROPERTY, new ObjectBindableProperty({
        type: "Array.ObjectConfigLocation",
        value: null
      }))
      .orElse(defaultConfigLocations);
      if(initialLocations) {
        let properties: ConfigDataProperties = new ConfigDataProperties(initialLocations);
        initialContributors.push(
          new ConfigDataContributor(ConfigDataContributorKind.INITIAL, null, null, properties)
        );
      }
      this.contributors = new ConfigDataContributors(list);
      this.contributors.addAll(initialContributors);
      AppLogger.debug(this.contributors);
      this.contributors.withProcessedImports(importer);
    }
    return this.contributors;
  }
  applyToEnvironment(
    environment: ApplicationEnvironment, contributors: ConfigDataContributors, locations: ObjectConfigLocation[]): void {

  }
}

const environmentPostProcessor = [
  {object:ConfigDataEnvironmentPostProcessor}
];

export {
  ConfigDataEnvironmentPostProcessor,
  environmentPostProcessor
}