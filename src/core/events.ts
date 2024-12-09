import { ApplicationContext, ApplicationEnvironment } from "./application"
import { FilterableLinkedList, ObjectFilterable, ObjectIterable, SimpleArrayList } from "./data_structure"
import { ApplicationListener } from "./listeners"

interface ApplicationEvent {
  getTimestamp(): number
  getEventType(): string
}

class ApplicationStartupEvent implements ApplicationEvent {
  _type: string
  _context: ApplicationContext
  _environment?: ApplicationEnvironment
  _timestamp: number
  constructor(type: string, context: ApplicationContext, environment?: ApplicationEnvironment) {
    this._type = type;
    this._context = context;
    this._environment = environment;
    this._timestamp = Date.now();
  }
  getApplicationContext(): ApplicationContext {
    return this._context;
  }
  getApplicationEnvironment(): ApplicationEnvironment {
    return this._environment || this._context.getEnvironment();
  }
  getTimestamp(): number {
    return this._timestamp;
  }
  getEventType(): string {
    return this._type;
  }
}

class ApplicationPayloadEvent<T> implements ApplicationEvent {
  _type: string
  _timestamp: number
  _payload: T
  constructor(type: string, payload: T) {
    this._type = type;
    this._payload = payload;
    this._timestamp = Date.now();
  }
  getTimestamp(): number {
    return this._timestamp;
  }
  getEventType(): string {
    return this._type;
  }
}

class ApplicationEventPublisher {
  _listeners: ObjectFilterable<ApplicationListener>
  constructor() {
    this._listeners = new FilterableLinkedList<ApplicationListener>();
  }
  getApplicationListeners(): ObjectIterable<ApplicationListener> {
    if(this._listeners) {
      return this._listeners;
    }
    throw new Error("Method not implemented.");
  }
  multicastEvent(event: ApplicationEvent): void {

  }
}

export {
  ApplicationEvent,
  ApplicationStartupEvent,
  ApplicationPayloadEvent,
  ApplicationEventPublisher
}