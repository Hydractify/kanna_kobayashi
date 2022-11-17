import {
	ApplicationCommandType,
	type RESTPostAPIApplicationCommandsJSONBody,
	type APIChatInputApplicationCommandInteraction,
	InteractionResponseType,
	ApplicationCommandOptionType,
} from 'discord-api-types/v10';
import { getAvatarUrl } from '../../util/discord.js';
import { getOption, getUserAndMember, getUserAndMemberFromOption } from '../../util/interaction.js';
import type { CommonResponse } from '../index.js';

export const data: RESTPostAPIApplicationCommandsJSONBody = {
	name: 'avatar',
	description: 'Display the avatar of a user',
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: 'user',
			description: 'The user to display their avatar of',
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

	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			embeds: [
				{
					title: `${user.username}#${user.discriminator}'s Avatar`,
					image: { url: getAvatarUrl(interaction.guild_id, member, user, { size: 2_048 }) },
				},
			],
		},
	};
}
