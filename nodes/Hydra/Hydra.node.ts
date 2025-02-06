import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';

import { hydraOperations, hydraParameters, hydraServices } from './HydraDescription';
import { spawn } from 'child_process';
import moment from 'moment';
import { HydraBruteForceResult } from './models/HydraBruteForceResult';
import { ShellUtils } from './utils/ShellUtils';

export class Hydra implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Hydra',
		name: 'hydra',
		icon: 'file:HydraLogo.svg',
		group: ['output'],
		version: 1,
		triggerPanel: false,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Attempt to connect a service',
		defaults: {
			name: 'Hydra',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		properties: [...hydraOperations, ...hydraServices, ...hydraParameters],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		let item: INodeExecutionData;
		const returnItems: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			item = { ...items[itemIndex] };
			const newItem: INodeExecutionData = {
				json: item.json,
				pairedItem: {
					item: itemIndex,
				},
			};

			// Parameters & Options
			const operation = this.getNodeParameter('operation', itemIndex);
			const service = this.getNodeParameter('service', itemIndex) as string;
			const target_host = this.getNodeParameter('target_host', itemIndex) as string;
			const attempts_limit = this.getNodeParameter('attempts_limit', itemIndex) as number;

			const options = this.getNodeParameter('options', itemIndex);
			const aggressive_mode = options.aggressive_mode ? '-t ' + options.aggressive_mode : '';
			const attempt_wait = options.attempt_wait ? '-W ' + options.attempt_wait : '';
			const empty_password = options.empty_password ? '-e n' : '';
			const restore = options.restore ? '-R' : '-I';
			const slow_attack = options.slow_attack ? '-t 1 -W 64' : '';
			const result_field = (options.result_field as string) || 'hydra';

			const hydraResult = new HydraBruteForceResult();
			hydraResult.target = target_host;
			hydraResult.service = service;

			const shellUtils = new ShellUtils();
			const workingDirectory = await shellUtils.resolveHomeFolder('~/');

			let command: string = `nmap -help`;
			if (operation === 'random_bruteforce') {
				const username = this.getNodeParameter('username', itemIndex) as string;

				command = `hydra -l ${username} -x 4:4:a1 -V ${aggressive_mode} ${attempt_wait} ${empty_password} ${restore} ${slow_attack} ${service}://${target_host}`;
			} else if (operation === 'dictionary_bruteforce') {
				let users_file = this.getNodeParameter('users_file', itemIndex) as string;
				let passwords_file = this.getNodeParameter('passwords_file', itemIndex) as string;

				users_file = await shellUtils.resolveHomeFolder(users_file);
				passwords_file = await shellUtils.resolveHomeFolder(passwords_file);

				command = `hydra -L ${users_file} -P ${passwords_file} -V -F ${aggressive_mode} ${attempt_wait} ${empty_password} ${restore} ${slow_attack} ${service}://${target_host}`;
			}

			console.log(`Hydra starting ${command}`);

			let child = spawn('sh', ['-c', command], { cwd: workingDirectory });
			child.stderr.pipe(process.stderr); // Redirect stderr to the console for error output.
			child.stdout.pipe(process.stdout); // Redirect stderr to the console for error output.

			const commandStart = moment();
			let attemptCount = 0;
			child.stdout.on('data', (data: Buffer) => {
				const lines: string[] = data
					.toString()
					.split('\n')
					.filter((line) => line.trim() !== ''); // Split lines and filter out empty lines

				for (const line of lines) {
					// Parse Attempt
					const regexAttempt =
						/\[ATTEMPT\] target (\S+) - login "(.*?)" - pass "(.*?)" - (\d+) of (\d+) \[child (\d+)\]/;
					const matchAttempt = line.match(regexAttempt);

					if (matchAttempt) {
						if (options.return_attempts) {
							hydraResult.allAttempts.push({
								target: matchAttempt[1],
								service: service,
								login: matchAttempt[2],
								password: matchAttempt[3],
								attempt: parseInt(matchAttempt[4], 10),
							});
						}
						attemptCount++;
					}

					// Parse Success
					const regexSuccess = /\[(\d+)\]\[(\w+)\] host: (\S+)\s+login: (\S+)\s+password: (.+)/;
					const matchSuccess = line.match(regexSuccess);

					if (matchSuccess) {
						hydraResult.successfulAttempts.push({
							target: `${matchSuccess[3]}:${matchSuccess[1]}`,
							service: matchSuccess[2],
							login: matchSuccess[4],
							password: matchSuccess[5],
							attempt: attemptCount,
						});
						hydraResult.cracked = true;
					}

					// Close if limit reach
					if (attempts_limit != 0 && attemptCount > attempts_limit - 1) {
						closeFunction();
					}
				}
			});

			await new Promise<void>((resolve, reject) => {
				child.on('close', (code, signal) => {
					console.log(`Hydra terminated with ${code}`);

					const duration = moment.duration(moment().diff(commandStart));

					hydraResult.duration = duration.asSeconds();
					hydraResult.durationFormatted = duration.humanize();
					hydraResult.attemptCount = attemptCount;

					newItem.json[result_field] = hydraResult;
					returnItems.push(newItem);

					// Resolve the Promise when the process ends
					resolve();
				});

				child.stderr.on('data', (error: Buffer) => {
					const lines: string[] = error
						.toString()
						.split('\n')
						.filter((line) => line.trim() !== '');

					for (const line of lines) {
						console.log(`Hydra stderr : ${line}`);
						if (line.includes('[ERROR]')) {
							hydraResult.errors.push(line);
							closeFunction();
						}
					}
				});
			});

			async function closeFunction() {
				child.kill('SIGHUP');
			}
		}

		return [returnItems];
	}
}
