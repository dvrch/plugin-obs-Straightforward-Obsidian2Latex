import { App, TFile, FileSystemAdapter } from 'obsidian';
import * as path from 'path';

export class PathManager {
	private app: App;
	private vaultPath: string;

	constructor(app: App) {
		this.app = app;
		if (app.vault.adapter instanceof FileSystemAdapter) {
			this.vaultPath = app.vault.adapter.getBasePath();
		} else {
			throw new Error('L\'adapter du vault n\'est pas FileSystemAdapter, impossible de récupérer le chemin absolu du vault.');
		}
	}

	/**
	 * Normalise un chemin pour être compatible cross-platform
	 */
	normalizePath(inputPath: string): string {
		return path.normalize(inputPath);
	}

	/**
	 * Joint des chemins de manière cross-platform
	 */
	joinPaths(...paths: string[]): string {
		return path.join(...paths);
	}

	/**
	 * Obtient le chemin absolu du vault
	 */
	getVaultPath(): string {
		return this.vaultPath;
	}

	/**
	 * Obtient le chemin absolu d'un fichier
	 */
	getAbsolutePath(relativePath: string): string {
		return path.resolve(this.vaultPath, relativePath);
	}

	/**
	 * Vérifie si un chemin est absolu
	 */
	isAbsolutePath(inputPath: string): boolean {
		return path.isAbsolute(inputPath);
	}

	/**
	 * Obtient le répertoire d'un fichier
	 */
	getDirectory(filePath: string): string {
		return path.dirname(filePath);
	}

	/**
	 * Obtient le nom de fichier sans extension
	 */
	getBasename(filePath: string): string {
		return path.basename(filePath, path.extname(filePath));
	}

	/**
	 * Obtient l'extension d'un fichier
	 */
	getExtension(filePath: string): string {
		return path.extname(filePath);
	}

	/**
	 * Construit le chemin vers le dossier Writing
	 */
	getWritingPath(): string {
		return this.joinPaths(this.vaultPath, '✍Writing');
	}

	/**
	 * Construit le chemin vers le dossier Automations
	 */
	getAutomationsPath(): string {
		return this.joinPaths(this.vaultPath, '👨‍💻Automations');
	}

	/**
	 * Construit le chemin vers le dossier Literature
	 */
	getLiteraturePath(): string {
		return this.joinPaths(this.vaultPath, '📚Literature');
	}

	/**
	 * Construit le chemin vers les blocs d'équations
	 */
	getEquationBlocksPath(): string {
		return this.joinPaths(this.getWritingPath(), 'equation blocks');
	}

	/**
	 * Construit le chemin vers les blocs de tableaux
	 */
	getTableBlocksPath(): string {
		return this.joinPaths(this.getWritingPath(), 'table blocks');
	}

	/**
	 * Obtient le chemin d'un fichier TFile
	 */
	getFilePath(file: TFile): string {
		if (this.app.vault.adapter instanceof FileSystemAdapter) {
			return this.app.vault.adapter.getFullPath(file.path);
		} else {
			throw new Error('L\'adapter du vault n\'est pas FileSystemAdapter, impossible de récupérer le chemin absolu du fichier.');
		}
	}

	/**
	 * Vérifie si un fichier existe
	 */
	async fileExists(filePath: string): Promise<boolean> {
		try {
			await this.app.vault.adapter.stat(filePath);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Crée un répertoire s'il n'existe pas
	 */
	async ensureDirectory(dirPath: string): Promise<void> {
		try {
			await this.app.vault.adapter.mkdir(dirPath);
		} catch (error) {
			// Le répertoire existe déjà ou erreur de permissions
			console.log(`Répertoire ${dirPath} existe déjà ou erreur:`, error);
		}
	}

	/**
	 * Obtient le séparateur de chemin pour la plateforme
	 */
	getPathSeparator(): string {
		return path.sep;
	}

	/**
	 * Convertit un chemin Windows en format Unix si nécessaire
	 */
	toUnixPath(inputPath: string): string {
		return inputPath.replace(/\\/g, '/');
	}

	/**
	 * Convertit un chemin Unix en format Windows si nécessaire
	 */
	toWindowsPath(inputPath: string): string {
		return inputPath.replace(/\//g, '\\');
	}
} 