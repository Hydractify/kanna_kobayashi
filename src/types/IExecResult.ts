// Amazing how even node stuff is not properly typed
export interface IExecResult {
	error?: Error & {
		code: number;
		stderr: string;
		stdout: string;
	};
	stderr: string;
	stdout: string;
}
