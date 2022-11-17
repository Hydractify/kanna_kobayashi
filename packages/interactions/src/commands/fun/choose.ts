import {
	ApplicationCommandType,
	type RESTPostAPIApplicationCommandsJSONBody,
	type APIChatInputApplicationCommandInteraction,
	InteractionResponseType,
	ApplicationCommandOptionType,
} from 'discord-api-types/v10';
import { assertTypeAll } from '../../util/typeguard.js';
import type { CommonResponse } from '../index.js';

export const data: RESTPostAPIApplicationCommandsJSONBody = {
	name: 'choose',
	description: 'Let me choose for you',
	type: ApplicationCommandType.ChatInput,
	// No vargargs >:(
	options: Array.from({ length: 25 }).map((_, num) => ({
		name: `option_${num + 1}`,
		description: 'One of the options to chose from',
		type: ApplicationCommandOptionType.String,
		// Require the first 2, 0 or 1 make no sense to allow
		required: num < 2,
	})),
};

export async function handleChatInput(interaction: APIChatInputApplicationCommandInteraction): Promise<CommonResponse> {
	const options = interaction.data.options!;
	assertTypeAll(options, ApplicationCommandOptionType.String, data.name);
	const option = options[Math.floor(Math.random() * options.length)]!;

	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			// Forbid mentions
			allowed_mentions: { parse: [] },
			content: `I choose **${option.value}**!`,
		},
	};
}
