import { AniListAnimeAndManga } from './AniListMixins';

export type AnimeData = {
	airing_status: 'finished airing'
	| 'currently airing'
	| 'not yet aired'
	| 'cancelled';
	description: string;
	duration: number;
	hashtag: string;
	list_stats: {
		completed: number;
		dropped: number;
		on_hold: number;
		plan_to_watch: number;
		watching: number;
	};
	series_type: 'anime';
	source: 'Original'
	| 'Manga'
	| 'Light Novel'
	| 'Visual Novel'
	| 'Video Game'
	| 'Other';
	total_episodes: number;
	youtube_id: string;
} & AniListAnimeAndManga;
