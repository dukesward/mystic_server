import { AppLogger } from "./logger";

class InvalidBinding implements Error {
  name: string;
  message: string;
  stack?: string | undefined;
  constructor(obj: string, stack?: string) {
    this.name = "invalid_binding";
    this.message = `Not able to bind property source for ${obj}`;
    this.stack = stack;
  }
}

class MethodNotImplemented implements Error {
  name: string;
  message: string;
  stack?: string | undefined;
  constructor(obj: string, stack?: string) {
    this.name = "method_not_implemented";
    this.message = `Method ${obj} not implemented`;
    this.stack = stack;
    AppLogger.error(this.message);
  }
}

class ModuleNotDefined implements Error {
  name: string;
  message: string;
  stack?: string | undefined;
  constructor(obj: string, stack?: string) {
    this.name = "obj_def_duplicate";
    this.message = `Module ${obj} not defined`;
    this.stack = stack;
  }
}

class NullArgument implements Error {
  name: string;
  message: string;
  stack?: string | undefined;
  constructor(obj: string, stack?: string) {
    this.name = "argument_is_null";
    this.message = `${obj} must not be null`;
    this.stack = stack;
  }
}

class ResourceNotFound implements Error {
  name: string;
  message: string;
  stack?: string | undefined;
  constructor(obj: string, stack?: string) {
    this.name = "resource_not_found";
    this.message = `Resource dir ${obj} not found`;
    this.stack = stack;
  }
}

export {
  InvalidBinding,
  MethodNotImplemented,
  ModuleNotDefined,
  NullArgument,
  ResourceNotFound
}