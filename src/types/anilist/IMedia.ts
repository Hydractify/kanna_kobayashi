import { IFuzzyDate } from './IFuzzyDate';
import { IImage } from './IImage';
import { IMediaTitle } from './IMediaTitle';
import { MediaSeason } from './MediaSeason';
import { MediaSource } from './MediaSource';
import { MediaStatus } from './MediaStatus';
// import { MediaType } from './MediaType';

export interface IMedia {
	title: IMediaTitle;
	season: MediaSeason;
	genres: string[];
	// type: MediaType;
	// id: number;
	/**
	 * Anime
	 */
	episodes: number;
	/**
	 * Manga
	 */
	volumes: number;
	startDate: IFuzzyDate;
	status: MediaStatus;
	endDate: IFuzzyDate;
	description: string;
	source: MediaSource;
	image: IImage;
	siteUrl: string;
	averageScore: number;
	chapters: number;
}
