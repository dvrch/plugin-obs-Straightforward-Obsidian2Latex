import { App } from 'obsidian';
import { SettingsManager } from '../../settings/SettingsManager';

export class TableProcessor {
	private app: App;
	private settings: SettingsManager;

	constructor(app: App, settings: SettingsManager) {
		this.app = app;
		this.settings = settings;
	}

	/**
	 * Traite les tableaux dans les lignes
	 */
	async process(lines: string[]): Promise<string[]> {
		let processedLines = [...lines];

		// 1. Identification des tableaux
		const tableIndexes = this.identifyTables(processedLines);

		// 2. Conversion des tableaux
		processedLines = this.convertTables(processedLines, tableIndexes);

		return processedLines;
	}

	/**
	 * Identifie les tableaux dans les lignes
	 */
	private identifyTables(lines: string[]): number[] {
		const tableIndexes: number[] = [];
		let tableStarted = false;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			const isTableLine = this.isTableLine(line);

			if (isTableLine && !tableStarted) {
				tableStarted = true;
				tableIndexes.push(i);
			} else if (!isTableLine && tableStarted) {
				tableStarted = false;
				tableIndexes.push(i);
			}
		}

		// Si un tableau est ouvert à la fin, le fermer
		if (tableStarted) {
			tableIndexes.push(lines.length);
		}

		return tableIndexes;
	}

	/**
	 * Vérifie si une ligne fait partie d'un tableau
	 */
	private isTableLine(line: string): boolean {
		// Ligne avec des séparateurs de colonnes
		return line.includes('|') && line.trim().length > 0;
	}

	/**
	 * Convertit les tableaux identifiés
	 */
	private convertTables(lines: string[], tableIndexes: number[]): string[] {
		const processedLines: string[] = [];
		let tableIndex = 0;

		for (let i = 0; i < lines.length; i++) {
			if (tableIndex < tableIndexes.length && i === tableIndexes[tableIndex]) {
				// Début d'un tableau
				const startIndex = i;
				const endIndex = tableIndexes[tableIndex + 1];
				const tableLines = lines.slice(startIndex, endIndex);
				
				// Convertir le tableau
				const latexTable = this.convertTableToLatex(tableLines);
				processedLines.push(latexTable);
				
				// Passer à la fin du tableau
				i = endIndex - 1;
				tableIndex += 2; // Passer au prochain tableau
			} else if (tableIndex < tableIndexes.length && i === tableIndexes[tableIndex + 1]) {
				// Fin d'un tableau, déjà traité
				continue;
			} else {
				// Ligne normale
				processedLines.push(lines[i]);
			}
		}

		return processedLines;
	}

	/**
	 * Convertit un tableau markdown en LaTeX
	 */
	private convertTableToLatex(tableLines: string[]): string {
		if (tableLines.length < 2) {
			return tableLines.join('\n');
		}

		// Parser les lignes du tableau
		const rows: string[][] = [];
		let headers: string[] = [];
		let alignments: string[] = [];

		for (let i = 0; i < tableLines.length; i++) {
			const line = tableLines[i].trim();
			
			if (line.length === 0) continue;

			// Diviser la ligne en colonnes
			const columns = line.split('|').map(col => col.trim()).filter(col => col.length > 0);

			if (i === 0) {
				// Première ligne = en-têtes
				headers = columns;
			} else if (i === 1) {
				// Deuxième ligne = alignements
				alignments = this.parseAlignments(columns);
			} else {
				// Lignes de données
				rows.push(columns);
			}
		}

		// Générer le tableau LaTeX
		return this.generateLatexTable(headers, alignments, rows);
	}

	/**
	 * Parse les alignements depuis la ligne de séparateurs
	 */
	private parseAlignments(alignmentLine: string[]): string[] {
		return alignmentLine.map(col => {
			col = col.trim();
			
			if (col.startsWith(':') && col.endsWith(':')) {
				return 'c'; // Centré
			} else if (col.startsWith(':')) {
				return 'l'; // Gauche
			} else if (col.endsWith(':')) {
				return 'r'; // Droite
			} else {
				return 'l'; // Par défaut, gauche
			}
		});
	}

	/**
	 * Génère le tableau LaTeX
	 */
	private generateLatexTable(headers: string[], alignments: string[], rows: string[][]): string {
		const packageType = this.settings.getTablePackage();
		const alignment = this.settings.getTableAlignment();
		const relWidth = this.settings.getTableRelWidth();

		// Construire la spécification des colonnes
		const columnSpec = alignments.map(align => {
			switch (align) {
				case 'l': return 'l';
				case 'r': return 'r';
				case 'c': return 'c';
				default: return 'l';
			}
		}).join('');

		// Construire les lignes d'en-tête
		const headerRow = headers.map(header => this.escapeLatex(header)).join(' & ');

		// Construire les lignes de données
		const dataRows = rows.map(row => {
			return row.map(cell => this.escapeLatex(cell)).join(' & ');
		});

		// Générer le tableau selon le package
		if (packageType === 'tabularx') {
			return this.generateTabularxTable(columnSpec, headerRow, dataRows, relWidth);
		} else if (packageType === 'longtable') {
			return this.generateLongtableTable(columnSpec, headerRow, dataRows);
		} else {
			return this.generateStandardTable(columnSpec, headerRow, dataRows);
		}
	}

	/**
	 * Génère un tableau avec tabularx
	 */
	private generateTabularxTable(columnSpec: string, headerRow: string, dataRows: string[], relWidth: number): string {
		const width = relWidth > 0 ? `${relWidth}\\linewidth` : '\\linewidth';
		
		return `\\begin{table}[h]
\\centering
\\begin{tabularx}{${width}}{${columnSpec}}
\\hline
${headerRow} \\\\
\\hline
${dataRows.join(' \\\\\n')} \\\\
\\hline
\\end{tabularx}
\\caption{Caption du tableau}
\\label{tab:table_label}
\\end{table}`;
	}

	/**
	 * Génère un tableau avec longtable
	 */
	private generateLongtableTable(columnSpec: string, headerRow: string, dataRows: string[]): string {
		return `\\begin{longtable}{${columnSpec}}
\\hline
${headerRow} \\\\
\\hline
\\endfirsthead
\\hline
${headerRow} \\\\
\\hline
\\endhead
\\hline
\\endfoot
${dataRows.join(' \\\\\n')} \\\\
\\hline
\\caption{Caption du tableau}
\\label{tab:table_label}
\\end{longtable}`;
	}

	/**
	 * Génère un tableau standard
	 */
	private generateStandardTable(columnSpec: string, headerRow: string, dataRows: string[]): string {
		return `\\begin{table}[h]
\\centering
\\begin{tabular}{${columnSpec}}
\\hline
${headerRow} \\\\
\\hline
${dataRows.join(' \\\\\n')} \\\\
\\hline
\\end{tabular}
\\caption{Caption du tableau}
\\label{tab:table_label}
\\end{table}`;
	}

	/**
	 * Échappe les caractères spéciaux LaTeX
	 */
	private escapeLatex(text: string): string {
		return text
			.replace(/\\/g, '\\textbackslash{}')
			.replace(/\{/g, '\\{')
			.replace(/\}/g, '\\}')
			.replace(/\$/g, '\\$')
			.replace(/\^/g, '\\^{}')
			.replace(/\~/g, '\\~{}')
			.replace(/\&/g, '\\&')
			.replace(/%/g, '\\%')
			.replace(/#/g, '\\#')
			.replace(/_/g, '\\_');
	}
} 