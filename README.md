# SoukOnline - Site d'Annonces au Maroc

Un site d'annonces moderne pour le Maroc, construit avec HTML, Tailwind CSS et JavaScript.

## Fonctionnalités

- Design moderne et responsive
- Interface utilisateur intuitive
- Recherche d'annonces par ville
- Catégories populaires
- Système d'authentification
- Dernières annonces
- Formulaire de contact

## Technologies Utilisées

- HTML5
- Tailwind CSS
- JavaScript
- Font Awesome pour les icônes
- Google Fonts (Poppins)

## Structure du Projet

```
soukonline/
├── index.html          # Page d'accueil
├── login.html          # Page de connexion
├── register.html       # Page d'inscription
├── README.md          # Documentation
├── css/               # Styles personnalisés (si nécessaire)
├── js/                # Scripts JavaScript
├── images/            # Images du site
└── blog/              # Articles de blog
```

## Hébergement sur GitHub Pages

1. Créez un nouveau repository sur GitHub
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/votre-username/soukonline.git
   git push -u origin main
   ```

2. Allez dans les paramètres du repository sur GitHub
   - Cliquez sur "Settings"
   - Descendez jusqu'à la section "GitHub Pages"
   - Dans "Source", sélectionnez la branche "main"
   - Cliquez sur "Save"

3. Votre site sera accessible à l'adresse :
   `https://votre-username.github.io/soukonline`

## Personnalisation

### Couleurs
Le site utilise un thème de couleurs personnalisé que vous pouvez modifier dans le fichier de configuration Tailwind :

```javascript
colors: {
    primary: '#E63946',    // Rouge
    secondary: '#1D3557',  // Bleu foncé
    accent: '#457B9D',     // Bleu clair
}
```

### Polices
Le site utilise la police Poppins de Google Fonts. Pour changer la police :

1. Modifiez le lien Google Fonts dans le `<head>` de chaque fichier HTML
2. Mettez à jour la configuration Tailwind :

```javascript
fontFamily: {
    sans: ['Votre-Police', 'sans-serif'],
}
```

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
