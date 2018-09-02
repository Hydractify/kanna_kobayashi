// tslint:disable no-bitwise
export enum BeatmapModsFlags {
	NF = 1 << 0,
	EZ = 1 << 1,
	NoVideo = 1 << 2,
	HD = 1 << 3,
	HR = 1 << 4,
	SD = 1 << 5,
	DT = 1 << 6,
	RX = 1 << 7,
	HT = 1 << 8,
	NC = 1 << 9,
	FL = 1 << 10,
	AP = 1 << 11,
	SO = 1 << 12,
	// Whatever Relax 2 is...
	RX2 = 1 << 13,
	PF = 1 << 14,
	KEY4 = 1 << 15,
	KEY5 = 1 << 16,
	KEY6 = 1 << 17,
	KEY7 = 1 << 18,
	KEY8 = 1 << 19,
	KEYMOD = BeatmapModsFlags.KEY4
	| BeatmapModsFlags.KEY5
	| BeatmapModsFlags.KEY6
	| BeatmapModsFlags.KEY7
	| BeatmapModsFlags.KEY8,
	FADEIN = 1 << 20,
	RANDOM = 1 << 21,
	LASTMOD = 1 << 22,
	FREEMODALLOWED = BeatmapModsFlags.NF
	| BeatmapModsFlags.EZ
	| BeatmapModsFlags.HD
	| BeatmapModsFlags.HR
	| BeatmapModsFlags.SD
	| BeatmapModsFlags.FL
	| BeatmapModsFlags.FADEIN
	| BeatmapModsFlags.RX
	| BeatmapModsFlags.RX2
	| BeatmapModsFlags.SO
	| BeatmapModsFlags.KEYMOD,
	// No 1 << 23, /shrug
	KEY9 = 1 << 24,
	KEY10 = 1 << 25,
	KEY1 = 1 << 26,
	KEY3 = 1 << 27,
	KEY2 = 1 << 28,
}
// tslint:enable no-bitwise

import { BitField, BitFieldResolvable } from 'discord.js';

export class BeatmapMods extends BitField<keyof typeof BeatmapModsFlags> {
	public static FLAGS = BeatmapModsFlags;

	public static resolve(bit?: BitFieldResolvable<keyof typeof BeatmapModsFlags>): number {
		return super.resolve(bit);
	}
}
