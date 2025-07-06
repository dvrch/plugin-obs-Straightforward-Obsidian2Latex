import { App, Editor, MarkdownView, Plugin, PluginSettingTab, Setting, MarkdownFileInfo } from 'obsidian';
import { LatexConverter } from './converter/LatexConverter';
import { PathManager } from './utils/PathManager';
import { SettingsManager } from './settings/SettingsManager';
import { LatexSettingsTab } from './settings/LatexSettingsTab';

export default class StraightforwardObsidian2LatexPlugin extends Plugin {
	settings: SettingsManager;
	converter: LatexConverter;
	pathManager: PathManager;

	async onload() {
		console.log('Chargement du plugin Straightforward Obsidian2Latex');

		// Initialisation des managers
		this.pathManager = new PathManager(this.app);
		this.settings = new SettingsManager();
		this.converter = new LatexConverter(this.app, this.settings, this.pathManager);

		// Chargement des paramètres
		await this.settings.loadSettings();

		// Ajout des commandes
		this.addCommands();

		// Ajout de l'onglet de paramètres
		this.addSettingTab(new LatexSettingsTab(this.app, this));
	}

	onunload() {
		console.log('Déchargement du plugin Straightforward Obsidian2Latex');
	}

	private addCommands() {
		// Commande principale de conversion
		this.addCommand({
			id: 'convert-current-note-to-latex',
			name: 'Convertir la note actuelle en LaTeX',
			editorCallback: async (editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => {
				const file = ctx.file;
				if (file) {
					await this.converter.convertNoteToLatex(file);
				}
			}
		});

		// Commande pour convertir une note spécifique
		this.addCommand({
			id: 'convert-specific-note-to-latex',
			name: 'Convertir une note spécifique en LaTeX',
			callback: async () => {
				// Ouvrir une modale pour sélectionner la note
				await this.converter.showNoteSelectionModal();
			}
		});

		// Commande pour compiler le LaTeX en PDF
		this.addCommand({
			id: 'compile-latex-to-pdf',
			name: 'Compiler le LaTeX en PDF',
			callback: async () => {
				await this.converter.compileLatexToPdf();
			}
		});

		// Commande pour test complet
		this.addCommand({
			id: 'run-complete-test',
			name: 'Lancer le test complet',
			callback: async () => {
				await this.converter.runCompleteTest();
			}
		});

		// Commande pour ouvrir les paramètres
		this.addCommand({
			id: 'open-latex-settings',
			name: 'Ouvrir les paramètres LaTeX',
			callback: () => {
				// Ouvrir les paramètres via l'API Obsidian
				this.app.setting.open();
			}
		});
	}
} 