import { App, TFile } from 'obsidian';
import { SettingsManager } from '../../settings/SettingsManager';
import { PathManager } from '../../utils/PathManager';

export class ReferenceProcessor {
	private app: App;
	private settings: SettingsManager;
	private pathManager: PathManager;

	constructor(app: App, settings: SettingsManager, pathManager: PathManager) {
		this.app = app;
		this.settings = settings;
		this.pathManager = pathManager;
	}

	/**
	 * Traite les références dans les lignes
	 */
	async process(lines: string[]): Promise<string[]> {
		let processedLines = [...lines];

		// 1. Traitement des références dynamiques (!ref{...})
		processedLines = await this.processDynamicReferences(processedLines);

		// 2. Traitement des liens internes
		processedLines = this.processInternalLinks(processedLines);

		// 3. Traitement des citations
		processedLines = this.processCitations(processedLines);

		// 4. Traitement des références non-embarquées
		if (this.settings.getConvertNonEmbeddedReferences()) {
			processedLines = this.processNonEmbeddedReferences(processedLines);
		}

		// 5. Traitement des références de figures
		processedLines = this.processFigureReferences(processedLines);

		// 6. Traitement des références de tableaux
		processedLines = this.processTableReferences(processedLines);

		return processedLines;
	}

	/**
	 * Traite les références dynamiques !ref{...} en incluant le contenu du fichier référencé
	 */
	private async processDynamicReferences(lines: string[]): Promise<string[]> {
		const processedLines: string[] = [];
		
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			
			// Détecter les références !ref{...}
			const refMatch = line.match(/!ref\{([^}]+)\}/);
			if (refMatch) {
				const refName = refMatch[1];
				console.log(`Traitement de la référence dynamique: ${refName}`);
				
				// Chercher le fichier référencé
				const referencedFile = await this.findReferencedFile(refName);
				if (referencedFile) {
					try {
						// Lire le contenu du fichier référencé
						const content = await this.app.vault.read(referencedFile);
						const contentLines = content.split('\n');
						
						// Convertir le contenu en LaTeX (récursivement)
						const latexContent = await this.convertReferencedContentToLatex(contentLines);
						
						// Remplacer la référence par le contenu LaTeX
						const newLine = line.replace(/!ref\{[^}]+\}/, latexContent.join('\n'));
						processedLines.push(newLine);
					} catch (error) {
						console.error(`Erreur lors de la conversion de ${refName}:`, error);
						processedLines.push(line); // Garder la ligne originale en cas d'erreur
					}
				} else {
					console.warn(`Fichier référencé non trouvé: ${refName}`);
					processedLines.push(line); // Garder la ligne originale
				}
			} else {
				processedLines.push(line);
			}
		}
		
		return processedLines;
	}

	/**
	 * Trouve le fichier référencé par son nom
	 */
	private async findReferencedFile(refName: string): Promise<TFile | null> {
		const files = this.app.vault.getMarkdownFiles();
		
		// Chercher par nom exact
		let file = files.find(f => f.basename === refName);
		if (file) return file;

		// Chercher par nom avec extension
		file = files.find(f => f.name === `${refName}.md`);
		if (file) return file;

		// Chercher dans les dossiers spécifiques (table blocks, figure blocks, etc.)
		const specialFolders = ['table blocks', 'figure blocks', 'equation blocks'];
		for (const folder of specialFolders) {
			file = files.find(f => f.path.includes(folder) && f.basename === refName);
			if (file) return file;
		}

		// Chercher par chemin partiel
		file = files.find(f => f.path.includes(refName));
		return file || null;
	}

	/**
	 * Convertit le contenu d'un fichier référencé en LaTeX
	 */
	private async convertReferencedContentToLatex(contentLines: string[]): Promise<string[]> {
		// Détecter le type de contenu basé sur le nom du fichier ou le contenu
		const isTable = contentLines.some(line => line.includes('|') || line.includes('---'));
		const isFigure = contentLines.some(line => line.includes('![') || line.includes('figure'));
		const isEquation = contentLines.some(line => line.includes('$$') || line.includes('$'));
		
		let processedLines = [...contentLines];
		
		// Appliquer les conversions selon le type de contenu
		if (isTable) {
			// Traitement spécial pour les tableaux
			processedLines = this.processTableContent(processedLines);
		} else if (isFigure) {
			// Traitement spécial pour les figures
			processedLines = this.processFigureContent(processedLines);
		} else if (isEquation) {
			// Traitement spécial pour les équations
			processedLines = this.processEquationContent(processedLines);
		} else {
			// Traitement général pour le texte
			processedLines = this.processGeneralContent(processedLines);
		}
		
		return processedLines;
	}

	/**
	 * Traite le contenu de type tableau
	 */
	private processTableContent(lines: string[]): string[] {
		const processedLines: string[] = [];
		let inTable = false;
		let tableContent: string[] = [];
		
		for (const line of lines) {
			if (line.includes('|') && line.includes('---')) {
				// Début d'un tableau
				if (!inTable) {
					inTable = true;
					tableContent = [];
				}
				tableContent.push(line);
			} else if (inTable && line.trim() === '') {
				// Fin du tableau
				inTable = false;
				// Convertir le tableau en LaTeX
				const latexTable = this.convertTableToLatex(tableContent);
				processedLines.push(...latexTable);
				tableContent = [];
			} else if (inTable) {
				tableContent.push(line);
			} else {
				processedLines.push(line);
			}
		}
		
		// Traiter le dernier tableau s'il n'a pas été fermé
		if (inTable && tableContent.length > 0) {
			const latexTable = this.convertTableToLatex(tableContent);
			processedLines.push(...latexTable);
		}
		
		return processedLines;
	}

	/**
	 * Convertit un tableau markdown en LaTeX
	 */
	private convertTableToLatex(tableLines: string[]): string[] {
		if (tableLines.length < 2) return tableLines;
		
		const latexLines: string[] = [];
		latexLines.push('\\begin{table}[ht]');
		latexLines.push('\\centering');
		latexLines.push('\\caption{Caption du tableau}');
		latexLines.push('\\label{tab:table}');
		
		// Compter les colonnes
		const firstRow = tableLines[0];
		const columns = (firstRow.match(/\|/g) || []).length - 1;
		const columnSpec = 'c'.repeat(columns);
		
		latexLines.push(`\\begin{tabular}{${columnSpec}}`);
		latexLines.push('\\hline');
		
		// Traiter les lignes de données
		for (let i = 0; i < tableLines.length; i++) {
			const line = tableLines[i];
			if (line.includes('---')) continue; // Ignorer la ligne de séparation
			
			const cells = line.split('|').filter(cell => cell.trim() !== '');
			const latexRow = cells.map(cell => cell.trim()).join(' & ');
			latexLines.push(latexRow + ' \\\\');
			
			if (i < tableLines.length - 1) {
				latexLines.push('\\hline');
			}
		}
		
		latexLines.push('\\end{tabular}');
		latexLines.push('\\end{table}');
		
		return latexLines;
	}

	/**
	 * Traite le contenu de type figure
	 */
	private processFigureContent(lines: string[]): string[] {
		return lines.map(line => {
			// Convertir les images markdown en LaTeX
			line = line.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
				return `\\begin{figure}[htb]
\\centering
\\includegraphics[width=0.7\\linewidth]{${src}}
\\caption{${alt || 'Caption'}}
\\label{fig:figure}
\\end{figure}`;
			});
			return line;
		});
	}

	/**
	 * Traite le contenu de type équation
	 */
	private processEquationContent(lines: string[]): string[] {
		return lines.map(line => {
			// Convertir les équations inline
			line = line.replace(/\$([^$]+)\$/g, '\\($1\\)');
			
			// Convertir les équations en bloc
			line = line.replace(/\$\$([^$]+)\$\$/g, (match, equation) => {
				return `\\begin{equation}
\\label{eq:equation}
${equation}
\\end{equation}`;
			});
			
			return line;
		});
	}

	/**
	 * Traite le contenu général
	 */
	private processGeneralContent(lines: string[]): string[] {
		return lines.map(line => {
			// Convertir les titres markdown en LaTeX
			line = line.replace(/^# (.*)$/, '\\section{$1}');
			line = line.replace(/^## (.*)$/, '\\subsection{$1}');
			line = line.replace(/^### (.*)$/, '\\subsubsection{$1}');
			
			// Convertir le formatage
			line = line.replace(/\*\*(.*?)\*\*/g, '\\textbf{$1}');
			line = line.replace(/\*(.*?)\*/g, '\\textit{$1}');
			line = line.replace(/==(.*?)==/g, '\\hl{$1}');
			
			// Convertir les listes
			line = line.replace(/^[\s]*[-*+]\s/, '\\item ');
			
			return line;
		});
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