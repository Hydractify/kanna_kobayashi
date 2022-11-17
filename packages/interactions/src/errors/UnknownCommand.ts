/**
 * Indicates that an interaction was received for a command that is unknown.
 */
export class UnknownCommand extends Error {
	public override name = this.constructor.name;

	public readonly command: string;

	public constructor(command: string) {
		super(`Received an interaction for an unknown command: ${command}`);

		this.command = command;
	}
}
