import {
	ApplicationCommandType,
	type RESTPostAPIApplicationCommandsJSONBody,
	type APIChatInputApplicationCommandInteraction,
	InteractionResponseType,
} from 'discord-api-types/v10';
import type { CommonResponse } from '../index.js';

export const data: RESTPostAPIApplicationCommandsJSONBody = {
	name: 'commandusage',
	description: 'Stats about command usage',
	type: ApplicationCommandType.ChatInput,
};

export async function handleChatInput(
	_interaction: APIChatInputApplicationCommandInteraction,
): Promise<CommonResponse> {
	// TODO: implement me
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: 'This command has not been implemented yet.',
		},
	};
}
