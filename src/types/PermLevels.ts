/**
 * Enum of availabel permission levels
 */
export enum PermLevels {
	/**
	 * Everyone who does not apply for another level
	 */
	EVERYONE,
	/**
	 * Everyone with a role called 'Dragon Tamer'
	 */
	DRAGONTAMER,
	/**
	 * Everyone with Ban and Kick members permission
	 */
	HUMANTAMER,
	/**
	 * Support people from the official guild
	 */
	TRUSTED,
	/**
	 * Developers of the bot
	 */
	DEV,
}
