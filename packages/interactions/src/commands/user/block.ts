import {
	ApplicationCommandType,
	type RESTPostAPIApplicationCommandsJSONBody,
	type APIChatInputApplicationCommandInteraction,
	InteractionResponseType,
	ApplicationCommandOptionType,
	type APIApplicationCommandInteractionDataSubcommandOption,
	MessageFlags,
} from 'discord-api-types/v10';
import { routeToSubcommand } from '../../util/interaction.js';
import type { CommonResponse } from '../index.js';

export const data: RESTPostAPIApplicationCommandsJSONBody = {
	name: 'block',
	description: 'Block or unblock a user',
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: 'add',
			description: 'Blocks a user',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'user',
					description: 'The user to block',
					type: ApplicationCommandOptionType.User,
					required: true,
				},
			],
		},
		{
			name: 'remove',
			description: 'Unblocks a user',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'user',
					description: 'The user to unblock',
					type: ApplicationCommandOptionType.User,
					required: true,
				},
			],
		},
		{
			name: 'list',
			description: 'Lists all users you have blocked',
			type: ApplicationCommandOptionType.Subcommand,
		},
	],
};

export async function handleChatInput(interaction: APIChatInputApplicationCommandInteraction): Promise<CommonResponse> {
	return routeToSubcommand(interaction, {
		add: handleAdd,
		remove: handleRemove,
		list: handleList,
	});
}

async function handleAdd(
	_interaction: APIChatInputApplicationCommandInteraction,
	_option: APIApplicationCommandInteractionDataSubcommandOption,
): Promise<CommonResponse> {
	// TODO: implement me
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			flags: MessageFlags.Ephemeral,
			content: 'This command (block add) has not been implemented yet.',
		},
	};
}

async function handleRemove(
	_interaction: APIChatInputApplicationCommandInteraction,
	_option: APIApplicationCommandInteractionDataSubcommandOption,
): Promise<CommonResponse> {
	// TODO: implement me
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			flags: MessageFlags.Ephemeral,
			content: 'This command (block remove) has not been implemented yet.',
		},
	};
}

async function handleList(
	_interaction: APIChatInputApplicationCommandInteraction,
	_option: APIApplicationCommandInteractionDataSubcommandOption,
): Promise<CommonResponse> {
	// TODO: implement me
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			flags: MessageFlags.Ephemeral,
			content: 'This command (block list) has not been implemented yet.',
		},
	};
}
