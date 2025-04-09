// Fonction pour créer une carte de société
function createCompanyCard(company) {
    return `
        <div class="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-2 transition-all hover:shadow-xl">
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="font-semibold text-xl text-primary">${company.name}</h3>
                    <div class="flex space-x-2">
                        ${company.social.linkedin ? `
                            <a href="https://linkedin.com/company/${company.social.linkedin}" 
                               target="_blank"
                               class="text-blue-600 hover:text-blue-800">
                                <i class="fab fa-linkedin"></i>
                            </a>
                        ` : ''}
                        ${company.social.facebook ? `
                            <a href="https://facebook.com/${company.social.facebook}"
                               target="_blank"
                               class="text-blue-600 hover:text-blue-800">
                                <i class="fab fa-facebook"></i>
                            </a>
                        ` : ''}
                    </div>
                </div>
                
                <p class="text-gray-600 mb-4">${company.description}</p>
                
                <div class="space-y-2 text-sm text-gray-600">
                    <p class="flex items-center">
                        <i class="fas fa-map-marker-alt w-5 text-primary"></i>
                        ${company.address}
                    </p>
                    <p class="flex items-center">
                        <i class="fas fa-phone w-5 text-primary"></i>
                        <a href="tel:${company.phone}" class="hover:text-primary">
                            ${company.phone}
                        </a>
                    </p>
                    <p class="flex items-center">
                        <i class="fas fa-envelope w-5 text-primary"></i>
                        <a href="mailto:${company.email}" class="hover:text-primary">
                            ${company.email}
                        </a>
                    </p>
                    <p class="flex items-center">
                        <i class="fas fa-globe w-5 text-primary"></i>
                        <a href="${company.website}" target="_blank" class="hover:text-primary">
                            ${company.website.replace('https://', '')}
                        </a>
                    </p>
                </div>
            </div>
        </div>
    `;
}

// Fonction pour créer une section de secteur
function createSectorSection(sector) {
    return `
        <div class="mb-12">
            <h3 class="text-2xl font-semibold mb-6 text-gray-800">
                <i class="fas fa-building mr-2 text-primary"></i>
                ${sector.name}
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${sector.companies.map(company => createCompanyCard(company)).join('')}
            </div>
        </div>
    `;
}

// Fonction pour charger et afficher l'annuaire
async function loadDirectory() {
    try {
        const response = await fetch('/directory/companies.json');
        const data = await response.json();
        
        const directoryContainer = document.querySelector('#directory-container');
        if (directoryContainer) {
            directoryContainer.innerHTML = data.sectors.map(sector => createSectorSection(sector)).join('');
        }

        // Initialiser la recherche
        initSearch(data);
    } catch (error) {
        console.error('Erreur lors du chargement de l\'annuaire:', error);
    }
}

// Fonction pour initialiser la recherche
function initSearch(data) {
    const searchInput = document.querySelector('#company-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const directoryContainer = document.querySelector('#directory-container');
        
        if (searchTerm === '') {
            directoryContainer.innerHTML = data.sectors.map(sector => createSectorSection(sector)).join('');
            return;
        }

        // Filtrer les sociétés qui correspondent à la recherche
        const filteredSectors = data.sectors.map(sector => ({
            name: sector.name,
            companies: sector.companies.filter(company => 
                company.name.toLowerCase().includes(searchTerm) ||
                company.description.toLowerCase().includes(searchTerm) ||
                company.address.toLowerCase().includes(searchTerm)
            )
        })).filter(sector => sector.companies.length > 0);

        directoryContainer.innerHTML = filteredSectors.map(sector => createSectorSection(sector)).join('');
    });
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', loadDirectory);
