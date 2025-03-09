import type { SomeCompanionConfigField } from '@companion-module/base/dist/index.js'

export interface FileDownloadConfig {
	url: string
	file: string
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return []
}
