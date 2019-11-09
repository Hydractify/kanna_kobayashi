import { Message, User } from 'discord.js';

import { User as UserModel } from '../models/User';

class UserExtension
{
	public fetchModel(this: User): Promise<UserModel>
	{
		return UserModel.fetch(this.id);
	}

	/* eslint-disable @typescript-eslint/no-empty-function */
	set lastMessage(value: Message)
	{ }
	set lastMessageID(value: string)
	{ }
	/* eslint-enable @typescript-eslint/no-empty-function */
}

export { UserExtension as Extension };
export { User as Target };
