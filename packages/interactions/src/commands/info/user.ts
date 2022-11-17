import {
	ApplicationCommandType,
	type RESTPostAPIApplicationCommandsJSONBody,
	type APIChatInputApplicationCommandInteraction,
	InteractionResponseType,
	ApplicationCommandOptionType,
	type APIEmbedField,
} from 'discord-api-types/v10';
import { getAvatarUrl, idToTimestamp, TimestampFlag, timestampMarkdown } from '../../util/discord.js';
import { getOption, getUserAndMember, getUserAndMemberFromOption } from '../../util/interaction.js';
import { mapIterable } from '../../util/util.js';
import type { CommonResponse } from '../index.js';

export const data: RESTPostAPIApplicationCommandsJSONBody = {
	name: 'user',
	description: 'Show information about a user',
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: 'user',
			description: 'The user you would like information about',
			type: ApplicationCommandOptionType.User,
			required: false,
		},
	],
};

export async function handleChatInput(interaction: APIChatInputApplicationCommandInteraction): Promise<CommonResponse> {
	const option = getOption(interaction.data.options!, 'user', {
		command: data.name,
		required: false,
		type: ApplicationCommandOptionType.User,
	});
	const { user, member } = option ? getUserAndMemberFromOption(interaction, option) : getUserAndMember(interaction);

	const memberFields1: APIEmbedField[] = [];
	const memberFields2: APIEmbedField[] = [];
	if (member) {
		memberFields1.push({
			name: 'Nickname',
			value: member.nick ?? 'None',
			inline: true,
		});

		const roles = new Set<string>();
		for (const role of member.roles) {
			if (role !== interaction.guild_id) {
				roles.add(`<@&${role}>`);
			}
		}

		memberFields2.push(
			{
				name: 'Joined this guild',
				value: timestampMarkdown(new Date(member.joined_at), TimestampFlag.RelativeTime),
				inline: true,
			},
			{
				name: 'Roles',
				value: mapIterable(roles) || 'None',
				inline: true,
			},
		);
	}

	const avatarUrl = getAvatarUrl(interaction.guild_id, member, user, { size: 2_048 });

	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			embeds: [
				{
					title: `Info about ${user.username}#${user.discriminator} (${user.id})`,
					fields: [
						...memberFields1,
						{
							name: 'Registered account',
							value: timestampMarkdown(idToTimestamp(user.id), TimestampFlag.RelativeTime),
							inline: true,
						},
						...memberFields2,
						{
							name: 'Avatar',
							value: `[Link](${avatarUrl})`,
							inline: true,
						},
					],
					image: { url: avatarUrl },
				},
			],
		},
	};
}
