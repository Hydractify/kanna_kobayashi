import { Message, User } from 'discord.js';

import { User as UserModel } from '../models/User';

class UserExtension {
	public fetchModel(this: User): Promise<UserModel> {
		return UserModel.fetch(this.id);
	}

	// tslint:disable:no-empty
	set lastMessage(value: Message) { }
	set lastMessageID(value: string) { }
	// tslint:enable:no-empty
}

export { UserExtension as Extension };
export { User as Target };
