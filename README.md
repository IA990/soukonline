# SoukOnline - Site d'Annonces au Maroc

Un site d'annonces moderne pour le Maroc, construit avec HTML, Tailwind CSS et JavaScript.

## Fonctionnalités

- Design moderne et responsive avec Tailwind CSS
- Interface utilisateur intuitive et animations fluides
- Système d'authentification complet
- Gestion des annonces par catégories
- Système de recherche avancé
- Annuaire des entreprises
- Système d'offres d'emploi automatisé
- Gestion des locations immobilières
- Base de données des villes marocaines
- Système de blog intégré

## Technologies Utilisées

- HTML5
- Tailwind CSS pour le design responsive
- JavaScript pour les interactions dynamiques
- Python pour les scripts d'automatisation
- Font Awesome pour les icônes
- Google Fonts (Poppins)

## Structure du Projet

```
soukonline/
├── index.html          # Page d'accueil
├── login.html          # Page de connexion
├── register.html       # Page d'inscription
├── README.md          # Documentation
│
├── css/               # Styles personnalisés
│   └── style.css      # Styles Tailwind et personnalisations
│
├── js/                # Scripts JavaScript
│   ├── directory.js   # Gestion de l'annuaire
│   ├── jobs.js        # Gestion des offres d'emploi
│   ├── rentals.js     # Gestion des locations
│   └── users.js       # Gestion des utilisateurs
│
├── data/              # Données statiques
│   └── cities.json    # Liste des villes marocaines
│
├── directory/         # Système d'annuaire
│   ├── companies.json        # Base de données des entreprises
│   └── fetch_companies.py    # Script de mise à jour
│
├── jobs/              # Système d'offres d'emploi
│   ├── fetch_jobs.py        # Script de récupération
│   ├── latest_jobs.json     # Données des offres
│   └── update_jobs.sh       # Script d'automatisation
│
├── rentals/           # Système de locations
│   ├── fetch_rentals.py     # Script de récupération
│   └── latest_rentals.json  # Données des locations
│
├── users/             # Gestion des utilisateurs
│   ├── api.py              # API utilisateurs
│   ├── user_manager.py     # Gestionnaire d'utilisateurs
│   ├── users.json          # Base de données utilisateurs
│   └── visits.json         # Suivi des visites
│
├── images/            # Ressources images
│   └── favicon.png    # Favicon du site
│
└── blog/              # Système de blog
```

## Composants Principaux

### 1. Système d'Authentification
- Inscription avec validation des données
- Connexion sécurisée
- Gestion des sessions utilisateurs
- Récupération de mot de passe
- Connexion via réseaux sociaux (Google, Facebook)

### 2. Système d'Offres d'Emploi
- Récupération automatique depuis diverses sources
- Mise à jour quotidienne via GitHub Actions
- Filtrage par ville et type de contrat
- Interface de recherche avancée

### 3. Système de Locations
- Gestion des annonces immobilières
- Filtrage par ville et type de bien
- Système de contact intégré
- Galerie photos

### 4. Annuaire des Entreprises
- Base de données des entreprises marocaines
- Système de recherche et filtrage
- Mise à jour automatique des données
- Fiches détaillées des entreprises

### 5. Gestion des Utilisateurs
- Profils utilisateurs personnalisables
- Tableau de bord des annonces
- Système de messagerie interne
- Statistiques de visites

## Installation et Configuration

1. Cloner le repository
```bash
git clone https://github.com/votre-username/soukonline.git
cd soukonline
```

2. Installation des dépendances Python (pour les scripts)
```bash
pip install -r requirements.txt
```

3. Configuration des variables d'environnement
```bash
cp .env.example .env
# Éditer .env avec vos configurations
```

4. Lancement des scripts d'automatisation
```bash
chmod +x jobs/update_jobs.sh
./jobs/update_jobs.sh
```

## Déploiement

### GitHub Pages
1. Configurer la branche de déploiement
```bash
git checkout -b gh-pages
git push origin gh-pages
```

2. Activer GitHub Pages dans les paramètres du repository
- Settings > Pages > Source > gh-pages

### Mise à jour Automatique
Les données sont automatiquement mises à jour via GitHub Actions :
- Offres d'emploi : toutes les 6 heures
- Annuaire des entreprises : quotidiennement
- Locations : toutes les 12 heures

## Personnalisation

### Thème de Couleurs
Le site utilise un thème personnalisé défini dans `css/style.css` :
```css
:root {
    --primary: #E63946;    /* Rouge */
    --secondary: #1D3557;  /* Bleu foncé */
    --accent: #457B9D;     /* Bleu clair */
}
```

### Polices
La police principale est Poppins, importée via Google Fonts. Pour la modifier :
1. Mettre à jour le lien dans le `<head>` des fichiers HTML
2. Modifier la configuration dans `css/style.css`

## Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## Contact

Pour toute question ou suggestion, n'hésitez pas à :
- Ouvrir une issue
- Envoyer un email à [votre-email]
- Visiter [votre-site]
