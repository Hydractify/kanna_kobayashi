import { BaseManager } from 'discord.js';
import { Collection } from 'discord.js';

export interface IFetchableManager<V> extends BaseManager<string, V, any> {
	resolveID(id: string): string | null;
	cache: Collection<string, V>;
	fetch(id: string): Promise<V>;
}
