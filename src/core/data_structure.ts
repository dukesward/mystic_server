import { MethodNotImplemented } from "./exceptions"
import { AppLogger } from "./logger"
import { Consumer, Converter, Predicate, Supplier } from "./types"

interface ObjectIterable<T> {
  each(action: Consumer<T>): void
  size(): number
  [Symbol.iterator](): Iterator<T | null, any, any>
}

interface ObjectFilterable<T> extends ObjectIterable<T> {
  filter(condition: Predicate<T>): ObjectIterable<T>
}

interface ObjectList<T> extends ObjectIterable<T> {
  get(i: number): ObjectListNode<T> | null
  add(o: T): void
  addAll(o: T[]): void
}

interface ObjectArrayList<T> extends ObjectIterable<T> {
  get(i: number): T | null
  add(o: T): void
  from(items: T[]): void
  to(): T[]
}

interface ObjectIterableList<T> extends ObjectIterable<T> {
  last(): ObjectListNode<T> | null
  next(): ObjectListNode<T> | null
  hasNext(): boolean
}

interface ObjectListNode<T> {
  empty(): boolean
  previous(): ObjectListNode<T> | null
  next(): ObjectListNode<T> | null
  setNext(t: ObjectListNode<T>): void
  get(): T | null
  set(t: T): void
}

interface ObjectLinkedList<T> extends ObjectList<T> {
  first(): T | null
  last(): T | null
  next(): T | null
}

interface ObjectMap<T> extends ObjectIterable<T> {
  get(key: string): T | null
  put(key: string, val: T): void
  contains(key: string): boolean
  toList(): T[]
}

interface ObjectSortableMap<T> extends ObjectMap<T> {
  sort(sortBy: Converter<T, number>): T[]
}

interface ObjectHashMap<T> extends ObjectMap<T> {
  hash(obj: T): number
}

interface ObjectTree<T> {

}

class SimpleLinkedListNode<T> implements ObjectListNode<T> {
  _t: T | null
  _previous: ObjectListNode<T> | null
  _next: ObjectListNode<T> | null
  constructor(t?: T) {
    this._t = typeof t === 'undefined' ? null : t;
    this._previous = null;
    this._next = null;
  }
  empty(): boolean {
    return this._t === null;
  }
  previous(): ObjectListNode<T> | null {
    return this._previous;
  }
  next(): ObjectListNode<T> | null {
    return this._next;
  }
  setNext(node: ObjectListNode<T>): void {
    this._next = node;
  }
  get(): T | null {
    return this._t;
  }
  set(t: T): void {
    this._t = t;
  }
}

class SimpleLinkedListIterator<T> implements Iterator<T | null, any, T> {
  private node: ObjectListNode<T> | null
  private index: number
  constructor(node: ObjectListNode<T>) {
    this.node = node;
    this.index = 0;
  }
  next(): IteratorResult<T | null, any> {
    if(this.node && this.node.next()) {
      this.node = this.node.next();
      this.index ++;
      if(this.node) {
        return {
          done: false,
          value: this.node.get()
        }
      }
    }
    return {
      done: true,
      value: 0
    }
  }
  return?(value?: any): IteratorResult<T, any> {
    throw new MethodNotImplemented("SimpleLinkedListIterator::return");
  }
  throw?(e?: any): IteratorResult<T, any> {
    AppLogger.error(e);
    return {
      done: true,
      value: -1
    }
  }
}

class SimpleLinkedList<T> implements ObjectLinkedList<T> {
  _node: ObjectListNode<T>
  _size: number
  constructor(t?: T) {
    this._node = typeof t === 'undefined' ? new SimpleLinkedListNode() : new SimpleLinkedListNode(t);
    this._size = 0;
  }
  size(): number {
    return this._size;
  }
  add(t: T): void {
    if(this._node.empty()) {
      this._node.set(t);
    }else {
      this._node.setNext(new SimpleLinkedListNode(t));
    }
    this._size ++;
  }
  addAll(o: T[]): void {
    for(let item of o) {
      this.add(item);
    }
  }
  first(): T | null {
    throw new MethodNotImplemented("SimpleLinkedList::first");
  }
  last(): T | null {
    throw new MethodNotImplemented("SimpleLinkedList::last");
  }
  next(): T | null {
    return (this._node && this._node.next()) ? (this._node.next()?.get() || null) : null;
  }
  get(i: number): ObjectListNode<T> {
    let index: number = 0;
    let node: ObjectListNode<T> | null = this._node;
    while(++index <= i && index < this.size()) {
      if(node && !node.empty()) node = node.next();
    }
    return node || this._node;
  }
  each(action: Consumer<T>): void {
    throw new MethodNotImplemented("SimpleLinkedList::each");
  }
  [Symbol.iterator](): Iterator<T | null, any, T> {
    return new SimpleLinkedListIterator<T>(this._node);
  }
}

