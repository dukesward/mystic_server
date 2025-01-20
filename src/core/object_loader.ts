import Module from "module";
import { AppLogger } from "./logger";
import { ObjectClassExport, ObjectLoadingConfig } from "./types";
import { ModuleNotDefined } from "./exceptions";

interface ObjectLoader {
  loadObject(config: ObjectLoadingConfig): Promise<ObjectClassExport[]>;
}

class ApplicationRuntimeObjectLoader implements ObjectLoader {
	private rootUri: string
	constructor(rootUri?: string) {
		this.rootUri = rootUri || __dirname;
	}
	loadObject(config: ObjectLoadingConfig): Promise<ObjectClassExport[]> {
		let name = config.name;
		let module = config.module ? `applications/${config.module?.replace('.', '/')}` : "core";
		let objSrc = `${this.rootUri}${module}/${name}.js`;
		const o: Promise<Module> = import(objSrc);
		return o.then((val: any) => {
			let type: string = config.type;
			if(type in val) {
				let list: ObjectClassExport[] = val[type];
				// AppLogger.info(list[0]);
				/*for(let i=0; i< list.length; i++) {
					let item = list[i];
					AppLogger.info(new item());
				}*/
				return list;
			}
			return [];
		}).catch((err: any) => {
			AppLogger.error(err);
			return [];
		});
	}
}

class ModuleSpecificObjectLoader implements ObjectLoader {
	loadObject(config: ObjectLoadingConfig): Promise<ObjectClassExport[]> {
		let module = config.module?.replace(".", "/");
		if(module) {
			let moduleRoot = `file://${__dirname}/../../`;
			let objSrc = `${moduleRoot}/src/applications/${module}/${config.name}.js`;
			const o = import(objSrc);
			return o;
		}else {
			throw new ModuleNotDefined(`${module}/${config.name}.js`);
		}
	}
}

export {
	ObjectLoader,
	ApplicationRuntimeObjectLoader,
	ModuleSpecificObjectLoader
}