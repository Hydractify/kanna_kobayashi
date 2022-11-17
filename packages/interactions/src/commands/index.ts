import type {
	APIApplicationCommandAutocompleteInteraction,
	APIApplicationCommandAutocompleteResponse,
	APIChatInputApplicationCommandInteraction,
	APIInteractionResponse,
	APIInteractionResponseDeferredMessageUpdate,
	APIInteractionResponsePong,
	APIInteractionResponseUpdateMessage,
	APIMessageApplicationCommandInteraction,
	APIMessageComponentInteraction,
	APIModalInteractionResponse,
	APIModalSubmitInteraction,
	APIUserApplicationCommandInteraction,
	RESTPostAPIApplicationCommandsJSONBody,
} from 'discord-api-types/v10';

export type ModalResponse = Exclude<
	APIInteractionResponse,
	| APIApplicationCommandAutocompleteInteraction
	| APIInteractionResponseDeferredMessageUpdate
	| APIInteractionResponsePong
	| APIInteractionResponseUpdateMessage
	| APIModalInteractionResponse
>;

export type ComponentResponse = Exclude<
	APIInteractionResponse,
	APIApplicationCommandAutocompleteInteraction | APIInteractionResponsePong
>;

export type CommonResponse = Exclude<
	APIInteractionResponse,
	| APIApplicationCommandAutocompleteInteraction
	| APIInteractionResponseDeferredMessageUpdate
	| APIInteractionResponsePong
	| APIInteractionResponseUpdateMessage
>;

export type CommandCallbacks = {
	handleAutocomplete(
		interaction: APIApplicationCommandAutocompleteInteraction,
	): Promise<APIApplicationCommandAutocompleteResponse>;
	handleChatInput(interaction: APIChatInputApplicationCommandInteraction): Promise<CommonResponse>;
	handleMessage(interaction: APIMessageApplicationCommandInteraction): Promise<CommonResponse>;
	handleMessageComponent(interaction: APIMessageComponentInteraction): Promise<ComponentResponse>;
	handleModal(interaction: APIModalSubmitInteraction): Promise<ModalResponse>;
	handleUser(interaction: APIUserApplicationCommandInteraction): Promise<CommonResponse>;
};

// All interaction files have to confirm to this interface.
// This is actually enforced through the handler file at compile time
export type Command = Partial<CommandCallbacks> & {
	data: RESTPostAPIApplicationCommandsJSONBody;
};

// Values exported from this file will be treated as interaction groups!

export * as common from './common/index.js';
export * as fun from './fun/index.js';
export * as info from './info/index.js';
export * as interactive from './interactive/index.js';
export * as settings from './settings/index.js';
export * as user from './user/index.js';
