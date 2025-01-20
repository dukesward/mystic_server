import fs from 'fs';
import path from 'path';
import { AppLogger, AppLoggerBuilder, Logger } from "./logger";
import { ApplicationRuntimeObjectLoader, ObjectLoader } from "./object_loader"
import { MethodNotImplemented, ResourceNotFound } from './exceptions';
import { Consumer, ObjectClassExport, ObjectConfigDictionary, ObjectDefinition, ObjectLoadingConfig } from './types';
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
  getResources(resource: string, next?: Consumer<ObjectClassExport[]>): Promise<any>
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
    throw new MethodNotImplemented("ConfigDataResource::exists");
  }
  getResource(): T {
    throw new MethodNotImplemented("ConfigDataResource::getResource");
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
  abstract getResources(resource: string, next?: Consumer<ObjectClassExport[]>): Promise<any>
}

class ApplicationRuntimeConfigResourceLoader extends ObjectConfigLoaderDelegate {
  private modules: ObjectConfigDictionary<string>
  private logger: Logger
  constructor() {
    super();
    this.modules = modules;
    this.logger = AppLoggerBuilder.build({instance: this});
  }
  getResource(resource: string): SimpleJsFileResource<ObjectDefinition> {
    throw new MethodNotImplemented("ApplicationRuntimeConfigResourceLoader::getResource");
  }
  getAutowiredResource(resource: string): void {
    let objSrc = path.join(__dirname, '/../applications');

  }
  async getResources(resource: string, next?: Consumer<ObjectClassExport[]>): Promise<any> {
    // let moduleRoot = `file://${__dirname}/../../`;
    let objSrc = path.join(__dirname, '/../applications');
    let resources: string[] = fs.readdirSync(objSrc);
    let resourceFiles: string[] = this.modules[resource] || [];
    for(let i=0; i<resources.length; i++) {
      let module: string = resources[i];
      for(let file of resourceFiles) {
        let target: string = `${objSrc}/${module}/${file}.js`;
        await this.doGetResources(target, {
          name: file,
          module: module,
          type: resource
        }, next);
      }
    }
  }
  async doGetResources(
    source: string, config: ObjectLoadingConfig, next?: Consumer<ObjectClassExport[]>): Promise<any> {
    if(fs.existsSync(source)) {
      try {
        let obj: ObjectClassExport[] | null = await this._objectLoader.loadObject(config);
        if(next && obj) next(obj);
        return obj;
      }catch (err) {
        this.logger.error(`Could not list directory ${source} due to ${err}`);
        throw new ResourceNotFound(source);
      }
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