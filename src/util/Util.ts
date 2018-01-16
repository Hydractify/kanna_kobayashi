import { Collection } from 'discord.js';

/**
 * Title case the passed input string.
 */
export const titleCase: (input: string) => string = (input: string): string => {
	let titleCased: string = '';
	for (const word of input.split(' ')) {
		titleCased += `${word[0].toUpperCase() + word.slice(1).toLowerCase()} `;
	}

	return titleCased.slice(0, -1);
};

/**
 * Type declaration for the returned Collection
 */
export type FlagCollection = Collection<string | symbol, string | boolean>;
/**
 * Symbol used to store all text unrelated to flags when parsing flags
 */
export const flagsText: symbol = Symbol.for('FlagsText');
/**
 * Parse flags from a string.
 * Duplicated flags will only return the conteont of the last one.
 * Flags without any content will return the boolean `true` as content.
 * Text before the first flag is keyed under the symbold `FlagsText` exported by this module.
 */
export const parseFlags: (input: string, lowerCase?: boolean) => FlagCollection
	= (input: string, lowerCase: boolean = false): FlagCollection => {
		const parsed: FlagCollection = new Collection();
		const flagsRegex: RegExp = /--(w+)(.*?(?=--|$))/g;

		const index: number = input.indexOf('--');
		if (index !== 0) {
			if (index === -1) return parsed.set(flagsText, input);

			parsed.set(flagsText, input.slice(0, index).trim());
			// tslint:disable-next-line:no-parameter-reassignment
			input = input.slice(index);
		}

		// tslint:disable-next-line:no-null-keyword
		let match: RegExpExecArray = null;

		// tslint:disable-next-line:no-conditional-assignment
		while ((match = flagsRegex.exec(input)) !== null) {
			const flag: string = (lowerCase
				? match[1].toLowerCase()
				: match[1]
			).trim();

			const content: string | boolean = match[2].trim() || true;

			parsed.set(flag, content);
		}

		return parsed;
	};

/**
 * Map an iterable to a string, values will be stringified.
 */
export const mapIterable: <T extends { toString(): string }>(iterable: Iterable<T>, random?: boolean) => string
	= <T extends { toString(): string }>(iterable: Iterable<T>, random: boolean = false): string => {
		const values: T[] = Array.from(iterable);

		if (random) {
			for (let i: number = values.length - 1; i > 0; --i) {
				const randomIndex: number = Math.floor(Math.random() * (i + 1));
				const randomValue: T = values[randomIndex];
				[values[i], values[randomIndex]] = [values[randomIndex], randomValue];
			}
		}

		let mapped: string = '';
		for (const value of values) {
			const stringified: string = String(value);
			if (mapped.length + stringified.length >= 1021) {
				mapped += '...';
				break;
			}

			mapped += ` ${stringified}`;
		}

		return mapped;
	};

/**
 * Split an array into smaller cunks.
 * The original array will _not_ be modified.
 */
export const chunkArray: <T>(input: T[], chunkSize: number) => T[][]
	= <T>(input: T[], chunkSize: number): T[][] => {
		const chunks: T[][] = [];
		const length: number = Math.ceil(input.length / chunkSize);

		for (let i: number = 0; i < length; undefined) {
			chunks.push(input.slice(i * chunkSize, ++i * chunkSize));
		}

		return chunks;
	};

/**
 * Replace parts of the input string determined by the passed object
 */
const replaceRegex: RegExp = /[-[\]/{}()*+?.\\^$|]/g;
export const replaceMap: (input: string, map: { [key: string]: string }) => string
	= (input: string, map: { [key: string]: string }): string => {
		const regexes: string[] = [];
		for (const key of Object.keys(map)) {
			regexes.push(key.replace(replaceRegex, '\\$&'));
		}

		return input.replace(new RegExp(regexes.join('|'), 'g'), (element: string) => map[element]);
	};

/**
 * Fetch the key of a value from an enum
 * (Since TS does not support that themselfes, probably dou possible clashes)
 * @param _enum Enum type
 * @param value Value to search for
 * @returns Key or null if not found
 */
export const enumKeyFromValue: (_enum: any, value: string) => string
	= <T>(_enum: T, value: string): string => {
		for (const [key, val] of Object.entries(_enum)) {
			if (val === value) return key;
		}

		return null;
	};
