export enum LogLevel {
	ERROR,
	WARN,
	INFO,
	VERBOSE,
	DEBUG,
	SILLY,
	NONE,
}

export const colors: IColor = {
	[LogLevel.ERROR]: [41, 31],
	[LogLevel.WARN]: [43, 33],
	[LogLevel.INFO]: [42, 32],
	[LogLevel.VERBOSE]: [46, 36],
	[LogLevel.DEBUG]: [40, 34],
	[LogLevel.SILLY]: [45, 35],
	/**
	 * Won't be logged, just here for completeness
	 */
	[LogLevel.NONE]: [0, 0],
};

export interface IColor {
	/**
	 * [background, foreground]
	 */
	[index: number]: [number, number];
}
