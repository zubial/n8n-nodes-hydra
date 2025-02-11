import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType, NodeOperationError,
} from 'n8n-workflow';
import { v4 as uuidv4 } from 'uuid';

import {filterPwdOperations, filterPwdParameters} from './FilterPwdDescription';
import {ShellUtils} from "./utils/ShellUtils";
import {FilterPwdResult} from "./models/FilterPwdResult";

export class FilterPwd implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Filter Pwd',
		name: 'filterpwd',
		icon: 'file:FilterPwdLogo.svg',
		group: ['output'],
		version: 1,
		triggerPanel: false,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Filter Password Dictionary',
		defaults: {
			name: 'Filter Pwd',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		properties: [...filterPwdOperations, ...filterPwdParameters],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		const operation = this.getNodeParameter('operation', 0) as string;
		const dictionary_file = this.getNodeParameter('dictionary_file', 0) as string;
		const min_length = this.getNodeParameter('min_length', 0) as number;
		const max_length = this.getNodeParameter('max_length', 0) as number;
		const has_uppercase = this.getNodeParameter('has_uppercase', 0) as boolean;
		const has_numbers = this.getNodeParameter('has_numbers', 0) as boolean;
		const has_special_chars = this.getNodeParameter('has_special_chars', 0) as boolean;

		const options = this.getNodeParameter('options', 0);
		const result_field = options.result_field ? (options.result_field as string) : 'dictionary_file';
		const output_file = options.output_file ? (options.output_file as string) : 'uuid';


		let awkCommand = `awk -help`;

		if (operation == 'filter_userpwd_dictionary') {
			awkCommand = `awk -F: 'length($2) >= ${min_length} && length($2) <= ${max_length}`;

			if (has_uppercase) awkCommand += ` && $2 ~ /[A-Z]/`;
			if (has_numbers) awkCommand += ` && $2 ~ /[0-9]/`;
			if (has_special_chars) awkCommand += ` && $2 ~ /[!@#$%^&*()_+<>?{}~]/`;

		} else {
			awkCommand = `awk 'length >= ${min_length} && length <= ${max_length}`;

			if (has_uppercase) awkCommand += ` && /[A-Z]/`;
			if (has_numbers) awkCommand += ` && /[0-9]/`;
			if (has_special_chars) awkCommand += ` && /[!@#$%^&*()_+<>?{}~]/`;

		}

		const shellUtils = new ShellUtils();

		let filteredFile;
		if (output_file == 'uuid') {
			filteredFile = await shellUtils.resolveHomeFolder(`~/${uuidv4()}_filtered.txt`);
		} else {
			filteredFile = await shellUtils.resolveHomeFolder(output_file);
		}


		const dictionaryFile = await shellUtils.resolveHomeFolder(dictionary_file);
		const workingDirectory = await shellUtils.resolveHomeFolder('~/');
		console.log(workingDirectory);

		awkCommand += `' ${dictionaryFile} > ${filteredFile}`;

		const result: FilterPwdResult = new FilterPwdResult();

		await shellUtils
			.command(awkCommand, workingDirectory)
			.then((output) => {
				console.log(`Command done ${awkCommand}`);

				result.file = filteredFile;

			})
			.catch((e) => {
				throw new NodeOperationError(this.getNode(), e);
			});

		let countCommand = `wc -l ${filteredFile} | awk '{print $1}'`;
		await shellUtils
			.command(countCommand, workingDirectory)
			.then((output) => {
				console.log(`Command done ${countCommand}`);

				result.count = parseInt(output, 10);

			})
			.catch((e) => {
				throw new NodeOperationError(this.getNode(), e);
			});


		items.forEach((item) => (item.json[result_field] = result));

		return [items];
	}
}
