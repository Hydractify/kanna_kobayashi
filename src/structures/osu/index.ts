import { APIRouter, buildRouter } from '../Api';

const { osuToken } = require('../../../data');
const api: () => APIRouter = buildRouter({
	baseURL: 'https://osu.ppy.sh/api',
	defaultHeaders: { accept: 'application/json' },
	defaultQueryParams: { k: osuToken },
});

export { api as Api };
export { Beatmap } from './Beatmap';
export { Score } from './Score';
export { User } from './User';
