import { User } from 'discord.js';

import { User as UserModel } from '../models/User';

class UserExtension {
	public fetchModel(this: User): Promise<UserModel> {
		return UserModel.fetchOrCache(this.id);
	}
}

export { UserExtension as Extension };
export { User as Target };
