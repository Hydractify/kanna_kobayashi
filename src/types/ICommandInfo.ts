import { PermissionString } from 'discord.js';

import { PermLevels } from './PermLevels';

export interface ICommandInfo {
	aliases?: string[];
	clientPermissions?: PermissionString[];
	coins?: number;
	cooldown?: number;
	description: string;
	enabled?: boolean;
	examples: string[];
	exp?: number;
	name: string;
	permLevel?: PermLevels;
	usage: string;
}
