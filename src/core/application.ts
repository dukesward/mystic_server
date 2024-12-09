import { Express, Request, Response } from "express";
import { AppLogger } from "./logger";
import { ObjectLoader } from "./object_loader";
import { ObjectFactory } from "./object_factory";
import { Consumer, GenericConstructor, ObjectClassExport, ObjectLoadingConfig, Predicate } from "./types";
import { ObjectMap, ObjectSortableMap, SimpleMap, SimpleSortableMap } from "./data_structure";
import { ObjectConstructorParser, ObjectInvokerChain, ObjectParser, ObjectSimpleInvokerChain, Ordered } from "./object_functions";
import { ApplicationStartupListener } from "./listeners";
import { ApplicationRuntimeConfigResourceLoader, ObjectConfigLoaderDelegate } from "./resource_loader";
import { ConfigDataProperties } from "./config";
import { applicationContextGlobal } from "../index";

const APP_SERVER_PORT = 'application.server.port';

interface Application {
  run(app: Express, applicationContextFactory: ApplicationContextFactory): void
}

interface ApplicationPropertySource<T> extends Ordered {
  getName(): string
  getSource(): T
  getProperty(name: string): any
  containsProperty(name: string): boolean
  getPropertyNames(): string[]
}

interface ApplicationConfigPropertySource extends ApplicationPropertySource<ConfigDataProperties> {
  filter(condition: Predicate<any>): ApplicationConfigPropertySource
  withPrefix(prefix: string): ApplicationConfigPropertySource
  from(propertySource: ApplicationPropertySource<ConfigDataProperties>): ApplicationConfigPropertySource
}

interface ApplicationPropertyResolver {
  getProperty(key: string): string | null
  containsProperty(key: string): boolean
}

interface ApplicationEnvironment extends ApplicationPropertyResolver {
  getActiveProfile(): string
  getPropertySources(): ObjectMap<ApplicationPropertySource<any>>
  getSystemProperties(): ObjectMap<any>
  specifyRequiredProperties(props: string[], validator?: (p: any) => boolean): void
  attachPropertySources(): void
}

interface ApplicationContext {
	_environment?: ApplicationEnvironment
  _objectLoader?: ObjectLoader
	_objectFactory?: ObjectFactory
	_objFactoryProcessors: ObjectLoadingConfig[]
  _initializers: ObjectMap<ApplicationContextIntializer>
  refresh(next: (context: ApplicationContext) => void): void
  prepareObjectFactory(): void
  postProcessObjFactory(): void
  onRefresh(): void
  postRefrech(): void
  getContextInitializers(): ObjectMap<ApplicationContextIntializer>
  getEnvironment(): ApplicationEnvironment
  setEnvironment(environment: ApplicationEnvironment): void
  setResourceLoader(resourceLoader: ObjectConfigLoaderDelegate): void
  getResourceLoader(): ObjectConfigLoaderDelegate
}

interface ApplicationContextFactory {
  createContext(): ApplicationContext;
  createEnvironment(): ApplicationEnvironment
}

interface ApplicationContextIntializer {
  initialize(context: ApplicationContext): void
}

abstract class AbstractApplicationEnvironment implements ApplicationEnvironment {
	_propertySources: ObjectSortableMap<ApplicationPropertySource<any>>
	_propertyResolver: ApplicationPropertyResolver
	constructor() {
		this._propertySources = new SimpleSortableMap<ApplicationPropertySource<any>>();
		this._propertyResolver = this.getPropertyResolver(this._propertySources);
		this.customizePropertySources(this._propertySources);
	}
	getPropertySources(): ObjectMap<ApplicationPropertySource<any>> {
		return this._propertySources;
	}
	specifyRequiredProperties(props: string[], validator?: (p: any) => boolean): void {
		throw new Error("Method not implemented.");
	}
	abstract getActiveProfile(): string
	abstract getPropertyResolver(propertySources: ObjectMap<ApplicationPropertySource<any>>): ApplicationPropertyResolver
	abstract customizePropertySources(propertySources: ObjectMap<ApplicationPropertySource<any>>): void
  abstract attachPropertySources(): void
  getSystemProperties(): ObjectMap<string> {
		let map = new SimpleMap<string>();
    for(let p in process.env) {
			if(process.env[p]) map.put(p, process.env[p]);
		}
		return map;
  }
	getProperty(key: string): string | null {
		return this._propertyResolver.getProperty(key);
	}
	containsProperty(key: string): boolean {
		return this._propertyResolver.containsProperty(key);
	}
}

