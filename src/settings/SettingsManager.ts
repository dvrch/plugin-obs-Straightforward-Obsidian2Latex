import { PluginSettingTab, Setting, App } from 'obsidian';

export interface LatexSettings {
	// Paramètres de base
	documentClass: string;
	fontSize: string;
	author: string;
	title: string;
	margin: string;
	
	// Paramètres de paragraphe
	paragraphIndent: number;
	addTableOfContents: boolean;
	addNewPageBeforeBibliography: boolean;
	allowDisplayBreaks: boolean;
	
	// Paramètres de figures
	reduceSpacingBetweenFigures: boolean;
	putFigureBelowText: boolean;
	includePath: boolean;
	
	// Paramètres de références
	convertNonEmbeddedReferences: boolean;
	treatEquationBlocksSeparately: boolean;
	adaptSectionHierarchy: boolean;
	
	// Paramètres de liens internes
	addSectionNumberAfterReferencing: boolean;
	
	// Paramètres de tableaux
	tablePackage: string;
	tableAlignment: string;
	tableRelWidth: number;
	
	// Paramètres de compilation
	latexCompiler: string;
	autoCompile: boolean;
	
	// Chemins
	writingPath: string;
	automationsPath: string;
	literaturePath: string;
	equationBlocksPath: string;
	tableBlocksPath: string;
}

export const DEFAULT_SETTINGS: LatexSettings = {
	// Paramètres de base
	documentClass: 'extarticle',
	fontSize: '',
	author: 'Auteur',
	title: '',
	margin: '0.9in',
	
	// Paramètres de paragraphe
	paragraphIndent: 0,
	addTableOfContents: true,
	addNewPageBeforeBibliography: true,
	allowDisplayBreaks: true,
	
	// Paramètres de figures
	reduceSpacingBetweenFigures: false,
	putFigureBelowText: true,
	includePath: true,
	
	// Paramètres de références
	convertNonEmbeddedReferences: true,
	treatEquationBlocksSeparately: true,
	adaptSectionHierarchy: true,
	
	// Paramètres de liens internes
	addSectionNumberAfterReferencing: true,
	
	// Paramètres de tableaux
	tablePackage: 'tabularx',
	tableAlignment: 'center',
	tableRelWidth: 1.2,
	
	// Paramètres de compilation
	latexCompiler: 'pdflatex',
	autoCompile: true,
	
	// Chemins (seront définis dynamiquement)
	writingPath: '',
	automationsPath: '',
	literaturePath: '',
	equationBlocksPath: '',
	tableBlocksPath: ''
};

export class SettingsManager {
	private settings: LatexSettings = DEFAULT_SETTINGS;

	async loadSettings(): Promise<void> {
		// Dans un vrai plugin, on chargerait depuis les paramètres Obsidian
		// Pour l'instant, on utilise les valeurs par défaut
		this.settings = { ...DEFAULT_SETTINGS };
	}

	async saveSettings(): Promise<void> {
		// Dans un vrai plugin, on sauvegarderait dans les paramètres Obsidian
		console.log('Sauvegarde des paramètres:', this.settings);
	}

	getSettings(): LatexSettings {
		return { ...this.settings };
	}

	updateSettings(newSettings: Partial<LatexSettings>): void {
		this.settings = { ...this.settings, ...newSettings };
	}

	// Getters pour les paramètres spécifiques
	getDocumentClass(): string {
		return this.settings.documentClass;
	}

	getFontSize(): string {
		return this.settings.fontSize;
	}

	getAuthor(): string {
		return this.settings.author;
	}

	getTitle(): string {
		return this.settings.title;
	}

	getMargin(): string {
		return this.settings.margin;
	}

	getParagraphIndent(): number {
		return this.settings.paragraphIndent;
	}

	getAddTableOfContents(): boolean {
		return this.settings.addTableOfContents;
	}

	getAddNewPageBeforeBibliography(): boolean {
		return this.settings.addNewPageBeforeBibliography;
	}

	getAllowDisplayBreaks(): boolean {
		return this.settings.allowDisplayBreaks;
	}

	getReduceSpacingBetweenFigures(): boolean {
		return this.settings.reduceSpacingBetweenFigures;
	}

	getPutFigureBelowText(): boolean {
		return this.settings.putFigureBelowText;
	}

	getIncludePath(): boolean {
		return this.settings.includePath;
	}

	getConvertNonEmbeddedReferences(): boolean {
		return this.settings.convertNonEmbeddedReferences;
	}

	getTreatEquationBlocksSeparately(): boolean {
		return this.settings.treatEquationBlocksSeparately;
	}

	getAdaptSectionHierarchy(): boolean {
		return this.settings.adaptSectionHierarchy;
	}

	getAddSectionNumberAfterReferencing(): boolean {
		return this.settings.addSectionNumberAfterReferencing;
	}

	getTablePackage(): string {
		return this.settings.tablePackage;
	}

	getTableAlignment(): string {
		return this.settings.tableAlignment;
	}

	getTableRelWidth(): number {
		return this.settings.tableRelWidth;
	}

	getLatexCompiler(): string {
		return this.settings.latexCompiler;
	}

	getAutoCompile(): boolean {
		return this.settings.autoCompile;
	}

	// Méthodes pour mettre à jour les chemins
	setWritingPath(path: string): void {
		this.settings.writingPath = path;
	}

	setAutomationsPath(path: string): void {
		this.settings.automationsPath = path;
	}

	setLiteraturePath(path: string): void {
		this.settings.literaturePath = path;
	}

	setEquationBlocksPath(path: string): void {
		this.settings.equationBlocksPath = path;
	}

	setTableBlocksPath(path: string): void {
		this.settings.tableBlocksPath = path;
	}
} 