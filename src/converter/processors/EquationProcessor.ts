import { App } from 'obsidian';
import { SettingsManager } from '../../settings/SettingsManager';

export class EquationProcessor {
	private app: App;
	private settings: SettingsManager;

	constructor(app: App, settings: SettingsManager) {
		this.app = app;
		this.settings = settings;
	}

	/**
	 * Traite les équations dans les lignes
	 */
	async process(lines: string[]): Promise<string[]> {
		let processedLines = [...lines];

		// 1. Traitement des équations inline
		processedLines = this.processInlineEquations(processedLines);

		// 2. Traitement des équations en bloc
		processedLines = this.processBlockEquations(processedLines);

		// 3. Traitement des équations alignées
		processedLines = this.processAlignedEquations(processedLines);

		// 4. Traitement des références d'équations
		processedLines = this.processEquationReferences(processedLines);

		return processedLines;
	}

	/**
	 * Traite les équations inline ($...$)
	 */
	private processInlineEquations(lines: string[]): string[] {
		return lines.map(line => {
			// Équations inline simples
			line = line.replace(/\$([^$]+)\$/g, '\\($1\\)');
			return line;
		});
	}

	/**
	 * Traite les équations en bloc ($$...$$)
	 */
	private processBlockEquations(lines: string[]): string[] {
		const processedLines: string[] = [];
		let inEquation = false;
		let equationContent: string[] = [];
		let equationLabel = '';

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];

			// Début d'une équation en bloc
			if (line.includes('$$') && !inEquation) {
				inEquation = true;
				equationContent = [];
				
				// Extraire le contenu de la première ligne
				const match = line.match(/\$\$(.*?)\$\$/);
				if (match) {
					equationContent.push(match[1]);
					
					// Chercher un label
					const labelMatch = line.match(/\\label\{eq__block_([^}]+)\}/);
					if (labelMatch) {
						equationLabel = labelMatch[1];
					}
				}
			}
			// Fin d'une équation en bloc
			else if (line.includes('$$') && inEquation) {
				inEquation = false;
				
				// Extraire le contenu de la dernière ligne
				const match = line.match(/\$\$(.*?)\$\$/);
				if (match) {
					equationContent.push(match[1]);
				}

				// Générer l'équation LaTeX
				const latexEquation = this.generateLatexEquation(equationContent.join('\n'), equationLabel);
				processedLines.push(latexEquation);
				equationContent = [];
				equationLabel = '';
			}
			// Contenu de l'équation
			else if (inEquation) {
				equationContent.push(line);
			}
			// Ligne normale
			else {
				processedLines.push(line);
			}
		}

		return processedLines;
	}

	/**
	 * Traite les équations alignées
	 */
	private processAlignedEquations(lines: string[]): string[] {
		return lines.map(line => {
			// Équations alignées avec \begin{aligned}
			line = line.replace(
				/\$\$\s*\\begin\{aligned\}(.*?)\\end\{aligned\}\s*\$\$/gs,
				(match, content) => {
					return this.convertAlignedToSplit(content);
				}
			);

			// Équations alignées avec \begin{align}
			line = line.replace(
				/\$\$\s*\\begin\{align\}(.*?)\\end\{align\}\s*\$\$/gs,
				(match, content) => {
					return this.convertAlignToSplit(content);
				}
			);

			return line;
		});
	}

	/**
	 * Convertit une équation alignée en format split
	 */
	private convertAlignedToSplit(content: string): string {
		const lines = content.split('\\\\').map(line => line.trim());
		const splitContent = lines.map(line => `\t\t${line}`).join(' \\\\\n');
		
		return `\\begin{equation}
\t\\begin{split}
${splitContent}
\t\\end{split}
\\end{equation}`;
	}

	/**
	 * Convertit une équation align en format split
	 */
	private convertAlignToSplit(content: string): string {
		const lines = content.split('\\\\').map(line => line.trim());
		const splitContent = lines.map(line => `\t\t${line}`).join(' \\\\\n');
		
		return `\\begin{equation}
\t\\begin{split}
${splitContent}
\t\\end{split}
\\end{equation}`;
	}

	/**
	 * Traite les références d'équations
	 */
	private processEquationReferences(lines: string[]): string[] {
		return lines.map(line => {
			// Références d'équations [[eq__block_name]]
			line = line.replace(/\[\[eq__block_([^\]]+)\]\]/g, '\\eqref{eq:$1}');
			
			// Références d'équations avec \ref
			line = line.replace(/\\ref\{eq__block_([^}]+)\}/g, '\\ref{eq:$1}');
			
			return line;
		});
	}

	/**
	 * Génère une équation LaTeX à partir du contenu
	 */
	private generateLatexEquation(content: string, label: string): string {
		content = content.trim();
		
		// Nettoyer le contenu
		content = content.replace(/^\$\$|\$\$$/g, '').trim();
		
		// Ajouter le label si présent
		const labelPart = label ? ` \\label{eq:${label}}` : '';
		
		return `\\begin{equation}${labelPart}
\t${content}
\\end{equation}`;
	}

	/**
	 * Convertit les équations non numérotées en numérotées
	 */
	private convertNonNumberedToNumbered(lines: string[]): string[] {
		return lines.map(line => {
			// Chercher les équations $$...$$ avec label
			const match = line.match(/\$\$\s*(.*?)\s*\$\$\s*\\label\{eq__block_([^}]+)\}/);
			if (match) {
				const equation = match[1].trim();
				const label = match[2];
				
				return `\\begin{equation} \\label{eq:${label}}
\t${equation}
\\end{equation}`;
			}
			
			return line;
		});
	}

	/**
	 * Vérifie et corrige les équations alignées
	 */
	private checkAndCorrectAlignedEquations(lines: string[]): string[] {
		return lines.map(line => {
			// Chercher les équations alignées mal formatées
			if (line.includes('\\begin{aligned}') || line.includes('\\begin{align}')) {
				// Traitement spécial pour les équations alignées
				// TODO: Implémenter la correction complète
			}
			
			return line;
		});
	}
} 