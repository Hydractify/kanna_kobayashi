import {
	ApplicationCommandType,
	type RESTPostAPIApplicationCommandsJSONBody,
	type APIChatInputApplicationCommandInteraction,
	ApplicationCommandOptionType,
	ChannelType,
	InteractionResponseType,
	type APIApplicationCommandInteractionDataSubcommandOption,
} from 'discord-api-types/v10';
import { routeToSubcommand } from '../../util/interaction.js';
import type { CommonResponse } from '../index.js';

export const data: RESTPostAPIApplicationCommandsJSONBody = {
	name: 'settings',
	description: 'Configure settings for this server',
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: 'farewellmessage',
			description: 'Get, set, or remove the farewell message',
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					name: 'get',
					description: 'Get the currently configured farewell message',
					type: ApplicationCommandOptionType.Subcommand,
				},
				{
					name: 'set',
					description: 'Set the farewell message',
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: 'message',
							// TODO: Explain placeholders
							description: 'Message to send when a member leaves, you may use placeholders.',
							type: ApplicationCommandOptionType.String,
							required: true,
						},
					],
				},
				{
					name: 'remove',
					description: 'Remove the currently configured farewell message',
					type: ApplicationCommandOptionType.Subcommand,
				},
			],
		},
		{
			name: 'joinmessage',
			description: 'Get, set, or remove the join message',
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					name: 'get',
					description: 'Get the currently configured join message',
					type: ApplicationCommandOptionType.Subcommand,
				},
				{
					name: 'set',
					description: 'Set the join message',
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: 'message',
							// TODO: Explain placeholders
							description: 'Message to send when a member joins, you may use placeholders.',
							type: ApplicationCommandOptionType.String,
							required: true,
						},
					],
				},
				{
					name: 'remove',
					description: 'Remove the currently configured join message',
					type: ApplicationCommandOptionType.Subcommand,
				},
			],
		},
		{
			name: 'notifchannel',
			description: 'Get, set, or remove the notif channel, where join and farewell messages will be sent to',
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					name: 'get',
					description: 'Get the currently configured notifchannel',
					type: ApplicationCommandOptionType.Subcommand,
				},
				{
					name: 'set',
					description: 'Set the notifchannel',
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: 'channel',
							description: 'The channel where join and farewell messages will be sent to',
							type: ApplicationCommandOptionType.Channel,
							channel_types: [ChannelType.GuildText],
							required: true,
						},
					],
				},
				{
					name: 'remove',
					description: 'Remove the currently configured notifchannel',
					type: ApplicationCommandOptionType.Subcommand,
				},
			],
		},
		{
			name: 'levelup',
			description: 'Get or set whether levelup message are currently enabled here',
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					name: 'get',
					description: 'Get whether levelup messages are currently enabled here',
					type: ApplicationCommandOptionType.Subcommand,
				},
				{
					name: 'set',
					description: 'Set whether levelup messages are enabled here',
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: 'enabled',
							description: 'Whether levelup messages should be enabled here',
							type: ApplicationCommandOptionType.Boolean,
							required: true,
						},
					],
				},
			],
		},
		{
			name: 'selfrole',
			description: 'List, add or remove self assignable roles',
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					name: 'list',
					description: 'Lists all self assignable roles',
					type: ApplicationCommandOptionType.Subcommand,
				},
				{
					name: 'add',
					description: 'Add a role to the list of self assignable roles',
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: 'role',
							description: 'The role to add',
							type: ApplicationCommandOptionType.Role,
							required: true,
						},
					],
				},
				{
					name: 'remove',
					description: 'Remove a role from the list of self assignable roles',
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: 'role',
							description: 'The role to remove',
							type: ApplicationCommandOptionType.Role,
							required: true,
						},
					],
				},
			],
		},
	],
};

