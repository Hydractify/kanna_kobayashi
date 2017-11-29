// tslint:disable no-any comment-format

// https://github.com/hydrabolt/discord.js/blob/27ccad1f1c209d1222d5846e44aa2caba2ed536d/src/rest/APIRouter.js

import { stringify } from 'querystring';
import * as snekfetch from 'snekfetch';

const { version } = require('../../package');

const noop: any = (): void => undefined;
const methods: PropertyKey[] = ['get', 'post', 'delete', 'patch', 'put'];
const reflectors: PropertyKey[] = [
	'toString', 'valueOf', 'inspect', 'constructor',
	Symbol.toPrimitive, Symbol.for('util.inspect.custom'),
];

const ua: { [key: string]: string } = {
	'User-Agent': `Kanna-Kobayashi, a discord bot. v${version} (https://github.com/TheDragonProject/Kanna-Kobayashi)`,
};

// tslint:disable-next-line:only-arrow-functions
export function buildRouter(options: IAPIRouterOptions): () => APIRouter {
	if (options.defaultHeaders) Object.assign(options.defaultHeaders, ua);
	else options.defaultHeaders = { ...ua };

	return (): APIRouter => router(options);
}
const router: (options: IAPIRouterOptions) => APIRouter = ({
	baseURL,
	catchNotFound = true,
	defaultHeaders = {},
	defaultQueryParams = {},
}: IAPIRouterOptions): APIRouter => {
	const route: PropertyKey[] = [''];

	const handler: ProxyHandler<any> = {
		get(target: () => void, name: PropertyKey): any {
			if (reflectors.includes(name)) return (): string => route.join('/');
			if (methods.includes(name)) {
				return <T = any>(options: IAPIOptions): Promise<T> => {
					let path: string = `${baseURL}${route.join('/')}`;
					if (options.query) {
						const queryString: string = (stringify({
							...defaultQueryParams,
							...options.query,
						}).match(/[^=&?]+=[^=&?]+/g) || []).join('&');
						path += `?${queryString}`;
					}

					const request: snekfetch = new snekfetch(name as any, path, {
						headers: defaultHeaders,
					});

					if (options.headers) request.set(options.headers);
					if (options.data) request.send(options.data);

					return request
						.then<any>((res: snekfetch.Result) => res.body)
						.catch((error: Error & snekfetch.Result) => {
							if (!catchNotFound || error.status !== 404) throw error;
						});
				};
			}
			route.push(name);

			return new Proxy<APIRouter>(noop, handler);
		},
		apply(target: () => void, _: any, args: any[]): any {
			// tslint:disable-next-line:triple-equals no-null-keyword
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
	data?: string;
	headers?: { [name: string]: string };
	query?: { [name: string]: string | number | boolean };
}

export interface IAPIRouterOptions {
	baseURL: string;
	catchNotFound?: boolean;
	defaultHeaders?: { [name: string]: string };
	defaultQueryParams?: { [name: string]: string | number };
}
