import { Structures } from 'discord.js';

import { User as UserModel } from '../models/User';


const UserExtensionClass = Structures.extend('User', User =>
	class UserExtension extends User
	{
		public fetchModel(): Promise<UserModel>
		{
			return UserModel.fetch(this.id);
		}
	}
);

export { UserExtensionClass as User };
