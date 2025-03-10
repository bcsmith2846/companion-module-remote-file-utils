import type { SomeCompanionConfigField } from '@companion-module/base'

export interface FileDownloadConfig {
	url: string
	file: string
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return []
}
