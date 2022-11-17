import {
	ApplicationCommandType,
	type RESTPostAPIApplicationCommandsJSONBody,
	type APIChatInputApplicationCommandInteraction,
	InteractionResponseType,
	ApplicationCommandOptionType,
} from 'discord-api-types/v10';
import { getOption } from '../../util/interaction.js';
import type { CommonResponse } from '../index.js';

export const data: RESTPostAPIApplicationCommandsJSONBody = {
	name: 'emoji',
	description: 'Display info about an emoji',
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: 'emoji',
			description: 'The emoji to display info about',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
	],
};

export async function handleChatInput(interaction: APIChatInputApplicationCommandInteraction): Promise<CommonResponse> {
	const option = getOption(interaction.data.options!, 'emoji', {
		command: data.name,
		required: true,
		type: ApplicationCommandOptionType.String,
	});

	// TODO: implement me
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: 'This command has not been implemented yet.',
		},
	};
}
