import { Collection } from 'discord.js';

/**
 * Title case the passed input string.
 */
export const titleCase: (input: string) => string = (input: string): string => {
	let titleCased: string = '';
	for (const word of input.split(' ')) {
		titleCased += `${word.slice(0, 1).toUpperCase() + word.slice(1).toLowerCase()} `;
	}

	return titleCased.slice(0, -1);
};

/**
 * Type declaration for the returned Collection
 */
export type FlagCollection = Collection<string | symbol, string | true>;
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
		const parsed: FlagCollection = new Collection<string | symbol, string | true>();
		const flagsRegex: RegExp = /--(\w+)(.*?(?=--|$))/g;

		const index: number = input.indexOf('--');
		if (index !== 0) {
			if (index === -1) return parsed.set(flagsText, input);

			parsed.set(flagsText, input.slice(0, index).trim());
			// tslint:disable-next-line:no-parameter-reassignment
			input = input.slice(index);
		}

		// tslint:disable-next-line:no-null-keyword
		let match: RegExpExecArray | null = null;

		// tslint:disable-next-line:no-conditional-assignment
		while ((match = flagsRegex.exec(input)) !== null) {
			const flag: string = (lowerCase
				? match[1].toLowerCase()
				: match[1]
			).trim();

			const content: string | true = match[2].trim() || true;

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
export const enumKeyFromValue: <T>(_enum: any, value: string) => T
	= <T>(_enum: T, value: string): T | null => {
		for (const [key, val] of Object.entries(_enum)) {
			if (val === value) return key as any;
		}

		return null;
	};

/**
 * Resolves an input
 * @param input Input to resolve
 * @param regex Regex to apply, the first capture group is the amount, the second the modifier
 * @param modifiers Dict of modifiers to apply
 * @returns The resolved amount, or NaN if nothing was resolved.
 */
const _resolve: (regex: RegExp, modifiers: { [key: string]: number }, input: string) => number =
	(regex: RegExp, modifiers: { [key: string]: number }, input: string): number => {
		let valid: boolean = false;
		let out: number = 0;
		let res: RegExpExecArray | null;

		// tslint:disable-next-line:no-conditional-assignment
		while ((res = regex.exec(input)) !== null) {
			valid = true;
			out += parseInt(res[1]) * modifiers[res[2]];
		}

		return valid ? out : NaN;
	};

const amountRegex: RegExp = / *?(-?\d+) *?([mkb])?/gi;
/* tslint:disable:object-literal-sort-keys */
const amountModifiers: { [key: string]: number } = {
	// billion
	b: 1e9,
	B: 1e9,
	// million
	m: 1e6,
	M: 1e6,
	// thousand
	k: 1e3,
	K: 1e3,
	// undefined is valid, tslint
	[undefined as any]: 1,
};
/* tslint:enable:object-literal-sort-keys */

/**
 * Resolves a string to an amount.
 * @param value Input to resolve
 * @returns A number if valid, or NaN if invalid
 */
export const resolveAmount: (value: string) => number = _resolve.bind(null, amountRegex, amountModifiers);

const durationRegex: RegExp = / *?(\d+) *?([hms])?/gi;
/* tslint:disable:object-literal-sort-keys */
const durationModifiers: { [key: string]: number } = {
	// hour
	h: 60,
	H: 60,
	// minute
	m: 1,
	M: 1,
	// second
	// default to minute
	[undefined as any]: 1,
};
/* tslint:enable:object-literal-sort-keys */

/**
 * Resolves a string to a duration.
 * @param value Input to resolve
 * @returns A duration in seconds
 */
export const resolveDuration: (value: string) => number = _resolve.bind(null, durationRegex, durationModifiers);
