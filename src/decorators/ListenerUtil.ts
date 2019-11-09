/* eslint-disable */

/**
 * MIT License
 * Copyright (c) 2016 Zack Campbell
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 * to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
 * Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
 * OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * Repo: https://github.com/zajrik/yamdbf
 * File: https://github.com/zajrik/yamdbf/blob/bb0939603e3cc3874262749c92486032d4339b83/src/util/ListenerUtil.ts
 */

import 'reflect-metadata';
import { EventEmitter } from 'events';

/**
 * Represents metadata used to build an event listener
 * and assign it to a class method at runtime
 */
interface ListenerMetadata {
	event: string;
	method: PropertyKey;
	once: boolean;
	args: any[];
	attached?: boolean;
}

/**
 * Contains static decorator methods for declaring class methods (within a class extending `EventEmitter`)
 * as listeners for events that will be emitted by the class or parent classes
 *
 * >**Note:** This is a TypeScript feature. Javascript users are limited to creating listeners
 * the old fashioned `<EventEmitter>on/once(...)` way
 * @module ListenerUtil
 */
export class ListenerUtil
{
	/**
	 * Attaches any listeners registered via the `on` or `once` decorators.
	 * Must be called ***after*** `super()`, and only in classes extending `EventEmitter`
	 * (which includes the Discord.js Client class and thus the YAMDBF Client class)
	 *
	 * If the `listenerSource` parameter is provided, the object passed will be used
	 * as the source of methods to link with events from the given `EventEmitter`
	 * @static
	 * @method registerListeners
	 * @param {EventEmitter} emitter EventEmitter to register listeners for
	 * @param {object} [listenerSource] Object with registered methods to link events to
	 * @returns {void}
	 */
	public static registerListeners(emitter: EventEmitter, listenerSource?: object): void
	{
		if (!(emitter instanceof EventEmitter))
		{
			throw new TypeError('Listeners can only be registered on classes extending EventEmitter');
		}

		const listenerTarget: object = typeof listenerSource !== 'undefined' ? listenerSource : emitter;
		if (typeof Reflect.getMetadata('listeners', listenerTarget.constructor.prototype) === 'undefined') return;

		const metaDataTarget: any = listenerTarget.constructor.prototype;
		for (const listener of <ListenerMetadata[]>Reflect.getMetadata('listeners', metaDataTarget))
		{
			if (!(<any>listenerTarget)[listener.method]) continue;
			if (listener.attached) continue;

			listener.attached = true;
			const eventHandler: (...eventArgs: any[]) => void =
				(...eventArgs) => (<any>listenerTarget)[listener.method](...eventArgs, ...listener.args);

			emitter[listener.once ? 'once' : 'on'](listener.event, eventHandler);
		}
	}

	/**
	 * Declares the decorated method as an event handler for the specified event.
	 * Must be registered by calling {@link ListenerUtil.registerListeners()}
	 *
	 * > **Note:** `registerListeners()` is already called in the YAMDBF
	 * {@link Client} constructor and does not need to be called in classes
	 * extending it
	 * @static
	 * @method on
	 * @param {string} event The name of the event to handle
	 * @param {...any[]} args Additional static values to pass to the method.
	 * 						  Will be passed after any args passed by the event
	 * @returns {MethodDecorator}
	 */
	public static on(event: string, ...args: any[]): MethodDecorator
	{
		return ListenerUtil._setListenerMetadata(event, false, ...args);
	}

	/**
	 * Declares the decorated method as a single-use event handler for the
	 * specified event. Must be registered by calling
	 * {@link ListenerUtil.registerListeners()}
	 *
	 * > **Note:** `registerListeners()` is already called in the YAMDBF
	 * {@link Client} constructor and does not need to be called in classes
	 * extending it
	 * @static
	 * @method once
	 * @param {string} event The name of the event to handle
	 * @param {...any[]} args Additional static values to pass to the method.
	 * 						  Will be passed after any args passed by the event
	 * @returns {MethodDecorator}
	 */
	public static once(event: string, ...args: any[]): MethodDecorator
	{
		return ListenerUtil._setListenerMetadata(event, true, ...args);
	}

	/**
	 * Returns a MethodDecorator that handles setting the appropriate listener
	 * metadata for a class method
	 * @private
	 */
	private static _setListenerMetadata(event: string, once: boolean, ...args: any[]): MethodDecorator
	{
		return function <T>(target: Record<string, any>, key: PropertyKey, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T>
		{
			const listeners: ListenerMetadata[] = Reflect.getMetadata('listeners', target) || [];
			listeners.push({ event, method: key, once, args });
			Reflect.defineMetadata('listeners', listeners, target);
			return descriptor;
		};
	}
}
