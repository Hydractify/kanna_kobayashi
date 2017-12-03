import { User as UserModel } from '../models/User';

export interface ICommandRunInfo {
	args?: string[];
	authorModel?: UserModel;
	commandName?: string;
}
