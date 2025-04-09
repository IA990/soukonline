import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import os

def fetch_emploima_jobs():
    """Récupère les offres d'emploi depuis Emploi.ma"""
    url = "https://www.emploi.ma/recherche-jobs-maroc"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    try:
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        job_listings = soup.find_all('div', class_='job-description-wrapper')

        jobs = []
        for job in job_listings[:6]:  # Limiter à 6 offres
            title_elem = job.find('h5', class_='title')
            company_elem = job.find('div', class_='company-name')
            location_elem = job.find('div', class_='job-location')
            description_elem = job.find('div', class_='description')
            link_elem = job.find('a', class_='title')

            if title_elem and company_elem:
                jobs.append({
                    'title': title_elem.text.strip(),
                    'company': company_elem.text.strip(),
                    'location': location_elem.text.strip() if location_elem else 'Maroc',
                    'description': description_elem.text.strip() if description_elem else '',
                    'posted_at': datetime.now().isoformat(),
                    'link': f"https://www.emploi.ma{link_elem['href']}" if link_elem else '#'
                })

        # Sauvegarde dans un fichier JSON
        os.makedirs('jobs', exist_ok=True)
        with open('jobs/latest_jobs.json', 'w', encoding='utf-8') as f:
            json.dump(jobs, f, ensure_ascii=False, indent=2)

        print(f"Récupération réussie : {len(jobs)} offres d'emploi trouvées")
        return True

    except Exception as e:
        print(f"Erreur lors de la récupération des offres: {str(e)}")
        return False

if __name__ == "__main__":
    fetch_emploima_jobs()
