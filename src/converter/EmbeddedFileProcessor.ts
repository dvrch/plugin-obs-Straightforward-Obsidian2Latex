import { App, TFile } from 'obsidian';
import { PathManager } from '../utils/PathManager';

export interface EmbeddedReference {
  fullReference: string;
  fileName: string;
  section: string;
  filePath: string;
}

export class EmbeddedFileProcessor {
  private app: App;
  private pathManager: PathManager;

  constructor(app: App) {
    this.app = app;
    this.pathManager = new PathManager(app);
  }

  /**
   * Extrait toutes les références aux fichiers imbriqués dans le contenu Markdown
   */
  extractEmbeddedReferences(content: string): EmbeddedReference[] {
    const references: EmbeddedReference[] = [];
    const referenceRegex = /!\[\[([^\]]+)\]\]/g;
    let match;

    while ((match = referenceRegex.exec(content)) !== null) {
      const fullReference = match[0];
      const referenceContent = match[1];
      
      // Extraire le nom du fichier et la section
      const fileNameMatch = referenceContent.match(/^([^#\\]+)/);
      const sectionMatch = referenceContent.match(/#([^\\]+)/) || referenceContent.match(/\\texttt\{([^}]+)\}/);
      
      if (fileNameMatch) {
        const fileName = fileNameMatch[1];
        const section = sectionMatch?.[1] || '';
        
        // Déterminer le chemin du fichier basé sur le type de bloc
        const filePath = this.determineFilePath(fileName);
        
        references.push({
          fullReference,
          fileName,
          section,
          filePath
        });
      }
    }

    return references;
  }

  /**
   * Détermine le chemin du fichier basé sur le nom du fichier
   */
  private determineFilePath(fileName: string): string {
    if (fileName.startsWith('eq__block_')) {
      return `✍Writing/equation blocks/${fileName}.md`;
    } else if (fileName.startsWith('table__block_')) {
      return `✍Writing/table blocks/${fileName}.md`;
    } else if (fileName.startsWith('figure__block_')) {
      return `✍Writing/figure blocks/${fileName}.md`;
    } else {
      // Par défaut, chercher dans le dossier courant
      return `${fileName}.md`;
    }
  }

  /**
   * Lit le contenu d'un fichier imbriqué
   */
  async readEmbeddedFile(filePath: string): Promise<string | null> {
    try {
      const file = this.app.vault.getAbstractFileByPath(filePath);
      if (file instanceof TFile) {
        return await this.app.vault.read(file);
      }
    } catch (error) {
      console.error(`Erreur lors de la lecture du fichier ${filePath}:`, error);
    }
    return null;
  }

  /**
   * Extrait une section spécifique du contenu d'un fichier
   */
  extractSection(content: string, section: string): string {
    if (!section) {
      return content;
    }

    // Chercher la section avec différents formats
    const patterns = [
      new RegExp(`#\\s*${section}\\s*\\n([\\s\\S]*?)(?=\\n#|$)`, 'i'),
      new RegExp(`%%\\s*${section}\\s*%%\\s*\\n([\\s\\S]*?)(?=\\n%%|$)`, 'i'),
      new RegExp(`\\\\texttt\\{${section}\\}\\s*\\n([\\s\\S]*?)(?=\\n\\\\texttt|$)`, 'i')
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    // Si aucune section n'est trouvée, retourner le contenu complet
    return content;
  }

  /**
   * Traite et remplace toutes les références dans le contenu
   */
  async processEmbeddedReferences(content: string): Promise<string> {
    const references = this.extractEmbeddedReferences(content);
    let processedContent = content;

    for (const reference of references) {
      const fileContent = await this.readEmbeddedFile(reference.filePath);
      if (fileContent) {
        const sectionContent = this.extractSection(fileContent, reference.section);
        if (sectionContent) {
          // Remplacer la référence par le contenu LaTeX
          processedContent = processedContent.replace(
            reference.fullReference,
            `\n% Start obsidian ref:\n%${reference.fileName}\\\\texttt{${reference.section}}\n${sectionContent}\n% End obsidian ref\n`
          );
        }
      }
    }

    return processedContent;
  }

  /**
   * Valide si une référence est correctement formatée
   */
  validateReference(reference: string): boolean {
    const pattern = /!\[\[([^#\\]+)(?:#([^\\]+)|\\texttt\{([^}]+)\})\]\]/;
    return pattern.test(reference);
  }
} 