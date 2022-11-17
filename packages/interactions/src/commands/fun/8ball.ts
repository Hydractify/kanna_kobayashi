import {
	ApplicationCommandType,
	type RESTPostAPIApplicationCommandsJSONBody,
	InteractionResponseType,
	type APIChatInputApplicationCommandInteraction,
	ApplicationCommandOptionType,
} from 'discord-api-types/v10';
import { Emojis } from '../../emojis.js';
import type { CommonResponse } from '../index.js';

export const data: RESTPostAPIApplicationCommandsJSONBody = {
	name: '8ball',
	description: 'Ask the famous 8 ball a question!',
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: 'question',
			description: 'The question you want to ask',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
	],
};

const responses = [
	`'I want it too! ${Emojis.KannaHug}`,
	`aye! ${Emojis.KannaHungry}`,
	`no... ${Emojis.KannaSad}`,
	`do not do it! ${Emojis.KannaShy}`,
	`why?! ${Emojis.KannaScared}`,
	`I have to gather more information first ${Emojis.KannaDetective}`,
];

export async function handleChatInput(
	_interaction: APIChatInputApplicationCommandInteraction,
): Promise<CommonResponse> {
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: responses[Math.floor(Math.random() * responses.length)],
		},
	};
}
