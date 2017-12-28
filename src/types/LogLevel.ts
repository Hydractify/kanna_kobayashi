import { ColorResolvable } from 'discord.js';

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
	[LogLevel.ERROR]: [41, 31, 'RED'],
	[LogLevel.WARN]: [43, 33, 0xFFFF00],
	[LogLevel.INFO]: [42, 32, 'GREEN'],
	[LogLevel.VERBOSE]: [46, 36, 0x00FFFF],
	[LogLevel.DEBUG]: [44, 34, 'BLUE'],
	[LogLevel.SILLY]: [45, 35, 0xFF00FF],
	/**
	 * Won't be logged, just here for completeness
	 */
	[LogLevel.NONE]: [0, 0, 0],
};

export interface IColor {
	/**
	 * [background, foreground]
	 */
	[index: number]: [number, number, ColorResolvable];
}
