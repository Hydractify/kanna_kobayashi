/**
 * MIT License

 * Copyright (c) Microsoft Corporation. All rights reserved.

 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE
 **/

// Type definitions for snekfetch 3.6
// Project: https://github.com/GusCaplan/snekfetch
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// DefinitelyTyped Repo: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/snekfetch
// Definitions originally by: Iker Pérez Brunelli <https://github.com/DarkerTV>
// Definitions modified by: SpaceEEC <https://github.com/SpaceEEC>
// TypeScript Version: 2.6.2

declare module 'snekfetch' {
	import { Agent, ClientRequest } from 'http';
	import { Readable } from 'stream';

	module Snekfetch {
		interface SnekfetchOptions {
			agent?: Agent;
			data?: any;
			followRedirects?: boolean;
			headers?: { [key: string]: any };
			qs?: { [key: string]: any };
			query?: string | { [key: string]: any };
			version?: 1 | 2;
		}

		interface Result<T = any> {
			// You are not going to annoy me any longer :^)
			body: T;
			ok: boolean;
			request: ClientRequest;
			status: number;
			statusText: string;
			text: string;
		}

		type methods = 'ACL'
			| 'BIND'
			| 'BREW'
			| 'CHECKOUT'
			| 'CONNECT'
			| 'COPY'
			| 'DELETE'
			| 'GET'
			| 'HEAD'
			| 'LINK'
			| 'LOCK'
			| 'MERGE'
			| 'MKACTIVITY'
			| 'MKCALENDAR'
			| 'MKCOL'
			| 'MOVE'
			| 'NOTIFY'
			| 'OPTIONS'
			| 'PATCH'
			| 'POST'
			| 'PROPFIND'
			| 'PROPPATCH'
			| 'PURGE'
			| 'PUT'
			| 'REBIND'
			| 'REPORT'
			| 'SEARCH'
			| 'SUBSCRIBE'
			| 'TRACE'
			| 'UNBIND'
			| 'UNLINK'
			| 'UNLOCK'
			| 'UNSUBSCRIBE';
	}

	class Snekfetch<T = any> extends Readable {
		static METHODS: Snekfetch.methods[];
		static version: string;

		data: any;
		request: ClientRequest;
		readonly response: Snekfetch.Result<T> | null;

		constructor(method: Snekfetch.methods, url: string, opts?: Snekfetch.SnekfetchOptions);

		static acl<T = any>(url: string, opts?: Snekfetch.SnekfetchOptions): Snekfetch<T>;
		static bind<T = any>(url: string, opts?: Snekfetch.SnekfetchOptions): Snekfetch<T>;
		static brew<T = any>(url: string, opts?: Snekfetch.SnekfetchOptions): Snekfetch<T>;
		static checkout<T = any>(url: string, opts?: Snekfetch.SnekfetchOptions): Snekfetch<T>;
		static connect<T = any>(url: string, opts?: Snekfetch.SnekfetchOptions): Snekfetch<T>;
		static copy<T = any>(url: string, opts?: Snekfetch.SnekfetchOptions): Snekfetch<T>;
		static delete<T = any>(url: string, opts?: Snekfetch.SnekfetchOptions): Snekfetch<T>;
		static get<T = any>(url: string, opts?: Snekfetch.SnekfetchOptions): Snekfetch<T>;
		static head<T = any>(url: string, opts?: Snekfetch.SnekfetchOptions): Snekfetch<T>;
		static link<T = any>(url: string, opts?: Snekfetch.SnekfetchOptions): Snekfetch<T>;
		static lock<T = any>(url: string, opts?: Snekfetch.SnekfetchOptions): Snekfetch<T>;
		static merge<T = any>(url: string, opts?: Snekfetch.SnekfetchOptions): Snekfetch<T>;
		static mkactivity<T = any>(url: string, opts?: Snekfetch.SnekfetchOptions): Snekfetch<T>;
		static mkcalendar<T = any>(url: string, opts?: Snekfetch.SnekfetchOptions): Snekfetch<T>;
		static mkcol<T = any>(url: string, opts?: Snekfetch.SnekfetchOptions): Snekfetch<T>;
		static move<T = any>(url: string, opts?: Snekfetch.SnekfetchOptions): Snekfetch<T>;
		static notify<T = any>(url: string, opts?: Snekfetch.SnekfetchOptions): Snekfetch<T>;
		static options<T = any>(url: string, opts?: Snekfetch.SnekfetchOptions): Snekfetch<T>;
		static patch<T = any>(url: string, opts?: Snekfetch.SnekfetchOptions): Snekfetch<T>;
		static post<T = any>(url: string, opts?: Snekfetch.SnekfetchOptions): Snekfetch<T>;
		static propfind<T = any>(url: string, opts?: Snekfetch.SnekfetchOptions): Snekfetch<T>;
		static proppatch<T = any>(url: string, opts?: Snekfetch.SnekfetchOptions): Snekfetch<T>;
		static purge<T = any>(url: string, opts?: Snekfetch.SnekfetchOptions): Snekfetch<T>;
		static put<T = any>(url: string, opts?: Snekfetch.SnekfetchOptions): Snekfetch<T>;
		static rebind<T = any>(url: string, opts?: Snekfetch.SnekfetchOptions): Snekfetch<T>;
		static report<T = any>(url: string, opts?: Snekfetch.SnekfetchOptions): Snekfetch<T>;
		static search<T = any>(url: string, opts?: Snekfetch.SnekfetchOptions): Snekfetch<T>;
		static subscribe<T = any>(url: string, opts?: Snekfetch.SnekfetchOptions): Snekfetch<T>;
		static trace<T = any>(url: string, opts?: Snekfetch.SnekfetchOptions): Snekfetch<T>;
		static unbind<T = any>(url: string, opts?: Snekfetch.SnekfetchOptions): Snekfetch<T>;
		static unlink<T = any>(url: string, opts?: Snekfetch.SnekfetchOptions): Snekfetch<T>;
		static unlock<T = any>(url: string, opts?: Snekfetch.SnekfetchOptions): Snekfetch<T>;
		static unsubscribe<T = any>(url: string, opts?: Snekfetch.SnekfetchOptions): Snekfetch<T>;

		attach(name: string, data: string | object | Buffer, filename?: string): Snekfetch<T>;

		end(): Promise<Snekfetch.Result<T>>;
		end<U>(cb: (err: Error & Snekfetch.Result<T> | null, res: Snekfetch.Result<T> & Error | null) => U): Promise<U>;

		query(name: string | { [key: string]: string }, value?: string): Snekfetch<T>;

		set(name: string | { [key: string]: string }, value?: string): Snekfetch<T>;

		send(data?: any): Snekfetch<T>;

		then(): Promise<Snekfetch.Result<T>>;
		then<U>(resolver: (res: Snekfetch.Result<T>) => U, rejector?: (err: Error & Snekfetch.Result<T>) => any): Promise<U>;

		catch(rejector: (err: Error & Snekfetch.Result<T>) => any): Promise<Snekfetch.Result<T>>;
	}

	export = Snekfetch;
}

