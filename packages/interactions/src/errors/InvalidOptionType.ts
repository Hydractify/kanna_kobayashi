import { ApplicationCommandOptionType } from 'discord-api-types/v10';

/**
 * Indicates that an option is not of the expected type.
 */
export class InvalidOptionType extends TypeError {
	public override name = this.constructor.name;

	public readonly command: string;

	public readonly option: string;

	public readonly expectedType: ApplicationCommandOptionType;

	public readonly actualType: ApplicationCommandOptionType;

	public constructor(
		command: string,
		option: string,
		expectedType: ApplicationCommandOptionType,
		actualType: ApplicationCommandOptionType,
	) {
		super(
			`Invalid option type in ${command}: ${option} should have been ${ApplicationCommandOptionType[expectedType]}, but was ${ApplicationCommandOptionType[actualType]}`,
		);

		this.command = command;
		this.option = option;
		this.expectedType = expectedType;
		this.actualType = actualType;
	}
}
