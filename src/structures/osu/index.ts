import { APIRouter, buildRouter } from '../Api';

const { osuToken } = require('../../../data');
const api: () => APIRouter = buildRouter({
	baseURL: 'https://osu.ppy.sh/api',
	defaultQueryParams: { k: osuToken },
});

export { api as Api };
export { Beatmap } from './Beatmap';
export { Score } from './Score';
export { User } from './User';
