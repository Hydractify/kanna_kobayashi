import { PermissionString } from 'discord.js';

import { PermLevels } from './PermLevels';

export interface ICommandInfo {
	aliases?: string[];
	clientPermissions?: PermissionString[];
	coins?: number;
	cooldown?: number;
	description: string;
	examples: string[];
	exp?: number;
	guarded?: boolean;
	patreonOnly?: boolean;
	permLevel?: PermLevels;
	usage: string;
}
