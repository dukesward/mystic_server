import { AppLoggerBuilder } from "./logger";
import { ApplicationRuntimeConfigResourceLoader } from "./resource_loader";
import { GenericConstructor, ObjectClassExport } from "./types";

const Resource = function(args: string[]): any {
  let resourceLoader = new ApplicationRuntimeConfigResourceLoader();
  let logger = AppLoggerBuilder.build("@Resource");
  return (constructor: Function) => {
    if(args.length) {
      for(let arg of args) {
        let tokens = arg.split(':');
        let argName = tokens[0];
        let resourceName = argName;
        if(tokens.length > 0) {
          resourceName = tokens[1];
        }
        resourceLoader.getResources(resourceName, (objs: ObjectClassExport[]) => {
          let obj: ObjectClassExport | null = null;
          if(objs.length > 1) {

          }else if(objs.length > 0) {
            obj = objs[0];
          }
          if(obj && obj.source) {
            logger.debug(argName);
            constructor.prototype[argName] = obj.source();
          }else if(obj) {
            logger.debug(argName);
            let objConstructor: GenericConstructor = obj.object;
            constructor.prototype[argName] = new objConstructor();
          }
        });
      }
    }
    return constructor;
  }
}

const PropertySource = function(source: string): any {
  return (constructor: Function) => {
    if(source) {
      constructor.prototype.propertySource = source;
    }
    return constructor;
  }
}

const Property = function(property: string): any {
  return (constructor: Function) => {
    
    return constructor;
  }
}

const Autowired = function(): any {
  return () => {
    
  }
}

export {
  Resource,
  PropertySource,
  Property,
  Autowired
}