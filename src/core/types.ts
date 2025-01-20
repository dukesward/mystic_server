import { ApplicationPropertySource } from "./application"
import { ObjectProperty } from "./object_functions"
import { ConfigDataResource } from "./resource_loader"

type Consumer<T> = (t: T) => void
type Supplier<T> = () => T
type Predicate<T> = (t: T) => boolean
type Converter<K, V> = (k: K) => V

type JsonObject = { [key: string]: any }

type GenericConstructor = { new (...args: any[]): any }
type GenericConstructorParameters<T extends GenericConstructor> = T extends new (...args: infer P) => any ? P : never

type ObjectInstance<T> = {
  instance: T
}

type ObjectClassExport = {
  objectId?: string
  object: GenericConstructor
  order?: number
  source?: () => any
}

type ObjectDefinition = {
  className: string
  type: string
  scope?: string
  parent?: string
  classDefinition: ObjectClassExport
}

type ObjectLoadingConfig = {
  name: string
  module?: string
  type: string
}

type ObjectPriority = {
  name: string
  type: string
  order: number
}

type ObjectConfigLocation = {
  value: string
  origin: string | null
}

type ObjectConfigProperty = {
  prop: ObjectProperty,
  source: ApplicationPropertySource<any>,
  value: any,
  origin: string | null
}

type ObjectResolvedConfig = {
  location: ObjectConfigLocation,
  resource: ConfigDataResource<any>,
  profile: string | null
}

type ObjectConfigCatalog<T> = {[name: string]: T}
type ObjectConfigDictionary<T> = ObjectConfigCatalog<T[]>

type ObjectType<T> = {
  type: string
  value: Supplier<T> | null
}

interface BiPredicate<T, U> {
  test(t: T, u: U): boolean
  and(other: BiPredicate<T, U>): boolean
  or(other: BiPredicate<T, U>): boolean
  negate(other: BiPredicate<T, U>): boolean
}

export type {
  Consumer,
  Supplier,
  Predicate,
  BiPredicate,
  Converter,
  JsonObject,
  GenericConstructor,
  GenericConstructorParameters,
  ObjectInstance,
  ObjectClassExport,
  ObjectDefinition,
  ObjectLoadingConfig,
  ObjectPriority,
  ObjectResolvedConfig,
  ObjectConfigLocation,
  ObjectConfigProperty,
  ObjectType,
  ObjectConfigCatalog,
  ObjectConfigDictionary
}