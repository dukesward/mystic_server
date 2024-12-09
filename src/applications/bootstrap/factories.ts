import { ApplicationContext, ApplicationContextFactory, ApplicationEnvironment } from "@core/application";
import { ApplicationRuntimeObjectLoader } from "@core/object_loader";
import { ApplicationRuntimeEnvironment, RuntimeApplicationContext } from "./application";

class RuntimeApplicationContextFactory implements ApplicationContextFactory {
    createEnvironment(): ApplicationEnvironment {
        return new ApplicationRuntimeEnvironment();
    }
    createContext(): ApplicationContext {
        let context: ApplicationContext = new RuntimeApplicationContext({
            'objectLoader': new ApplicationRuntimeObjectLoader(`file://${__dirname}/../../`)
        });
        return context;
    }
}

export {
    RuntimeApplicationContextFactory
}