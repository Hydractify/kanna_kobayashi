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
	Key4 = 1 << 15,
	Key5 = 1 << 16,
	Key6 = 1 << 17,
	Key7 = 1 << 18,
	Key8 = 1 << 19,
	keyMod = BeatmapMods.Key4
	| BeatmapMods.Key5
	| BeatmapMods.Key6
	| BeatmapMods.Key7
	| BeatmapMods.Key8,
	FadeIn = 1 << 20,
	Random = 1 << 21,
	LastMod = 1 << 22,
	FreeModAllowed = BeatmapMods.NF
	| BeatmapMods.EZ
	| BeatmapMods.HD
	| BeatmapMods.HR
	| BeatmapMods.SD
	| BeatmapMods.FL
	| BeatmapMods.FadeIn
	| BeatmapMods.RX
	| BeatmapMods.RX2
	| BeatmapMods.SO
	| BeatmapMods.keyMod,
	// No 1 << 23, /shrug
	Key9 = 1 << 24,
	Key10 = 1 << 25,
	Key1 = 1 << 26,
	Key3 = 1 << 27,
	Key2 = 1 << 28,
}
