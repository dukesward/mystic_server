import { ApplicationContext, ApplicationEnvironment } from "./application";

interface EnvironmentPostProcessor {
  postProcessEnvironment(context: ApplicationContext, environment: ApplicationEnvironment): void
}

export {
  EnvironmentPostProcessor
}