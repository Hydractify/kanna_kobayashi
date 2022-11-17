import type { CommandCallbacks } from '../commands/index.js';

/**
 * Indicates that a interaction module is missing a callback that was intended to be called.
 */
export class MissingCallback extends Error {
	public override name = this.constructor.name;

	public readonly command: string;

	public readonly callback: string;

	// eslint-disable-next-line promise/prefer-await-to-callbacks
	public constructor(command: string, callback: keyof CommandCallbacks) {
		super(`Command ${command} is missing a callback for ${callback} and such an interaction was received.`);

		this.command = command;
		this.callback = callback;
	}
}
