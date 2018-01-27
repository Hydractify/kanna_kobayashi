import { ICharacterName } from './ICharacterName';
import { IImage } from './IImage';

export interface ICharacter {
	// id: number;
	name: ICharacterName;
	image: IImage;
	description: string;
	siteUrl: string;
}
