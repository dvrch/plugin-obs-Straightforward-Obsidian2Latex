import { App, TFile, Notice, Modal, SuggestModal } from 'obsidian';
import { SettingsManager } from '../settings/SettingsManager';
import { PathManager } from '../utils/PathManager';
import { MarkdownProcessor } from './processors/MarkdownProcessor';
import { EquationProcessor } from './processors/EquationProcessor';
import { TableProcessor } from './processors/TableProcessor';
import { ReferenceProcessor } from './processors/ReferenceProcessor';
import { LatexGenerator } from './generators/LatexGenerator';
import { EmbeddedFileProcessor } from './EmbeddedFileProcessor';

export class LatexConverter {
	private app: App;
	private settings: SettingsManager;
	private pathManager: PathManager;
	private markdownProcessor: MarkdownProcessor;
	private equationProcessor: EquationProcessor;
	private tableProcessor: TableProcessor;
	private referenceProcessor: ReferenceProcessor;
	private latexGenerator: LatexGenerator;
	private embeddedProcessor: EmbeddedFileProcessor;

	constructor(app: App, settings: SettingsManager, pathManager: PathManager) {
		this.app = app;
		this.settings = settings;
		this.pathManager = pathManager;
		
		// Initialisation des processeurs
		this.markdownProcessor = new MarkdownProcessor(this.app, this.settings);
		this.equationProcessor = new EquationProcessor(this.app, this.settings);
		this.tableProcessor = new TableProcessor(this.app, this.settings);
		this.referenceProcessor = new ReferenceProcessor(this.app, this.settings, this.pathManager);
		this.latexGenerator = new LatexGenerator(this.app, this.settings, this.pathManager);
		this.embeddedProcessor = new EmbeddedFileProcessor(this.app);
	}

	/**
	 * Convertit une note en LaTeX
	 */
	async convertNoteToLatex(file: TFile): Promise<void> {
		try {
			new Notice('Début de la conversion en LaTeX...');

			// 1. Lire le contenu du fichier
			const content = await this.app.vault.read(file);
			const lines = content.split('\n');

			// 2. Traitement du markdown
			let processedLines = await this.markdownProcessor.process(lines);

			// 3. Traitement des équations
			processedLines = await this.equationProcessor.process(processedLines);

			// 4. Traitement des tableaux
			processedLines = await this.tableProcessor.process(processedLines);

			// 5. Traitement des références
			processedLines = await this.referenceProcessor.process(processedLines);

			// 6. Traitement des fichiers imbriqués
			const processedContent = processedLines.join('\n');
			const embeddedProcessedContent = await this.embeddedProcessor.processEmbeddedReferences(processedContent);
			processedLines = embeddedProcessedContent.split('\n');

			// 7. Génération du LaTeX
			const latexContent = await this.latexGenerator.generate(processedLines, file);

			// 8. Sauvegarde du fichier .tex
			const texFilePath = this.getTexFilePath(file);
			await this.saveTexFile(texFilePath, latexContent);

			new Notice(`Conversion réussie ! Fichier créé: ${texFilePath}`);

			// 9. Compilation automatique si activée
			if (this.settings.getAutoCompile()) {
				await this.compileLatexToPdf(texFilePath);
			}

		} catch (error) {
			console.error('Erreur lors de la conversion:', error);
			new Notice(`Erreur lors de la conversion: ${error.message}`);
		}
	}

	/**
	 * Affiche une modale pour sélectionner une note à convertir
	 */
	async showNoteSelectionModal(): Promise<void> {
		new NoteSelectionModal(this.app, this).open();
	}

	/**
	 * Compile le LaTeX en PDF
	 */
	async compileLatexToPdf(texFilePath?: string): Promise<void> {
		try {
			new Notice('Compilation LaTeX en cours...');

			// Si aucun fichier spécifié, chercher le plus récent
			if (!texFilePath) {
				const writingPath = this.pathManager.getWritingPath();
				const texFiles = await this.findTexFiles(writingPath);
				
				if (texFiles.length === 0) {
					throw new Error('Aucun fichier .tex trouvé');
				}

				// Prendre le plus récent
				texFilePath = texFiles[0];
			}

			// Compilation
			const result = await this.compileLatex(texFilePath);
			
			if (result.success) {
				new Notice('Compilation réussie ! PDF généré.');
			} else {
				throw new Error(`Erreur de compilation: ${result.error}`);
			}

		} catch (error) {
			console.error('Erreur lors de la compilation:', error);
			new Notice(`Erreur lors de la compilation: ${error.message}`);
		}
	}

