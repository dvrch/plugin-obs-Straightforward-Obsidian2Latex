import { describe, it, expect, vi } from 'vitest';

describe('Traitement des fichiers imbriqués', () => {
  it('devrait extraire le nom du fichier depuis une référence Obsidian', () => {
    const reference = '![[eq__block_Einstein#expr]]';
    const fileName = reference.match(/\[\[([^#]+)/)?.[1];
    expect(fileName).toBe('eq__block_Einstein');
  });

  it('devrait extraire la section depuis une référence Obsidian', () => {
    const reference = '![[table__block_1#table]]';
    const section = reference.match(/#([^\]]+)/)?.[1];
    expect(section).toBe('table');
  });

  it('devrait construire le chemin complet vers un bloc d\'équation', () => {
    const fileName = 'eq__block_Einstein';
    const expectedPath = `✍Writing/equation blocks/${fileName}.md`;
    expect(expectedPath).toContain('equation blocks');
    expect(expectedPath).toContain('eq__block_Einstein.md');
  });

  it('devrait construire le chemin complet vers un bloc de tableau', () => {
    const fileName = 'table__block_1';
    const expectedPath = `✍Writing/table blocks/${fileName}.md`;
    expect(expectedPath).toContain('table blocks');
    expect(expectedPath).toContain('table__block_1.md');
  });

  it('devrait détecter les références multiples dans un contenu', () => {
    const content = `
      ![[eq__block_Einstein#expr]]
      ![[table__block_1#table]]
      ![[table__block_2#table]]
    `;
    const references = content.match(/!\[\[([^\]]+)\]\]/g);
    expect(references).toHaveLength(3);
  });

  it('devrait valider le format des blocs d\'équations', () => {
    const equationBlock = `# %%expr%%
$$E=mc^{2}$$`;
    expect(equationBlock).toContain('# %%expr%%');
    expect(equationBlock).toContain('$$');
  });

  it('devrait valider le format des blocs de tableaux', () => {
    const tableBlock = `%%
caption:: Caption of table
%%
# %%table%%
| Col1 | Col2 |
|------|------|
| a11  | a12  |`;
    expect(tableBlock).toContain('# %%table%%');
    expect(tableBlock).toContain('caption::');
  });
}); 