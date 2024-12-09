import { ApplicationEnvironment } from "@core/application";
import { ObjectDefinitionPostProcessor, ObjectFactory } from "@core/object_factory";

class ConfigObjectPostProcessor implements ObjectDefinitionPostProcessor {
	_environment: ApplicationEnvironment
	constructor(environment: ApplicationEnvironment) {
		this._environment = environment;
	}
	postProcess(factory: ObjectFactory): void {
		throw new Error("Method not implemented.");
	}
}

const objectDefinitionPostProcessor = [
	{object:ConfigObjectPostProcessor}
]

export {
	ConfigObjectPostProcessor,
	objectDefinitionPostProcessor
};