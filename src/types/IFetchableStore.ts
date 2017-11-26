import { DataStore } from 'discord.js';

export interface IFetchableStore<V> extends DataStore<string, V> {
	fetch(id: string): Promise<V>;
}
