export type AniListAnimeAndManga = {
	adult: boolean;
	average_score: number;
	description: string;
	end_date_fuzzy: number;
	genres: string[];
	image_url_banner: string;
	image_url_sml: string;
	popularity: number;
	score_distribution: IScoreDistribution;
	season: number;
	start_date_fuzzy: number;
	synonyms: string[];
	title_english: string;
	title_japanese: string;
	title_romaji: string;
	type: 'TV'
	| 'TV Short'
	| 'Movie'
	| 'Special'
	| 'OVA'
	| 'ONA'
	| 'Music'
	| 'Manga'
	| 'Novel'
	| 'One Shot'
	| 'Doujin'
	| 'Manhua'
	| 'Manhwa';
	updated_at: number;
} & IAniListAllTypes;

export interface IAniListAllTypes {
	id: number;
	image_url_lge: string;
	image_url_med: string;
}

export interface IScoreDistribution {
	10: number;
	100: number;
	20: number;
	30: number;
	40: number;
	50: number;
	60: number;
	70: number;
	80: number;
	90: number;
}
