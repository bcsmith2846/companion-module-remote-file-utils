import type { FileDownloadInstance } from './main.js'
import { createWriteStream, stat } from 'fs'
import { get } from 'https'

const URL =
	/^(?<uri>http|https|ftp):\/\/(?<domain>(?<subdomain>(?:[a-z0-9-]+\.)+)??(?<root>(?:[a-z0-9-]+)(?<tld>\.[a-z]{2,5})))(?<path>\/(?<file>(?:[a-z0-9-_.]+)(?:\/?|(?<ext>\.[a-z0-9]+)))*?)??$/i
const FILE = /^(?<type>[a-z]:|\.|\.\.|\\)[\\/](?<path>(?<file>[a-z0-9_\s.-]+(?:[\\/]?|(?<ext>\.[a-z0-9]+)))*?)$/i

export function UpdateActions(self: FileDownloadInstance): void {
	self.setActionDefinitions({
		sample_action: {
			name: 'Download File',
			options: [
				{
					type: 'textinput',
					id: 'url',
					label: 'URL of file to download',
					regex: `/${URL.source}/i`,
				},
				{
					type: 'textinput',
					id: 'file',
					label: 'Local path to save file',
					regex: `/${FILE.source}/i`,
				},
			],
			callback: async (event) => {
				if (!event.options) return
				if (
					!event.options.url ||
					!event.options.file ||
					typeof event.options.url != 'string' ||
					typeof event.options.file != 'string'
				)
					return
				const url: string = event.options.url
				const path: string = event.options.file
				get(url, (res) => {
					stat(path, (err, stats) => {
						if (err) {
							self.log(
								'error',
								`Error getting file stats: ${err.message}\n\nPath is likely pointing to a file in a nonexistent directory or to a non-existent directory itself.`,
							)
							return
						}
						if (stats.isFile()) {
							self.log('warn', `File ${path} already exists. Overwriting with ${url}...`)
							const ws = createWriteStream(path)
							res.pipe(ws)
							ws.on('finish', () => {
								ws.close()
								console.log(`File downloaded successfully to ${path}!`)
							})
						} else if (stats.isDirectory()) {
							const realpath = `${path}/${url.split('/').pop()}`
							self.log('info', `Path is a directory, saving inside. Path: ${realpath} URL: ${url}`)
							const ws = createWriteStream(realpath)
							res.pipe(ws)
							ws.on('finish', () => {
								ws.close()
								console.log(`File downloaded successfully to ${realpath}!`)
							})
						} else {
							self.log('error', 'Path is neither a file nor a directory.')
							return
						}
					})
				})

				console.log(event.options)
			},
		},
	})
}
