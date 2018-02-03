// tslint:disable:ban-types only-arrow-functions

import { PostgreSQL } from '../structures/PostgreSQL';

/**
 * Adds a reference to the redis client to the class or class prototype.
 * Defaults to adding to the prototype.
 */
export function Sequelize(defineStatic: boolean): ClassDecorator;
export function Sequelize<T extends Function>(constructor: T): void;
export function Sequelize<T extends Function>(firstParam: T | boolean): void | ClassDecorator {
	if (typeof firstParam === 'boolean') {
		return function <R extends Function>(constructor: R): void {
			Reflect.defineProperty(constructor, 'sequelize', { value: PostgreSQL.instance.db });
		};
	}

	Reflect.defineProperty(firstParam.prototype, 'sequelize', { value: PostgreSQL.instance.db });
}
