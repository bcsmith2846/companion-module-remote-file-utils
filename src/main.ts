import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type FileDownloadConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { checkFeedbackUpdates } from './utils.js'

export class FileDownloadInstance extends InstanceBase<FileDownloadConfig> {
	config!: FileDownloadConfig // Setup in init()
	timer: NodeJS.Timeout | undefined = undefined
	timerPaused: boolean = false

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: FileDownloadConfig): Promise<void> {
		const configDefaults = {
			downloaded: false,
			downloading: false,
			downloadURL: undefined,
			downloadFile: undefined,
			uploaded: false,
			uploading: false,
			uploadURL: undefined,
			uploadFile: undefined,
		}

		this.config = {
			...configDefaults,
			...config,
		}

		this.updateStatus(InstanceStatus.Ok)

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
		this.startFeedbackUpdateTimer() // Start the timer that dynamically updates feedbacks
		this.setVariableValues({
			...configDefaults,
		})
	}
	// When module gets deleted
	async destroy(): Promise<void> {
		if (this.timer) clearInterval(this.timer)
		this.log('debug', 'destroy')
	}

	async configUpdated(config: FileDownloadConfig): Promise<void> {
		this.config = config
	}

	startFeedbackUpdateTimer(): void {
		this.timer = setInterval((): void => {
			checkFeedbackUpdates(this)
		}, 3000)
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
