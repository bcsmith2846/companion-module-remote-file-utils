import { combineRgb } from '@companion-module/base'
import type { FileDownloadInstance } from './main.js'

export function UpdateFeedbacks(self: FileDownloadInstance): void {
	self.setFeedbackDefinitions({
		downloading: {
			name: 'Downloading',
			type: 'boolean',
			showInvert: false,

			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [],
			callback: () => {
				return self.config.downloading
			},
		},
		downloaded: {
			name: 'Downloaded',
			type: 'boolean',
			showInvert: false,
			defaultStyle: {
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [],
			callback: () => {
				return self.config.downloaded && !self.config.downloading
			},
		},
		uploading: {
			name: 'uploading',
			type: 'boolean',
			showInvert: false,

			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [],
			callback: () => {
				return self.config.uploading
			},
		},
		uploaded: {
			name: 'uploaded',
			type: 'boolean',
			showInvert: false,
			defaultStyle: {
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [],
			callback: () => {
				return self.config.uploaded && !self.config.uploading
			},
		},
	})
}
