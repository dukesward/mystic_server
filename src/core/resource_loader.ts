import fs from 'fs';
import path from 'path';
import { AppLogger } from "./logger";
import { ApplicationRuntimeObjectLoader, ObjectLoader } from "./object_loader"
import { ResourceNotFound } from './exceptions';
import { Consumer, ObjectClassExport, ObjectConfigDictionary, ObjectDefinition } from './types';
import { modules } from './modules';

const URL_FILE_PROTOCOL = "file://";

interface Resource<T> {
  exists(): boolean
  isFile(): boolean
  getResource(): T
  getResourceUri(): string
}

interface ResourceLoader<T> {
  getResource(resource: string): Resource<T>
	getObjectLoader(): ObjectLoader
}

abstract class FileResource<T> implements Resource<T> {
  private uri: string
  constructor(uri: string) {
    this.uri = uri;
  }
  abstract exists(): boolean;
  abstract getResource(): T
  getResourceUri(): string {
    return this.uri;
  }
  isFile(): boolean {
    return true;
  }
}

class SimpleJsFileResource<T> extends FileResource<T> {
  private resource: T
  constructor(uri: string, t: T) {
    super(uri);
    this.resource = t;
  }
  getResource(): T {
    return this.resource;
  }
  exists(): boolean {
    return !!this.resource;
  }
}

class ConfigDataResource<T> extends FileResource<T> {
  exists(): boolean {
    throw new Error('Method not implemented.');
  }
  getResource(): T {
    throw new Error('Method not implemented.');
  }
  
}

abstract class ObjectConfigLoaderDelegate implements ResourceLoader<ObjectDefinition> {
  _objectLoader: ObjectLoader
  constructor() {
    this._objectLoader = new ApplicationRuntimeObjectLoader(`file://${__dirname}/../../src/`);
  }
  getObjectLoader(): ObjectLoader {
    return this._objectLoader;
  }
  abstract getResource(resource: string): SimpleJsFileResource<ObjectDefinition>
  abstract getResources(resource: string, next?: Consumer<ObjectClassExport[]>): void
}

class ApplicationRuntimeConfigResourceLoader extends ObjectConfigLoaderDelegate {
  private modules: ObjectConfigDictionary<string>
  constructor() {
    super();
    this.modules = modules;
  }
  getResource(resource: string): SimpleJsFileResource<ObjectDefinition> {
    throw new Error("Method not implemented.")
  }
  getAutowiredResource(resource: string): void {
    let objSrc = path.join(__dirname, '/../applications');

  }
  getResources(resource: string, next?: Consumer<ObjectClassExport[]>): void {
    // let moduleRoot = `file://${__dirname}/../../`;
    let objSrc = path.join(__dirname, '/../applications');
    try {
      let resources = fs.readdirSync(objSrc);
      let resourceFiles: string[] = this.modules[resource] || [];
      AppLogger.debug("getResources");
      AppLogger.debug(resourceFiles);
      resources.forEach((module: string) => {
        for(let file of resourceFiles) {
          let target: string = `${objSrc}/${module}/${file}.js`;
          if(fs.existsSync(target)) {
            this._objectLoader.loadObject({
              name: file,
              module: module,
              type: resource
            }).then(
              (obj: ObjectClassExport[] | null) => {
                if(next && obj) next(obj);
              }
            )
          }
        }
      });
    }catch(err) {
      AppLogger.error(`Could not list directory ${objSrc} due to: ${err}`);
      throw new ResourceNotFound(objSrc);
      //process.exit(1);
    }
  }
}

export {
  Resource,
  ResourceLoader,
  FileResource,
  SimpleJsFileResource,
  ConfigDataResource,
  ObjectConfigLoaderDelegate,
  ApplicationRuntimeConfigResourceLoader
}