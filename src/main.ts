import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type FileDownloadConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { stat } from 'fs'

export class FileDownloadInstance extends InstanceBase<FileDownloadConfig> {
	config!: FileDownloadConfig // Setup in init()
	downloaded: boolean = false
	downloading: boolean = false
	url: string | undefined = undefined
	file: string | undefined = undefined
	timer: NodeJS.Timeout | undefined = undefined
	timerPaused: boolean = false

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: FileDownloadConfig): Promise<void> {
		this.config = config

		this.updateStatus(InstanceStatus.Ok)

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
		this.timer = setInterval(() => {
			const file = this.getVariableValue('file')?.toString()
			if (!file || this.timerPaused) return
			this.log('debug', 'Timer tick')
			stat(file, (err, stats) => {
				if (err) {
					this.log(
						'error',
						`Error getting file stats: ${err.message}\n\nPath is likely pointing to a file in a nonexistent directory or to a non-existent directory itthis.`,
					)
					this.downloaded = false
				} else {
					if (stats?.isFile()) {
						this.downloaded = true
					} else if (stats?.isDirectory()) {
						const realpath = `${this.getVariableValue('file')}/${this.getVariableValue('url')?.toString().split('/').pop()}`
						stat(realpath, (err, stats) => {
							if (err) {
								this.downloaded = false
								this.downloading = false
								this.checkFeedbacks('downloading', 'downloaded')
							}
							if (stats?.isFile()) {
								this.downloaded = true
								this.downloading = false
								this.checkFeedbacks('downloading', 'downloaded')
							} else {
								this.downloaded = false
								this.downloading = false
								this.checkFeedbacks('downloading', 'downloaded')
							}
						})
					} else {
						this.downloaded = false
						this.checkFeedbacks('downloading', 'downloaded')
					}
				}
			})
		}, 3000)
		this.setVariableValues({ url: this.url, file: this.file, downloaded: this.downloaded })
	}
	// When module gets deleted
	async destroy(): Promise<void> {
		if (this.timer) clearInterval(this.timer)
		this.log('debug', 'destroy')
	}

	async configUpdated(config: FileDownloadConfig): Promise<void> {
		this.config = config
		this.setVariableValues({ ...config })
	}

	pauseTimer(): void {
		this.timerPaused = true
	}

	unpauseTimer(): void {
		this.timerPaused = false
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}
}

runEntrypoint(FileDownloadInstance, UpgradeScripts)
