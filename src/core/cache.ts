import { ObjectHashMap, ObjectMap, SimpleMap } from "./data_structure";
import { MethodNotImplemented } from "./exceptions";

interface CacheKey<T> {
  match(key: ObjectMap<T>): boolean
}

interface CacheObject<K, V> {
  get(key: K): V | null
  put(key: K, val: V): void
}

abstract class GenericCacheMap<K, V> implements CacheObject<ObjectMap<K>, V> {
  private keys: CacheKey<K>[] = []
  private cacheMap: ObjectMap<V>
  constructor() {
    this.cacheMap = new SimpleMap<V>();
  }
  get(key: ObjectMap<K>): V | null {
    for(let k of this.keys) {
      if(k.match(key)) return this.cacheMap.get(this.getCacheKey(key));
    }
    return null;
  }
  put(key: ObjectMap<K>, val: V): void {
    throw new MethodNotImplemented("GenericCacheMap::put");
  }
  abstract getCacheKey(key: ObjectMap<K>): string
}

export {
  CacheKey,
  CacheObject,
  GenericCacheMap
}