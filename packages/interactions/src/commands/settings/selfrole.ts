import {
	ApplicationCommandType,
	type RESTPostAPIApplicationCommandsJSONBody,
	type APIChatInputApplicationCommandInteraction,
	InteractionResponseType,
	ApplicationCommandOptionType,
	type APIApplicationCommandAutocompleteInteraction,
	type APIApplicationCommandAutocompleteResponse,
} from 'discord-api-types/v10';
import { getOption } from '../../util/interaction.js';
import type { CommonResponse } from '../index.js';

export const data: RESTPostAPIApplicationCommandsJSONBody = {
	name: 'selfrole',
	description: 'Add or remove a self role to or from yourself.',
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: 'role',
			description: 'The role you would like to add or remove from yourself',
			type: ApplicationCommandOptionType.String,
			autocomplete: true,
			required: true,
		},
	],
};

export async function handleAutocomplete(
	interaction: APIApplicationCommandAutocompleteInteraction,
): Promise<APIApplicationCommandAutocompleteResponse> {
	const role = getOption(interaction.data.options!, 'role', {
		command: data.name,
		required: true,
		type: ApplicationCommandOptionType.String,
	});

	// TODO: implement me
	return {
		type: InteractionResponseType.ApplicationCommandAutocompleteResult,
		data: {
			choices: [],
		},
	};
}

export async function handleChatInput(interaction: APIChatInputApplicationCommandInteraction): Promise<CommonResponse> {
	const role = getOption(interaction.data.options!, 'role', {
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
