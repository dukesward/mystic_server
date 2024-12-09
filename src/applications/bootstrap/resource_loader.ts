import { ObjectLoader } from "@core/object_loader";
import { ConfigDataResource, Resource, ResourceLoader } from "@core/resource_loader";

class StandardConfigResourceLoader implements ResourceLoader<any> {
  getResource(resource: string): ConfigDataResource<any> {
    throw new Error("Method not implemented.");
  }
  getObjectLoader(): ObjectLoader {
    throw new Error("Method not implemented.");
  }
}

const configResourceLoader = [
  {object:StandardConfigResourceLoader, order:10}
];

export {
  configResourceLoader
}