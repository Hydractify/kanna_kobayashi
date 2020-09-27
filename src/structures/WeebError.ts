/**
 * Extended error to identify errors originating
 * from the weeb.sh API when bubbling up.
 */
export class WeebError extends Error
{
	/**
	 * Instantiates a new `WeebError`, optionally copying a provided error's properties.
	 * @param error Either an Error instance or an error message as a string
	 */
	constructor(error: string | Error)
	{
		if (error instanceof Error)
		{
			super(error.message);
			Object.assign(this, error);
		}
		else
		{
			super(error);
		}
	}

}
