import type { FileDownloadInstance } from './main.js'

export function UpdateVariableDefinitions(self: FileDownloadInstance): void {
	self.setVariableDefinitions([
		{ variableId: 'downloaded', name: 'Is the file downloaded?' },
		{ variableId: 'downloading', name: 'Is the file downloading?' },
		{ variableId: 'downloadFile', name: 'Local file location' },
		{ variableId: 'downloadURL', name: 'File download URl' },
		{ variableId: 'uploaded', name: 'Is the file uploaded?' },
		{ variableId: 'uploading', name: 'Is the file uploading?' },
		{ variableId: 'uploadFile', name: 'Local file to upload' },
		{ variableId: 'uploadURL', name: 'File upload URL (without file name)' },
	])
}
