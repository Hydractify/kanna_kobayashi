import { IItemStructure } from '../types/IItemStructure';
import { ItemRarities } from '../types/ItemRarities';
import { Items } from '../types/Items';
import { ItemTypes } from '../types/ItemTypes';

const ITEMS: IItemStructure[] = [
	/**
	 * Bug
	 * Use: None, just a dummy item for selling.
	 */
	{
		buyable: false,
		description: 'This is a bug... And... It looks tasty!',
		name: Items.BUG,
		price: 50,
		rarity: ItemRarities.COMMON,
		tradable: false,
		type: ItemTypes.ITEM,
		unique: false,
	},
	/**
	 * Bug Net
	 * Use: Unique command, can break.
	 */
	{
		buyable: true,
		description: 'Go out to catch bugs with this net!',
		name: Items.BUG_NET,
		price: 500,
		rarity: ItemRarities.RARE,
		tradable: true,
		type: ItemTypes.ITEM,
		unique: true,
	},

	/**
	 * Camera
	 * Use: Allow the use of the image command
	 */
	{
		buyable: true,
		description: 'This is the Camera! Having one will make you able to use the `image` command!',
		name: Items.CAMERA,
		price: 2,
		rarity: ItemRarities.HARMONY,
		tradable: true,
		type: ItemTypes.ITEM,
		unique: true,
	},

	/**
	 * Dragon Scale
	 * Use: Currency for buying items above it's rarity
	 */
	{
		buyable: true,
		description: 'This is the scale of a Dragon, worth more than you can imagine, take care of this precious item.',
		name: Items.DRAGON_SCALE,
		price: 1000,
		rarity: ItemRarities.DRAGON_SCALE,
		tradable: true,
		type: ItemTypes.ITEM,
		unique: false,
	},
];
export { ITEMS };

const BADGES: IItemStructure[] = [
	/**
	 * Developer
	 * How to get: Be a lead developer of Kanna
	 */
	{
		buyable: false,
		description: 'If you have this badge, it means you are one of my developers!',
		name: Items.DEVELOPER,
		price: null,
		rarity: ItemRarities['?'],
		tradable: false,
		type: ItemTypes.BADGE,
		unique: true,
	},

	/**
	 * Staff
	 * How to get: Be a staff?
	 */
	{
		buyable: false,
		description: 'You are awesome for having this... You help me to grow!',
		name: Items.STAFF,
		price: null,
		rarity: ItemRarities['?'],
		tradable: false,
		type: ItemTypes.BADGE,
		unique: true,
	},

	{
		buyable: false,
		description: 'Wow... You are one of my partners if you have this!',
		name: Items.PATRON,
		price: null,
		rarity: ItemRarities['?'],
		tradable: false,
		type: ItemTypes.BADGE,
		unique: true,
	},

	/**
	 * Patron
	 * How to get: Donating on Patreon
	 */
	{
		buyable: false,
		description: 'T-thanks for supporting me on Patreon!',
		name: Items.PATRON,
		price: null,
		rarity: ItemRarities.IMMORTAL,
		tradable: false,
		type: ItemTypes.BADGE,
		unique: true,
	},
];
export { BADGES };