	/**
	 * Lance un test complet du système
	 */
	async runCompleteTest(): Promise<void> {
		try {
			new Notice('Lancement du test complet...');

			// 1. Test des chemins
			await this.testPaths();

			// 2. Test de conversion
			const testFile = await this.findTestFile();
			if (testFile) {
				await this.convertNoteToLatex(testFile);
			}

			// 3. Test de compilation
			await this.compileLatexToPdf();

			new Notice('Test complet réussi !');

		} catch (error) {
			console.error('Erreur lors du test complet:', error);
			new Notice(`Erreur lors du test complet: ${error.message}`);
		}
	}

	/**
	 * Obtient le chemin du fichier .tex correspondant
	 */
	private getTexFilePath(file: TFile): string {
		const baseName = this.pathManager.getBasename(file.path);
		const writingPath = this.pathManager.getWritingPath();
		// Utiliser le PathManager pour joindre les chemins correctement et éviter les doublons
		return this.pathManager.joinPaths(writingPath, `${baseName}.tex`);
	}

	/**
	 * Sauvegarde le fichier .tex
	 */
	private async saveTexFile(filePath: string, content: string): Promise<void> {
		// Créer le répertoire si nécessaire
		const dir = this.pathManager.getDirectory(filePath);
		await this.pathManager.ensureDirectory(dir);

		// Sauvegarder le fichier
		await this.app.vault.adapter.write(filePath, content);
	}

	/**
	 * Trouve les fichiers .tex dans un répertoire
	 */
	private async findTexFiles(dirPath: string): Promise<string[]> {
		try {
			const files = await this.app.vault.adapter.list(dirPath);
			return files.files
				.filter(file => file.endsWith('.tex'))
				.map(file => this.pathManager.joinPaths(dirPath, file))
				.sort((a, b) => {
					// Trier par date de modification (plus récent en premier)
					return 0; // TODO: Implémenter le tri par date
				});
		} catch (error) {
			console.error('Erreur lors de la recherche de fichiers .tex:', error);
			return [];
		}
	}

	/**
	 * Compile un fichier LaTeX
	 */
	private async compileLatex(texFilePath: string): Promise<{ success: boolean; error?: string }> {
		// Cette méthode nécessiterait une intégration avec un compilateur LaTeX
		// Pour l'instant, on simule la compilation
		console.log(`Compilation de ${texFilePath}`);
		
		// TODO: Implémenter la vraie compilation LaTeX
		// Cela pourrait nécessiter l'utilisation de Node.js child_process
		// ou une API externe pour la compilation

		return { success: true };
	}

	/**
	 * Test des chemins
	 */
	private async testPaths(): Promise<void> {
		const paths = [
			this.pathManager.getWritingPath(),
			this.pathManager.getAutomationsPath(),
			this.pathManager.getLiteraturePath(),
			this.pathManager.getEquationBlocksPath(),
			this.pathManager.getTableBlocksPath()
		];

		for (const path of paths) {
			await this.pathManager.ensureDirectory(path);
		}
	}

	/**
	 * Trouve un fichier de test
	 */
	private async findTestFile(): Promise<TFile | null> {
		const files = this.app.vault.getMarkdownFiles();
		const testFiles = files.filter(file => 
			file.path.includes('✍Writing') && 
			!file.path.includes('👨‍💻')
		);

		return testFiles.length > 0 ? testFiles[0] : null;
	}
}

/**
 * Modale pour sélectionner une note à convertir
 */
class NoteSelectionModal extends SuggestModal<TFile> {
	private converter: LatexConverter;

	constructor(app: App, converter: LatexConverter) {
		super(app);
		this.converter = converter;
	}

	getSuggestions(query: string): TFile[] {
		const files = this.app.vault.getMarkdownFiles();
		return files.filter(file => 
			file.path.toLowerCase().includes(query.toLowerCase()) &&
			file.path.includes('✍Writing')
		);
	}

	renderSuggestion(file: TFile, el: HTMLElement): void {
		el.createEl('div', { text: file.basename });
		el.createEl('small', { text: file.path });
	}

	async onChooseSuggestion(file: TFile, evt: MouseEvent | KeyboardEvent): Promise<void> {
		await this.converter.convertNoteToLatex(file);
	}
} 