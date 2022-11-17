import { stringify } from 'node:querystring';
import type { APIGuildMember, APIUser, CDNQuery, DefaultUserAvatarAssets } from 'discord-api-types/v10';
import { CDNRoutes, RouteBases, ImageFormat } from 'discord-api-types/v10';

/**
 * Gets the avatar url of a user, respecting their guild avatar, if present,
 * as well as falling back to their default avatar if none is present.
 */
export function getAvatarUrl(
	guildId: string | null | undefined,
	// Some narrower types of APIGuildMember exist and we only care about the avatar anyway
	member: Pick<APIGuildMember, 'avatar'> | null | undefined,
	user: APIUser,
	query?: CDNQuery,
): string {
	let route;

	if (guildId && member?.avatar) {
		const format = member.avatar.startsWith('a_') ? ImageFormat.GIF : ImageFormat.WebP;
		route = CDNRoutes.guildMemberAvatar(guildId, user.id, member.avatar, format);
	} else if (user.avatar) {
		const format = user.avatar.startsWith('a_') ? ImageFormat.GIF : ImageFormat.WebP;
		route = CDNRoutes.userAvatar(user.id, user.avatar, format);
	} else {
		route = CDNRoutes.defaultUserAvatar((Number.parseInt(user.discriminator, 10) % 5) as DefaultUserAvatarAssets);
	}

	return `${RouteBases.cdn}${route}${query ? `?${stringify(query as Record<string, string>)}` : ''}`;
}

/**
 * How the timestamp should be formatted.
 * Note that the locale of the Discord client of the viewing user will be used.
 * The examples use `en_US`, the actual values will differ for other locales.
 */
/* eslint-disable typescript-sort-keys/string-enum */
export enum TimestampFlag {
	/**
	 * Example: `16:20`
	 */
	ShortTime = 't',
	/**
	 * Example: `16:20:30`
	 */
	LongTime = 'T',
	/**
	 * Example: `20/04/2021`
	 */
	ShortDate = 'd',
	/**
	 * Example: `20 April 2021`
	 */
	LongDate = 'D',
	/**
	 * Example: `20 April 2021 16:20`
	 */
	ShortDateTime = 'f',
	/**
	 * Example: `Tuesday, 20 April 2021 16:20`
	 */
	LongDateTime = 'F',
	/**
	 * Example: `2 months ago`
	 */
	RelativeTime = 'R',
}
/* eslint-enable typescript-sort-keys/string-enum */

/**
 * Converts the given timestamp to Discord markdown for a timestamp.
 *
 * @param ts - The timestamp to format
 * @param flag - How to format the timestamp
 * @returns The resulting markdown
 */
export function timestampMarkdown(ts: Date | number, flag?: TimestampFlag): string {
	return `<t:${Math.trunc(Number(ts) / 1_000)}${flag ? `:${flag}` : ''}>`;
}

const DISCORD_EPOCH = 1_420_070_400_000n;

export function idToTimestamp(id: string) {
	return Number((BigInt(id) >> 22n) + DISCORD_EPOCH);
}
