import type { FileDownloadInstance } from './main.js'
import { doFileDownload, doFileUpload, RegexPatterns } from './utils.js'

export function UpdateActions(self: FileDownloadInstance): void {
	self.setActionDefinitions({
		download_file: {
			name: 'Download File',
			options: [
				{
					type: 'textinput',
					id: 'url',
					label: 'URL of file to download',
					regex: `/${RegexPatterns.URL.source}/i`,
				},
				{
					type: 'textinput',
					id: 'file',
					label: 'Local path to save file',
					regex: `/${RegexPatterns.FILE.source}/i`,
				},
			],
			callback: async (action, context) => await doFileDownload(self, action, context),
		},
		upload_file: {
			name: 'Upload File',
			options: [
				{
					type: 'textinput',
					id: 'url',
					label: 'URL of upload target (without file name)',
					regex: `/${RegexPatterns.URL.source}/i`,
				},
				{
					type: 'textinput',
					id: 'file',
					label: 'Local path to file to upload',
					regex: `/${RegexPatterns.FILE.source}/i`,
				},
			],
			callback: async (action, context) => await doFileUpload(self, action, context),
		},
	})
}
