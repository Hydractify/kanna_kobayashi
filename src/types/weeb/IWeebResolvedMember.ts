import { GuildMember } from 'discord.js';

import { PermLevels } from '../PermLevels';

export interface IWeebResolvedMember {
	member: GuildMember;
	name: string;
	partnerId: string | null;
	perm: PermLevels;
}
