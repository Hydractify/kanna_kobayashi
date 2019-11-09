import { RandomImageResult } from '../types/weeb/RandomImageResult';
import { TagsResult } from '../types/weeb/TagsResult';
import { TypesResult } from '../types/weeb/TypesResult';
import { APIRouter, buildRouter } from './Api';

/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const { weebToken } = require('../../data');
const api: () => APIRouter = buildRouter({
	baseURL: 'https://api.weeb.sh',
	defaultHeaders: {
		accept: 'application/json',
		authorization: weebToken,
	},
});

export interface IFetchRandomOptions {
	filetype?: string;
	hidden?: boolean;
	nsfw?: boolean;
	tags?: string;
	type?: string;
}

export const fetchTags: (showHidden?: boolean) => Promise<string[]> =
	(showHidden: boolean = false): Promise<string[]> =>
		api()
			.images
			.tags
			.get<TagsResult>({ query: { showHidden } })
			.then((res: TagsResult) => res.tags);

export const fetchTypes: (showHidden?: boolean) => Promise<string[]> =
	(showHidden: boolean = false): Promise<string[]> =>
		api()
			.images
			.types
			.get<TypesResult>({ query: { showHidden } })
			.then((res: TypesResult) => res.types);

export const fetchRandom: (options: IFetchRandomOptions) => Promise<RandomImageResult>
	= (options: IFetchRandomOptions): Promise<RandomImageResult> =>
	{
		if (!options.type && !options.tags) throw new Error('One of "type" or "tags" is required to fetch a random image!');

		return api().images.random.get<RandomImageResult>({ query: options as any });
	};
