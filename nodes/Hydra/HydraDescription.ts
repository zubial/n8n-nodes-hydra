import { INodeProperties } from 'n8n-workflow';

export const hydraOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Random BruteForce',
				value: 'random_bruteforce',
				description: 'Bruteforce a service with random password',
				action: 'Bruteforce a service with random password',
			},
			{
				name: 'Dictionary BruteForce',
				value: 'dictionary_bruteforce',
				description: 'Bruteforce a service from dictionary',
				action: 'Bruteforce a service from dictionary',
			},
		],
		default: 'random_bruteforce',
	},
];

export const hydraServices: INodeProperties[] = [
	{
		displayName: 'Target Service',
		name: 'service',
		type: 'options',
		options: [
			{
				name: 'SSH',
				value: 'ssh',
				description: 'SSH Service',
			},
		],
		default: 'ssh',
	},
];

export const hydraParameters: INodeProperties[] = [
	{
		displayName: 'Target Host / IP',
		name: 'target_host',
		type: 'string',
		required: true,
		default: '192.168.0.1:22',
		description: 'Define the target host',
	},
	{
		displayName: 'Username',
		name: 'username',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				operation: ['random_bruteforce'],
			},
		},
		default: 'root',
		description: 'The username to bruteforce (-l)',
	},
	{
		displayName: 'Users Dictionary File',
		name: 'users_file',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				operation: ['dictionary_bruteforce'],
			},
		},
		default: '~/users-list.txt',
		description: 'The users dictionary file (-L)',
	},
	{
		displayName: 'Passwords Dictionary File',
		name: 'passwords_file',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				operation: ['dictionary_bruteforce'],
			},
		},
		default: '~/passwords-list.txt',
		description: 'The passwords dictionary file (-P)',
	},
	{
		displayName: 'Attempts Limit',
		name: 'attempts_limit',
		type: 'number',
		required: true,
		default: 50,
		description: 'Limit the number of attempts (0 to disable)',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add option',
		default: {},
		options: [
			{
				displayName: 'Slow Attack',
				name: 'slow_attack',
				type: 'boolean',
				default: true,
				description: 'Use slow attack (-t 1 -W 64)',
			},
			{
				displayName: 'Aggressive Mode',
				name: 'aggressive_mode',
				type: 'number',
				default: 4,
				description: 'For faster execution (-t 4)',
			},
			{
				displayName: 'Wait Time',
				name: 'attempt_wait',
				type: 'number',
				default: 32,
				description: 'Wait time between attempt (-W 32)',
			},
			{
				displayName: 'Try Empty Password',
				name: 'empty_password',
				type: 'boolean',
				default: false,
				description: 'Try with empty password (-e n)',
			},
			{
				displayName: 'Return All Attempts',
				name: 'return_attempts',
				type: 'boolean',
				default: false,
				description: 'Return all attempts',
			},
			{
				displayName: 'Restore Session',
				name: 'restore',
				type: 'boolean',
				default: false,
				description: 'Restore session on failure (-R)',
			},
			{
				displayName: 'Put Result in Field',
				name: 'result_field',
				type: 'string',
				default: 'hydra',
				description: 'The name of the output field to put the data in',
			},
		],
	},
];
