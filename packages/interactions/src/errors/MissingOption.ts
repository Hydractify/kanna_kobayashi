/**
 * Indicates that a required option was missing.
 */
export class MissingOption extends Error {
	public override name = this.constructor.name;

	public readonly command: string;

	public readonly option: string;

	public constructor(command: string, option: string) {
		super(`Missing option type in ${command}: ${option} is not present.`);

		this.command = command;
		this.option = option;
	}
}
