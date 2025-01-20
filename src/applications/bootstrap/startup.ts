import { ApplicationContext, ApplicationContextIntializer } from "@core/application";
import { ApplicationStartupEvent } from "@core/events";
import { ApplicationListener } from "@core/listeners";
import { ObjectConfigProperty } from "./config";
import { MethodNotImplemented } from "@core/exceptions";

const APP_BOOTSTRAP_ENABLED = 'application.bootstrap.enabled';

class ApplicationBootstrapEvent extends ApplicationStartupEvent {
  
}

class BootstrapApplicationListener implements ApplicationListener {
  onApplicationEvent(event: ApplicationBootstrapEvent): void {
    if(!this.bootstrapEnabled(event)) {
      return;
    }
  }
  bootstrapEnabled(event: ApplicationBootstrapEvent): boolean {
    return !!event.getApplicationEnvironment().getProperty(new ObjectConfigProperty(APP_BOOTSTRAP_ENABLED));
  }
}

class ObjectConfigReaderInitializer implements ApplicationContextIntializer {
  initialize(context: ApplicationContext): void {
    throw new MethodNotImplemented("ObjectConfigReaderInitializer::initialize");
  }
  
}

export {
  BootstrapApplicationListener,
  ObjectConfigReaderInitializer
}