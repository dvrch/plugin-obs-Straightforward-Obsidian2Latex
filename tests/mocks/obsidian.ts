import { vi } from 'vitest';

// Mock pour les modules Obsidian
export class TFile {
  path: string;
  name: string;
  
  constructor(path: string) {
    this.path = path;
    this.name = path.split('/').pop() || '';
  }
}

export class App {
  vault: any;
  
  constructor() {
    this.vault = {
      getAbstractFileByPath: vi.fn(),
      read: vi.fn(),
      list: vi.fn(),
      stat: vi.fn(),
      mkdir: vi.fn(),
      write: vi.fn()
    };
  }
}

// Mock global pour Obsidian
global.obsidian = {
  TFile,
  App
}; 