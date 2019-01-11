// tslint:disable comment-format

// https://github.com/hydrabolt/discord.js/blob/27ccad1f1c209d1222d5846e44aa2caba2ed536d/src/rest/APIRouter.js

import * as fetch from 'node-fetch';
import { stringify } from 'querystring';

const { version } = require('../../package');

const noop: any = (): void => undefined;
const methods: string[] = ['get', 'post', 'delete', 'patch', 'put'];
const reflectors: PropertyKey[] = [
	'toString', 'valueOf', 'inspect', 'constructor',
	Symbol.toPrimitive, Symbol.for('util.inspect.custom'),
];

const ua: { [key: string]: string } = {
	'User-Agent': `Kanna-Kobayashi, a discord bot. v${version} (https://github.com/hydractify/kanna-kobayashi)`,
};

export const buildRouter: (options: IAPIRouterOptions) => () => APIRouter
	= (options: IAPIRouterOptions): () => APIRouter => {
		options.defaultHeaders = options.defaultHeaders
			? { ...options.defaultHeaders, ...ua }
			: { ...ua };

		return (): APIRouter => router(options);
	};

const router: (options: IAPIRouterOptions) => APIRouter = ({
	baseURL,
	catchNotFound = true,
	defaultHeaders = {},
	defaultQueryParams = {},
}: IAPIRouterOptions): APIRouter => {
	const route: string[] = [''];

	const handler: ProxyHandler<any> = {
		get(target: () => void, name: string): any {
			if (reflectors.includes(name)) return (): string => route.join('/');
			if (methods.includes(name)) {
				return async <T = any>(options: IAPIOptions = {}): Promise<T> => {
					let url: string = `${baseURL}${route.join('/')}`;
					if (options.query) {
						const queryString: string = (stringify({
							...defaultQueryParams,
							...options.query,
						}).match(/[^=&?]+=[^=&?]+/g) || []).join('&');
						url += `?${queryString}`;
					}

					const res: fetch.Response = await fetch.default(url, {
						body: options.data ? JSON.stringify(options.data) : undefined,
						headers: options.headers
							? { ...options.headers, ...defaultHeaders }
							: defaultHeaders,
						method: name,
					});

					if (res.ok) return res[options.type || 'json']();

					if (res.status === 404 && catchNotFound) return undefined as any;

					return res.json()
						.catch(() => res.buffer())
						.catch(() => res.text())
						.catch(() => null)
						.then((body: any) =>
							Promise.reject(
								Object.assign(
									new Error(`${res.status}: ${res.statusText}`),
									body,
									res,
								),
							),
						);
				};
			}
			route.push(name);

			return new Proxy<APIRouter>(noop, handler);
		},
		apply(target: () => void, _: any, args: any[]): any {
			// tslint:disable-next-line:triple-equals
			route.push(...args.filter((x: any) => x != null));

			return new Proxy<APIRouter>(noop, handler);
		},
	};

	return new Proxy<APIRouter>(noop, handler);
};

export type APIRouter = IAPIRouteBuilder & IAPIRouteOptions;

interface IAPIRouteOptions {
	delete<T = any>(options?: IAPIOptions): Promise<T>;
	get<T = any>(options?: IAPIOptions): Promise<T>;
	patch<T = any>(options?: IAPIOptions): Promise<T>;
	post<T = any>(options?: IAPIOptions): Promise<T>;
	put<T = any>(options?: IAPIOptions): Promise<T>;
}

interface IAPIRouteBuilder {
	(...args: any[]): APIRouter;
	[route: string]: APIRouter;
}

export interface IAPIOptions {
	data?: any;
	headers?: { [name: string]: string };
	query?: { [name: string]: string | number | boolean };
	type?: {
		[K in keyof fetch.Body]: fetch.Body[K] extends () => void
		? K
		: never
	}[keyof fetch.Body];
}

export interface IAPIRouterOptions {
	baseURL: string;
	catchNotFound?: boolean;
	defaultHeaders?: { [name: string]: string };
	defaultQueryParams?: { [name: string]: string | number };
}
