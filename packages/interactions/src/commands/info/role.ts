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
	name: 'role',
	description: 'Show information about a role',
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: 'role',
			description: 'The role you would like information about',
			type: ApplicationCommandOptionType.Role,
			required: true,
		},
	],
};

export async function handleChatInput(interaction: APIChatInputApplicationCommandInteraction): Promise<CommonResponse> {
	const option = getOption(interaction.data.options!, 'role', {
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
