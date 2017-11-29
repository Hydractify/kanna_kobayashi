// tslint:disable no-bitwise
export enum BeatmapMods {
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
	KEYMOD = BeatmapMods.KEY4
	| BeatmapMods.KEY5
	| BeatmapMods.KEY6
	| BeatmapMods.KEY7
	| BeatmapMods.KEY8,
	FADEIN = 1 << 20,
	RANDOM = 1 << 21,
	LASTMOD = 1 << 22,
	FREEMODALLOWED = BeatmapMods.NF
	| BeatmapMods.EZ
	| BeatmapMods.HD
	| BeatmapMods.HR
	| BeatmapMods.SD
	| BeatmapMods.FL
	| BeatmapMods.FADEIN
	| BeatmapMods.RX
	| BeatmapMods.RX2
	| BeatmapMods.SO
	| BeatmapMods.KEYMOD,
	// No 1 << 23, /shrug
	KEY9 = 1 << 24,
	KEY10 = 1 << 25,
	KEY1 = 1 << 26,
	KEY3 = 1 << 27,
	KEY2 = 1 << 28,
}
