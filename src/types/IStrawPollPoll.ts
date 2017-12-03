import { StrawPollDupChecks } from './StrawPollDupChecks';

export interface IStrawPollPoll {
	captcha: boolean;
	dupcheck: StrawPollDupChecks;
	id: number;
	multi: boolean;
	options: string[];
	title: string;
	votes: number[];
}
