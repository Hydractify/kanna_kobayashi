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
	name: 'relationship',
	description: 'Your relationship',
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: 'propose',
			description: 'Propose to someone',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'user',
					description: 'The user you would like to propose to',
					type: ApplicationCommandOptionType.User,
					required: true,
				},
			],
		},
		{
			name: 'breakup',
			description: 'Break up with your partner',
			type: ApplicationCommandOptionType.Subcommand,
		},
		{
			name: 'hidepartner',
			description: 'Un-hide your partner from your profile',
			type: ApplicationCommandOptionType.Subcommand,
		},
	],
};

export async function handleChatInput(interaction: APIChatInputApplicationCommandInteraction): Promise<CommonResponse> {
	return routeToSubcommand(interaction, {
		propose: handlePropose,
		breakup: handleBreakup,
		hidepartner: handleHidepartner,
	});
}

async function handlePropose(
	_interaction: APIChatInputApplicationCommandInteraction,
	_option: APIApplicationCommandInteractionDataSubcommandOption,
): Promise<CommonResponse> {
	// TODO: implement me
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: 'This command (relationship propose) has not been implemented yet.',
		},
	};
}

async function handleBreakup(
	_interaction: APIChatInputApplicationCommandInteraction,
	_option: APIApplicationCommandInteractionDataSubcommandOption,
): Promise<CommonResponse> {
	// TODO: implement me
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: 'This command (relationship breakup) has not been implemented yet.',
		},
	};
}

async function handleHidepartner(
	_interaction: APIChatInputApplicationCommandInteraction,
	_option: APIApplicationCommandInteractionDataSubcommandOption,
): Promise<CommonResponse> {
	// TODO: implement me
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: 'This command (relationship hidepartner) has not been implemented yet.',
		},
	};
}
