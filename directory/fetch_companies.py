import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import os

def fetch_professionals():
    """
    Récupère les informations des professionnels depuis différentes sources :
    - Pages jaunes
    - Ordre des médecins
    - Ordre des avocats
    - Ordre des architectes
    - etc.
    """
    professionals = {
        "sectors": []
    }

    try:
        # Exemple avec les Pages Jaunes (à adapter selon l'API ou le site)
        sectors = [
            {"name": "Santé", "keywords": ["médecin", "dentiste", "pharmacie"]},
            {"name": "Juridique", "keywords": ["avocat", "notaire", "huissier"]},
            {"name": "Comptabilité & Audit", "keywords": ["expert-comptable", "commissaire aux comptes"]},
            {"name": "Architecture & Design", "keywords": ["architecte", "designer"]},
            {"name": "Technologies & IT", "keywords": ["informatique", "développement web"]}
        ]

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

        for sector in sectors:
            sector_data = {
                "name": sector["name"],
                "companies": []
            }

            for keyword in sector["keywords"]:
                # URL à adapter selon la source
                url = f"https://www.pagesjaunes.ma/recherche/{keyword}"
                
                try:
                    response = requests.get(url, headers=headers)
                    soup = BeautifulSoup(response.text, 'html.parser')
                    
                    # Les sélecteurs CSS doivent être adaptés selon le site
                    listings = soup.find_all('div', class_='business-listing')
                    
                    for listing in listings[:5]:  # Limiter à 5 résultats par mot-clé
                        company = {
                            "name": listing.find('h2').text.strip() if listing.find('h2') else "",
                            "description": listing.find('p', class_='description').text.strip() if listing.find('p', class_='description') else "",
                            "address": listing.find('div', class_='address').text.strip() if listing.find('div', class_='address') else "",
                            "phone": listing.find('div', class_='phone').text.strip() if listing.find('div', class_='phone') else "",
                            "email": listing.find('div', class_='email').text.strip() if listing.find('div', class_='email') else "",
                            "website": listing.find('a', class_='website')['href'] if listing.find('a', class_='website') else "",
                            "social": {
                                "linkedin": "",
                                "facebook": ""
                            }
                        }
                        sector_data["companies"].append(company)
                
                except Exception as e:
                    print(f"Erreur lors de la récupération des données pour {keyword}: {str(e)}")
                    continue

            professionals["sectors"].append(sector_data)

        # Sauvegarde dans un fichier JSON
        os.makedirs('directory', exist_ok=True)
        with open('directory/companies.json', 'w', encoding='utf-8') as f:
            json.dump(professionals, f, ensure_ascii=False, indent=2)

        print("Récupération des données terminée avec succès")
        return True

    except Exception as e:
        print(f"Erreur lors de la récupération des données: {str(e)}")
        return False

if __name__ == "__main__":
    fetch_professionals()
