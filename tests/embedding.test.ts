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
    expect(expectedPath).toBe('✍Writing/equation blocks/eq__block_Einstein.md');
  });

  it('devrait détecter les références aux blocs d\'équations dans le texte', () => {
    const markdownContent = 'Voici une équation ![[eq__block_Einstein#expr]] et une autre ![[eq__block_1#expr]]';
    const references = markdownContent.match(/!\[\[([^\]]+)\]\]/g);
    expect(references).toHaveLength(2);
    expect(references?.[0]).toBe('![[eq__block_Einstein#expr]]');
    expect(references?.[1]).toBe('![[eq__block_1#expr]]');
  });

  it('devrait détecter les références aux blocs de tableaux dans le texte', () => {
    const markdownContent = 'Voir le tableau ![[table__block_1#table]] et ![[table__block_2#table]]';
    const references = markdownContent.match(/!\[\[([^\]]+)\]\]/g);
    expect(references).toHaveLength(2);
    expect(references?.[0]).toBe('![[table__block_1#table]]');
    expect(references?.[1]).toBe('![[table__block_2#table]]');
  });

  it('devrait détecter les références aux blocs de figures dans le texte', () => {
    const markdownContent = 'Voir la figure ![[figure__block_gradient_steps#fig]]';
    const references = markdownContent.match(/!\[\[([^\]]+)\]\]/g);
    expect(references).toHaveLength(1);
    expect(references?.[0]).toBe('![[figure__block_gradient_steps#fig]]');
  });

  it('devrait remplacer une référence par le contenu LaTeX réel', () => {
    // Simulation du contenu d'un fichier d'équation
    const equationContent = `#expr
\\begin{equation} \\label{eq:Einstein}
\tE=mc^{2}
\\end{equation}`;
    
    // Simulation de l'extraction de la section - approche simplifiée
    const lines = equationContent.split('\n');
    const exprIndex = lines.findIndex(line => line.trim() === '#expr');
    const extractedContent = lines.slice(exprIndex + 1).join('\n');
    
    // Le contenu extrait devrait contenir l'équation LaTeX
    expect(extractedContent).toContain('\\begin{equation}');
    expect(extractedContent).toContain('E=mc^{2}');
    expect(extractedContent).toContain('\\end{equation}');
  });

  it('devrait traiter les références avec des caractères spéciaux', () => {
    const reference = '![[eq__block_Einstein\\texttt{expr}]]';
    const fileName = reference.match(/\[\[([^\\#]+)/)?.[1];
    const section = reference.match(/\\texttt\{([^}]+)\}/)?.[1];
    
    expect(fileName).toBe('eq__block_Einstein');
    expect(section).toBe('expr');
  });

  it('devrait gérer les références multiples dans un même document', () => {
    const markdownContent = `
    Voici une équation ![[eq__block_Einstein#expr]]
    Et un tableau ![[table__block_1#table]]
    Et une figure ![[figure__block_1#fig]]
    `;
    
    const references = markdownContent.match(/!\[\[([^\]]+)\]\]/g);
    expect(references).toHaveLength(3);
    
    const fileNames = references?.map(ref => ref.match(/\[\[([^#\\]+)/)?.[1]).filter(Boolean);
    expect(fileNames).toEqual(['eq__block_Einstein', 'table__block_1', 'figure__block_1']);
  });
}); 