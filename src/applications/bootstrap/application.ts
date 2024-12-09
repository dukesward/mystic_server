import { AbstractApplicationEnvironment, ApplicationConfigPropertySource, ApplicationContext, ApplicationContextIntializer, ApplicationEnvironment, ApplicationPropertyResolver, ApplicationPropertySource } from "@core/application";
import { ObjectIterable, ObjectMap, ObjectSortableMap, SimpleMap, SimpleSortableMap } from "@core/data_structure";
import { RuntimeObjectFactory, SingletonObjectFactory } from "@core/object_factory";
import { ObjectLoader } from "@core/object_loader";
import { ObjectLoadingConfig, ObjectPriority, Predicate } from "@core/types";
import { ObjectConfigReaderInitializer } from "./startup";
import { AppLogger } from "@core/logger";
import { ConfigDataProperties } from "@core/config";
import { ObjectConfigLoaderDelegate } from "@core/resource_loader";

const DEFAULT_APP_PROP_SOURCE = 'applicationProperties';
const SYSTEM_PROP_SOURCE = 'systemProperties';

const APP_PROP_SOURCE_ORDER = 10;
const APP_SYS_SOURCE_ORDER = 1;

class ApplicationRuntimeConfigProperties implements ApplicationConfigPropertySource {
	_name: string
	_source: ConfigDataProperties
	constructor(name: string, properties: ConfigDataProperties) {
		this._name = name;
		this._source = properties;
	}
	getName(): string {
		return this._name;
	}
	getSource(): ConfigDataProperties {
		return this._source;
	}
	getOrder(): number {
		return APP_PROP_SOURCE_ORDER;
	}
	filter(condition: Predicate<any>): ApplicationConfigPropertySource {
		throw new Error("Method not implemented.");
	}
	withPrefix(prefix: string): ApplicationConfigPropertySource {
		throw new Error("Method not implemented.");
	}
	from(propertySource: ApplicationConfigPropertySource): ApplicationConfigPropertySource {
		throw new Error("Method not implemented.");
	}
	getProperty(name: string) {
		throw new Error("Method not implemented.");
	}
	containsProperty(name: string): boolean {
		throw new Error("Method not implemented.");
	}
	getPropertyNames(): string[] {
		throw new Error("Method not implemented.");
	}
}

class ApplicationPropertySourcesPropertySource implements ApplicationPropertySource<ObjectIterable<ApplicationPropertySource<any>>> {
	_name: string
	_source: ObjectIterable<ApplicationPropertySource<any>>
	constructor(name: string, properties: ObjectIterable<ApplicationPropertySource<any>>) {
		this._name = name;
		this._source = properties;
	}
	getName(): string {
		return this._name;
	}
	getProperty(name: string): any {
		//
	}
	getSource(): ObjectIterable<ApplicationPropertySource<any>> {
		return this._source;
	}
	containsProperty(name: string): boolean {
		throw new Error("Method not implemented.");
	}
	getPropertyNames(): string[] {
		throw new Error("Method not implemented.");
	}
	getOrder(): number {
		throw new Error("Method not implemented.");
	}
}

class ApplicationSystemProperties implements ApplicationPropertySource<ObjectMap<any>> {
	_source: ObjectMap<string>
	_name: string
	constructor(name: string, source: ObjectMap<string>) {
		this._source = source;
		this._name = name;
	}
	getName(): string {
		return this._name;
	}
	getOrder(): number {
		return APP_SYS_SOURCE_ORDER;
	}
	getSource(): ObjectMap<string> {
		return this._source;
	}
	getProperty(name: string): any {
		if(name in this._source) {
			return this._source.get(name);
		}else if(process.env[name]) {
			// try fetching from process env
			this._source.put(name, process.env[name]);
			return process.env[name];
		}
	}
	containsProperty(name: string): boolean {
		throw new Error("Method not implemented.");
	}
	getPropertyNames(): string[] {
		throw new Error("Method not implemented.");
	}
}

class ApplicationPropSourcePropertyResolver implements ApplicationPropertyResolver {
	_attachedSource?: ApplicationPropertySource<any>
	_propertySources: ObjectSortableMap<ApplicationPropertySource<any>>
	constructor(propertySources: ObjectSortableMap<ApplicationPropertySource<any>>) {
		this._propertySources = propertySources;
	}
	getProperty(key: string): string | null {
		if(this._attachedSource && this._attachedSource.containsProperty(key)) {
			return this._attachedSource.getProperty(key);
		}
		let defaultPropertySource: ApplicationPropertySource<any> | null = this._propertySources.get(DEFAULT_APP_PROP_SOURCE);
		if(defaultPropertySource && defaultPropertySource.containsProperty(key)) {
			return defaultPropertySource.getProperty(key);
		}else {
			let orderedPropertySources = this._propertySources.sort((s: ApplicationPropertySource<any>) => s.getOrder());
			if(orderedPropertySources) {
				for(let i=0; i<orderedPropertySources.length; i++) {
					let propertySource: ApplicationPropertySource<any> = orderedPropertySources[i];
					if(propertySource.getProperty(key)) {
						return propertySource.getProperty(key);
					}
				}
			}
		}
		return null;
	}
	containsProperty(key: string): boolean {
		throw new Error("Method not implemented.");
	}
}

