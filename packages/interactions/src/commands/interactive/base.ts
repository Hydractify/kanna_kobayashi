import {
	type APIApplicationCommandOption,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	type RESTPostAPIApplicationCommandsJSONBody,
	type APIChatInputApplicationCommandInteraction,
	InteractionResponseType,
	type APIUser,
	type APIInteractionDataResolvedGuildMember,
	MessageFlags,
	type APIEmbed,
} from 'discord-api-types/v10';
import { getUserAndMemberFromOption } from '../../util/interaction.js';
import { assertTypeAll } from '../../util/typeguard.js';
import { fetchRandom } from '../../util/weeb-sh.js';
import type { CommonResponse } from '../index.js';

export function createData(
	name: string,
	description: string,
	requiredArgs = 1,
): RESTPostAPIApplicationCommandsJSONBody {
	return {
		name,
		description,
		type: ApplicationCommandType.ChatInput,
		options: Array.from({ length: 25 }).map<APIApplicationCommandOption>((_, num) => ({
			name: `user_${num + 1}`,
			description: `user_${num + 1}`,
			type: ApplicationCommandOptionType.User,
			required: num < requiredArgs,
		})),
	};
}

export function createChatInputHandler(
	action: string,
	emoji: string,
	type: string,
	options?: {
		formatAction?(action: string, members: UserMemberData[]): string;
		selfResponse?: string;
	},
): (interaction: APIChatInputApplicationCommandInteraction) => Promise<CommonResponse> {
	return async (interaction) => {
		const members = getMembers(interaction);
		// interaction.data.options missing indacates that members is optional
		if (!members.length && interaction.data.options) {
			return {
				type: InteractionResponseType.ChannelMessageWithSource,
				data: {
					flags: MessageFlags.Ephemeral,
					content: 'Looks like none of them is in this guild.',
				},
			};
		}

		if (options?.selfResponse && members.some((member) => member.user.id === interaction.application_id)) {
			return {
				type: InteractionResponseType.ChannelMessageWithSource,
				data: {
					content: options.selfResponse,
				},
			};
		}

		// TODO: Handle users blocking the invoker

		const actualAction = options?.formatAction?.(action, members) ?? action;

		const baseString = computeBaseString(interaction, emoji, actualAction, members);

		const embed = await fetchEmbed(type);

		return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: baseString,
				embeds: [embed],
			},
		};
	};
}

type UserMemberData = {
	member: APIInteractionDataResolvedGuildMember;
	user: APIUser;
};

function getMembers(interaction: APIChatInputApplicationCommandInteraction) {
	const options = interaction.data.options ?? [];
	assertTypeAll(options, ApplicationCommandOptionType.User, interaction.data.name);
	return options
		.map((option) => getUserAndMemberFromOption(interaction, option))
		.filter((option): option is UserMemberData => Boolean(option.member));
}

function computeBaseString(
	interaction: APIChatInputApplicationCommandInteraction,
	emoji: string,
	action: string,
	members: UserMemberData[],
) {
	const invokerName = (interaction.member?.nick ?? interaction.member?.user.username ?? interaction.user?.username)!;

	const base = `${emoji} | **${invokerName}** ${action}`;

	if (members.length === 0) {
		return base;
	}

	if (members.length === 1) {
		return `${base} ${getName(interaction, members[0]!)}`;
	}

	const names = members.map((member) => getName(interaction, member));

	return `${base} **${names.slice(0, -1).join('**, **')}** and **${names.at(-1)}**`;
}

function getName(interaction: APIChatInputApplicationCommandInteraction, um: UserMemberData) {
	if (interaction.application_id === um.user.id) {
		return 'me';
	}

	if (interaction.user?.id ?? interaction.member?.user.id === um.user.id) {
		return 'themselves';
	}

	return `<@${um.user.id}>`;
}

async function fetchEmbed(type: string): Promise<APIEmbed> {
	const { url } = await fetchRandom({
		filetype: 'gif',
		nsfw: false,
		type,
	});

	return {
		image: {
			url,
		},
	};
}
