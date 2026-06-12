import { ItemView, WorkspaceLeaf, MarkdownRenderer, Component } from 'obsidian';

export const VIEW_TYPE_DAILY_NOTE_AGGREGATION = 'daily-note-aggregation-view';

export class DailyNoteAggregationView extends ItemView {
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType(): string {
		return VIEW_TYPE_DAILY_NOTE_AGGREGATION;
	}

	getDisplayText(): string {
		return 'Daily Note Aggregation';
	}

	getIcon(): string {
		return 'calendar';
	}

	async onOpen() {
		const container = this.contentEl;
		container.empty();

		const rootEl = container.createDiv({ cls: 'daily-note-aggregator' });
		rootEl.createEl('h1', { text: 'Daily Note Aggregation', cls: 'daily-note-title' });

		const files = this.app.vault.getMarkdownFiles();
		
		// Match filenames in format YYYY-MM-DD
		const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
		
		// Filter files and sort descending (newest first)
		const dailyNotes = files
			.filter((file) => dateRegex.test(file.basename))
			.sort((a, b) => b.basename.localeCompare(a.basename));

		if (dailyNotes.length === 0) {
			rootEl.createEl('p', { text: 'No daily notes found.' });
			return;
		}

		for (const file of dailyNotes) {
			const noteSection = rootEl.createDiv({ cls: 'daily-note-section' });
			
			// Clickable header to open the specific daily note file
			const header = noteSection.createEl('h2', { cls: 'daily-note-header' });
			const link = header.createEl('a', {
				text: file.basename,
				cls: 'daily-note-link',
				href: '#',
			});
			link.addEventListener('click', (e) => {
				e.preventDefault();
				this.app.workspace.getLeaf('tab').openFile(file);
			});

			const contentContainer = noteSection.createDiv({ cls: 'daily-note-content' });
			
			// Load the file content safely from cache
			const content = await this.app.vault.cachedRead(file);
			
			const component = new Component();
			this.addChild(component);
			
			await MarkdownRenderer.render(
				this.app,
				content || '*Empty daily note*',
				contentContainer,
				file.path,
				component
			);
		}
	}

	async onClose() {
		// Child components are cleaned up automatically via addChild
	}
}
