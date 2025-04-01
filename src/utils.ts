import { CompanionActionContext, CompanionActionEvent } from '@companion-module/base/dist/index.js'
import { createReadStream, createWriteStream, stat } from 'fs'
import { get, request } from 'https'
import { FileDownloadInstance } from './main.js'

export const RegexPatterns = {
	URL: /^(?<uri>http|https|ftp):\/\/(?<domain>(?<subdomain>(?:[a-z0-9-]+\.)+)??(?<root>(?:[a-z0-9-]+)(?<tld>\.[a-z]{2,5})))(?<path>\/(?<file>(?:[a-z0-9-_.]+)(?:\/?|(?<ext>\.[a-z0-9]+)))*?)??$/i,
	FILE: /^(?<type>[a-z]:|\.|\.\.|\\)[\\/](?<path>(?<file>[a-z0-9_\s.-]+(?:[\\/]?|(?<ext>\.[a-z0-9]+)))*?)$/i,
}

export const getAuthHeader = (self: FileDownloadInstance): Record<string, string> | undefined => {
	if (!self.config || self.config.username == undefined || self.config.password == undefined) {
		return undefined
	}
	const token = Buffer.from(`${self.config.username}:${self.config.password}`).toString('base64')
	return {
		Authorization: `Basic ${token}`,
	}
}

export const checkFeedbackUpdates = (self: FileDownloadInstance): void => {
	checkDownloadFeedbackUpdates(self)
	checkUploadFeedbackUpdates(self)
}

export const doFileUpload = async (
	self: FileDownloadInstance,
	event: CompanionActionEvent,
	_: CompanionActionContext,
): Promise<void> => {
	if (!event.options) return
	if (
		!event.options.url ||
		!event.options.file ||
		typeof event.options.url != 'string' ||
		typeof event.options.file != 'string'
	)
		return
	const url: string = event.options.url
	const file: string = event.options.file
	self.config.uploadFile = file
	self.config.uploadURL = url
	self.config.uploading = true
	self.setVariableValues({
		uploadURL: url,
		uploadFile: file,
		uploaded: !self.config.uploaded,
		uploading: self.config.uploading,
	})
	self.checkFeedbacks('uploading')
	self.pauseTimer()
	// Look at file
	stat(file, (err, stats) => {
		// If error looking at file
		if (err) {
			self.log(
				'error',
				`Error getting file stats: ${err.message}\n\nPath is likely pointing to a file in a nonexistent directory or to a non-existent directory itself.`,
			)
			self.config.uploaded = false
			self.config.uploading = false
			self.setVariableValues({ uploaded: self.config.uploaded, uploading: self.config.uploading })
			self.unpauseTimer()
			self.checkFeedbacks('uploading', 'uploaded')
		}
		// Build request
		const req = request(
			{
				method: 'PUT',
				hostname: new URL(url).hostname,
				path: new URL(url).pathname,
				headers: {
					'Content-Type': 'application/octet-stream',
					'Content-Length': stats.size,
					...getAuthHeader(self), // Add auth header if available
				},
			},
			// Handle response
			(res) => {
				self.config.uploaded = true
				self.config.uploading = false
				self.setVariableValues({ uploaded: self.config.uploaded, uploading: self.config.uploading })
				self.unpauseTimer()
				self.checkFeedbacks('uploading', 'uploaded')
				self.log('debug', `File upload request to ${url} completed with status code ${res.statusCode}.`)
			},
		)
		// Handle request errors
		req.on('error', (err) => {
			if (err) {
				self.log('error', `Error reading file: ${err.message}`)
				self.config.uploaded = false
				self.config.uploading = false
				self.setVariableValues({ uploaded: self.config.uploaded, uploading: self.config.uploading })
				self.unpauseTimer()
				self.checkFeedbacks('uploading', 'uploaded')
			}
		})
		// Upload file if exists
		if (stats.isFile()) {
			const rs = createReadStream(file)
			rs.pipe(req)
			rs.on('error', (err) => {
				if (err) {
					self.log('error', `Error reading file: ${err.message}`)
					self.config.uploaded = false
					self.config.uploading = false
					self.setVariableValues({ uploaded: self.config.uploaded, uploading: self.config.uploading })
					self.unpauseTimer()
					self.checkFeedbacks('uploading', 'uploaded')
				}
			})
			rs.on('close', () => {
				// Submit the request
				req.end()
				self.unpauseTimer()
			})
		}
	})
}