class SimpleArrayList<T> implements ObjectArrayList<T> {
  private items: T[] = []
  constructor(items?: T[]) {
    if(items) this.items.concat(items);
  }
  get(i: number): T | null {
    return i < this.items.length ? this.items[i] : null;
  }
  add(o: T): void {
    throw new MethodNotImplemented("SimpleArrayList::add");
  }
  from(items: T[]): void {
    throw new MethodNotImplemented("SimpleArrayList::from");
  }
  to(): T[] {
    throw new MethodNotImplemented("SimpleArrayList::to");
  }
  each(action: Consumer<T>): void {
    throw new MethodNotImplemented("SimpleArrayList::each");
  }
  size(): number {
    return this.items.length;
  }
  [Symbol.iterator](): Iterator<T | null, any, any> {
    throw new MethodNotImplemented("SimpleArrayList::Symbol.iterator");
  }
}

class FilterableLinkedList<T> extends SimpleLinkedList<T> implements ObjectFilterable<T> {
  filter(condition: Predicate<T>): ObjectIterable<T> {
    throw new MethodNotImplemented("FilterableLinkedList::filter");
  }
}

class SimpleMapIterator<T> implements Iterator<T, any, T> {
  private map: { [key: string]: T }
  private index: number
  constructor(map: { [key: string]: T }) {
    this.map = map;
    this.index = 0;
  }
  next(): IteratorResult<T, any> {
    if(Object.keys(this.map).length > this.index) {
      let keys: string[] = Object.keys(this.map);
      this.index ++;
      return {
        done: false,
        value: this.map[keys[this.index]]
      }
    }
    return {
      done: true,
      value: 0
    }
  }
  return?(value?: any): IteratorResult<T, any> {
    throw new MethodNotImplemented("SimpleMapIterator::return");
  }
  throw?(e?: any): IteratorResult<T, any> {
    AppLogger.error(e);
    return {
      done: true,
      value: -1
    }
  }
}

class SimpleMap<T> implements ObjectMap<T> {
  private map: { [key: string]: T } = {}
  get(key: string): T | null {
    if(!this.map[key]) return null;
    return this.map[key];
  }
  put(key: string, val: T): void {
    this.map[key] = val;
  }
  size(): number {
    return Object.keys(this.map).length;
  }
  each(action: Consumer<T>): void {
    
  }
  contains(key: string): boolean {
    for(let o in this.map) {
      if(o === key) return true;
    }
    return false;
  }
  toList(): T[] {
    return Object.values(this.map);
  }
  [Symbol.iterator](): Iterator<T, number, T> {
    return new SimpleMapIterator<T>(this.map);
  }
}

class SimpleSortableMap<T> extends SimpleMap<T> implements ObjectSortableMap<T> {
  sort(sortBy: Converter<T, number>): T[] {
    let list: T[] = this.toList();
    list.sort((a: T, b: T) => {
      return sortBy(a) - sortBy(b);
    });
    return list;
  }
}

class SimpleBinaryTree<T> implements ObjectTree<T> {

}

export {
  ObjectIterable,
  ObjectFilterable,
  ObjectList,
  ObjectArrayList,
  ObjectListNode,
  ObjectIterableList,
  ObjectLinkedList,
  FilterableLinkedList,
  ObjectMap,
  ObjectSortableMap,
  ObjectHashMap,
  ObjectTree,
  SimpleLinkedListNode,
  SimpleLinkedListIterator,
  SimpleLinkedList,
  SimpleArrayList,
  SimpleMapIterator,
  SimpleMap,
  SimpleSortableMap,
  SimpleBinaryTree
}