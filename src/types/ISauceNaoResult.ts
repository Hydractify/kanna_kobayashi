export interface ISauceNaoResult {
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
		data: (
			IPixivData
			| IDeviantArtData
			| IPawooData
			| ISankakuData
			| IBcyData
			| IAnidbData
			| INicoVideoData
			| IDanbooruData
		) & {
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

interface IPixivData {
	member_id: number;
	member_name: string;
	pixiv_id: number;
	title: string;
}

interface IDeviantArtData {
	author_name: string;
	author_url: string;
	da_id: number;
	title: string;
}

interface IPawooData {
	created_at: string;
	pawoo_id: number;
	pawoo_user_acct: string;
	pawoo_user_display_name: string;
	pawoo_user_username: string;
}

interface ISankakuData {
	creator: string;
	sankaku_id: number;
	source: string;
}

interface IBcyData {
	bcy_id: number;
	bcy_type: string;
	member_id: number;
	member_link_id: number;
	member_name: string;
	title: string;
}

interface IAnidbData {
	anidb_aid: number;
	/**
	 * 'hh:mm:ss / hh:mm:ss'
	 */
	est_time: string;
	part: string;
	source: string;
	year: string;
}

interface INicoVideoData {
	member_id: number;
	member_name: string;
	seiga_id: number;
	title: string;
}

interface IDanbooruData {
	creator: string;
	danbooru_id: number;
	source: string;
}
