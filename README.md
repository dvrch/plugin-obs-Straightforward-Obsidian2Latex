# Straightforward Obsidian2Latex Plugin

Plugin Obsidian natif pour convertir vos notes en documents LaTeX de manière robuste et cross-platform.

## 🎯 Fonctionnalités

### ✅ Conversion complète
- **Markdown vers LaTeX** : Conversion fidèle de tous les éléments
- **Équations mathématiques** : Support complet des équations inline et en bloc
- **Tableaux** : Conversion automatique avec alignement et packages LaTeX
- **Références** : Liens internes, citations, références croisées
- **Figures** : Gestion automatique des images et figures

### ✅ Interface utilisateur
- **Commandes intégrées** : Conversion directe depuis Obsidian
- **Paramètres avancés** : Configuration complète via l'interface
- **Sélection de notes** : Modale pour choisir les notes à convertir
- **Notifications** : Retour utilisateur en temps réel

### ✅ Robustesse cross-platform
- **Chemins universels** : Compatible Windows, Linux, macOS
- **Gestion des erreurs** : Validation et récupération automatique
- **Tests automatiques** : Validation complète du pipeline

## 🚀 Installation

### 1. Installation manuelle
```bash
# Cloner le plugin
git clone [URL_DU_PLUGIN]
cd plugin-obs-Straightforward-Obsidian2Latex

# Installer les dépendances
npm install

# Compiler le plugin
npm run build
```

### 2. Installation dans Obsidian
1. Copier le dossier du plugin dans `.obsidian/plugins/`
2. Activer le plugin dans les paramètres Obsidian
3. Configurer les paramètres selon vos besoins

## 📝 Utilisation

### Commandes disponibles
- **Convertir la note actuelle** : `Ctrl/Cmd + Shift + L`
- **Convertir une note spécifique** : Sélection via modale
- **Compiler LaTeX en PDF** : Compilation automatique
- **Test complet** : Validation du système

### Structure recommandée
```
vault/
├── ✍Writing/           # Notes à convertir
├── 👨‍💻Automations/      # Templates et scripts
├── 📚Literature/        # Fichiers de citations
└── .obsidian/plugins/   # Plugins Obsidian
```

### Format des notes
```markdown
# Titre du document

## Introduction
Votre texte ici...

### Citations
Dans [[p1]], nous voyons que...  # → \cite{p1}

### Équations
$$E = mc^2$$  # → Équation LaTeX

### Tableaux
| Colonne 1 | Colonne 2 |
|-----------|-----------|
| Donnée 1  | Donnée 2  |

### Références
Voir [[section_autre]]  # → \ref{section_autre}
```

## ⚙️ Configuration

### Paramètres de base
- **Classe de document** : article, extarticle, ifacconf
- **Taille de police** : 12pt, 11pt, etc.
- **Auteur et titre** : Métadonnées du document
- **Marges** : Configuration des marges de page

### Paramètres de paragraphe
- **Indentation** : Première ligne des paragraphes
- **Table des matières** : Génération automatique
- **Sauts de page** : Gestion des équations longues

### Paramètres de figures
- **Espacement** : Réduction entre figures
- **Positionnement** : Sous le texte ou flottant
- **Chemins** : Inclusion des chemins d'images

### Paramètres de références
- **Citations** : Conversion automatique [[p1]] → \cite{p1}
- **Liens internes** : Références croisées
- **Numéros de section** : Ajout automatique

## 🔧 Architecture

### Structure du code
```
src/
├── main.ts                    # Point d'entrée du plugin
├── converter/                 # Logique de conversion
│   ├── LatexConverter.ts     # Convertisseur principal
│   ├── processors/           # Processeurs spécialisés
│   │   ├── MarkdownProcessor.ts
│   │   ├── EquationProcessor.ts
│   │   ├── TableProcessor.ts
│   │   └── ReferenceProcessor.ts
│   └── generators/           # Générateurs LaTeX
│       └── LatexGenerator.ts
├── settings/                 # Gestion des paramètres
│   ├── SettingsManager.ts
│   └── LatexSettingsTab.ts
└── utils/                    # Utilitaires
    └── PathManager.ts
```

### Processeurs spécialisés
- **MarkdownProcessor** : En-têtes, listes, formatage
- **EquationProcessor** : Équations inline et en bloc
- **TableProcessor** : Tableaux avec alignement
- **ReferenceProcessor** : Liens et citations

### Générateur LaTeX
- **Préambule** : Packages et configuration
- **Document** : Structure complète
- **Bibliographie** : Gestion des références

## 🧪 Tests

### Test complet automatique
```bash
# Lancer tous les tests
npm run test

# Tests effectués :
# ✅ Validation des chemins
# ✅ Conversion Markdown → LaTeX
# ✅ Compilation LaTeX → PDF
# ✅ Robustesse cross-platform
```

### Tests manuels
1. **Test de conversion** : Convertir une note simple
2. **Test d'équations** : Vérifier les équations mathématiques
3. **Test de tableaux** : Valider les tableaux complexes
4. **Test de références** : Tester les liens internes

## 🔄 Workflow recommandé

### 1. Écriture
- Écrivez vos notes dans Obsidian
- Utilisez la syntaxe markdown standard
- Organisez vos références dans `📚Literature/`

### 2. Conversion
- Utilisez la commande de conversion
- Vérifiez le fichier `.tex` généré
- Ajustez les paramètres si nécessaire

### 3. Compilation
- Compilation automatique après conversion
- Vérification du PDF généré
- Corrections si nécessaire

### 4. Révision
- Vérifiez la qualité du PDF
- Ajustez les templates si besoin
- Relancez la conversion

## 🐛 Dépannage

### Problèmes courants

#### Erreur "Module not found"
```bash
# Solution : Recompiler le plugin
npm run build
```

#### Erreur de conversion
- Vérifiez la syntaxe markdown
- Consultez les logs dans la console
- Testez avec une note simple

#### Erreur de compilation LaTeX
- Vérifiez l'installation LaTeX
- Consultez les logs de compilation
- Testez avec un document minimal

### Logs et debug
```bash
# Activer les logs détaillés
# Dans la console Obsidian (Ctrl/Cmd + Shift + I)
console.log('Debug info');
```

## 📚 Ressources

### Documentation
- **API Obsidian** : https://github.com/obsidianmd/obsidian-api
- **LaTeX** : https://www.latex-project.org/
- **Markdown** : https://www.markdownguide.org/

### Exemples
- **Notes simples** : Conversion basique
- **Équations complexes** : Mathématiques avancées
- **Tableaux** : Données structurées
- **Références** : Citations et liens

## 🤝 Contribution

### Développement
```bash
# Cloner le repository
git clone [URL]

# Installer les dépendances
npm install

# Mode développement
npm run dev

# Build de production
npm run build
```

### Tests
```bash
# Lancer les tests
npm test

# Tests spécifiques
npm run test:unit
npm run test:integration
```

## 📄 Licence

Ce plugin est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

**💡 Conseil** : Commencez avec des notes simples pour comprendre le système avant de créer des documents complexes !

**🎯 Nouveau** : Le plugin est maintenant natif Obsidian - plus besoin d'installation Python ! 