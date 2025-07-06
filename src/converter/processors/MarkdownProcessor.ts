import { App } from 'obsidian';
import { SettingsManager } from '../../settings/SettingsManager';

export class MarkdownProcessor {
	private app: App;
	private settings: SettingsManager;

	constructor(app: App, settings: SettingsManager) {
		this.app = app;
		this.settings = settings;
	}

	/**
	 * Traite les lignes markdown et les convertit en LaTeX
	 */
	async process(lines: string[]): Promise<string[]> {
		let processedLines = [...lines];

		// 1. Traitement des en-têtes
		processedLines = this.processHeaders(processedLines);

		// 2. Traitement des listes
		processedLines = this.processLists(processedLines);

		// 3. Traitement du formatage (gras, italique, etc.)
		processedLines = this.processFormatting(processedLines);

		// 4. Traitement des liens
		processedLines = this.processLinks(processedLines);

		// 5. Traitement des commentaires
		processedLines = this.processComments(processedLines);

		// 6. Traitement des symboles spéciaux
		processedLines = this.processSpecialSymbols(processedLines);

		return processedLines;
	}

	/**
	 * Traite les en-têtes markdown
	 */
	private processHeaders(lines: string[]): string[] {
		return lines.map(line => {
			// Titres de niveau 1
			line = line.replace(/^# (.*)$/, '\\section{$1}');
			
			// Titres de niveau 2
			line = line.replace(/^## (.*)$/, '\\subsection{$1}');
			
			// Titres de niveau 3
			line = line.replace(/^### (.*)$/, '\\subsubsection{$1}');
			
			// Titres de niveau 4+
			line = line.replace(/^#### (.*)$/, '\\paragraph{$1} \\hspace{0pt} \\\\');
			line = line.replace(/^##### (.*)$/, '\\paragraph{$1} \\hspace{0pt} \\\\');
			line = line.replace(/^###### (.*)$/, '\\paragraph{$1} \\hspace{0pt} \\\\');
			line = line.replace(/^####### (.*)$/, '\\paragraph{$1} \\hspace{0pt} \\\\');
			line = line.replace(/^######## (.*)$/, '\\paragraph{$1} \\hspace{0pt} \\\\');

			// Traitement spécial pour Appendix
			line = line.replace(/^# Appendix$/, '\\appendix');

			return line;
		});
	}

	/**
	 * Traite les listes
	 */
	private processLists(lines: string[]): string[] {
		const processedLines: string[] = [];
		let inList = false;
		let listType = '';

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			
			// Détection du début d'une liste
			if (line.match(/^[\s]*[-*+]\s/)) {
				if (!inList) {
					processedLines.push('\\begin{itemize}');
					inList = true;
					listType = 'itemize';
				}
				const item = line.replace(/^[\s]*[-*+]\s/, '');
				processedLines.push(`\\item ${item}`);
			}
			// Détection des listes numérotées
			else if (line.match(/^[\s]*\d+\.\s/)) {
				if (!inList) {
					processedLines.push('\\begin{enumerate}');
					inList = true;
					listType = 'enumerate';
				}
				const item = line.replace(/^[\s]*\d+\.\s/, '');
				processedLines.push(`\\item ${item}`);
			}
			// Fin de liste
			else if (inList && line.trim() === '') {
				processedLines.push(`\\end{${listType}}`);
				inList = false;
				listType = '';
			}
			// Ligne normale
			else {
				if (inList) {
					processedLines.push(`\\end{${listType}}`);
					inList = false;
					listType = '';
				}
				processedLines.push(line);
			}
		}

		// Fermer la liste si elle n'a pas été fermée
		if (inList) {
			processedLines.push(`\\end{${listType}}`);
		}

		return processedLines;
	}

	/**
	 * Traite le formatage (gras, italique, etc.)
	 */
	private processFormatting(lines: string[]): string[] {
		return lines.map(line => {
			// Gras
			line = line.replace(/\*\*(.*?)\*\*/g, '\\textbf{$1}');
			
			// Italique
			line = line.replace(/\*(.*?)\*/g, '\\textit{$1}');
			
			// Surligné
			line = line.replace(/==(.*?)==/g, '\\hl{$1}');
			
			// Barré
			line = line.replace(/~~(.*?)~~/g, '\\st{$1}');
			
			// Code inline
			line = line.replace(/`(.*?)`/g, '\\texttt{$1}');
			
			// Tags
			line = line.replace(/#(\S+)/g, '\\texttt{$1}');

			return line;
		});
	}

	/**
	 * Traite les liens
	 */
	private processLinks(lines: string[]): string[] {
		return lines.map(line => {
			// Liens avec texte
			line = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '\\href{$2}{$1}');
			
			// URLs simples
			line = line.replace(/(https?:\/\/\S+)/g, '\\url{$1}');

			return line;
		});
	}

	/**
	 * Traite les commentaires
	 */
	private processComments(lines: string[]): string[] {
		return lines.filter(line => {
			// Supprimer les lignes de commentaires markdown
			return !line.trim().startsWith('%%');
		});
	}

	/**
	 * Traite les symboles spéciaux
	 */
	private processSpecialSymbols(lines: string[]): string[] {
		return lines.map(line => {
			// Échapper les caractères spéciaux LaTeX UNIQUEMENT dans le texte utilisateur
			// Ne pas toucher aux commandes LaTeX générées (\section, \item, etc.)
			// On considère qu'une ligne qui commence par un backslash est une commande LaTeX
			if (line.trim().startsWith('\\')) {
				return line;
			}
			// Sinon, on échappe les caractères spéciaux
			line = line.replace(/%/g, '\\%');
			line = line.replace(/#/g, '\\#');
			line = line.replace(/\$/g, '\\$');
			line = line.replace(/\{/g, '\\{');
			line = line.replace(/\}/g, '\\}');
			line = line.replace(/\^/g, '\\^{}');
			line = line.replace(/\~/g, '\\~{}');
			// NE PAS échapper le backslash globalement !
			// Symboles de tableau
			line = line.replace(/&/g, '\\&');
			return line;
		});
	}
} 