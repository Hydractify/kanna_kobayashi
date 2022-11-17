import {
	ApplicationCommandType,
	type RESTPostAPIApplicationCommandsJSONBody,
	InteractionResponseType,
	type APIChatInputApplicationCommandInteraction,
} from 'discord-api-types/v10';
import type { CommonResponse } from '../index.js';

export const data: RESTPostAPIApplicationCommandsJSONBody = {
	name: 'ping',
	description: 'Pong',
	type: ApplicationCommandType.ChatInput,
};

export async function handleChatInput(
	_interaction: APIChatInputApplicationCommandInteraction,
): Promise<CommonResponse> {
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: 'Pong',
		},
	};
}
