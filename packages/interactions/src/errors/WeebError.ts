/**
 * Indicates that this error originates from `weeb.sh`.
 */
export class WeebError extends Error {
	public override name = this.constructor.name;

	public readonly url: string;

	public readonly statusCode: number;

	public readonly response: string;

	public constructor(url: string, statusCode: number, response: string) {
		super(`Request to ${url} failed with ${statusCode}: ${response}`);

		this.url = url;
		this.statusCode = statusCode;
		this.response = response;
	}
}
