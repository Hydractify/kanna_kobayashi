// tslint:disable:ban-types only-arrow-functions no-any
import { Logger } from '../structures/Logger';
import { LogLevel } from '../types/LogLevel';

// Original idea from:
// Link: https://github.com/RobinBuschmann/sequelize-typescript/blob/master/lib/annotations/Column.ts
export function Loggable(defineStatic: boolean): ClassDecorator;
export function Loggable(prefix: string, defineStatic?: boolean): ClassDecorator;
export function Loggable<T extends Function>(constructor: T): void;
export function Loggable<T extends Function>(
	firstParam: T | string | boolean,
	defineStatic?: boolean,
): ClassDecorator | void {
	if (typeof firstParam === 'string') {
		return function <R extends Function>(constructor: R): void {
			const target: object = defineStatic ? constructor : constructor.prototype;

			Reflect.defineProperty(target, 'logger', {
				value: new Proxy(Logger.instance, getHandler(firstParam)),
			});
		};
	}

	if (typeof firstParam === 'boolean') {
		return function <R extends Function>(constructor: R): void {
			const target: object = defineStatic ? constructor : constructor.prototype;

			Reflect.defineProperty(target, 'logger', { value: Logger.instance });
		};
	}

	Reflect.defineProperty(firstParam.prototype, 'logger', { value: Logger.instance });
}

function getHandler(prefix: string | undefined): ProxyHandler<Logger> {
	return {
		get: (target: Logger, prop: keyof Logger): (...data: any[]) => Promise<void> | void => {
			if (typeof target[prop] === 'function') {
				if (prop === 'setLogLevel') {
					return (level: LogLevel): void =>
						target[prop](level);
				}

				return (...data: any[]): Promise<void> =>
					target[prop](prefix, ...data);
			}

			return target[prop];
		},
	};
}