class ApplicationRuntimeEnvironment extends AbstractApplicationEnvironment {
	_profile: string
	constructor() {
		super();
		this._profile = process.env.NODE_ENV || "prod";
	}
	getActiveProfile(): string {
		return this._profile;
	}
	getPropertyResolver(propertySources: ObjectSortableMap<any>): ApplicationPropertyResolver {
		return new ApplicationPropSourcePropertyResolver(propertySources);
	}
	attachPropertySources(): void {
		let propertySource: ApplicationPropertySource<any> 
		= new ApplicationPropertySourcesPropertySource(DEFAULT_APP_PROP_SOURCE, this._propertySources);
		this._propertySources.put(DEFAULT_APP_PROP_SOURCE, propertySource);
	}
	customizePropertySources(propertySources: ObjectMap<ApplicationPropertySource<any>>): void {
		propertySources.put(SYSTEM_PROP_SOURCE, new ApplicationSystemProperties(SYSTEM_PROP_SOURCE, this.getSystemProperties()));
	}
}

abstract class AbstractApplicationContext implements ApplicationContext {
	_environment?: ApplicationEnvironment
	_objectLoader?: ObjectLoader
	_objectFactory?: SingletonObjectFactory
	_objFactoryProcessors: ObjectLoadingConfig[] = []
	_initializers: SimpleMap<ApplicationContextIntializer> = new SimpleMap()
	_resourceLoader!: ObjectConfigLoaderDelegate
	constructor(args: any) {
		this._objectLoader = args['objectLoader'];
		this._objectFactory = new RuntimeObjectFactory();
		this._objectFactory.registerObjWithSupplier<ApplicationEnvironment>(
			"applicationEnvironment", () => this.getEnvironment()
		);
		this.loadContextInitializers();
	}
	getResourceLoader(): ObjectConfigLoaderDelegate {
		return this._resourceLoader;
	}
	setResourceLoader(resourceLoader: ObjectConfigLoaderDelegate): void {
		this._resourceLoader = resourceLoader;
	}
	setEnvironment(environment: ApplicationEnvironment): void {
		this._environment = environment;
	}
	getEnvironment(): ApplicationEnvironment {
		if(!this._environment) {
			throw new Error('Application environment is not ready');
		}
		return this._environment;
	}
	getObjectFactory(): SingletonObjectFactory | null {
		return this._objectFactory || null;
	}
	loadContextInitializers(): void {
		this._initializers.put('obj_config_reader', new ObjectConfigReaderInitializer());
	}
	getContextInitializers(): SimpleMap<ApplicationContextIntializer> {
		return this._initializers;
	}
	refresh(next: (context: ApplicationContext) => void): void {
		this.prepareObjectFactory();
		this.postProcessObjFactory();
		next(this);
	}
	registerObjectDefinition(config: ObjectLoadingConfig): void {
		this._objectFactory?.registerObjWithConfig(config);
	}
	abstract prepareObjectFactory(): void
  abstract postProcessObjFactory(): void
	abstract onRefresh(): void
  abstract postRefrech(): void
}

class RuntimeApplicationContext extends AbstractApplicationContext {
	constructor(args: any) {
		super(args);
	}
	addFactoryProcessors(): void {
		this._objFactoryProcessors.push({
			name: 'processors', module: 'bootstrap', type: 'objectDefinitionPostProcessor'
		});
	}
	prepareObjectFactory(): void {
		if(this._objectFactory && this._objectLoader) {
			this._objectFactory.objectLoader = this._objectLoader;
			this.addFactoryProcessors();
			this._objFactoryProcessors.forEach(
				(c: ObjectLoadingConfig) => {
					this._objectFactory?.registerObjWithConfig(c)
				}
			);
		}
	}
	postProcessObjFactory(): void {
		let registered: SimpleSortableMap<ObjectPriority> | undefined = this._objectFactory?.getObjectNamesForType('postProcessor');
		registered && registered.sort((p: ObjectPriority) => p.order).forEach((p: ObjectPriority) => {

		});
	}
	processObjLifecycle(next: (objs: []) => void): void {

	}
	onRefresh(): void {

	}
	postRefrech(): void {
		this._objectFactory?.instantiateObjectSingletons();
	}
}

export {
	ApplicationRuntimeConfigProperties,
	ApplicationPropertySourcesPropertySource,
	ApplicationSystemProperties,
  ApplicationRuntimeEnvironment,
	AbstractApplicationContext,
  RuntimeApplicationContext
};