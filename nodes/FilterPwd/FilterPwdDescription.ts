import { INodeProperties } from 'n8n-workflow';

export const filterPwdOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Filter Password Dictionary',
				value: 'filter_pwd_dictionary',
				description: 'Apply filter on password dictionary',
				action: 'Apply filter on password dictionary',
			},
			{
				name: 'Filter User:Password Dictionary',
				value: 'filter_userpwd_dictionary',
				description: 'Apply filter on user:password dictionary',
				action: 'Apply filter on user:password dictionary',
			},
		],
		default: 'filter_pwd_dictionary',
	},
];

export const filterPwdParameters: INodeProperties[] = [
	{
		displayName: 'Dictionary File',
		name: 'dictionary_file',
		type: 'string',
		required: true,
		default: '~/dictionary-list.txt',
		description: 'The dictionary file',
	},
	{
		displayName: 'minLength',
		name: 'min_length',
		type: 'number',
		required: true,
		default: '4',
		description: 'Define the min length',
	},
	{
		displayName: 'maxLength',
		name: 'max_length',
		type: 'number',
		required: true,
		default: '8',
		description: 'Define the max length',
	},
	{
		displayName: 'hasUppercase',
		name: 'has_uppercase',
		type: 'boolean',
		required: true,
		default: false,
		description: 'Password having uppercase',
	},
	{
		displayName: 'hasNumbers',
		name: 'has_numbers',
		type: 'boolean',
		required: true,
		default: false,
		description: 'Password having numbers',
	},
	{
		displayName: 'hasSpecialChars',
		name: 'has_special_chars',
		type: 'boolean',
		required: true,
		default: false,
		description: 'Password special chars',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add option',
		default: {},
		options: [
			{
				displayName: 'Output File',
				name: 'output_file',
				type: 'string',
				default: '~/filtered-output.txt',
				description: 'The output file',
			},
			{
				displayName: 'Put Result in Field',
				name: 'result_field',
				type: 'string',
				default: 'dictionary_file',
				description: 'The name of the output field to put the data in',
			},
		],
	},
];
