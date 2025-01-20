import { CacheKey, GenericCacheMap } from "@core/cache";
import { ObjectMap } from "@core/data_structure";
import { MethodNotImplemented } from "@core/exceptions";
import { ObjectConverter } from "@core/object_properties";
import { ObjectType } from "@core/types";

class ObjectConverterCacheKey implements CacheKey<ObjectType<any>> {
  match(key: ObjectMap<ObjectType<any>>): boolean {
    throw new MethodNotImplemented("ObjectConverterCacheKey::match");
  }
}

class ObjectConverterCache extends GenericCacheMap<ObjectType<any>, ObjectConverter<any, any>> {
  getCacheKey(key: ObjectMap<ObjectType<any>>): string {
    throw new MethodNotImplemented("ObjectConverterCache::getCacheKey");
  }
}

export {
  ObjectConverterCacheKey,
  ObjectConverterCache
}