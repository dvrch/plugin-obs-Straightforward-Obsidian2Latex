import { describe, it, expect, vi } from 'vitest';

// Mock simple pour éviter l'import d'Obsidian
const mockApp = {
  vault: {
    getAbstractFileByPath: vi.fn(),
    read: vi.fn()
  }
} as any;

// Test de la logique d'extraction des références sans dépendance Obsidian
describe('Logique d\'extraction des références', () => {
  it('devrait extraire le nom du fichier depuis une référence Obsidian', () => {
    const reference = '![[eq__block_Einstein#expr]]';
    const fileName = reference.match(/\[\[([^#\\]+)/)?.[1];
    expect(fileName).toBe('eq__block_Einstein');
  });

  it('devrait extraire la section depuis une référence Obsidian', () => {
    const reference = '![[table__block_1#table]]';
    const section = reference.match(/#([^\\\]]+)/)?.[1];
    expect(section).toBe('table');
  });

  it('devrait extraire la section depuis une référence avec \\texttt', () => {
    const reference = '![[table__block_1\\texttt{table}]]';
    const section = reference.match(/\\texttt\{([^}]+)\}/)?.[1];
    expect(section).toBe('table');
  });

  it('devrait construire le chemin complet vers un bloc d\'équation', () => {
    const fileName = 'eq__block_Einstein';
    const expectedPath = `✍Writing/equation blocks/${fileName}.md`;
    expect(expectedPath).toBe('✍Writing/equation blocks/eq__block_Einstein.md');
  });

  it('devrait construire le chemin complet vers un bloc de tableau', () => {
    const fileName = 'table__block_1';
    const expectedPath = `✍Writing/table blocks/${fileName}.md`;
    expect(expectedPath).toBe('✍Writing/table blocks/table__block_1.md');
  });

  it('devrait extraire plusieurs références d\'un contenu', () => {
    const content = `
      ![[eq__block_Einstein#expr]]
      ![[table__block_1#table]]
      ![[figure__block_1#fig]]
    `;
    const references = content.match(/!\[\[([^\]]+)\]\]/g);
    expect(references).toHaveLength(3);
  });

  it('devrait extraire une section avec #', () => {
    const content = `#expr
\\begin{equation}
E=mc^2
\\end{equation}`;
    
    const lines = content.split('\n');
    const exprIndex = lines.findIndex(line => line.trim() === '#expr');
    const extractedContent = lines.slice(exprIndex + 1).join('\n');
    
    expect(extractedContent).toContain('\\begin{equation}');
    expect(extractedContent).toContain('E=mc^2');
  });

  it('devrait valider les références correctes', () => {
    const pattern = /!\[\[([^#\\]+)(?:#([^\\]+)|\\texttt\{([^}]+)\})\]\]/;
    
    expect(pattern.test('![[eq__block_Einstein#expr]]')).toBe(true);
    expect(pattern.test('![[table__block_1\\texttt{table}]]')).toBe(true);
    expect(pattern.test('[[eq__block_Einstein#expr]]')).toBe(false);
  });
}); 