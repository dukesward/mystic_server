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

export {
  ResourceNotFound,
  ModuleNotDefined
}