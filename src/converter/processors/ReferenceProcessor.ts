import { App, TFile } from 'obsidian';
import { SettingsManager } from '../../settings/SettingsManager';

export class ReferenceProcessor {
	private app: App;
	private settings: SettingsManager;

	constructor(app: App, settings: SettingsManager) {
		this.app = app;
		this.settings = settings;
	}

	/**
	 * Traite les références dans les lignes
	 */
	async process(lines: string[]): Promise<string[]> {
		let processedLines = [...lines];

		// 1. Traitement des liens internes
		processedLines = this.processInternalLinks(processedLines);

		// 2. Traitement des citations
		processedLines = this.processCitations(processedLines);

		// 3. Traitement des références non-embarquées
		if (this.settings.getConvertNonEmbeddedReferences()) {
			processedLines = this.processNonEmbeddedReferences(processedLines);
		}

		// 4. Traitement des références de figures
		processedLines = this.processFigureReferences(processedLines);

		// 5. Traitement des références de tableaux
		processedLines = this.processTableReferences(processedLines);

		return processedLines;
	}

	/**
	 * Traite les liens internes [[note]]
	 */
	private processInternalLinks(lines: string[]): string[] {
		return lines.map(line => {
			// Liens internes simples [[note]]
			line = line.replace(/\[\[([^\]]+)\]\]/g, (match, noteName) => {
				// Si c'est une citation (nom court), utiliser \cite
				if (this.isCitation(noteName)) {
					return `\\cite{${noteName}}`;
				}
				// Sinon, utiliser \ref
				return `\\ref{${this.normalizeLabel(noteName)}}`;
			});

			// Liens internes avec section [[note#section]]
			line = line.replace(/\[\[([^\]]+)#([^\]]+)\]\]/g, (match, noteName, sectionName) => {
				const label = this.normalizeLabel(noteName);
				const sectionLabel = this.normalizeLabel(sectionName);
				return `\\ref{${label}:${sectionLabel}}`;
			});

			return line;
		});
	}

	/**
	 * Traite les citations [[p1]], [[p2]], etc.
	 */
	private processCitations(lines: string[]): string[] {
		return lines.map(line => {
			// Citations avec pattern p1, p2, etc.
			line = line.replace(/\[\[p(\d+)\]\]/g, '\\cite{p$1}');
			
			// Citations avec pattern ref1, ref2, etc.
			line = line.replace(/\[\[ref(\d+)\]\]/g, '\\cite{ref$1}');
			
			return line;
		});
	}

	/**
	 * Traite les références non-embarquées
	 */
	private processNonEmbeddedReferences(lines: string[]): string[] {
		return lines.map(line => {
			// Convertir [[note]] en "note" (texte simple)
			line = line.replace(/\[\[([^\]]+)\]\]/g, '$1');
			return line;
		});
	}

	/**
	 * Traite les références de figures
	 */
	private processFigureReferences(lines: string[]): string[] {
		return lines.map(line => {
			// Références de figures [[figure__block_name]]
			line = line.replace(/\[\[figure__block_([^\]]+)\]\]/g, '\\ref{fig:$1}');
			
			// Références de figures avec \ref
			line = line.replace(/\\ref\{figure__block_([^}]+)\}/g, '\\ref{fig:$1}');
			
			return line;
		});
	}

	/**
	 * Traite les références de tableaux
	 */
	private processTableReferences(lines: string[]): string[] {
		return lines.map(line => {
			// Références de tableaux [[table__block_name]]
			line = line.replace(/\[\[table__block_([^\]]+)\]\]/g, '\\ref{tab:$1}');
			
			// Références de tableaux avec \ref
			line = line.replace(/\\ref\{table__block_([^}]+)\}/g, '\\ref{tab:$1}');
			
			return line;
		});
	}

	/**
	 * Vérifie si une référence est une citation
	 */
	private isCitation(noteName: string): boolean {
		// Pattern pour les citations : p1, p2, ref1, ref2, etc.
		const citationPattern = /^(p|ref)\d+$/;
		return citationPattern.test(noteName);
	}

	/**
	 * Normalise un label pour LaTeX
	 */
	private normalizeLabel(label: string): string {
		return label
			.toLowerCase()
			.replace(/[^a-z0-9]/g, '-')
			.replace(/-+/g, '-')
			.replace(/^-|-$/g, '');
	}

	/**
	 * Trouve une note par son nom
	 */
	private async findNoteByName(noteName: string): Promise<TFile | null> {
		const files = this.app.vault.getMarkdownFiles();
		
		// Chercher par nom exact
		let file = files.find(f => f.basename === noteName);
		if (file) return file;

		// Chercher par nom avec extension
		file = files.find(f => f.name === `${noteName}.md`);
		if (file) return file;

		// Chercher par chemin partiel
		file = files.find(f => f.path.includes(noteName));
		return file || null;
	}

	/**
	 * Obtient le contenu d'une note
	 */
	private async getNoteContent(noteName: string): Promise<string | null> {
		const file = await this.findNoteByName(noteName);
		if (!file) return null;

		try {
			return await this.app.vault.read(file);
		} catch (error) {
			console.error(`Erreur lors de la lecture de ${noteName}:`, error);
			return null;
		}
	}

	/**
	 * Traite les références avec numéros de section
	 */
	private processSectionReferences(lines: string[]): string[] {
		if (!this.settings.getAddSectionNumberAfterReferencing()) {
			return lines;
		}

		return lines.map(line => {
			// Ajouter le numéro de section après les références
			line = line.replace(/\\ref\{([^}]+)\}/g, (match, label) => {
				// TODO: Implémenter la logique pour obtenir le numéro de section
				return `${match} (section)`;
			});
			
			return line;
		});
	}

	/**
	 * Traite les références croisées entre sections
	 */
	private processCrossReferences(lines: string[]): string[] {
		return lines.map(line => {
			// Références croisées avec format [[section#subsection]]
			line = line.replace(/\[\[([^#]+)#([^\]]+)\]\]/g, (match, section, subsection) => {
				const sectionLabel = this.normalizeLabel(section);
				const subsectionLabel = this.normalizeLabel(subsection);
				return `\\ref{${sectionLabel}:${subsectionLabel}}`;
			});
			
			return line;
		});
	}
} 