import { ApplicationEnvironment, ApplicationPropertySource } from "@core/application";
import { ObjectBindable, ObjectBinder } from "@core/object_properties";
import { ObjectBoundProperty, ObjectConfigProperty } from "./config";
import { ObjectProperty } from "@core/object_functions";
import { ObjectArrayList, SimpleArrayList } from "@core/data_structure";

class ObjectConfigPropertyBinder implements ObjectBinder {
  private sources: ApplicationPropertySource<any>[]
  constructor(environment: ApplicationEnvironment) {
    this.sources = environment.getPropertySources().toList();
  }
  bind<T>(prop: string, bindable: ObjectBindable<T>): ObjectBoundProperty<T> {
    return this.bindProperty(this.ofProperty(prop), bindable);
  }
  bindProperty<T>(prop: ObjectProperty, bindable: ObjectBindable<T>): ObjectBoundProperty<T> {
    throw new Error("Method not implemented.");
  }
  ofProperty(prop: string): ObjectProperty {
    let elements: string[] = prop.split('.');
    let list: ObjectArrayList<string> = new SimpleArrayList(elements);
    return new ObjectConfigProperty(list);
  }
}

const objectBinder = [
  {object: ObjectConfigPropertyBinder}
]

export {
  ObjectConfigPropertyBinder,
  objectBinder
}