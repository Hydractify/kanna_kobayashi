import {
	ApplicationCommandType,
	type RESTPostAPIApplicationCommandsJSONBody,
	InteractionResponseType,
	type APIChatInputApplicationCommandInteraction,
} from 'discord-api-types/v10';
import type { CommonResponse } from '../index.js';

export const data: RESTPostAPIApplicationCommandsJSONBody = {
	name: 'info',
	description: 'A collection of useful links about this app',
	type: ApplicationCommandType.ChatInput,
};

export async function handleChatInput(
	_interaction: APIChatInputApplicationCommandInteraction,
): Promise<CommonResponse> {
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: [
				'[Invite Link](https://www.hydractify.org/invite)',
				'[Patreon](https://www.patreon.com/hydractify)',
				'[Support Server / Official Server](https://discord.gg/uBdXdE9)',
				'[Official Weebsite](https://www.hydractify.org)',
				'[Wiki / Kanna 101](https://github.com/hydractify/kanna-kobayashi/wiki)',
			].join('\n'),
		},
	};
}
