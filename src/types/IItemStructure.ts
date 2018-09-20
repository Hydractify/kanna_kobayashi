import { ItemRarities } from './ItemRarities';
import { Items } from './Items';
import { ItemTypes } from './ItemTypes';

export interface IItemStructure {
	buyable: boolean;
	description: string;
	name: Items;
	price: number | null;
	rarity: ItemRarities;
	tradable: boolean;
	type: ItemTypes;
	unique: boolean;
}
