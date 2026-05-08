# SansNom

Forum d'écoute anonyme entre pairs pour étudiants.

## Stack
- React (Create React App)
- CSS Modules par composant
- Aucune dépendance externe (hors React)

## Installation

```bash
npx create-react-app sansnom
cd sansnom
```

Ensuite, remplacez le contenu de `src/` et `public/` par les fichiers fournis.

## Police

La police **Spectral** est chargée automatiquement depuis Google Fonts. Aucune installation manuelle nécessaire.

## Structure des fichiers

```
src/
├── index.css              ← Variables CSS globales + reset
├── index.js               ← Point d'entrée
├── App.jsx                ← Router principal
├── context/
│   └── ThemeContext.jsx   ← Dark/light mode
├── data/
│   └── mockData.js        ← Données fictives (posts, pairs, ressources)
├── components/
│   ├── Navbar/            ← Navbar.jsx + Navbar.css
│   ├── Sidebar/           ← Sidebar.jsx + Sidebar.css
│   ├── Feed/              ← Feed.jsx + Feed.css
│   ├── Post/              ← Post.jsx + Post.css
│   ├── Chat/              ← Chat.jsx + Chat.css
│   ├── Resources/         ← Resources.jsx + Resources.css
│   └── Modal/             ← Modal.jsx + Modal.css
└── pages/
    ├── Forum/             ← Forum.jsx + Forum.css
    ├── ChatPage/          ← ChatPage.jsx + ChatPage.css
    └── ResourcesPage/     ← ResourcesPage.jsx + ResourcesPage.css
```

## Lancer le projet

```bash
npm start
```
