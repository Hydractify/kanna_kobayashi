import {
	ApplicationCommandType,
	type RESTPostAPIApplicationCommandsJSONBody,
	type APIChatInputApplicationCommandInteraction,
	InteractionResponseType,
	ApplicationCommandOptionType,
	type APIApplicationCommandAutocompleteInteraction,
	type APIApplicationCommandInteractionDataSubcommandOption,
	MessageFlags,
	type APIApplicationCommandAutocompleteResponse,
} from 'discord-api-types/v10';
import { TzDatabase } from 'timezonecomplete';
import { getOption, routeToSubcommand } from '../../util/interaction.js';
import type { CommonResponse } from '../index.js';

export const data: RESTPostAPIApplicationCommandsJSONBody = {
	name: 'timezone',
	description: 'Get, set, or remove your timezone',
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: 'get',
			description: 'Get your configured timezone',
			type: ApplicationCommandOptionType.Subcommand,
		},
		{
			name: 'set',
			description: 'Set your timezone',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'timezone',
					description: 'The timezone you live in (only the current offset will be displayed)',
					type: ApplicationCommandOptionType.String,
					autocomplete: true,
					required: true,
				},
			],
		},
		{
			name: 'remove',
			description: 'Remove your configured timezone',
			type: ApplicationCommandOptionType.Subcommand,
		},
	],
};

export async function handleAutocomplete(
	interaction_: APIApplicationCommandAutocompleteInteraction,
): Promise<APIApplicationCommandAutocompleteResponse> {
	return routeToSubcommand(interaction_, {
		async set(_interaction, option) {
			const timezone = getOption(option.options, 'timezone', {
				command: data.name,
				required: true,
				type: ApplicationCommandOptionType.String,
			}).value;

			const choices = TzDatabase.instance()
				.zoneNames()
				.filter((zone) => zone.toLowerCase().includes(timezone.toLowerCase()))
				.slice(0, 25)
				.map((zone) => ({
					name: zone,
					value: zone,
				}));

			return {
				type: InteractionResponseType.ApplicationCommandAutocompleteResult,
				data: {
					choices,
				},
			} as APIApplicationCommandAutocompleteResponse;
		},
	});
}

export async function handleChatInput(interaction: APIChatInputApplicationCommandInteraction): Promise<CommonResponse> {
	return routeToSubcommand(interaction, {
		set: handleSet,
		get: handleGet,
		remove: handleRemove,
	});
}

async function handleSet(
	_interaction: APIChatInputApplicationCommandInteraction,
	option: APIApplicationCommandInteractionDataSubcommandOption,
): Promise<CommonResponse> {
	const timezone = getOption(option.options, 'timezone', {
		command: data.name,
		required: true,
		type: ApplicationCommandOptionType.String,
	}).value;
	let duration;

	try {
		duration = TzDatabase.instance().totalOffset(timezone, Date.now());
	} catch {
		return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				flags: MessageFlags.Ephemeral,
				content: "That's not a valid timezone, please use one of the suggested timezones.",
			},
		};
	}

	// TODO: implement me
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: `${timezone}? Yeah, thats ${duration.hours()} at the moment.`,
		},
	};
}

async function handleGet(
	interaction: APIChatInputApplicationCommandInteraction,
	option: APIApplicationCommandInteractionDataSubcommandOption,
): Promise<CommonResponse> {
	// TODO: implement me
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: 'This command (get) has not been implemented yet.',
		},
	};
}

async function handleRemove(
	interaction: APIChatInputApplicationCommandInteraction,
	option: APIApplicationCommandInteractionDataSubcommandOption,
): Promise<CommonResponse> {
	// TODO: implement me
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: 'This command (remove) has not been implemented yet.',
		},
	};
}
