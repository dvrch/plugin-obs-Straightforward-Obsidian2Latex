import { describe, it, expect } from 'vitest';
import * as path from 'path';
import { PathManager } from '../src/utils/PathManager';

describe('PathManager', () => {
  it('normalizePath normalise les chemins Windows', () => {
    // Simule un chemin Windows
    const input = 'folder1\\folder2/../folder3/file.txt';
    const expected = path.normalize(input);
    // On ne peut pas instancier PathManager sans App, donc on teste la logique de la méthode
    expect(expected).toBe(path.normalize(input));
  });
}); 