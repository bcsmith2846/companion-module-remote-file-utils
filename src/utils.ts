import { CompanionActionContext, CompanionActionEvent } from '@companion-module/base/dist/index.js'
import { createWriteStream, stat } from 'fs'
import { get } from 'https'
import { FileDownloadInstance } from './main.js'

export const RegexPatterns = {
	URL: /^(?<uri>http|https|ftp):\/\/(?<domain>(?<subdomain>(?:[a-z0-9-]+\.)+)??(?<root>(?:[a-z0-9-]+)(?<tld>\.[a-z]{2,5})))(?<path>\/(?<file>(?:[a-z0-9-_.]+)(?:\/?|(?<ext>\.[a-z0-9]+)))*?)??$/i,
	FILE: /^(?<type>[a-z]:|\.|\.\.|\\)[\\/](?<path>(?<file>[a-z0-9_\s.-]+(?:[\\/]?|(?<ext>\.[a-z0-9]+)))*?)$/i,
}

export const checkFeedbackUpdates = (self: FileDownloadInstance): void => {
	const file = self.getVariableValue('file')?.toString()
	if (!file || self.timerPaused) return
	self.log('debug', 'Timer tick')
	stat(file, (err, stats) => {
		if (err) {
			self.log(
				'error',
				`Error getting file stats: ${err.message}\n\nPath is likely pointing to a file in a nonexistent directory or to a non-existent directory itself.`,
			)
			self.downloaded = false
		} else {
			if (stats?.isFile()) {
				self.downloaded = true
			} else if (stats?.isDirectory()) {
				const realpath = `${self.getVariableValue('file')}/${self.getVariableValue('url')?.toString().split('/').pop()}`
				stat(realpath, (err, stats) => {
					if (err) {
						self.downloaded = false
						self.downloading = false
						self.checkFeedbacks('downloading', 'downloaded')
					}
					if (stats?.isFile()) {
						self.downloaded = true
						self.downloading = false
						self.checkFeedbacks('downloading', 'downloaded')
					} else {
						self.downloaded = false
						self.downloading = false
						self.checkFeedbacks('downloading', 'downloaded')
					}
				})
			} else {
				self.downloaded = false
				self.checkFeedbacks('downloading', 'downloaded')
			}
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
	self.setVariableValues({ url, file })
	self.file = file
	self.url = url
	self.downloading = true
	self.checkFeedbacks('downloading')
	self.pauseTimer()
	get(url, (res) => {
		stat(file, (err, stats) => {
			if (err) {
				self.log(
					'error',
					`Error getting file stats: ${err.message}\n\nPath is likely pointing to a file in a nonexistent directory or to a non-existent directory itself.`,
				)
				self.downloaded = false
				self.downloading = false
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
					self.downloaded = true
					self.downloading = false
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
					self.downloaded = true
					self.downloading = false
					self.unpauseTimer()
					self.checkFeedbacks('downloading', 'downloaded')
				})
			} else {
				self.log('error', 'Path is neither a file nor a directory.')
				self.downloaded = false
				self.downloading = false
				self.unpauseTimer()
				self.checkFeedbacks('downloading', 'downloaded')
			}
		})
	})
}
