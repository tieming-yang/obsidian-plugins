import {
	Editor,
	MarkdownView,
	MarkdownFileInfo,
	Modal,
	Notice,
	Plugin,
} from 'obsidian';
import {
	DEFAULT_SETTINGS,
	MyPluginSettings,
	SampleSettingTab,
} from './settings';
import {
	DailyNoteAggregationView,
	VIEW_TYPE_DAILY_NOTE_AGGREGATION,
} from './view';

// Remember to rename these classes and interfaces!

export default class MyPlugin extends Plugin {
	settings!: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		this.registerView(
			VIEW_TYPE_DAILY_NOTE_AGGREGATION,
			(leaf) => new DailyNoteAggregationView(leaf)
		);

		// This creates an icon in the left ribbon.
		this.addRibbonIcon('calendar', 'Daily Note Aggregation', (_evt: MouseEvent) => {
			this.activateView();
		});

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status bar text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-modal-simple',
			name: 'Open modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			},
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'replace-selected',
			name: 'Replace selected content',
			editorCallback: (
				editor: Editor,
				_ctx: MarkdownView | MarkdownFileInfo,
			) => {
				editor.replaceSelection('Sample editor command');
			},
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-modal-complex',
			name: 'Open modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
				return false;
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.addCommand({
			id: 'open-daily-note-aggregation',
			name: 'Open Daily Note Aggregation View',
			callback: () => {
				this.activateView();
			},
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000),
		);
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf = workspace.getLeavesOfType(VIEW_TYPE_DAILY_NOTE_AGGREGATION)[0];
		if (!leaf) {
			leaf = workspace.getLeaf(true);
			await leaf.setViewState({
				type: VIEW_TYPE_DAILY_NOTE_AGGREGATION,
				active: true,
			});
		}
		workspace.revealLeaf(leaf);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<MyPluginSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
