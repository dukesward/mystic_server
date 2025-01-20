import { ApplicationPropertySource } from "./application";
import { ObjectMap, SimpleMap } from "./data_structure";
import { AppLoggerBuilder, Logger } from "./logger";
import { ConfigDataResource, Resource } from "./resource_loader";
import { ObjectConfigLocation, ObjectResolvedConfig } from "./types";

enum ConfigDataContributorKind {
  EXISTING,
  INITIAL,
  UNBOUND,
  BOUND
}

interface ConfigDataResolver {
  resolve(location: ObjectConfigLocation): ConfigDataResource<any>[]
  resolvable(location: ObjectConfigLocation): boolean
}

interface PropertySourceLoader {
  getFileExtensions(): string[]
  load<T>(name: string, resource: Resource<T>): ApplicationPropertySource<T>
}

class ConfigDataLoader {
  
}

class ConfigDataProperties {
  private imports: ObjectConfigLocation[]
  constructor(imports: ObjectConfigLocation[]) {
    this.imports = imports;
  }
  getImports(): ObjectConfigLocation[] {
    return this.imports;
  }
}

class ConfigDataContributor {
  private kind: ConfigDataContributorKind
  private location: ObjectConfigLocation | null
  private propertySource: ApplicationPropertySource<any> | null
  private properties?: ConfigDataProperties
  constructor(
    kind: ConfigDataContributorKind,
    propertySource: ApplicationPropertySource<any> | null,
    location: ObjectConfigLocation | null,
    properties?: ConfigDataProperties
  ) {
    this.kind = kind;
    this.propertySource = propertySource;
    this.location = location;
    if(properties) this.properties = properties;
  }
  isInitial(): boolean {
    return this.kind === ConfigDataContributorKind.INITIAL;
  }
  getKind(): ConfigDataContributorKind {
    return this.kind;
  }
  getImports(): ObjectConfigLocation[] | null {
    return this.properties ? this.properties.getImports() : null;
  }
}

class ConfigDataImporter {
  private loadedLocations: ObjectConfigLocation[] = []
  private resolvers: ConfigDataResolver[]
  private logger: Logger
  constructor(resolvers?: ConfigDataResolver[]) {
    this.resolvers = resolvers || [];
    this.logger = AppLoggerBuilder.build({instance: this});
  }
  resolve(locations: ObjectConfigLocation[], profile?: string): ObjectMap<ObjectResolvedConfig> | null {
    try {
      let resolved: ObjectResolvedConfig[] = [];
      for(let location of locations) {
        for(let resolver of this.resolvers) {
          this.logger.debug(resolver);
          if(resolver.resolvable(location)) {
            let resources: ConfigDataResource<any>[] = resolver.resolve(location);
            for(let resource of resources) {
              resolved.push(
                {
                  location: location,
                  resource: resource,
                  profile: profile || null
                }
              );
            }
          }
        }
      }
      return this.loadConfigs(resolved);
    }catch (err) {
      this.logger.error(`config data locations ${locations} failed to resolve`);
      return null;
    }
  }
  getLoadedLocations(): ObjectConfigLocation[] {
    return this.loadedLocations;
  };
  loadConfigs(configs: ObjectResolvedConfig[]): ObjectMap<ObjectResolvedConfig> {
    let map: ObjectMap<ObjectResolvedConfig> = new SimpleMap();
    for(let config of configs) {
      let location = config.location;
      let resource = config.resource;
      try {

      }catch(err) {

      }
    }
    return map;
  }
}

export {
  ConfigDataProperties,
  PropertySourceLoader,
  ConfigDataContributorKind,
  ConfigDataContributor,
  ConfigDataResolver,
  ConfigDataImporter
}