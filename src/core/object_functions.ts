import { ObjectIterable } from "./data_structure";
import { AppLogger, AppLoggerBuilder, Logger } from "./logger";
import { ObjectConversionService } from "./object_properties";
import { GenericConstructor } from "./types"

interface Ordered {
  getOrder(): number
}

interface ObjectProperty {
  empty(): boolean
  getElement(i: number): string | null
  getFullName(): string
}

interface ObjectParser<T> {
  parse(t: T): string[]
}

interface ObjectInvokerChain<T> {
  invoke(action: (item: T) => void): void
  hasNext(): boolean
}

class ObjectConstructorParser implements ObjectParser<GenericConstructor> {
  parse(gc: GenericConstructor): string[] {
    let str = gc.toString();
    let lines = str.split('\n');
    if(lines.length) {
      let classDef: string = lines[0];
      let matched: RegExpMatchArray | null = classDef.match(/class (.*?) extends (.*?) {/);
      if(matched && matched.length) {
        return [matched[1], matched[2]];
      }else {
        matched = classDef.match(/class (.*?) {/);
        if(matched && matched.length) {
          return [matched[1]];
        }
      }
    }
    return [];
  }
}

class ObjectSimpleInvokerChain<T> implements ObjectInvokerChain<T> {
  private items: ObjectIterable<T>
  private index: number
  private logger: Logger
  constructor(items: ObjectIterable<T>) {
    this.items = items;
    this.index = 0;
    this.logger = AppLoggerBuilder.build({instance: this});
  }
  invoke(action: (item: T) => void): void {
    let self = this;
    let generator: Generator = (function *() {
      for(let i of self.items) {
        // self.logger.debug(i);
        self.index ++;
        if(i) yield action(i);
      }
    })();
    while(this.hasNext()) {
      generator.next();
    }
  }
  hasNext(): boolean {
    return this.index < this.items.size();
  }
}

export {
  Ordered,
  ObjectProperty,
  ObjectParser,
  ObjectConstructorParser,
  ObjectInvokerChain,
  ObjectSimpleInvokerChain
}