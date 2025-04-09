import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import os

def fetch_avito_rentals():
    """Récupère les annonces de location depuis Avito.ma"""
    url = "https://www.avito.ma/fr/maroc/appartements-à_louer"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    try:
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        rental_listings = soup.find_all('div', class_='listing-card')

        rentals = []
        for rental in rental_listings[:6]:  # Limiter à 6 annonces
            title_elem = rental.find('h2', class_='listing-title')
            price_elem = rental.find('span', class_='price')
            location_elem = rental.find('span', class_='location')
            description_elem = rental.find('p', class_='listing-description')
            link_elem = rental.find('a', class_='listing-link')
            image_elem = rental.find('img', class_='listing-image')

            if title_elem and price_elem:
                rentals.append({
                    'title': title_elem.text.strip(),
                    'price': price_elem.text.strip(),
                    'location': location_elem.text.strip() if location_elem else 'Maroc',
                    'description': description_elem.text.strip() if description_elem else '',
                    'image': image_elem['src'] if image_elem and 'src' in image_elem.attrs else '',
                    'posted_at': datetime.now().isoformat(),
                    'link': f"https://www.avito.ma{link_elem['href']}" if link_elem else '#',
                    'type': 'location'  # ou 'colocation'
                })

        # Récupérer aussi les colocations
        url_coloc = "https://www.avito.ma/fr/maroc/colocations"
        response = requests.get(url_coloc, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        coloc_listings = soup.find_all('div', class_='listing-card')

        for coloc in coloc_listings[:3]:  # Limiter à 3 annonces de colocation
            title_elem = coloc.find('h2', class_='listing-title')
            price_elem = coloc.find('span', class_='price')
            location_elem = coloc.find('span', class_='location')
            description_elem = coloc.find('p', class_='listing-description')
            link_elem = coloc.find('a', class_='listing-link')
            image_elem = coloc.find('img', class_='listing-image')

            if title_elem and price_elem:
                rentals.append({
                    'title': title_elem.text.strip(),
                    'price': price_elem.text.strip(),
                    'location': location_elem.text.strip() if location_elem else 'Maroc',
                    'description': description_elem.text.strip() if description_elem else '',
                    'image': image_elem['src'] if image_elem and 'src' in image_elem.attrs else '',
                    'posted_at': datetime.now().isoformat(),
                    'link': f"https://www.avito.ma{link_elem['href']}" if link_elem else '#',
                    'type': 'colocation'
                })

        # Créer le dossier rentals s'il n'existe pas
        os.makedirs('rentals', exist_ok=True)
        
        # Sauvegarder dans un fichier JSON
        with open('rentals/latest_rentals.json', 'w', encoding='utf-8') as f:
            json.dump(rentals, f, ensure_ascii=False, indent=2)

        print(f"Récupération réussie : {len(rentals)} annonces immobilières trouvées")
        return True

    except Exception as e:
        print(f"Erreur lors de la récupération des annonces: {str(e)}")
        return False

if __name__ == "__main__":
    fetch_avito_rentals()
