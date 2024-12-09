import { ApplicationContext, ApplicationEnvironment } from "./application"
import { ApplicationEvent, ApplicationEventPublisher, ApplicationStartupEvent } from "./events"
import { AppLogger } from "./logger"
import { EnvironmentPostProcessor } from "./processors"
import { ApplicationRuntimeConfigResourceLoader, ObjectConfigLoaderDelegate } from "./resource_loader"
import { Consumer, ObjectClassExport } from "./types"

const APP_STARTING = 'app_start_starting'
const APP_START_ENV = 'app_start_env_prepared'
const APP_START_CONTEXT = 'app_start_context_prepared'

interface ApplicationListener {
  onApplicationEvent(event: ApplicationEvent): void
}

abstract class ApplicationStartupListener implements ApplicationListener {
  onApplicationEvent(event: ApplicationStartupEvent): void {
    if(event.getEventType() === APP_STARTING) {
      this.onApplicationStarting(event.getApplicationContext());
    }
    if(event.getEventType() === APP_START_ENV) {
      this.onEnvironmentPrepared(event.getApplicationContext(), event.getApplicationEnvironment());
    }
    if(event.getEventType() === APP_START_CONTEXT) {
      this.onContextPrepared(event.getApplicationContext());
    }
  }
  abstract onApplicationStarting(context: ApplicationContext): void
  abstract onEnvironmentPrepared(context: ApplicationContext, environment: ApplicationEnvironment): void
  abstract onContextPrepared(context: ApplicationContext): void
}

class EnvironmentPostProcessListener extends ApplicationStartupListener {
  onApplicationStarting(context: ApplicationContext): void {
    //
  }
  onEnvironmentPrepared(context: ApplicationContext, environment: ApplicationEnvironment): void {
    let resourceLoader = new ApplicationRuntimeConfigResourceLoader();
    this.getEnvironmentPostProcessors(context, (processors: ObjectClassExport[]) => {
      for(let i=0; i<processors.length; i++) {
        let processor: EnvironmentPostProcessor = new processors[i].object();
        processor.postProcessEnvironment(context, environment);
      }
    });
  }
  onContextPrepared(context: ApplicationContext): void {
    throw new Error("Method not implemented.")
  }
  getEnvironmentPostProcessors(
    context: ApplicationContext,
    next: Consumer<ObjectClassExport[]>): void {
    context.getResourceLoader().getResources('environmentPostProcessor', next);
  }
}

class ApplicationEventPublishListener extends ApplicationStartupListener {
  eventPublisher: ApplicationEventPublisher
  constructor() {
    super();
    this.eventPublisher = new ApplicationEventPublisher();
  }
  onApplicationStarting(context: ApplicationContext): void {
    this.eventPublisher.multicastEvent(new ApplicationStartupEvent(APP_STARTING, context));
  }
  onEnvironmentPrepared(context: ApplicationContext, environment: ApplicationEnvironment): void {
    this.eventPublisher.multicastEvent(new ApplicationStartupEvent(APP_START_ENV, context, environment));
  }
  onContextPrepared(context: ApplicationContext): void {
    this.eventPublisher.multicastEvent(new ApplicationStartupEvent(APP_START_CONTEXT, context));
  }
}

const applicationListener = [
  {object: ApplicationEventPublishListener},
  {object: EnvironmentPostProcessListener}
];

export {
  ApplicationListener,
  ApplicationStartupListener,
  ApplicationEventPublishListener,
  EnvironmentPostProcessListener,
  applicationListener
}