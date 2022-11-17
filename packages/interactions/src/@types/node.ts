// Hack for https://github.com/nodejs/undici/issues/1740
// as @types/node does not have these

// Fixed with https://github.com/nodejs/undici/pull/1762
// Not released yet :(

declare global {
	export class DOMException extends Error {}

	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions, @typescript-eslint/no-empty-interface
	export interface EventInit {}
}

export {};
