export interface IItemStructure {
	buyable: boolean;
	description: string;
	name: string;
	price: number | null;
	rarity: number;
	tradable: boolean;
	type: string;
	unique: boolean;
}
