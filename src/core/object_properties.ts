import { ApplicationPropertySource } from "./application"
import { MethodNotImplemented } from "./exceptions"
import { ObjectProperty } from "./object_functions"
import { ObjectConfigCatalog, ObjectType, Supplier } from "./types"

const ObjectConvertables: ObjectConfigCatalog<Supplier<any>> = {

}

type ObjectBindHandler<T> = {
  onStart: (prop: ObjectProperty, bindable: ObjectBindable<T>) => ObjectBindable<T>
  onSuccess: (prop: ObjectProperty, bindable: ObjectBindable<T>, result: ObjectBindResult<T>) => any
}

interface ObjectBindResult<T> {
  get(): T | null
  isBound(): boolean
  orElse(other: T | null): T | null
}

interface ObjectBindable<T> {
  getType(): ObjectType<T>
}

interface ObjectBindContext {
  getSources(): ApplicationPropertySource<any>[]
}

interface ObjectBinder {
  bind<T>(prop: string, bindable: ObjectBindable<T>, handler?: ObjectBindHandler<T>): ObjectBindResult<T>
  bindType<T>(prop: string, bindable: ObjectType<T>): ObjectBindResult<T>
  bindProperty<T>(prop: ObjectProperty, bindable: ObjectBindable<T>, context: ObjectBindContext, handler?: ObjectBindHandler<T>): ObjectBindResult<T>
}

type ObjectConverter<S, T> = 
T extends Supplier<infer O> ? 
{convert: (source: S, supplier: Supplier<O>) => O} : 
T extends ObjectType<infer O> ? {convert: (source: S, supplier: ObjectType<O>) => O} :
{convert: (source: S, supplier?: any) => T}

interface ObjectConversionService {
  addConverter<S, T>(sourceType: ObjectType<S>, targetType: ObjectType<T>, converter: ObjectConverter<S, T>): void
  canConvert<S, T>(source: any, sourceType: ObjectType<S>, targetType: ObjectType<T>): boolean
  convert<S, T>(source: any, sourceType: ObjectType<S>, targetType: ObjectType<T>): T
}

class GenericConversionService implements ObjectConversionService {
  private cachedConverters: ObjectConfigCatalog<ObjectConverter<any, any>> = {}
  addConverter<S, T>(
    sourceType: ObjectType<S>, targetType: ObjectType<T>, converter: ObjectConverter<S, T>): void {
      let objectType: string = sourceType.type + '->' + targetType.type;
      this.cachedConverters[objectType] = converter;
  }
  canConvert<S, T>(source: any, sourceType: ObjectType<S>, targetType: ObjectType<T>): boolean {
    throw new MethodNotImplemented("GenericConversionService::canConvert");
  }
  convert<S, T>(source: any, sourceType: ObjectType<S>, targetType: ObjectType<T>): T {
    throw new MethodNotImplemented("GenericConversionService::convert");
  }
}

class ObjectConverters {
  private converters: ObjectConversionService[]
  constructor() {
    this.converters = [];
  }
  addService(service: ObjectConversionService): void {
    this.converters.push(service);
  }
  addServices(services: ObjectConversionService[]): void {
    for(let service of services) {
      this.converters.push(service);
    }
  }
}


export type {
  ObjectBindHandler
}

export {
  ObjectBindResult,
  ObjectBindable,
  ObjectBinder,
  ObjectBindContext,
  ObjectConverter,
  ObjectConversionService,
  GenericConversionService,
  ObjectConverters
}