class ApplicationServer implements Application {
  private app?: Express
  private resourceLoader!: ObjectConfigLoaderDelegate
  run(app: Express, applicationContextFactory: ApplicationContextFactory): void {
    AppLogger.info('starting mystic app server...');
    this.app = app;
    this.resourceLoader = new ApplicationRuntimeConfigResourceLoader();
    // create and prepare application environment
    let environment: ApplicationEnvironment = applicationContextFactory.createEnvironment();
    this.getApplicationRunListeners(
      (listeners: SimpleSortableMap<ApplicationStartupListener>) => {
        let applicationContext: ApplicationContext = applicationContextGlobal || applicationContextFactory.createContext();
        applicationContext.setResourceLoader(this.resourceLoader);
        this.prepareEnvironment(applicationContext, environment, listeners);
        // create and prepare application context
        this.prepareContext(applicationContext, environment);
        applicationContext.refresh(this.doStartup.bind(this));
      }
    );
  }
  async getApplicationRunListeners(
    next: (listeners: SimpleSortableMap<ApplicationStartupListener>) => void): Promise<void> {
    let listeners = new SimpleSortableMap<ApplicationStartupListener>();
    await this.loadCoreObjects(
      'listeners', 'applicationListener', (clazzes: ObjectClassExport[]) => {
        let parser: ObjectParser<GenericConstructor> = new ObjectConstructorParser();
        for(let i=0; i<clazzes.length; i++) {
          let tokens: string[] = parser.parse(clazzes[i].object);
          if(tokens.length) {
            listeners.put(tokens[0], new clazzes[i].object());
          }
        }
      }
    )
    next(listeners);
  }
  prepareContext(context: ApplicationContext, environment: ApplicationEnvironment) {
    context.setEnvironment(environment);
    context.getContextInitializers().each((initializer) => initializer.initialize(context));
  }
  prepareEnvironment(
    context: ApplicationContext,
    environment: ApplicationEnvironment,
    listeners: SimpleSortableMap<ApplicationStartupListener>): void {
    let propertySources: ObjectMap<ApplicationPropertySource<any>> = environment.getPropertySources();
    this.configureCommandLineArgs(propertySources);
    environment.attachPropertySources();
    // custom environment init items to be added
    let listenerChain: ObjectInvokerChain<ApplicationStartupListener> = new ObjectSimpleInvokerChain(listeners);
    listenerChain.invoke(
      (listener: ApplicationStartupListener) => listener.onEnvironmentPrepared(context, environment));
  }
  configureCommandLineArgs(propertySources: ObjectMap<ApplicationPropertySource<any>>): void {

  }
  doStartup(context: ApplicationContext): void {
    let port = context.getEnvironment().getProperty(APP_SERVER_PORT) || process.env.PORT;
    if(this.app) {
      this.app.get("/", (req: Request, res: Response) => {
        res.send("Express + TypeScript Server");
      });
      this.app.listen(port, () => {
        AppLogger.info(`[server]: Server is running at http://localhost:${port} for environment ${process.env.NODE_ENV}!`);
      });
    }else {

    }
  }
  async loadCoreObjects(name: string, type: string, callback: Consumer<ObjectClassExport[]>): Promise<any> {
    let objectLoader: ObjectLoader | undefined = this.resourceLoader?.getObjectLoader();
    if(objectLoader) {
      let clazzes: ObjectClassExport[] | null = await objectLoader.loadObject({
        name: name,
        type: type
      });
      AppLogger.info('loadObject task is finished');
      if(callback && clazzes) {
        callback(clazzes)
      };
    }
  }
}

export {
  Application,
  ApplicationEnvironment,
  ApplicationConfigPropertySource,
  ApplicationPropertySource,
  ApplicationPropertyResolver,
  ApplicationContext,
  ApplicationContextFactory,
  ApplicationContextIntializer,
  AbstractApplicationEnvironment,
  ApplicationServer
}