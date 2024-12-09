import { ObjectProperty } from "./object_functions"
import { ObjectType } from "./types"


type ObjectBindHandler<T> = {
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

interface ObjectBinder {
  bind<T>(prop: string, bindable: ObjectBindable<T>): ObjectBindResult<T>
  bindProperty<T>(prop: ObjectProperty, bindable: ObjectBindable<T>): ObjectBindResult<T>
}

interface ObjectConverter {
  convert<T>(source: any, sourceType: ObjectType<T>, targetType: ObjectType<T>): T;
}

interface ObjectConversionService<S, T> {
  canConvert(sourceType: ObjectType<S>, targetType: ObjectType<T>): boolean
  convert(source: S): T
}

export type {
  ObjectBindHandler
}

export {
  ObjectBindResult,
  ObjectBindable,
  ObjectBinder,
  ObjectConverter,
  ObjectConversionService
}