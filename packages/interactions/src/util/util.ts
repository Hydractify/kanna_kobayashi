/**
 * Map an iterable to a string, values will be stringified.
 */
export const mapIterable: <T extends { toString(): string }>(iterable: Iterable<T>, random?: boolean) => string = <
	T extends { toString(): string },
>(
	iterable: Iterable<T>,
	random: boolean = false,
): string => {
	if (random) {
		const values = Array.from(iterable);
		for (let idx = values.length - 1; idx > 0; --idx) {
			const randomIndex = Math.floor(Math.random() * (idx + 1));
			const randomValue = values[randomIndex]!;
			[values[idx], values[randomIndex]] = [values[randomIndex]!, randomValue];
		}

		// eslint-disable-next-line no-param-reassign
		iterable = values;
	}

	let mapped = '';
	for (const value of iterable) {
		const stringified = String(value);
		if (mapped.length + stringified.length >= 1_021) {
			mapped += '...';
			break;
		}

		mapped += ` ${stringified}`;
	}

	return mapped;
};
