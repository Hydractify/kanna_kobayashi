import { IAniListAllTypes } from './AniListMixins';

export type CharData = {
	info: string;
	name_alt: string;
	name_first: string;
	name_japanese: string;
	name_last: string;
	role: string;
	/**
	 * For ts compatability
	 * Obviously not present here
	 */
	series_type: never;
} & IAniListAllTypes;
