import { ConfigDataResource } from "./resource_loader"

type Consumer<T> = (t: T) => void
type Supplier<T> = () => T
type Predicate<T> = (t: T) => boolean
type Converter<K, V> = (k: K) => V

type JsonObject = { [key: string]: any }

type GenericConstructor = { new(...args: any[]): any }

type ObjectClassExport = {
  object: GenericConstructor,
  order?: number
}

type ObjectDefinition = {
  className: string
  scope: string
  parent?: string
  dependencies: string[]
  loading: ObjectLoadingConfig
  supplier: GenericConstructor
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
  origin: string
}

type ObjectResolvedConfig = {
  location: ObjectConfigLocation,
  resource: ConfigDataResource<any>,
  profile: string | null
}

type ObjectType<T> = {
  type: string
  value: Supplier<T> | null
}

type ObjectConfigDictionary<T> = {[name: string]: T[]}

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
  ObjectClassExport,
  ObjectDefinition,
  ObjectLoadingConfig,
  ObjectPriority,
  ObjectResolvedConfig,
  ObjectConfigLocation,
  ObjectType,
  ObjectConfigDictionary
}