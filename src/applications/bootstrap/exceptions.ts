class ObjectDefinitionDuplicate implements Error {
  name: string;
  message: string;
  stack?: string | undefined;
  constructor(obj: string, stack?: string) {
    this.name = "obj_def_duplicate";
    this.message = `Duplicate object definition for ${obj}`;
    this.stack = stack;
  }
}

class ObjectDefinitionNotFound implements Error {
  name: string;
  message: string;
  stack?: string | undefined;
  constructor(obj: string, stack?: string) {
    this.name = "obj_def_not_found";
    this.message = `Object definition not found for ${obj}`;
    this.stack = stack;
  }
}

export {
  ObjectDefinitionDuplicate,
  ObjectDefinitionNotFound
}