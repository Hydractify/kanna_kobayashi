import {
	ApplicationCommandType,
	type RESTPostAPIApplicationCommandsJSONBody,
	type APIChatInputApplicationCommandInteraction,
	InteractionResponseType,
	ApplicationCommandOptionType,
	type APIApplicationCommandInteractionDataSubcommandOption,
} from 'discord-api-types/v10';
import { routeToSubcommand } from '../../util/interaction.js';
import type { CommonResponse } from '../index.js';

export const data: RESTPostAPIApplicationCommandsJSONBody = {
	name: 'reputation',
	description: 'Reputation command',
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: 'positive',
			description: 'Add a positive reputation to a user',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'user',
					description: 'The user you want to add a positive reputation to',
					type: ApplicationCommandOptionType.User,
					required: true,
				},
			],
		},
		{
			name: 'negative',
			description: 'Add a negative reputation to a user',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'user',
					description: 'The user you want to add a negative reputation to',
					type: ApplicationCommandOptionType.User,
					required: true,
				},
			],
		},
		{
			name: 'clear',
			description: 'Remove the reputation you added to a user (becoming neutral again)',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'user',
					description: 'The user you want to clear',
					type: ApplicationCommandOptionType.User,
					required: true,
				},
			],
		},
		{
			name: 'show',
			description: 'Show the reputation of a user',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'user',
					description: 'The user you want to show the reputation of',
					type: ApplicationCommandOptionType.User,
					required: true,
				},
			],
		},
	],
};

export async function handleChatInput(interaction: APIChatInputApplicationCommandInteraction): Promise<CommonResponse> {
	return routeToSubcommand(interaction, {
		positive: handlePositive,
		negative: handleNegative,
		clear: handleClear,
		show: handleShow,
	});
}

async function handlePositive(
	_interaction: APIChatInputApplicationCommandInteraction,
	_option: APIApplicationCommandInteractionDataSubcommandOption,
): Promise<CommonResponse> {
	// TODO: implement me
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: 'This command (reputation positive) has not been implemented yet.',
		},
	};
}

async function handleNegative(
	_interaction: APIChatInputApplicationCommandInteraction,
	_option: APIApplicationCommandInteractionDataSubcommandOption,
): Promise<CommonResponse> {
	// TODO: implement me
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: 'This command (reputation negative) has not been implemented yet.',
		},
	};
}

async function handleClear(
	_interaction: APIChatInputApplicationCommandInteraction,
	_option: APIApplicationCommandInteractionDataSubcommandOption,
): Promise<CommonResponse> {
	// TODO: implement me
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: 'This command (reputation clear) has not been implemented yet.',
		},
	};
}

async function handleShow(
	_interaction: APIChatInputApplicationCommandInteraction,
	_option: APIApplicationCommandInteractionDataSubcommandOption,
): Promise<CommonResponse> {
	// TODO: implement me
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: 'This command (reputation show) has not been implemented yet.',
		},
	};
}
