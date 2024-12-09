import { ObjectConfigPropertyBinder } from "@applications/bootstrap/object_properties";
import { AppLogger } from "./logger";
import { ApplicationRuntimeEnvironment } from "@applications/bootstrap/application";
import { ApplicationRuntimeConfigResourceLoader } from "./resource_loader";

const Autowired = function(args: string[]): any {
  return (constructor: Function) => {
    if(args.length) {
      for(let arg of args) {

      }
    }
    // constructor.prototype.binder = new ObjectConfigPropertyBinder(new ApplicationRuntimeEnvironment());
  }
}

export {
  Autowired
}