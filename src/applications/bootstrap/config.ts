import { ConfigDataContributor, ConfigDataImporter, ConfigDataResolver } from "@core/config";
import { ObjectBindable, ObjectBinder } from "@core/object_properties";
import { ObjectArrayList, ObjectIterable, ObjectList, ObjectListNode, ObjectMap, SimpleArrayList, SimpleLinkedList } from "@core/data_structure";
import { ObjectProperty } from "@core/object_functions";
import { Consumer, ObjectClassExport, ObjectConfigLocation, ObjectResolvedConfig, ObjectType } from "@core/types";
import { AppLogger, AppLoggerBuilder, Logger } from "@core/logger";
import { ConfigDataResource, ResourceLoader } from "@core/resource_loader";
import { Resource } from "@core/decorators";
import { MethodNotImplemented } from "@core/exceptions";
import path from "path";

const OBJ_CONFIG_SPLITTER = ".";
const CONFIG_NAME_PROPERTY = "spring.config.name";

class ObjectConfigProperty implements ObjectProperty {
  private elements: ObjectArrayList<string>
  private fullName: string
  constructor(element: string) {
    this.fullName = element;
    this.elements = new SimpleArrayList<string>(element.split(OBJ_CONFIG_SPLITTER));
  }
  getFullName(): string {
    return this.fullName;
  }
  empty(): boolean {
    return this.elements && this.elements.size() > 0
  }
  getElement(i: number): string | null {
    return this.elements.size() > i ? this.elements.get(i) : null
  }
}

class ObjectBindableProperty<T> implements ObjectBindable<T> {
  private type: ObjectType<T>
  constructor(type: ObjectType<T>) {
    this.type = type;
  }
  getType(): ObjectType<T> {
    return this.type;
  }
}

class StandardConfigDataReference {
  private configLocation: ObjectConfigLocation
  private resourceLocation: string
  private directory: string
  private profile?: string
  constructor(
    location: ObjectConfigLocation, directory: string, extension?: string, profile?: string) {
      this.configLocation = location
      this.directory = directory
      this.resourceLocation = extension || ''
      if(profile) this.profile = profile
  }
}

@Resource(["binder:objectBinder", "resourceLoader:configResourceLoader"])
class StandardConfigDataResolver implements ConfigDataResolver {
  private binder!: ObjectBinder
  private resourceLoader!: ResourceLoader<any>
  private configNames!: string[]
  private logger: Logger 
  constructor() {
    this.logger = AppLoggerBuilder.build({instance: this});
    this.configNames = this.getConfigNames(this.binder);
    this.logger.debug("StandardConfigDataResolver config names " + this.configNames);
  }
  getConfigNames(binder: ObjectBinder): string[] {
    let strings: string[] = [];
    return binder.bindType(CONFIG_NAME_PROPERTY, { type: "Array.String", value: () => strings }).orElse(["application"]) || [];
  }
  getBinder(): ObjectBinder {
    return this.binder;
  }
  getReference(configLocation: ObjectConfigLocation): StandardConfigDataReference[] {
    let resourceLocation: string = this.getResourceLocation(configLocation);
    if(resourceLocation.endsWith("/") || resourceLocation.endsWith(path.sep)) {
      return this.getResourceFromDirectory(resourceLocation);
    }
    return this.getResourceFromFile(resourceLocation);
  }
  getResourceLocation(configLocation: ObjectConfigLocation): string {
    let resourceLocation: string = configLocation.value;
    let urlMatcher = /^([a-zA-Z][a-zA-Z0-9*]*?:)(.*$)/;
    let isAbsolutePath: boolean = resourceLocation.startsWith("/") || urlMatcher.test(resourceLocation);
    this.logger.debug(`getResourceLocation: isAbsolutePath? ${isAbsolutePath}`);
    if(isAbsolutePath) {
      return resourceLocation;
    }
    return __dirname + resourceLocation;
  }
  getResourceFromDirectory(directory: string): StandardConfigDataReference[] {
    let references: StandardConfigDataReference[] = [];
    for(let configName of this.configNames) {
      this.resourceLoader.getResources("propertySourceLoader", (objs: ObjectClassExport[]) => {

      });
    }
    return references;
  }
  getResourceFromFile(directory: string): StandardConfigDataReference[] {
    throw new MethodNotImplemented("StandardConfigDataResolver::getResourceFromFile");
  }
  resolve(location: ObjectConfigLocation): ConfigDataResource<any>[] {
    let resolved: ConfigDataResource<any>[] = [];
    let reference: StandardConfigDataReference[] = this.getReference(location);
    return resolved;
  }
  resolvable(location: ObjectConfigLocation): boolean {
    return true;
  }
}

class ConfigDataContributors implements ObjectIterable<ConfigDataContributor> {
  private contributors: ObjectList<ConfigDataContributor> | null
  private current: number = 0
  private logger: Logger
  constructor(contributors: ObjectList<ConfigDataContributor>) {
    this.logger = AppLoggerBuilder.build({instance: this});
    this.contributors = contributors;
  }
  withProcessedImports(importer: ConfigDataImporter): void {
    while(true) {
      let contributor: ConfigDataContributor | null = this.getNext();
      if(!contributor) {
        return;
      }
      // let contributor = node.get();
      if(contributor) {
        let imports: ObjectConfigLocation[] | null = contributor.getImports();
        this.logger.debug(`Processing imports ${imports}`);
        if(!imports) {
          this.logger.debug("No imports found, skip contributor");
          continue;
        }
        let imported: ObjectMap<ObjectResolvedConfig> | null = importer.resolve(imports);
        if(imported) {
          this.logger.debug(`Imported ${imported}`);
          break;
        }
      }else {
        return;
      }
    }
  }
  each(action: Consumer<ConfigDataContributor>): void {
    throw new MethodNotImplemented("ConfigDataContributors::each");
  }
  size(): number {
    throw new MethodNotImplemented("ConfigDataContributors::size");
  }
  getNext(): ConfigDataContributor | null {
    if(this.contributors) {
      let contributor = this.contributors.get(this.current++);
      if(contributor && !contributor.empty()) {
        return contributor.get();
      }
    }
    return null;
  }
  addAll(contributors: ConfigDataContributor[]): void {
    if(!this.contributors) {
      this.contributors = new SimpleLinkedList<ConfigDataContributor>();
    }
    this.contributors.addAll(contributors);
  }
  [Symbol.iterator](): Iterator<ConfigDataContributor | null, any, any> {
    throw new MethodNotImplemented("ConfigDataContributors::Symbol.iterator");
  }
}

const configDataResolver = [
  {object:StandardConfigDataResolver}
];

export {
  ObjectConfigProperty,
  ObjectBindableProperty,
  ConfigDataContributors,
  StandardConfigDataResolver,
  configDataResolver
}