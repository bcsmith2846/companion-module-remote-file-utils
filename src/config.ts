import type { SomeCompanionConfigField } from '@companion-module/base'

export interface FileDownloadConfig {
	url: string | undefined
	file: string | undefined
	username: string | undefined
	password: string | undefined
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			id: 'username',
			label: 'Upload Username (HTTP Basic Auth)',
			type: 'textinput',
			width: 6,
		},
		{
			id: 'password',
			label: 'Upload Password (HTTP Basic Auth)',
			type: 'textinput',
			width: 6,
		},
	]
}
