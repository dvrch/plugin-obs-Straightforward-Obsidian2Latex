import { vi } from 'vitest';
import './mocks/obsidian';

// Configuration globale pour les tests
global.console = {
  ...console,
  // Réduire le bruit dans les tests
  warn: vi.fn(),
  error: vi.fn(),
}; 