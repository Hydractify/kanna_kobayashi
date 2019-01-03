import { Badges } from '../types/Badges';
import { IItemStructure } from '../types/IItemStructure';

const BADGES: IItemStructure[] = [
	/**
	 * Developer
	 * How to get: Be a lead developer of Kanna
	 */
	{
		description: 'If you have this badge, it means you are one of my developers!',
		name: Badges.DEVELOPER,
	},

	/**
	 * Staff
	 * How to get: Be a staff?
	 */
	{
		description: 'You are awesome for having this... You help me to grow!',
		name: Badges.STAFF,
	},

	/**
	 * Partner
	 * How to get: Partner with the official server/bot
	 */
	{
		description: 'Wow... You are one of my partners if you have this!',
		name: Badges.PARTNER,
	},

	/**
	 * Patron
	 * How to get: Donating on Patreon
	 */
	{
		description: 'T-thanks for supporting me on Patreon!',
		name: Badges.PATRON,
	},
];
export { BADGES };
