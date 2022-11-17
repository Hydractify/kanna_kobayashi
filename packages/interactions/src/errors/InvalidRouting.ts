/**
 * Indicates that a defined route is not compatible with the received interaction data.
 */
export class InvalidRouting extends Error {
	public readonly command: string;

	public readonly chain: string;

	public readonly definedPaths: string[];

	public readonly actualPaths: string[];

	public constructor(command: string, chain: string, definedPaths: string[], actualPaths: string[]) {
		super(
			[
				`Tried to route a subcommand of ${command}, but no suitable path was defined.`,
				`Chain is currently at ${chain}, expected one of ${definedPaths.join(', ')}, but got ${actualPaths.join(', ')}`,
			].join(' '),
		);

		this.command = command;
		this.chain = chain;
		this.definedPaths = definedPaths;
		this.actualPaths = actualPaths;
	}
}
