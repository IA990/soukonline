// Fonction pour charger les villes et régions
async function loadCities() {
    try {
        const response = await fetch('/data/cities.json');
        const data = await response.json();
        
        // Remplir le sélecteur de villes
        const citySelect = document.querySelector('#city-select');
        if (citySelect) {
            // Ajouter l'option "Toutes les villes"
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Toutes les villes';
            citySelect.appendChild(defaultOption);

            // Ajouter les régions et leurs villes
            data.regions.forEach(region => {
                const optgroup = document.createElement('optgroup');
                optgroup.label = region.name;

                region.cities.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city.toLowerCase();
                    option.textContent = city;
                    optgroup.appendChild(option);
                });

                citySelect.appendChild(optgroup);
            });
        }
    } catch (error) {
        console.error('Erreur lors du chargement des villes:', error);
    }
}

// Fonction pour formater le prix
function formatPrice(price) {
    return price.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ');
}

// Fonction pour formater la date relative
function formatRelativeDate(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays/7)} semaine(s)`;
    return `Il y a ${Math.floor(diffDays/30)} mois`;
}

// Fonction pour créer une carte d'annonce
function createRentalCard(rental) {
    const typeLabel = rental.type === 'colocation' ? 'Colocation' : 'Location';
    const typeClass = rental.type === 'colocation' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
    
    return `
        <div class="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-2 transition-all hover:shadow-xl">
            <div class="relative">
                <img src="${rental.image || 'https://via.placeholder.com/300x200'}" 
                     alt="${rental.title}"
                     class="w-full h-48 object-cover">
                <span class="${typeClass} absolute top-2 right-2 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    ${typeLabel}
                </span>
            </div>
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="font-semibold text-lg text-primary line-clamp-2">${rental.title}</h3>
                        <p class="text-gray-600 text-sm">${rental.location}</p>
                    </div>
                    <span class="text-lg font-bold text-primary">${formatPrice(rental.price)}</span>
                </div>
                <p class="text-gray-600 text-sm line-clamp-3 mb-4">${rental.description}</p>
                <div class="flex justify-between items-center">
                    <a href="${rental.link}" target="_blank" 
                       class="text-primary hover:text-red-600 transition-colors text-sm font-medium">
                        Voir l'annonce <i class="fas fa-arrow-right ml-1"></i>
                    </a>
                    <span class="text-xs text-gray-500">${formatRelativeDate(rental.posted_at)}</span>
                </div>
            </div>
        </div>
    `;
}

// Fonction pour charger et afficher les annonces
async function loadRentals() {
    try {
        const response = await fetch('/rentals/latest_rentals.json');
        const rentals = await response.json();
        
        const rentalsContainer = document.querySelector('#rentals-container');
        if (rentalsContainer) {
            rentalsContainer.innerHTML = rentals.map(rental => createRentalCard(rental)).join('');
        }
    } catch (error) {
        console.error('Erreur lors du chargement des annonces:', error);
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadCities();
    loadRentals();
    
    // Gérer le filtrage par ville
    const citySelect = document.querySelector('#city-select');
    if (citySelect) {
        citySelect.addEventListener('change', async () => {
            const selectedCity = citySelect.value.toLowerCase();
            const response = await fetch('/rentals/latest_rentals.json');
            const rentals = await response.json();
            
            const filteredRentals = selectedCity
                ? rentals.filter(rental => rental.location.toLowerCase().includes(selectedCity))
                : rentals;
            
            const rentalsContainer = document.querySelector('#rentals-container');
            if (rentalsContainer) {
                rentalsContainer.innerHTML = filteredRentals.map(rental => createRentalCard(rental)).join('');
            }
        });
    }
});
