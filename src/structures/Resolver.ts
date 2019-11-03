import { Collection, Guild, GuildMember, Role, User } from 'discord.js';

import { IFetchableStore } from '../types/IFetchableStore';
import { Client } from './Client';
import { CommandHandler } from './CommandHandler';

/**
 * Handles resolving of all kind
 */
export class Resolver 
{
	/**
	 * Regex used for user and member mentions, or just plain ids
	 */
	public static readonly idRegex: RegExp = /^<@!?(\d{17,19})>$|^(\d{17,19})$/;

	/**
	 * Reference to the client
	 */
	public readonly client: Client;
	/**
	 * Reference to the command handler
	 */
	public readonly handler: CommandHandler;

	/**
	 * Instantiates a new resolver
	 */
	public constructor(handler: CommandHandler) 
	{
		this.handler = handler;
		this.client = handler.client;
	}

	/**
	 * Try to resolve the provided input to a member
	 */
	public async resolveMember(input: string, guild: Guild, allowBots: boolean = true): Promise<GuildMember | undefined> 
	{
		if (!input) return undefined;

		const fetched: GuildMember | undefined = await this._matchAndFetch(input, Resolver.idRegex, guild.members);

		if (fetched) 
		{
			if (!allowBots && fetched.user.bot) return undefined;

			return fetched;
		}

		input = input.toLowerCase();
		let matchedMember: GuildMember | undefined;
		for (const member of guild.members.values()) 
		{
			if (!allowBots && member.user.bot) continue;

			// Check for an "exact" lowercased match
			if ((member.nickname && member.nickname.toLowerCase() === input)
				|| member.user.username.toLowerCase() === input
				|| member.user.tag.toLowerCase() === input
			) 
			{
				matchedMember = member;
				break;
			}
			// Check for a partial match
			if (!matchedMember
				&& (member.user.username.toLowerCase().includes(input)
					|| (member.nickname && member.nickname.toLowerCase().includes(input))
				)
			) 
			{
				matchedMember = member;
			}
		}

		if (matchedMember || guild.members.size >= guild.memberCount) 
		{
			return matchedMember;
		}

		const user: User | undefined = await this.resolveUser(input, allowBots);
		if (user) return guild.members.fetch(user).catch(() => undefined);

		return undefined;
	}

	/**
	 * Try to resolve the input to a role
	 */
	public resolveRole(input: string, roles: Collection<string, Role>, allowEveryone: boolean = true): Role | undefined 
	{
		const match: RegExpExecArray | null = /^<@&(\d{17,19})>$|^(\d{17,19})$/.exec(input);
		if (match) 
		{
			const which: string = match[1] || match[2];
			if (!allowEveryone && which === roles.first()!.guild.id) return undefined;

			return roles.get(which) || undefined;
		}

		input = input.toLowerCase();

		let includesMatch: Role | undefined;
		for (const role of roles.values()) 
		{
			if (!allowEveryone && role.id === role.guild.id) continue;
			const roleName: string = role.name.toLowerCase();
			if (roleName === input || `@${roleName}` === input) return role;
			if (!match && `@${roleName}`.includes(input)) includesMatch = role;
		}

		return includesMatch;
	}

	/**
	 * Try to resolve the input to a user
	 */
	public async resolveUser(input: string, allowBots: boolean = true): Promise<User | undefined> 
	{
		if (!input) return undefined;

		const fetched: User | undefined = await this._matchAndFetch(input, Resolver.idRegex, this.client.users);

		if (fetched) 
		{
			if (!allowBots && fetched.bot) return undefined;

			return fetched;
		}

		input = input.toLowerCase();
		for (const user of this.client.users.values()) 
		{
			if (!allowBots && user.bot) continue;

			// Check for the user's tag or username
			if (user.tag.toLowerCase() === input
				|| user.username.toLowerCase() === input
			) return user;

			if (input.length <= 3) break;
			// Or partial username, require more than 3 characters however
			if (user.username.toLowerCase().includes(input)
			) 
			{
				return user;
			}
		}

		return undefined;
	}

	private async _matchAndFetch<V>(
		input: string,
		regex: RegExp,
		store: IFetchableStore<V>,
	): Promise<V | undefined> 
	{

		const match: RegExpExecArray | null = regex.exec(input);
		if (!match) return undefined;

		const which: string = match[1] || match[2];

		return store.get(which) || store.fetch(which).catch(() => undefined);
	}
}
