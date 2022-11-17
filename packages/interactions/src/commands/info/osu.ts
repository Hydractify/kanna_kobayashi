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
	name: 'osu',
	description: 'osu! command',
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: 'beatmap',
			description: 'Display information about an osu! beatmap',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'id',
					description: 'The id of the beatmap you want information about',
					type: ApplicationCommandOptionType.String,
					required: true,
				},
				{
					name: 'mode',
					description: 'The osu mode you are interested in',
					type: ApplicationCommandOptionType.String,
					choices: [
						{ name: 'Standard', value: 'OSU' },
						{ name: 'Taiko', value: 'TAIKO' },
						{ name: 'Catch the Beat', value: 'CTB' },
						{ name: 'Mania', value: 'MANIA' },
					],
					required: false,
				},
				{
					name: 'best',
					description: 'Show the top 10 scores and minimal info of the beatmap',
					type: ApplicationCommandOptionType.Boolean,
					required: false,
				},
			],
		},
		{
			name: 'beatmapset',
			description: 'Display information of an osu! beatmap set',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'id',
					description: 'The id of the beatmap set you want more information about',
					type: ApplicationCommandOptionType.String,
					required: true,
				},
			],
		},
		{
			name: 'user',
			description: 'Display information about an osu! user',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'query',
					description: 'The username of id of the user you want more information about',
					type: ApplicationCommandOptionType.String,
					required: true,
				},
				{
					name: 'mode',
					description: 'The osu mode you are interested in',
					type: ApplicationCommandOptionType.String,
					choices: [
						{ name: 'Standard', value: 'OSU' },
						{ name: 'Taiko', value: 'TAIKO' },
						{ name: 'Catch the Beat', value: 'CTB' },
						{ name: 'Mania', value: 'MANIA' },
					],
					required: false,
				},
				{
					name: 'option',
					description: 'Whether you want to see the top or most recent scores',
					type: ApplicationCommandOptionType.String,
					choices: [
						{ name: 'top', value: 'top' },
						{ name: 'recent', value: 'recent' },
					],
					required: false,
				},
			],
		},
	],
};

export async function handleChatInput(interaction: APIChatInputApplicationCommandInteraction): Promise<CommonResponse> {
	return routeToSubcommand(interaction, {
		beatmap: handleBeatmap,
		beatmapset: handleBeatmapset,
		user: handleUser,
	});
}

async function handleBeatmap(
	_interaction: APIChatInputApplicationCommandInteraction,
	_options: APIApplicationCommandInteractionDataSubcommandOption,
): Promise<CommonResponse> {
	// TODO: implement me
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: 'This command (beatmap) has not been implemented yet.',
		},
	};
}

async function handleBeatmapset(
	_interaction: APIChatInputApplicationCommandInteraction,
	_options: APIApplicationCommandInteractionDataSubcommandOption,
): Promise<CommonResponse> {
	// TODO: implement me
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: 'This command (beatmapset) has not been implemented yet.',
		},
	};
}

async function handleUser(
	_interaction: APIChatInputApplicationCommandInteraction,
	_options: APIApplicationCommandInteractionDataSubcommandOption,
): Promise<CommonResponse> {
	// TODO: implement me
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: 'This command (user) has not been implemented yet.',
		},
	};
}
