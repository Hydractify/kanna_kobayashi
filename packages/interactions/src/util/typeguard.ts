import type { APIApplicationCommandInteractionDataOption, ApplicationCommandOptionType } from 'discord-api-types/v10';
import { InvalidOptionType } from '../errors/InvalidOptionType.js';

/**
 * Whether the given option is of the given type.
 */
export function isType<T extends ApplicationCommandOptionType>(
	option: APIApplicationCommandInteractionDataOption,
	type: T,
): option is Extract<APIApplicationCommandInteractionDataOption, { type: T }> {
	return option.type === type;
}

/**
 * Asserts that a given option is of the given type.
 */
export function assertType<T extends ApplicationCommandOptionType>(
	option: APIApplicationCommandInteractionDataOption,
	type: T,
	command: string,
): asserts option is Extract<APIApplicationCommandInteractionDataOption, { type: T }> {
	if (option.type !== type) {
		throw new InvalidOptionType(command, option.name, type, option.type);
	}
}

/**
 * Asserts that all the given options are of the given type.
 */
export function assertTypeAll<T extends ApplicationCommandOptionType>(
	options: APIApplicationCommandInteractionDataOption[],
	type: T,
	command: string,
): asserts options is Extract<APIApplicationCommandInteractionDataOption, { type: T }>[] {
	for (const option of options) {
		assertType(option, type, command);
	}
}
