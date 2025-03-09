import type { FileDownloadInstance } from './main.js'

export function UpdateVariableDefinitions(self: FileDownloadInstance): void {
	self.setVariableDefinitions([
		{ variableId: 'file', name: 'Local file location' },
		{ variableId: 'url', name: 'File download URl' },
		{ variableId: 'downloaded', name: 'Is the file downloaded?' },
	])
}
