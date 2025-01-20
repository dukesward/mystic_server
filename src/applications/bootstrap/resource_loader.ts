import { ObjectLoader } from "@core/object_loader";
import { ConfigDataResource, Resource, ResourceLoader } from "@core/resource_loader";
import { MethodNotImplemented } from "@core/exceptions";
import { Consumer, ObjectClassExport } from "@src/core/types";

class StandardConfigResourceLoader implements ResourceLoader<any> {
  getResources(resource: string, next?: Consumer<ObjectClassExport[]>): Promise<any> {
    throw new MethodNotImplemented("StandardConfigResourceLoader::getResources");
  }
  getResource(resource: string): ConfigDataResource<any> {
    throw new MethodNotImplemented("StandardConfigResourceLoader::getResource");
  }
  getObjectLoader(): ObjectLoader {
    throw new MethodNotImplemented("StandardConfigResourceLoader::getObjectLoader");
  }
}

const configResourceLoader = [
  {object:StandardConfigResourceLoader, order:10}
];

export {
  configResourceLoader
}