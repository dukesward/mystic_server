import { ApplicationContext, ApplicationContextFactory, ApplicationEnvironment } from "@core/application";
import { ApplicationRuntimeObjectLoader } from "@core/object_loader";
import { ApplicationRuntimeEnvironment, RuntimeApplicationContext } from "./application";

class RuntimeApplicationContextFactory implements ApplicationContextFactory {
	private applicationContext?: ApplicationContext
	createEnvironment(): ApplicationEnvironment {
		return new ApplicationRuntimeEnvironment();
	}
	createContext(): ApplicationContext {
		if(!this.applicationContext) {
			this.applicationContext = new RuntimeApplicationContext({
				'objectLoader': new ApplicationRuntimeObjectLoader(`file://${__dirname}/../../`)
			});
		}
		return this.applicationContext;
	}
}

export {
  RuntimeApplicationContextFactory
}