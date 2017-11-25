/**
 * Enum of available user types
 */
export enum UserTypes {
	/**
	 * Blacklisted users may not interact with the bot
	 * neither do their guilds
	 */
	BLACKLISTED = 'BLACKLISTED',
	/**
	 * Whitelisted users may use the bot
	 * in their guilds even if they have a high bot count
	 */
	WHITELISTED = 'WHITELISTED',
	/**
	 * Trusted users will be granted permission level 3 in all guilds
	 */
	TRUSTED = 'TRUSTED',
	/**
	 * Developers may use all commands in all servers
	 * and additional developer only commands, such as eval
	 */
	DEV = 'DEV',
}
