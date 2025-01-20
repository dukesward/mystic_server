import { ApplicationPropertySource } from "@core/application";
import { ObjectBindable, ObjectBindContext, ObjectBinder, ObjectBindHandler, ObjectBindResult, ObjectConversionService, ObjectConverters } from "@core/object_properties";
import { ObjectBindableProperty, ObjectConfigProperty } from "./config";
import { ObjectProperty } from "@core/object_functions";
import { Resource } from "@core/decorators";
import { InvalidBinding, NullArgument } from "@core/exceptions";
import { AppLogger } from "@core/logger";
import { BootstrapObjectConversionService } from "./object_functions";
import { ObjectType } from "@core/types";

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

class ObjectConfigPropertyBindContext implements ObjectBindContext {
  private sources: ApplicationPropertySource<any>[]
  constructor(sources?: ApplicationPropertySource<any>[]) {
    this.sources = sources || [];
  }
  getSources(): ApplicationPropertySource<any>[] {
    return this.sources;
  }
}

@Resource(["sources:applicationPropertySources"])
class ObjectConfigPropertyBinder implements ObjectBinder {
  private sources!: ApplicationPropertySource<any>[]
  private converters: ObjectConverters
  constructor(services?: ObjectConversionService[]) {
    this.converters = new ObjectConverters();
    if(services) {
      this.converters.addServices(services);
    }
    if(!services?.length) this.converters.addService(new BootstrapObjectConversionService());
  }
  bind<T>(prop: string, bindable: ObjectBindable<T>, handler?: ObjectBindHandler<T>): ObjectBoundProperty<T> {
    return this.bindInitial(prop, bindable);
  }
  bindType<T>(prop: string, bindable: ObjectType<T>): ObjectBoundProperty<T> {
    return this.bindInitial(prop, new ObjectBindableProperty(bindable));
  }
  bindInitial<T>(prop: string, bindable: ObjectBindable<T>, context?: ObjectBindContext, handler?: ObjectBindHandler<T>): ObjectBoundProperty<T> {
    let configProp = this.ofProperty(prop);
    return this.bindProperty(configProp, bindable, context || new ObjectConfigPropertyBindContext());
  }
  bindProperty<T>(prop: ObjectProperty, bindable: ObjectBindable<T>, context: ObjectBindContext, handler?: ObjectBindHandler<T>): ObjectBoundProperty<T> {
    if(prop.empty()) {
      throw new NullArgument('binding property');
    }else if(!bindable.getType()) {
      throw new NullArgument('type of bindable target');
    }
    try {
      if(handler) {
        let replacedBindable: ObjectBindable<T> = handler.onStart(prop, bindable);
        if(!replacedBindable) {

        }else {
          bindable = replacedBindable;
        }
      }
      let target: T | null = this.bindObject(prop, bindable, context, handler);
      if(target) {
        
      }
      let converted = this.convert(prop, target, bindable.getType());
      return new ObjectBoundProperty(converted);
    }catch (err) {
      AppLogger.error(err);
      throw new InvalidBinding(prop.getFullName());
    }
  }
  ofProperty(prop: string): ObjectProperty {
    return new ObjectConfigProperty(prop);
  }
  bindObject<T>(prop: ObjectProperty, bindable: ObjectBindable<T>, context: ObjectBindContext, handler?: ObjectBindHandler<T>): any | null {
    // search object property in the property sources
    let configureProp: ObjectConfigProperty | null = null;
    for(let source of context.getSources()) {
      if(source.containsProperty(prop)) {
        configureProp = source.getProperty(prop);
        break;
      }
    }
    if(!configureProp) {
      return null;
    }
    return null;
  }
  convert<T>(prop: ObjectProperty, source: any, targetType: ObjectType<T>): any {

  }
}

const objectBinder = [
  {object: ObjectConfigPropertyBinder}
]

export {
  ObjectBoundProperty,
  ObjectConfigPropertyBindContext,
  ObjectConfigPropertyBinder,
  objectBinder
}