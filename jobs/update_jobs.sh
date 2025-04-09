#!/bin/bash

# Chemin vers le répertoire du projet
PROJECT_DIR="/project/sandbox/user-workspace/soukonline"

# Activation de l'environnement Python (si nécessaire)
# source /chemin/vers/votre/env/bin/activate

# Exécution du script Python de mise à jour des offres
cd $PROJECT_DIR
python3 jobs/fetch_jobs.py

# Log de l'exécution
echo "$(date): Mise à jour des offres d'emploi effectuée" >> jobs/update.log

# Commit et push des changements vers GitHub
git add jobs/latest_jobs.json
git commit -m "Mise à jour automatique des offres d'emploi - $(date)"
git push https://${GITHUB_TOKEN}@github.com/IA990/soukonline.git main
