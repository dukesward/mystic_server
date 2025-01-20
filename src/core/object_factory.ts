import { ObjectDefinitionDuplicate, ObjectDefinitionNotFound } from "@applications/bootstrap/exceptions";
import { AppLoggerBuilder, Logger } from "./logger";
import { ObjectLoader } from "./object_loader";
import { ObjectClassExport, ObjectDefinition, ObjectLoadingConfig, ObjectPriority, Supplier } from "./types";
import { SimpleSortableMap } from "./data_structure";
import { AsyncTask, AsyncTaskManager } from "./async";
import { applicationContextGlobal } from "../app";
import { ApplicationContext } from "./application";

// referring to org.springframework.beans.factory.support.DefaultSingletonBeanRegistry
interface SingletonObjectProvider {
	registerSingleton(name: string, singletonObject: any): void
	getSingleton(name: string): any
}

interface ObjectFactory {
	_objectLoader?: ObjectLoader
	_objectDefinitions: { [name: string]: ObjectDefinition }
	get objectLoader(): ObjectLoader | undefined
	set objectLoader(objectLoader: ObjectLoader)
	get objectDefinitions(): { [name: string]: ObjectDefinition }
	registerObjWithConfig(config: ObjectLoadingConfig): void
	registerObjectsWithConfigs(configs: ObjectLoadingConfig[], callback?: () => void): void
	registerObjDefinition(config: ObjectDefinition): void
	registerObjWithSupplier<T>(name: string, supplier: Supplier<T>): void
	getObjDefinition(obj: string): ObjectDefinition
	getObject<T>(name: string, type: string): T
	getObjectNamesForType(type: string, includeNonSingleton?: boolean, allowEagerInit?: boolean): SimpleSortableMap<ObjectPriority>
	instantiateObjectSingleton(obj: string): void
	instantiateObjectSingletons(): void
}

interface SingletonObjectFactory extends SingletonObjectProvider, ObjectFactory {

}

interface ObjectDefinitionPostProcessor {
	postProcess(context: ApplicationContext, factory: ObjectFactory): void
}

class RuntimeObjectFactory implements SingletonObjectFactory {
	_objectLoader: ObjectLoader
	_objectLoadingConfigs: { [name: string]: ObjectLoadingConfig } = {}
	_objectDefinitions: { [name: string]: ObjectDefinition } = {}
	_singletonObjects: { [name: string]: any } = {}
	_earlySingletonObjects: { [name: string]: any } = {}
	private logger: Logger
	constructor(_objectLoader?: ObjectLoader) {
		this._objectLoader = _objectLoader || applicationContextGlobal.getObjectLoader();
		this.logger = AppLoggerBuilder.build({instance: this});
	}
	get objectLoader(): ObjectLoader | undefined {
		return this._objectLoader;
	}
	set objectLoader(objectLoader: ObjectLoader) {
		this._objectLoader = objectLoader;
	}
	get objectDefinitions(): { [name: string]: ObjectDefinition } {
		return this._objectDefinitions;
	}
	getObject(name: string, type: string): any {
		let obj: any = this._singletonObjects[name];
		if(!obj) {
			obj = this._earlySingletonObjects[name];
		}
		if(!obj) {
			obj = this.instantiateObjectSingleton(name);
		}
		if(!obj) {
			throw new ObjectDefinitionNotFound(name);
		}
		return obj;
	}
	getObjectNamesForType(type: string, includeNonSingleton?: boolean, allowEagerInit?: boolean): SimpleSortableMap<ObjectPriority> {
		let objects: SimpleSortableMap<ObjectPriority> = new SimpleSortableMap();
		for(let key in this._objectDefinitions) {
			let o: ObjectDefinition = this._objectDefinitions[key];
			if(o.type === type) {
				objects.put(key, {
					name: o.className,
					type: o.type,
					order: o.classDefinition.order || 0
				});
			}
		}
		return objects;
	}
	registerObjWithConfig(config: ObjectLoadingConfig): void {
		
	}
	registerObjectRunnable(config: ObjectLoadingConfig): (t: ObjectClassExport[]) => void {
		return (m: ObjectClassExport[]) => {
			if(m) {
				for(let i=0; i<m.length; i++) {
					let def = m[i];
					this.registerObjDefinition({
						'className': def.objectId || def.object.name,
						'type': config.type,
						'classDefinition': def
					});
				}
			}
		}
	}
	registerObjectsWithConfigs(configs: ObjectLoadingConfig[], callback?: () => void): void {
		let taskManager: AsyncTaskManager<ObjectClassExport[]> = new AsyncTaskManager();
		for(let i=0; i<configs.length; i++) {
			//this.registerObjWithConfig(configs[i]);
			taskManager.addTask(new AsyncTask<ObjectClassExport[]>(
				this._objectLoader.loadObject(configs[i]), this.registerObjectRunnable(configs[i])));
		}
		taskManager.start(callback);
	}
	registerObjDefinition(config: ObjectDefinition): void {
		if(this._objectDefinitions[config.className]) {
			throw new ObjectDefinitionDuplicate(config.className);
		}
		this._objectDefinitions[config.className] = config;
		// this.logger.debug(this._objectDefinitions);
	}
	registerObjWithSupplier<T>(name: string, supplier: Supplier<T>): void {
		this._singletonObjects[name] = supplier();
	}
	registerSingleton(name: string, singletonObject: any): void {
		if(this._singletonObjects[name]) {
			this.logger.warn(`Singleton object ${name} exists and will be overwritten`);
		}
		this._singletonObjects[name] = singletonObject;
	}
	getSingleton(name: string): any {

	}
	getObjDefinition(name: string): ObjectDefinition {
		return this._objectDefinitions[name];
	}
	instantiateObjectSingleton(obj: string): void {
		let definition: ObjectDefinition = this.getObjDefinition(obj);
		if(definition) {
			this.logger.info(definition.className);
			this._singletonObjects[obj] = new definition.classDefinition.object();
		}
		return this._singletonObjects[obj];
	}
	instantiateObjectSingletons(): void {
		for (let key in this._objectDefinitions) {
			let definition: ObjectDefinition = this._objectDefinitions[key];
			if(definition) {
				this.logger.info(definition.className);
			}
		}
	}
}

export {
    ObjectFactory,
		SingletonObjectFactory,
		ObjectDefinitionPostProcessor,
    RuntimeObjectFactory
}