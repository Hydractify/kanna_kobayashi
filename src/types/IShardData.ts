export interface IShardData<T = IShardDataOther> {
	guilds: number;
	other: T;
	users: number;
}

export interface IShardDataOther {
	ram: string;
	shardId: number;
}
