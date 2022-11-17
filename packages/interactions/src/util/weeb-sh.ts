import { emitWarning } from 'node:process';
import { stringify } from 'node:querystring';
import { request } from 'undici';
import { WEEB_SH_TOKEN } from '../config.js';
import { WeebError } from '../errors/WeebError.js';

export type WeebFetchOptions = {
	filetype?: string;
	hidden?: boolean;
	nsfw?: boolean;
	tags?: string;
	type?: string;
};

export type RandomImageResult = {
	account: string;
	baseType: string;
	filetype: string;
	hidden: boolean;
	id: string;
	mimeType: string;
	nsfw: boolean;
	status: number;
	tags: string[];
	type: string;
	url: string;
};

export async function fetchRandom(options: WeebFetchOptions): Promise<RandomImageResult> {
	if (!WEEB_SH_TOKEN) {
		emitWarning('Required a weeb.sh token, but none was configured!', 'MissingConfigurationWarning');

		throw new Error('Cannot fetch random image when no weeb sh token was provided.');
	}

	if (!options.type && !options.tags) {
		throw new TypeError('One of "type" or "tags" is required to fetch a random image.');
	}

	const url = `https://api.weeb.sh/images/random?${stringify(options)}`;
	const { statusCode, body } = await request(url, {
		headers: {
			accept: 'application/json',
			authorization: WEEB_SH_TOKEN,
			'User-Agent': `Kanna-Kobayashi, a discord bot. v? (https://github.com/hydractify/kanna-kobayashi)`,
		},
	});

	if (statusCode !== 200) {
		throw new WeebError(url, statusCode, await body.text());
	}

	return body.json();
}
