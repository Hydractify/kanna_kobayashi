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
	name: 'anime',
	description: 'Lookup an anime',
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: 'name',
			description: 'The name of the anime',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
	],
};

export async function handleChatInput(interaction: APIChatInputApplicationCommandInteraction): Promise<CommonResponse> {
	const option = getOption(interaction.data.options!, 'name', {
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
