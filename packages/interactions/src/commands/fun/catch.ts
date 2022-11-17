import {
	ApplicationCommandType,
	type RESTPostAPIApplicationCommandsJSONBody,
	type APIChatInputApplicationCommandInteraction,
	InteractionResponseType,
} from 'discord-api-types/v10';
import type { CommonResponse } from '../index.js';

export const data: RESTPostAPIApplicationCommandsJSONBody = {
	name: 'catch',
	description: 'Catch some bugs',
	type: ApplicationCommandType.ChatInput,
};

export async function handleChatInput(
	_interaction: APIChatInputApplicationCommandInteraction,
): Promise<CommonResponse> {
	let bugAmount = 0;

	const bugChance: number = Math.floor(Math.random() * 100) + 1;

	if (bugChance === 100) {
		bugAmount = 6;
	} else if (bugChance > 90) {
		bugAmount = 5;
	} else if (bugChance > 80) {
		bugAmount = 4;
	} else if (bugChance > 70) {
		bugAmount = 3;
	} else if (bugChance > 60) {
		bugAmount = 2;
	} else if (bugChance > 50) {
		bugAmount = 1;
	}

	let response: string;
	if (bugAmount === 0) {
		response = 'You did not get any bugs...';
	} else if (bugAmount === 1) {
		response = 'You got 1 bug! 🐛';
	} else {
		response = `You got ${bugAmount} bugs! 🐛`;
	}

	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: response,
		},
	};
}
