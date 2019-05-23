import { execSync } from 'child_process';
import { Gauge } from 'prom-client';

import { Loggable, Logger } from './Logger';

const TIMEOUT = 10000;

/**
 * Prometheus Singleton
 */
@Loggable('PROMETHEUS')
export class Prometheus {
	/**
	 * Singleton Prometheus instance
	 */
	public static get instance(): Prometheus {
		return this._instance || new this();
	}

	/**
	 * Prometheus instance
	 */
	private static _instance: Prometheus;

	/**
	 * Reference to the Logger instance
	 */
	private readonly logger!: Logger;

	/**
	 * Timers currently running;
	 */
	private readonly timers: NodeJS.Timer[] = [];

	/** Gauge for the memory usage */
	private readonly _memory: Gauge;
	/** Gauge for the node version */
	private readonly _nodeVersion: Gauge;
	/** Gauge for the bot version and commit hash */
	private readonly _kannaVersion: Gauge;
	/** Gauge for the cpu usage */
	private readonly _cpu: Gauge;

	/** The last cpu time used to get diffs */
	private _lastCpuUsage: { user: number, system: number } = { user: 0, system: 0 };

	/** Whether the Prometheus singleton is already started */
	private started: boolean = false;

	/**
	 * Instantiate the Prometheus singleton.
	 */
	private constructor() {
		if (Prometheus._instance) {
			throw new Error('Can not create multiple instances from Prometheus singleton.');
		}

		Prometheus._instance = this;

		this._memory = new Gauge({
			help: 'Memory being used by this process',
			name: 'kanna_kobayashi_process_rss',
		});

		this._nodeVersion = new Gauge({
			help: 'Nodejs version of this process',
			labelNames: ['version'],
			name: 'kanna_kobayashi_nodejs_version',
		});

		this._kannaVersion = new Gauge({
			help: 'Version of the bot',
			labelNames: ['version', 'commit'],
			name: 'kanna_kobayashi_version',
		});

		this._cpu = new Gauge({
			help: 'CPU time of this process',
			name: 'kanna_kobayashi_cpu',
		});
	}

	/**
	 * Start Prometheus timers
	 */
	public start(): void {
		if (this.started) return;
		this.started = true;

		this.timers.push(
			setInterval(
				() => this._memory.set(process.memoryUsage().rss, Date.now()),
				TIMEOUT,
			),
			setInterval(
				() => {
					const oldUsage: number = this._lastCpuUsage.system + this._lastCpuUsage.user;
					const { user, system } = this._lastCpuUsage = process.cpuUsage();
					this._cpu.set((user + system) - oldUsage, Date.now());
				},
				TIMEOUT,
			),
		);
		for (const timer of this.timers) timer.unref();

		this._nodeVersion.set({ version: process.versions.node }, 1);

		const { version } = require('../../package.json');
		const commit = execSync('git rev-parse --short HEAD', { encoding: 'utf8', cwd: __dirname });

		this._kannaVersion.set({ version, commit }, 1);

		this.logger.info('Installed');
	}

	/**
	 * Stop Prometheus timers
	 */
	public stop(): void {
		if (!this.started) return;
		this.started = false;

		for (const timer of this.timers) {
			clearInterval(timer);
		}
	}
}
