import { App, PluginSettingTab, Setting } from 'obsidian';
import StraightforwardObsidian2LatexPlugin from '../main';
import { SettingsManager } from './SettingsManager';

export class LatexSettingsTab extends PluginSettingTab {
	plugin: StraightforwardObsidian2LatexPlugin;

	constructor(app: App, plugin: StraightforwardObsidian2LatexPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'Paramètres LaTeX' });

		// Section Paramètres de base
		this.createBasicSettingsSection(containerEl);

		// Section Paramètres de paragraphe
		this.createParagraphSettingsSection(containerEl);

		// Section Paramètres de figures
		this.createFigureSettingsSection(containerEl);

		// Section Paramètres de références
		this.createReferenceSettingsSection(containerEl);

		// Section Paramètres de tableaux
		this.createTableSettingsSection(containerEl);

		// Section Paramètres de compilation
		this.createCompilationSettingsSection(containerEl);
	}

	private createBasicSettingsSection(containerEl: HTMLElement): void {
		containerEl.createEl('h3', { text: 'Paramètres de base' });

		new Setting(containerEl)
			.setName('Classe de document')
			.setDesc('Classe LaTeX à utiliser')
			.addDropdown(dropdown => dropdown
				.addOption('extarticle', 'Article étendu')
				.addOption('article', 'Article standard')
				.addOption('ifacconf', 'Conférence IFAC')
				.setValue(this.plugin.settings.getDocumentClass())
				.onChange(async (value) => {
					this.plugin.settings.updateSettings({ documentClass: value });
					await this.plugin.settings.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Taille de police')
			.setDesc('Taille de police (ex: 12pt, 11pt)')
			.addText(text => text
				.setPlaceholder('12pt')
				.setValue(this.plugin.settings.getFontSize())
				.onChange(async (value) => {
					this.plugin.settings.updateSettings({ fontSize: value });
					await this.plugin.settings.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Auteur')
			.setDesc('Nom de l\'auteur')
			.addText(text => text
				.setPlaceholder('Votre nom')
				.setValue(this.plugin.settings.getAuthor())
				.onChange(async (value) => {
					this.plugin.settings.updateSettings({ author: value });
					await this.plugin.settings.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Titre')
			.setDesc('Titre du document')
			.addText(text => text
				.setPlaceholder('Titre du document')
				.setValue(this.plugin.settings.getTitle())
				.onChange(async (value) => {
					this.plugin.settings.updateSettings({ title: value });
					await this.plugin.settings.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Marges')
			.setDesc('Marges de page (ex: 0.9in)')
			.addText(text => text
				.setPlaceholder('0.9in')
				.setValue(this.plugin.settings.getMargin())
				.onChange(async (value) => {
					this.plugin.settings.updateSettings({ margin: value });
					await this.plugin.settings.saveSettings();
				}));
	}

	private createParagraphSettingsSection(containerEl: HTMLElement): void {
		containerEl.createEl('h3', { text: 'Paramètres de paragraphe' });

		new Setting(containerEl)
			.setName('Indentation première ligne')
			.setDesc('Indentation en points (0 pour aucune)')
			.addSlider(slider => slider
				.setLimits(0, 50, 5)
				.setValue(this.plugin.settings.getParagraphIndent())
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.updateSettings({ paragraphIndent: value });
					await this.plugin.settings.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Table des matières')
			.setDesc('Ajouter une table des matières')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.getAddTableOfContents())
				.onChange(async (value) => {
					this.plugin.settings.updateSettings({ addTableOfContents: value });
					await this.plugin.settings.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Nouvelle page avant bibliographie')
			.setDesc('Insérer une nouvelle page avant la bibliographie')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.getAddNewPageBeforeBibliography())
				.onChange(async (value) => {
					this.plugin.settings.updateSettings({ addNewPageBeforeBibliography: value });
					await this.plugin.settings.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Autoriser les sauts de page')
			.setDesc('Autoriser les sauts de page dans les équations')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.getAllowDisplayBreaks())
				.onChange(async (value) => {
					this.plugin.settings.updateSettings({ allowDisplayBreaks: value });
					await this.plugin.settings.saveSettings();
				}));
	}

	private createFigureSettingsSection(containerEl: HTMLElement): void {
		containerEl.createEl('h3', { text: 'Paramètres de figures' });

		new Setting(containerEl)
			.setName('Réduire l\'espacement entre figures')
			.setDesc('Réduire l\'espacement entre les figures')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.getReduceSpacingBetweenFigures())
				.onChange(async (value) => {
					this.plugin.settings.updateSettings({ reduceSpacingBetweenFigures: value });
					await this.plugin.settings.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Figure sous le texte')
			.setDesc('Placer les figures sous le texte')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.getPutFigureBelowText())
				.onChange(async (value) => {
					this.plugin.settings.updateSettings({ putFigureBelowText: value });
					await this.plugin.settings.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Inclure le chemin')
			.setDesc('Inclure le chemin complet des images')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.getIncludePath())
				.onChange(async (value) => {
					this.plugin.settings.updateSettings({ includePath: value });
					await this.plugin.settings.saveSettings();
				}));
	}

	private createReferenceSettingsSection(containerEl: HTMLElement): void {
		containerEl.createEl('h3', { text: 'Paramètres de références' });

		new Setting(containerEl)
			.setName('Convertir les références non-embarquées')
			.setDesc('Convertir [[note]] en texte simple')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.getConvertNonEmbeddedReferences())
				.onChange(async (value) => {
					this.plugin.settings.updateSettings({ convertNonEmbeddedReferences: value });
					await this.plugin.settings.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Traiter les blocs d\'équations séparément')
			.setDesc('Traiter les blocs d\'équations de manière séparée')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.getTreatEquationBlocksSeparately())
				.onChange(async (value) => {
					this.plugin.settings.updateSettings({ treatEquationBlocksSeparately: value });
					await this.plugin.settings.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Adapter la hiérarchie des sections')
			.setDesc('Adapter la hiérarchie des sections dans les notes embarquées')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.getAdaptSectionHierarchy())
				.onChange(async (value) => {
					this.plugin.settings.updateSettings({ adaptSectionHierarchy: value });
					await this.plugin.settings.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Numéro de section après référence')
			.setDesc('Ajouter le numéro de section après les références internes')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.getAddSectionNumberAfterReferencing())
				.onChange(async (value) => {
					this.plugin.settings.updateSettings({ addSectionNumberAfterReferencing: value });
					await this.plugin.settings.saveSettings();
				}));
	}

	private createTableSettingsSection(containerEl: HTMLElement): void {
		containerEl.createEl('h3', { text: 'Paramètres de tableaux' });

		new Setting(containerEl)
			.setName('Package de tableau')
			.setDesc('Package LaTeX pour les tableaux')
			.addDropdown(dropdown => dropdown
				.addOption('tabularx', 'tabularx')
				.addOption('longtable', 'longtable')
				.addOption('tabularray', 'tabularray')
				.setValue(this.plugin.settings.getTablePackage())
				.onChange(async (value) => {
					this.plugin.settings.updateSettings({ tablePackage: value });
					await this.plugin.settings.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Alignement des tableaux')
			.setDesc('Alignement par défaut des tableaux')
			.addDropdown(dropdown => dropdown
				.addOption('center', 'Centré')
				.addOption('left', 'Gauche')
				.addOption('right', 'Droite')
				.setValue(this.plugin.settings.getTableAlignment())
				.onChange(async (value) => {
					this.plugin.settings.updateSettings({ tableAlignment: value });
					await this.plugin.settings.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Largeur relative des tableaux')
			.setDesc('Largeur relative des tableaux (1.0 = 100%)')
			.addSlider(slider => slider
				.setLimits(0.5, 2.0, 0.1)
				.setValue(this.plugin.settings.getTableRelWidth())
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.updateSettings({ tableRelWidth: value });
					await this.plugin.settings.saveSettings();
				}));
	}

	private createCompilationSettingsSection(containerEl: HTMLElement): void {
		containerEl.createEl('h3', { text: 'Paramètres de compilation' });

		new Setting(containerEl)
			.setName('Compilateur LaTeX')
			.setDesc('Compilateur LaTeX à utiliser')
			.addDropdown(dropdown => dropdown
				.addOption('pdflatex', 'pdflatex')
				.addOption('xelatex', 'xelatex')
				.addOption('lualatex', 'lualatex')
				.setValue(this.plugin.settings.getLatexCompiler())
				.onChange(async (value) => {
					this.plugin.settings.updateSettings({ latexCompiler: value });
					await this.plugin.settings.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Compilation automatique')
			.setDesc('Compiler automatiquement après conversion')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.getAutoCompile())
				.onChange(async (value) => {
					this.plugin.settings.updateSettings({ autoCompile: value });
					await this.plugin.settings.saveSettings();
				}));
	}
} 