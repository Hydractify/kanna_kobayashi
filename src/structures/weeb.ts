import { RandomImageResult } from '../types/weeb/RandomImageResult';
import { TagsResult } from '../types/weeb/TagsResult';
import { TypesResult } from '../types/weeb/TypesResult';
import { APIRouter, buildRouter } from './Api';
import { WeebError } from './WeebError';

/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const { weebToken } = require('../../data');
const api: () => APIRouter = buildRouter({
	baseURL: 'https://api.weeb.sh',
	defaultHeaders: {
		accept: 'application/json',
		authorization: weebToken,
	},
});

export interface IFetchRandomOptions
{
	filetype?: string;
	hidden?: boolean;
	nsfw?: boolean;
	tags?: string;
	type?: string;
}

export async function fetchTags(showHidden: boolean = false): Promise<string[]>
{
	try
	{
		const { tags } = await api().images.tags.get<TagsResult>({ query: { showHidden } });
		return tags;
	}
	catch (error)
	{
		throw Object.assign(new WeebError(error.message), error);
	}
}

export async function fetchTypes(showHidden: boolean = false): Promise<string[]>
{
	try
	{
		const { types } = await api().images.types.get<TypesResult>({ query: { showHidden } });
		return types;
	}
	catch (error)
	{
		throw Object.assign(new WeebError(error.message), error);
	}
}

export async function fetchRandom(options: IFetchRandomOptions): Promise<RandomImageResult>
{
	if (!options.type && !options.tags) throw new Error('One of "type" or "tags" is required to fetch a random image!');

	try
	{
		return await api().images.random.get<RandomImageResult>({ query: options as any });
	}
	catch (error)
	{
		throw Object.assign(new WeebError(error.message), error);
	}
}
