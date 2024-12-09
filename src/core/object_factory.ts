import { ObjectDefinitionDuplicate, ObjectDefinitionNotFound } from "@applications/bootstrap/exceptions";
import { AppLogger } from "./logger";
import { ObjectLoader } from "./object_loader";
import { GenericConstructor, ObjectClassExport, ObjectDefinition, ObjectLoadingConfig, ObjectPriority, Supplier } from "./types";
import { SimpleSortableMap } from "./data_structure";

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
	registerObjDefinition(config: ObjectDefinition): void
	registerObjWithSupplier<T>(name: string, supplier: Supplier<T>): void
	getObjDefinition(obj: string): ObjectDefinition
	getObject(name: string, type: string): any
	getObjectNamesForType(type: string, includeNonSingleton?: boolean, allowEagerInit?: boolean): SimpleSortableMap<ObjectPriority>
	instantiateObjectSingleton(obj: string): void
	instantiateObjectSingletons(): void
}

interface SingletonObjectFactory extends SingletonObjectProvider, ObjectFactory {

}

interface ObjectDefinitionPostProcessor {
	postProcess(factory: ObjectFactory): void
}

class RuntimeObjectFactory implements SingletonObjectFactory {
	_objectLoader?: ObjectLoader
	_objectLoadingConfigs: { [name: string]: ObjectLoadingConfig } = {}
	_objectDefinitions: { [name: string]: ObjectDefinition } = {}
	_singletonObjects: { [name: string]: any } = {}
	_earlySingletonObjects: { [name: string]: any } = {}
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

	}
	getObjectNamesForType(type: string, includeNonSingleton?: boolean, allowEagerInit?: boolean): SimpleSortableMap<ObjectPriority> {
		let objects: SimpleSortableMap<ObjectPriority> = new SimpleSortableMap();
		for(let key in this._objectDefinitions) {
			let o: ObjectDefinition = this._objectDefinitions[key];
			if(o) {
				objects.put(key, {
					name: o.className,
					type: o.loading.type,
					order: 0
				});
			}
		}
		return objects;
	}
	registerObjWithConfig(config: ObjectLoadingConfig): void {
		let name = config.name;
		try {
			let definition = this._objectLoader?.loadObject(config);
			if(!definition) {
				throw new ObjectDefinitionNotFound(name);
			}
			definition.then((m: ObjectClassExport[] | null) => {
				if(m) {
					AppLogger.info(m);
				}
				//d.loading = config;
				//this.registerObjDefinition(d);
			}).catch((e: Error) => {
				AppLogger.error(e);
			});
		}catch (e: any) {
			AppLogger.error(e);
		}
	}
	registerObjDefinition(config: ObjectDefinition): void {
		if(this._objectDefinitions[config.className]) {
			throw new ObjectDefinitionDuplicate(config.className);
		}
		this._objectDefinitions[config.className] = config;
	}
	registerObjWithSupplier<T>(name: string, supplier: Supplier<T>): void {
		
	}
	registerSingleton(name: string, singletonObject: any): void {
		if(this._singletonObjects[name]) {
			AppLogger.warn(`Singleton object ${name} exists and will be overwritten`);
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
			AppLogger.info(definition);
		}
	}
	instantiateObjectSingletons(): void {

	}
}

export {
    ObjectFactory,
		SingletonObjectFactory,
		ObjectDefinitionPostProcessor,
    RuntimeObjectFactory
}