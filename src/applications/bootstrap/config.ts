import { ConfigDataContributor, ConfigDataImporter, ConfigDataResolver } from "@core/config";
import { ObjectBindResult, ObjectBindable, ObjectBinder } from "@core/object_properties";
import { ObjectIterable, ObjectList, ObjectListNode } from "@core/data_structure";
import { ObjectProperty } from "@core/object_functions";
import { Consumer, ObjectConfigLocation, ObjectType } from "@core/types";
import { AppLogger } from "@core/logger";
import { ConfigDataResource, ResourceLoader } from "@core/resource_loader";
import { Autowired } from "@core/decorators";

class ObjectBoundProperty<T> implements ObjectBindResult<T> {
  private value: T | null
  constructor(value: T | null) {
    this.value = value
  }
  get(): T | null {
    return this.value;
  }
  isBound(): boolean {
    return this.value !== null;
  }
  orElse(other: T | null): T | null {
    return this.value != null ? this.value : other;
  }
}

class ObjectConfigProperty implements ObjectProperty {
  private elements: ObjectList<string>
  constructor(elements: ObjectList<string>) {
    this.elements = elements;
  }
  empty(): boolean {
    return this.elements && this.elements.size() > 0
  }
  getElement(i: number): string | null {
    return this.elements.size() > i ? this.elements.get(i).get() : null
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

@Autowired(["objectBinder", "configResourceLoader"])
class StandardConfigDataResolver implements ConfigDataResolver {
  private binder!: ObjectBinder
  private resourceLoader!: ResourceLoader<any>
  /*constructor(binder: ObjectBinder, resourceLoader: ResourceLoader<any>) {
    this.binder = binder;
    this.resourceLoader = resourceLoader;
  }*/
  getBinder(): ObjectBinder {
    return this.binder;
  }
  resolve(location: ObjectConfigLocation): ConfigDataResource<any> {
    AppLogger.debug('StandardConfigDataResolver::resolve');
    throw new Error("Method not implemented.");
  }
}

class ConfigDataContributors implements ObjectIterable<ConfigDataContributor> {
  private contributors: ObjectListNode<ConfigDataContributor> | null
  constructor(contributors: ObjectList<ConfigDataContributor>) {
    this.contributors = contributors.get(0);
  }
  withProcessedImports(importer: ConfigDataImporter): void {
    while(true) {
      let node: ObjectListNode<ConfigDataContributor> | null = this.getNext();
      if(!node || node.empty()) {
        return;
      }
      let contributor = node.get();
      if(contributor) {
        let imports: ObjectConfigLocation[] | null = contributor.getImports();
        AppLogger.debug(`Processing imports ${imports}`);
        if(imports) {
          let imported = importer.resolve(imports);
        }
      }else {
        return;
      }
    }
  }
  each(action: Consumer<ConfigDataContributor>): void {
    throw new Error("Method not implemented.");
  }
  size(): number {
    throw new Error("Method not implemented.");
  }
  getNext(): ObjectListNode<ConfigDataContributor> | null {
    if(this.contributors) this.contributors = this.contributors.next();
    return this.contributors;
  }
  addAll(contributors: ConfigDataContributor[]): void {

  }
  [Symbol.iterator](): Iterator<ConfigDataContributor | null, any, any> {
    throw new Error("Method not implemented.");
  }
}

const configDataResolver = [
  {object:StandardConfigDataResolver}
];

export {
  ObjectBoundProperty,
  ObjectConfigProperty,
  ObjectBindableProperty,
  ConfigDataContributors,
  StandardConfigDataResolver,
  configDataResolver
}