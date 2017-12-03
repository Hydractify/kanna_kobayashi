export interface IUrbanDictionaryResponse {
	list: {
		author: string;
		current_vote: string;
		defid: number;
		definition: string;
		example: string;
		permalink: string;
		thumbs_down: number;
		thumbs_up: number;
		word: string;
	}[];
	result_type: string;
	tags: string[];
}
