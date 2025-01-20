import { ApplicationContext, ApplicationEnvironment, ApplicationPropertySource } from "@core/application";
import { ConfigDataContributor, ConfigDataContributorKind, ConfigDataImporter, ConfigDataProperties, ConfigDataResolver } from "@core/config";
import { ObjectBinder } from "@core/object_properties";
import { ObjectList, ObjectMap, SimpleLinkedList } from "@core/data_structure";
import { EnvironmentPostProcessor } from "@core/processors";
import { ObjectClassExport, ObjectConfigLocation } from "@core/types";
import { ConfigDataContributors, ObjectBindableProperty } from "./config";
import { AppLoggerBuilder, Logger } from "@core/logger";
import { ObjectConfigPropertyBinder } from "./object_properties";
import { ObjectDefinitionPostProcessor, ObjectFactory } from "@src/core/object_factory";

const CONFIG_LOCATION_PROPERTY = "default.config.location";


class ConfigDataEnvironmentPostProcessor implements EnvironmentPostProcessor {
  private contributors?: ConfigDataContributors
  private logger: Logger
  constructor() {
    this.logger = AppLoggerBuilder.build({instance: this});
  }
  async postProcessEnvironment(context: ApplicationContext, environment: ApplicationEnvironment): Promise<void> {
    let binder: ObjectBinder = new ObjectConfigPropertyBinder();
    let importer: ConfigDataImporter = new ConfigDataImporter(await this.createConfigDataResolvers(context));
    let contributors: ConfigDataContributors = this.getContributors(environment, binder, importer);
    this.applyToEnvironment(environment, contributors, importer.getLoadedLocations());
  }
  async createConfigDataResolvers(context: ApplicationContext): Promise<ConfigDataResolver[]> {
    let resolvers: ConfigDataResolver[] = [];
    await context.getResourceLoader().getResources("configDataResolver", (clazzes: ObjectClassExport[]) => {
      for(let clazz of clazzes) {
        let obj = new clazz.object();
        resolvers.push(obj);
      }
      // this.logger.debug(resolvers);
    });
    this.logger.debug("resolvers loaded");
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
      let defaultConfigLocations: ObjectConfigLocation[] = [{value: "src/resources", origin: null}];
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
      this.contributors.withProcessedImports(importer);
    }
    return this.contributors;
  }
  applyToEnvironment(
    environment: ApplicationEnvironment, contributors: ConfigDataContributors, locations: ObjectConfigLocation[]): void {

  }
}

class ConfigObjectPostProcessor implements ObjectDefinitionPostProcessor {
	_environment: ApplicationEnvironment
  private logger: Logger
	constructor(environment: ApplicationEnvironment) {
		this._environment = environment;
    this.logger = AppLoggerBuilder.build({instance: this});
	}
	postProcess(context: ApplicationContext, factory: ObjectFactory): void {
		this.logger.debug('Post process config objects');
    this.loadApplicationConfigurations(context);
	}
  async loadApplicationConfigurations(context: ApplicationContext) {
    let objectLoader = context.getObjectLoader();
    // let configs: ObjectConfigLocation[] = [{value: "src/core", origin: null}];
  }
}

const environmentPostProcessor = [
  {object:ConfigDataEnvironmentPostProcessor}
];

const objectDefinitionPostProcessor = [
  {object:ConfigObjectPostProcessor}
]

export {
  ConfigDataEnvironmentPostProcessor,
  environmentPostProcessor,
  objectDefinitionPostProcessor
}