export const doFileDownload = async (
	self: FileDownloadInstance,
	event: CompanionActionEvent,
	_: CompanionActionContext,
): Promise<void> => {
	if (!event.options) return
	if (
		!event.options.url ||
		!event.options.file ||
		typeof event.options.url != 'string' ||
		typeof event.options.file != 'string'
	)
		return
	const url: string = event.options.url
	const file: string = event.options.file
	self.config.downloadFile = file
	self.config.downloadURL = url
	self.config.downloading = true
	self.setVariableValues({
		downloadURL: url,
		downloadFile: file,
		downloaded: !self.config.downloading,
		downloading: self.config.downloading,
	})
	self.checkFeedbacks('downloading')
	self.pauseTimer()
	get(url, (res) => {
		stat(file, (err, stats) => {
			if (err) {
				self.log(
					'error',
					`Error getting file stats: ${err.message}\n\nPath is likely pointing to a file in a nonexistent directory or to a non-existent directory itself.`,
				)
				self.config.downloaded = false
				self.config.downloading = false
				self.setVariableValues({ downloaded: self.config.downloaded, downloading: self.config.downloading })
				self.unpauseTimer()
				self.checkFeedbacks('downloading', 'downloaded')
				return
			}
			if (stats?.isFile()) {
				self.log('warn', `File ${file} already exists. Overwriting with ${url}...`)
				const ws = createWriteStream(file)
				res.pipe(ws)
				ws.on('finish', () => {
					ws.close()
					self.config.downloaded = true
					self.config.downloading = false
					self.setVariableValues({ downloaded: self.config.downloaded, downloading: self.config.downloading })
					self.unpauseTimer()
					self.checkFeedbacks('downloading', 'downloaded')
					console.log(`File downloaded successfully to ${file}!`)
				})
			} else if (stats?.isDirectory()) {
				const realpath = `${file}/${url.split('/').pop()}`
				self.log('info', `Path is a directory, saving inside. Path: ${realpath} URL: ${url}`)
				const ws = createWriteStream(realpath)
				res.pipe(ws)
				ws.on('finish', () => {
					ws.close()
					console.log(`File downloaded successfully to ${realpath}!`)
					self.config.downloaded = true
					self.config.downloading = false
					self.setVariableValues({ downloaded: self.config.downloaded, downloading: self.config.downloading })
					self.unpauseTimer()
					self.checkFeedbacks('downloading', 'downloaded')
				})
			} else {
				self.log('error', 'Path is neither a file nor a directory.')
				self.config.downloaded = false
				self.config.downloading = false
				self.setVariableValues({ downloaded: self.config.downloaded, downloading: self.config.downloading })
				self.unpauseTimer()
				self.checkFeedbacks('downloading', 'downloaded')
			}
		})
	})
}

export const checkDownloadFeedbackUpdates = (self: FileDownloadInstance): void => {
	const file = self.getVariableValue('downloadFile')?.toString()
	if (!file || self.timerPaused) return
	self.log('debug', 'Timer tick download')
	stat(file, (err, stats) => {
		if (err) {
			self.log(
				'error',
				`Error getting file stats: ${err.message}\n\nPath is likely pointing to a file in a nonexistent directory or to a non-existent directory itself.`,
			)
			self.config.downloaded = false
		} else {
			if (stats?.isFile()) {
				self.config.downloaded = true
				self.setVariableValues({ downloaded: self.config.downloaded, downloading: self.config.downloading })
				self.checkFeedbacks('downloaded')
			} else if (stats?.isDirectory()) {
				const realpath = `${self.getVariableValue('downloadFile')}/${self.getVariableValue('downloadURL')?.toString().split('/').pop()}`
				stat(realpath, (err, stats) => {
					if (err) {
						self.config.downloaded = false
						self.setVariableValues({ downloaded: self.config.downloaded, downloading: self.config.downloading })
						self.checkFeedbacks('downloaded')
					}
					if (stats?.isFile()) {
						self.config.downloaded = true
						self.config.downloading = false
						self.setVariableValues({ downloaded: self.config.downloaded, downloading: self.config.downloading })
						self.checkFeedbacks('downloaded')
					} else {
						self.config.downloaded = false
						self.setVariableValues({ downloaded: self.config.downloaded, downloading: self.config.downloading })
						self.checkFeedbacks('downloaded')
					}
				})
			} else {
				self.config.downloaded = false
				self.setVariableValues({ downloaded: self.config.downloaded, downloading: self.config.downloading })
				self.checkFeedbacks('downloaded')
			}
		}
		self.setVariableValues({ downloaded: self.config.downloaded, downloading: self.config.downloading })
	})
}

export const checkUploadFeedbackUpdates = (self: FileDownloadInstance): void => {
	const url = self.getVariableValue('uploadURL')?.toString()
	if (!url || self.timerPaused) return
	self.log('debug', 'Timer tick: upload')
	// For uploading feedback, we request the url and check the status code, discarding any data
	get(url, (res) => {
		if (res.statusCode === 200 || res.statusCode === 201) {
			self.config.uploaded = true
			self.config.uploading = false
			self.setVariableValues({ uploaded: self.config.uploaded, uploading: self.config.uploading })
			self.checkFeedbacks('uploaded')
		} else {
			self.config.uploaded = false
			self.config.uploading = false
			self.setVariableValues({ uploaded: self.config.uploaded, uploading: self.config.uploading })
			self.checkFeedbacks('uploaded')
			self.log('debug', `Upload status check returned status code ${res.statusCode}. File doesn't exist`)
		}
	}).on('error', (err) => {
		self.log('error', `Error checking upload status: ${err.message}`)
		self.config.uploaded = false
		self.config.uploading = false
		self.setVariableValues({ uploaded: self.config.uploaded, uploading: self.config.uploading })
		self.checkFeedbacks('uploaded')
	})
}
