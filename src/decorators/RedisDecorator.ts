// tslint:disable:ban-types only-arrow-functions

import { Redis as RedisClass } from '../structures/Redis';

/**
 * Adds a reference to the redis client to the class or class prototype.
 * Defaults to adding to the prototype.
 */
export function Redis(defineStatic: boolean): ClassDecorator;
export function Redis<T extends Function>(constructor: T): void;
export function Redis<T extends Function>(firstParam: T | boolean): void | ClassDecorator {
	if (typeof firstParam === 'boolean') {
		return function <R extends Function>(constructor: R): void {
			Reflect.defineProperty(constructor, 'redis', { value: RedisClass.instance.db });
		};
	}

	Reflect.defineProperty(firstParam.prototype, 'redis', { value: RedisClass.instance.db });
}
