import {
	setExtra as sentrySetExtra,
	setExtras as sentrySetExtras,
	setTag as sentrySetTag,
	setUser as sentrySetUser,
} from '@sentry/node';
import {
	type APIInteraction,
	type APIInteractionResponse,
	InteractionResponseType,
	InteractionType,
	ApplicationCommandType,
	type APIApplicationCommandInteraction,
	type APIChatInputApplicationCommandInteraction,
	type APIUserApplicationCommandInteraction,
	type APIMessageApplicationCommandInteraction,
} from 'discord-api-types/v10';
import { MissingCallback } from '../errors/MissingCallback.js';
import { UnknownCommand } from '../errors/UnknownCommand.js';
import type { Command } from './index.js';
import * as groups from './index.js';

export async function handleInteraction(interaction: APIInteraction): Promise<APIInteractionResponse> {
	sentrySetTag('interaction.type', InteractionType[interaction.type] ?? interaction.type);
	sentrySetExtras({
		interaction:
			interaction.app_permissions ?? interaction.channel_id
				? {
						app_permissions: interaction.app_permissions,
						channel_id: interaction.channel_id,
				  }
				: undefined,
		guild:
			interaction.guild_id ?? interaction.guild_locale
				? {
						id: interaction.guild_id,
						locale: interaction.guild_locale,
				  }
				: undefined,
	});

	if (interaction.user ?? interaction.member) {
		const member = interaction.member;
		const user = member?.user ?? interaction.user!;
		sentrySetUser({
			id: user.id,
			username: `${user.username}#${user.discriminator}`,
			locale: user.locale,
			permissions: member?.permissions,
			nick: member?.nick,
		});
	}

	switch (interaction.type) {
		case InteractionType.Ping:
			return {
				type: InteractionResponseType.Pong,
			};

		case InteractionType.ApplicationCommand:
			return handleApplicationCommand(interaction);

		case InteractionType.MessageComponent: {
			sentrySetExtra('custom_id', interaction.data.custom_id);

			const command = getCommand(interaction.data.custom_id.split('-')[0]!);

			if (!command.handleMessageComponent) {
				throw new MissingCallback(command.data.name, 'handleMessageComponent');
			}

			return command.handleMessageComponent(interaction);
		}

		case InteractionType.ApplicationCommandAutocomplete: {
			const command = getCommand(interaction.data.name);

			if (!command.handleAutocomplete) {
				throw new MissingCallback(command.data.name, 'handleUser');
			}

			return command.handleAutocomplete(interaction);
		}

		case InteractionType.ModalSubmit: {
			sentrySetExtra('custom_id', interaction.data.custom_id);

			const command = getCommand(interaction.data.custom_id.split('-')[0]!);

			if (!command.handleModal) {
				throw new MissingCallback(command.data.name, 'handleModal');
			}

			return command.handleModal(interaction);
		}

		default:
			// Discord may add new types in the future, we should throw rather than do nothing here.
			throw new RangeError(`Unhandled interaction type: ${(interaction as any).type}`);
	}
}

async function handleApplicationCommand(interaction: APIApplicationCommandInteraction) {
	sentrySetTag('interaction.data.type', interaction.data.type);

	const command = getCommand(interaction.data.name);

	switch (interaction.data.type) {
		case ApplicationCommandType.ChatInput:
			if (!command.handleChatInput) {
				throw new MissingCallback(command.data.name, 'handleChatInput');
			}

			return command.handleChatInput(interaction as APIChatInputApplicationCommandInteraction);

		case ApplicationCommandType.User:
			if (!command.handleUser) {
				throw new MissingCallback(command.data.name, 'handleUser');
			}

			return command.handleUser(interaction as APIUserApplicationCommandInteraction);

		case ApplicationCommandType.Message:
			if (!command.handleMessage) {
				throw new MissingCallback(command.data.name, 'handleUser');
			}

			return command.handleMessage(interaction as APIMessageApplicationCommandInteraction);

		default:
			// TS can't infer the interaction types above, but can infer that the above is exhausting?
			// Discord may add new types in the future, we should throw rather than do nothing here.
			throw new RangeError(`Unhandled application command type: ${(interaction.data as any).type}`);
	}
}

const commands: Map<string, Command> = new Map(Object.values(groups).flatMap((group) => Object.entries(group)));
function getCommand(name: string): Command {
	sentrySetTag('command', name);

	const command = commands.get(name);

	if (!command) {
		throw new UnknownCommand(name);
	}

	return command;
}