export async function handleChatInput(interaction: APIChatInputApplicationCommandInteraction): Promise<CommonResponse> {
	return routeToSubcommand(interaction, {
		farewellmessage: {
			get: handleGetString,
			set: handleSetString,
			remove: handleRemoveString,
		},
		joinmessage: {
			get: handleGetString,
			set: handleSetString,
			remove: handleRemoveString,
		},
		notifchannel: {
			get: handleGetNotifchannel,
			set: handleSetNotifchannel,
			remove: handleRemoveNotifchannel,
		},
		levelup: {
			get: handleGetLevelup,
			set: handleSetLevelup,
		},
		selfrole: {
			list: handleListSelfrole,
			add: handleAddSelfrole,
			remove: handleRemoveSelfrole,
		},
	});
}

async function handleGetString(
	_interaction: APIChatInputApplicationCommandInteraction,
	option: APIApplicationCommandInteractionDataSubcommandOption,
): Promise<CommonResponse> {
	// TODO: implement me
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: `This command (get ${option.name}) has not been implemented yet.`,
		},
	};
}

async function handleSetString(
	_interaction: APIChatInputApplicationCommandInteraction,
	option: APIApplicationCommandInteractionDataSubcommandOption,
): Promise<CommonResponse> {
	// TODO: implement me
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: `This command (set ${option.name}) has not been implemented yet.`,
		},
	};
}

async function handleRemoveString(
	_interaction: APIChatInputApplicationCommandInteraction,
	option: APIApplicationCommandInteractionDataSubcommandOption,
): Promise<CommonResponse> {
	// TODO: implement me
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: `This command (remove ${option.name}) has not been implemented yet.`,
		},
	};
}

async function handleGetNotifchannel(
	_interaction: APIChatInputApplicationCommandInteraction,
	_option: APIApplicationCommandInteractionDataSubcommandOption,
): Promise<CommonResponse> {
	// TODO: implement me
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: `This command (get notifchannel) has not been implemented yet.`,
		},
	};
}

async function handleSetNotifchannel(
	_interaction: APIChatInputApplicationCommandInteraction,
	_option: APIApplicationCommandInteractionDataSubcommandOption,
): Promise<CommonResponse> {
	// TODO: implement me
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: `This command (set notifchannel) has not been implemented yet.`,
		},
	};
}

async function handleRemoveNotifchannel(
	_interaction: APIChatInputApplicationCommandInteraction,
	_option: APIApplicationCommandInteractionDataSubcommandOption,
): Promise<CommonResponse> {
	// TODO: implement me
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: `This command (remove notifchannel) has not been implemented yet.`,
		},
	};
}

async function handleGetLevelup(
	_interaction: APIChatInputApplicationCommandInteraction,
	_option: APIApplicationCommandInteractionDataSubcommandOption,
): Promise<CommonResponse> {
	// TODO: implement me
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: `This command (get levelup) has not been implemented yet.`,
		},
	};
}

async function handleSetLevelup(
	_interaction: APIChatInputApplicationCommandInteraction,
	_option: APIApplicationCommandInteractionDataSubcommandOption,
): Promise<CommonResponse> {
	// TODO: implement me
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: `This command (set levelup) has not been implemented yet.`,
		},
	};
}

async function handleListSelfrole(
	_interaction: APIChatInputApplicationCommandInteraction,
	_option: APIApplicationCommandInteractionDataSubcommandOption,
): Promise<CommonResponse> {
	// TODO: implement me
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: `This command (list selfrole) has not been implemented yet.`,
		},
	};
}

async function handleAddSelfrole(
	_interaction: APIChatInputApplicationCommandInteraction,
	_option: APIApplicationCommandInteractionDataSubcommandOption,
): Promise<CommonResponse> {
	// TODO: implement me
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: `This command (add selfrole) has not been implemented yet.`,
		},
	};
}

async function handleRemoveSelfrole(
	_interaction: APIChatInputApplicationCommandInteraction,
	_option: APIApplicationCommandInteractionDataSubcommandOption,
): Promise<CommonResponse> {
	// TODO: implement me
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: `This command (remove selfrole) has not been implemented yet.`,
		},
	};
}
