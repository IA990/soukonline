import requests
import json
from datetime import datetime
import os

def fetch_google_jobs():
    # Configuration de l'API Serpapi (vous devrez vous inscrire pour obtenir une clé API)
    url = "https://serpapi.com/search.json"
    params = {
        "engine": "google_jobs",
        "q": "jobs in Morocco",
        "location": "Morocco",
        "api_key": "YOUR_API_KEY"  # Remplacez par votre clé API
    }

    try:
        response = requests.get(url, params=params)
        data = response.json()
        
        # Formatage des données
        jobs = []
        for job in data.get('jobs_results', [])[:6]:  # Limiter à 6 offres
            jobs.append({
                'title': job.get('title'),
                'company': job.get('company_name'),
                'location': job.get('location'),
                'description': job.get('description'),
                'posted_at': job.get('posted_at'),
                'link': job.get('link')
            })
        
        # Sauvegarde dans un fichier JSON
        with open('jobs/latest_jobs.json', 'w', encoding='utf-8') as f:
            json.dump(jobs, f, ensure_ascii=False, indent=2)
            
        return True
    except Exception as e:
        print(f"Erreur lors de la récupération des offres: {str(e)}")
        return False

if __name__ == "__main__":
    # Créer le dossier jobs s'il n'existe pas
    os.makedirs('jobs', exist_ok=True)
    fetch_google_jobs()
