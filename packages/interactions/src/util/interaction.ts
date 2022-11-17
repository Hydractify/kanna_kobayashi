import {
	type APIApplicationCommandInteractionDataOption,
	type APIApplicationCommandInteractionDataSubcommandOption,
	type APIApplicationCommandInteractionDataUserOption,
	type APIInteraction,
	type APIInteractionDataResolved,
	type APIInteractionResponse,
	type APIPingInteraction,
	ApplicationCommandOptionType,
} from 'discord-api-types/v10';
import { InvalidRouting } from '../errors/InvalidRouting.js';
import { MissingOption } from '../errors/MissingOption.js';
import { assertType } from './typeguard.js';

/**
 * Gets an option by name from the given array.
 * Optionally asserts that the option is present and optionally asserts that the given option is of a specific type.
 */
export function getOption<T extends ApplicationCommandOptionType>(
	options: APIApplicationCommandInteractionDataOption[] | undefined,
	name: string,
	opts: {
		command: string;
		required: true;
		type?: never;
	},
): APIApplicationCommandInteractionDataOption;
export function getOption<T extends ApplicationCommandOptionType>(
	options: APIApplicationCommandInteractionDataOption[] | undefined,
	name: string,
	opts: {
		command: string;
		required: true;
		type: T;
	},
): Extract<APIApplicationCommandInteractionDataOption, { type: T }>;
export function getOption<T extends ApplicationCommandOptionType>(
	options: APIApplicationCommandInteractionDataOption[] | undefined,
	name: string,
	opts?: {
		command?: string;
		required?: false;
		type?: never;
	},
): APIApplicationCommandInteractionDataOption | undefined;
export function getOption<T extends ApplicationCommandOptionType>(
	options: APIApplicationCommandInteractionDataOption[] | undefined,
	name: string,
	opts: {
		command: string;
		required?: false;
		type: T;
	},
): Extract<APIApplicationCommandInteractionDataOption, { type: T }> | undefined;

export function getOption<T extends ApplicationCommandOptionType>(
	options: APIApplicationCommandInteractionDataOption[] | undefined,
	name: string,
	opts?: {
		command?: string;
		required?: boolean;
		type?: T;
	},
): APIApplicationCommandInteractionDataOption | undefined {
	const option = options?.find((option) => option.name === name);

	if (!option && opts?.required) {
		throw new MissingOption(opts.command!, name);
	}

	if (option && opts?.type) {
		assertType(option, opts.type, opts.command!);
	}

	return option;
}

/**
 * Gets the user and member (if from a guild) from the user that caused this interaction.
 */
export function getUserAndMember(interaction: Exclude<APIInteraction, APIPingInteraction>) {
	return {
		// Either of them is present, TS just doesn't know this
		user: interaction.member?.user ?? interaction.user!,
		member: interaction.member,
	};
}

export function getUserAndMemberFromOption(
	interaction: Extract<APIInteraction, { data: { resolved?: APIInteractionDataResolved } }>,
	option: APIApplicationCommandInteractionDataUserOption,
) {
	const user = interaction.data.resolved?.users?.[option.value];
	// This should be impossible to happen (if the given option belongs to the given interaction)
	// But you never know with Discord, so throw a helpful error then
	if (!user) {
		throw new Error(
			`Failed to obtain user ${option.value} from resolved: ${Object.keys(interaction.data.resolved?.users ?? {})}`,
		);
	}

	return {
		user,
		member: interaction.data.resolved?.members?.[option.value],
	};
}

export type Routes<T, U extends APIInteractionResponse> = {
	[subroute: string]:
		| Routes<T, U>
		| ((interaction: T, data: APIApplicationCommandInteractionDataSubcommandOption) => Promise<U>);
};

/**
 * Routes the given interaction to its subcommand handler based on the given route data.
 */
export async function routeToSubcommand<
	T extends Extract<APIInteraction, { data: { options?: APIApplicationCommandInteractionDataOption[] } }>,
	U extends APIInteractionResponse,
>(interaction: T, routes: Routes<T, U>): Promise<U> {
	const options = interaction.data.options;
	if (!options) {
		throw new InvalidRouting(interaction.data.name, '', Object.keys(routes), []);
	}

	return _routeToSubcommand(interaction, options, routes, '->');
}

async function _routeToSubcommand<
	T extends Extract<APIInteraction, { data: { options?: APIApplicationCommandInteractionDataOption[] } }>,
	U extends APIInteractionResponse = APIInteractionResponse,
>(
	interaction: T,
	options: APIApplicationCommandInteractionDataOption[],
	routes: Routes<T, U>,
	chain: string,
): Promise<U> {
	for (const [name, subroute] of Object.entries(routes)) {
		if (subroute instanceof Function) {
			const option = getOption(options, name, {
				command: interaction.data.name,
				required: false,
				// A function indicates that the end reached, thus a subcommand
				type: ApplicationCommandOptionType.Subcommand,
			});

			if (option) {
				return subroute(interaction, option);
			}
		} else {
			const option = getOption(options, name, {
				command: interaction.data.name,
				required: false,
				// A non-function (ergo another Routes<T> object) indicates that we need to go futher down, therefore a subcommand group
				type: ApplicationCommandOptionType.SubcommandGroup,
			});

			if (option) {
				return _routeToSubcommand(interaction, option.options, subroute, `${chain}->${name}`);
			}
		}
	}

	throw new InvalidRouting(
		interaction.data.name,
		chain,
		Object.keys(routes),
		options.map((option) => option.name),
	);
}
