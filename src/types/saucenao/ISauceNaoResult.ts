import { IAnidbData } from './IAniDbData';
import { IBcyData } from './IBcyData';
import { IDanbooruData } from './IDanbooruData';
import { IDeviantArtData } from './IDeviantArtData';
import { INicoVideoData } from './INiceVideoData';
import { IPawooData } from './IPawooData';
import { IPixivData } from './IPixivData';
import { ISankakuData } from './ISankakuData';

type DefaultData = IPixivData
	| IDeviantArtData
	| IPawooData
	| ISankakuData
	| IBcyData
	| IAnidbData
	| INicoVideoData
	| IDanbooruData;

export interface ISauceNaoResult<T = DefaultData> {
	header: {
		account_type: string;
		index: {
			id: number;
			parent_id: number;
			results: number;
			status: number;
		}[];
		long_limit: string;
		long_remaining: number;
		minimum_similarity: number;
		query_image: string;
		query_image_display: string;
		results_requested: number;
		results_returned: number;
		search_depth: string;
		short_limit: string;
		short_remaining: number;
		status: number;
		user_id: string;
	};
	results: {
		data: T & {
			ext_urls: string[];
		};
		header: {
			index_id: number;
			index_name: string;
			similarity: string;
			thumbnail: string;
		};
	}[];
}
