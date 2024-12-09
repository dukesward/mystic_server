import { ApplicationPropertySource } from "./application";
import { AppLogger } from "./logger";
import { ConfigDataResource } from "./resource_loader";
import { ObjectConfigLocation, ObjectResolvedConfig } from "./types";

enum ConfigDataContributorKind {
  EXISTING,
  INITIAL,
  UNBOUND,
  BOUND
}

interface ConfigDataResolver {
  resolve(location: ObjectConfigLocation): ConfigDataResource<any>
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
  constructor(resolvers?: ConfigDataResolver[]) {
    this.resolvers = resolvers || [];
  }
  resolve(locations: ObjectConfigLocation[], profile?: string): ObjectResolvedConfig[] {
    try {
      let resolved: ObjectResolvedConfig[] = [];
      for(let location of locations) {
        for(let resolver of this.resolvers) {

        }
      }
      return resolved;
    }catch (err) {
      AppLogger.error(`config data locations ${locations} failed to resolve`);
      return [];
    }
  }
  getLoadedLocations(): ObjectConfigLocation[] {
    return this.loadedLocations;
  };
}

export {
  ConfigDataProperties,
  ConfigDataContributorKind,
  ConfigDataContributor,
  ConfigDataResolver,
  ConfigDataImporter
}