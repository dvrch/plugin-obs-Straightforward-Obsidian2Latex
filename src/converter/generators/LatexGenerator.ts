import { App, TFile } from 'obsidian';
import { SettingsManager } from '../../settings/SettingsManager';
import { PathManager } from '../../utils/PathManager';

export class LatexGenerator {
	private app: App;
	private settings: SettingsManager;
	private pathManager: PathManager;

	constructor(app: App, settings: SettingsManager, pathManager: PathManager) {
		this.app = app;
		this.settings = settings;
		this.pathManager = pathManager;
	}

	/**
	 * Génère le contenu LaTeX complet
	 */
	async generate(lines: string[], file: TFile): Promise<string> {
		// 1. Générer le préambule
		const preamble = this.generatePreamble();

		// 2. Générer le début du document
		const documentStart = this.generateDocumentStart();

		// 3. Traiter le contenu principal
		const mainContent = this.processMainContent(lines);

		// 4. Générer la fin du document
		const documentEnd = this.generateDocumentEnd();

		// 5. Assembler le tout
		return preamble + '\n\n' + documentStart + '\n\n' + mainContent + '\n\n' + documentEnd;
	}

	/**
	 * Génère le préambule LaTeX
	 */
	private generatePreamble(): string {
		const documentClass = this.settings.getDocumentClass();
		const fontSize = this.settings.getFontSize();
		const fontsizeOption = fontSize ? `[${fontSize}]` : '';

		let preamble = `\\documentclass${fontsizeOption}{${documentClass}}`;

		// Packages de base
		preamble += '\n\\usepackage[table]{xcolor}';
		preamble += '\n\\usepackage{tabularx}';
		preamble += '\n\\usepackage{longtable}';
		preamble += '\n\\usepackage{tabularray}';
		preamble += '\n\\usepackage{enumitem,amssymb}';
		preamble += '\n\\usepackage{hyperref}';
		preamble += '\n\\usepackage{geometry}';
		preamble += '\n\\usepackage{cleveref}';

		// Configuration des listes
		preamble += '\n\\newlist{todolist}{itemize}{2}';
		preamble += '\n\\setlist[todolist]{label=$\\square$}';

		// Configuration des citations
		preamble += '\n\\newtotcounter{citnum}';
		preamble += '\n\\def\\oldbibitem{} \\let\\oldbibitem=\\bibitem';
		preamble += '\n\\def\\bibitem{\\stepcounter{citnum}\\oldbibitem}';

		// Configuration des paragraphes
		const paragraphIndent = this.settings.getParagraphIndent();
		preamble += `\n\\setlength{\\parindent}{${paragraphIndent}pt}`;

		// Marges
		const margin = this.settings.getMargin();
		if (margin) {
			preamble += `\n\\usepackage[margin=${margin}]{geometry}`;
		}

		// Configuration des hyperliens
		preamble += '\n\\hypersetup{';
		preamble += '\n\tcolorlinks = true,';
		preamble += '\n\turlcolor = blue,';
		preamble += '\n\tlinkcolor = blue,';
		preamble += '\n\tcitecolor = blue';
		preamble += '\n}';

		// Configuration des couleurs
		preamble += '\n\\sethlcolor{yellow}';

		// Configuration des sections
		preamble += '\n\\setcounter{secnumdepth}{4}';
		preamble += '\n\\setlength{\\parskip}{7pt}';

		// Configuration des marges
		preamble += '\n\\let\\oldmarginpar\\marginpar';
		preamble += '\n\\renewcommand\\marginpar[1]{\\oldmarginpar{\\tiny #1}}';

		// Commandes personnalisées
		preamble += '\n\\newcommand{\\ignore}[1]{}';

		// Configuration spéciale pour IFAC
		if (documentClass === 'ifacconf') {
			preamble += '\n\\newcounter{part}';
			preamble += '\n\\counterwithin*{section}{part}';
		}

		return preamble;
	}

	/**
	 * Génère le début du document
	 */
	private generateDocumentStart(): string {
		let start = '\\begin{document}';

		// Autoriser les sauts de page si configuré
		if (this.settings.getAllowDisplayBreaks()) {
			start += '\n\\allowdisplaybreaks';
		}

		// Auteur
		const author = this.settings.getAuthor();
		if (author) {
			start += `\n\\author{${author}}`;
		}

		// Titre
		const title = this.settings.getTitle();
		if (title) {
			start += `\n\\title{${title}}`;
			start += '\n\\maketitle';
		}

		return start;
	}

	/**
	 * Traite le contenu principal
	 */
	private processMainContent(lines: string[]): string {
		// Trouver le texte avant la première section
		let textBeforeFirstSection = '';
		let mainContent = '';

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			
			if (line.startsWith('\\section')) {
				// Commencer le contenu principal à partir de la première section
				mainContent = lines.slice(i).join('\n');
				break;
			} else {
				textBeforeFirstSection += line + '\n';
			}
		}

		// Ajouter le texte avant la première section
		if (textBeforeFirstSection.trim()) {
			mainContent = textBeforeFirstSection + mainContent;
		}

		// Ajouter la table des matières si configurée
		if (this.settings.getAddTableOfContents()) {
			mainContent = '\\tableofcontents\n\\newpage\n\n' + mainContent;
		}

		return mainContent;
	}

	/**
	 * Génère la fin du document
	 */
	private generateDocumentEnd(): string {
		let end = '';

		// Nouvelle page avant bibliographie si configurée
		if (this.settings.getAddNewPageBeforeBibliography()) {
			end += '\n\\newpage\n\n';
		}

		// Bibliographie
		end += '\n\\bibliographystyle{apacite}';
		end += '\n\\bibliography{BIBTEX}';

		// Fin du document
		end += '\n\\end{document}';

		return end;
	}

	/**
	 * Génère les packages à charger selon les paramètres
	 */
	private generatePackages(): string {
		const packages: string[] = [];

		// Packages de base
		packages.push('\\usepackage[table]{xcolor}');
		packages.push('\\usepackage{tabularx}');
		packages.push('\\usepackage{longtable}');
		packages.push('\\usepackage{tabularray}');

		// Packages selon la classe de document
		const documentClass = this.settings.getDocumentClass();
		if (documentClass === 'ifacconf') {
			packages.push('%💀\\usepackage{ifacconf}');
		}

		// Packages supplémentaires
		packages.push('\\usepackage{enumitem,amssymb}');
		packages.push('\\usepackage{hyperref}');
		packages.push('\\usepackage{geometry}');
		packages.push('\\usepackage{cleveref}');

		return packages.join('\n');
	}

	/**
	 * Génère la configuration des hyperliens
	 */
	private generateHyperlinkSetup(): string {
		return `\\hypersetup{
\tcolorlinks = true,
\turlcolor = blue,
\tlinkcolor = blue,
\tcitecolor = blue
}`;
	}

	/**
	 * Génère la configuration des marges
	 */
	private generateMarginSetup(): string {
		const margin = this.settings.getMargin();
		if (margin) {
			return `\\usepackage[margin=${margin}]{geometry}`;
		}
		return '';
	}

	/**
	 * Génère la configuration des paragraphes
	 */
	private generateParagraphSetup(): string {
		const indent = this.settings.getParagraphIndent();
		return `\\setlength{\\parindent}{${indent}pt}`;
	}
} 