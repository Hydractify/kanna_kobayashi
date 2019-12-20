import { DataStore } from 'discord.js';

export interface IFetchableStore<V> extends DataStore<string, V> {
	resolveID(id: string): string | null;
	get(id: string): V | undefined;
	fetch(id: string): Promise<V>;
}
