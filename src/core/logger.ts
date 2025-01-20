import { ObjectInstance } from "./types";

const log4js = require('log4js');
const jsonLayout = require('log4js-json-layout');

log4js.addLayout('json', jsonLayout);
log4js.configure({
  appenders: {
    out: { type: 'stdout' },
    app: { type: 'file', filename: 'app.log', layout: { type: 'json' } },
  },
  categories: {
    default: { appenders: ['out'], level: 'all' },
    app: { appenders: ['app'], level: 'debug' },
  },
});

const AppLogger = log4js.getLogger('out');

type Logger = {
  info: (message: any) => void;
  debug: (message: any) => void;
  error: (message: any) => void;
  warn: (message: any) => void;
  fatal: (message: any) => void;
};

class AppLoggerBuilder {
  static build(caller: string | ObjectInstance<any>, processor?: (m: any) => string) {
    // AppLogger.info(`[${caller.constructor.name}]`);
    let name = typeof caller === 'string' ? caller : caller.instance.constructor.name;
    processor = processor || ((m: any) => {
      let s = typeof m === 'string' ? m : m.constructor ? m.constructor.name : JSON.stringify(m);
      return `[${name}] ${s}`;
    });
    return {
      info: (message: any) => AppLogger.info(processor(message)),
      debug: (message: any) => AppLogger.debug(processor(message)),
      error: (message: any) => AppLogger.error(processor(message)),
      warn: (message: any) => AppLogger.warn(processor(message)),
      fatal: (message: any) => AppLogger.fatal(processor(message))
    };
  }
}

export type {
  Logger
}

export {
  AppLoggerBuilder,
  AppLogger
}