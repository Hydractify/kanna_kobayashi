import { Redis } from '../structures/Redis';

// tslint:disable-next-line:ban-types only-arrow-functions
export function redis<T extends Function>(constructor: T): void {
	Reflect.defineProperty(constructor, 'redis', { value: Redis.instance.db });
}
