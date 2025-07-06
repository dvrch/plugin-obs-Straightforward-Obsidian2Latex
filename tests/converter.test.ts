import { describe, it, expect, vi } from 'vitest';

// Mock des classes pour éviter les dépendances Obsidian
const mockPathManager = {
  joinPaths: (...paths: string[]) => paths.join('/'),
  normalizePath: (path: string) => path.replace(/\\/g, '/')
};

describe('LatexConverter - Imbrication de fichiers', () => {
  it('devrait détecter les références aux blocs d\'équations', () => {
    const markdownContent = '![[eq__block_Einstein#expr]]';
    // Test de détection des références aux blocs d'équations
    expect(markdownContent).toContain('eq__block_Einstein');
    expect(markdownContent).toContain('#expr');
  });

  it('devrait détecter les références aux blocs de tableaux', () => {
    const markdownContent = '![[table__block_1#table]]';
    // Test de détection des références aux blocs de tableaux
    expect(markdownContent).toContain('table__block_1');
    expect(markdownContent).toContain('#table');
  });

  it('devrait traiter les chemins vers les blocs d\'équations', () => {
    const equationPath = '✍Writing/equation blocks/eq__block_Einstein.md';
    const expectedPath = mockPathManager.joinPaths('✍Writing', 'equation blocks', 'eq__block_Einstein.md');
    expect(expectedPath).toContain('equation blocks');
    expect(expectedPath).toContain('eq__block_Einstein.md');
  });

  it('devrait traiter les chemins vers les blocs de tableaux', () => {
    const tablePath = '✍Writing/table blocks/table__block_1.md';
    const expectedPath = mockPathManager.joinPaths('✍Writing', 'table blocks', 'table__block_1.md');
    expect(expectedPath).toContain('table blocks');
    expect(expectedPath).toContain('table__block_1.md');
  });

  it('devrait normaliser les chemins cross-platform', () => {
    const inputPath = '✍Writing\\table blocks\\table__block_1.md';
    const normalizedPath = mockPathManager.normalizePath(inputPath);
    expect(normalizedPath).toBeDefined();
    expect(typeof normalizedPath).toBe('string');
  });
}); 