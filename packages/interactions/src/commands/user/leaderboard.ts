import {
	ApplicationCommandType,
	type RESTPostAPIApplicationCommandsJSONBody,
	type APIChatInputApplicationCommandInteraction,
	InteractionResponseType,
	ApplicationCommandOptionType,
} from 'discord-api-types/v10';
import type { CommonResponse } from '../index.js';

export const data: RESTPostAPIApplicationCommandsJSONBody = {
	name: 'leaderboard',
	description: 'Show the leaderboard',
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: 'type',
			description: 'Which leaderboard to show',
			type: ApplicationCommandOptionType.String,
			choices: ['experience', 'level', 'reputation'].map((ch) => ({ name: ch, value: ch })),
		},
	],
};

export async function handleChatInput(interaction: APIChatInputApplicationCommandInteraction): Promise<CommonResponse> {
	// TODO: implement me
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: 'This command has not been implemented yet.',
		},
	};
}
