import { IResult } from './IResult';

export type RandomImageResult = {
	account: string;
	baseType: string;
	filetype: string;
	hidden: boolean;
	id: string;
	mimeType: string;
	nsfw: boolean;
	tags: string[];
	type: string;
	url: string;
} & IResult;
