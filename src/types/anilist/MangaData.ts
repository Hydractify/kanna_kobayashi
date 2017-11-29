import { AniListAnimeAndManga } from './AniListMixins';

export type MangaData = {
	description: string;
	list_stats: {
		completed: number;
		dropped: number;
		on_hold: number;
		plan_to_read: number;
		reading: number;
	};
	publishing_status: 'finished publishing'
	| 'publishing'
	| 'not yet published'
	| 'cancelled';
	series_type: 'manga';
	total_chapters: number;
	total_volumes: number;
} & AniListAnimeAndManga;
