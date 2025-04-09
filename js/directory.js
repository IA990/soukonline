// Cache pour stocker les données
let directoryData = null;

// Fonction pour créer une carte de société avec lazy loading des images
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
                                <i class="fab fa-linkedin fa-lg"></i>
                            </a>
                        ` : ''}
                        ${company.social.facebook ? `
                            <a href="https://facebook.com/${company.social.facebook}"
                               target="_blank"
                               class="text-blue-600 hover:text-blue-800">
                                <i class="fab fa-facebook fa-lg"></i>
                            </a>
                        ` : ''}
                    </div>
                </div>
                
                <p class="text-gray-600 mb-4 line-clamp-2">${company.description}</p>
                
                <div class="space-y-2 text-sm text-gray-600">
                    <p class="flex items-center">
                        <i class="fas fa-map-marker-alt w-5 text-primary"></i>
                        <span class="line-clamp-1">${company.address}</span>
                    </p>
                    <p class="flex items-center">
                        <i class="fas fa-phone w-5 text-primary"></i>
                        <a href="tel:${company.phone}" class="hover:text-primary">
                            ${company.phone}
                        </a>
                    </p>
                    <p class="flex items-center">
                        <i class="fas fa-envelope w-5 text-primary"></i>
                        <a href="mailto:${company.email}" class="hover:text-primary truncate">
                            ${company.email}
                        </a>
                    </p>
                    ${company.website ? `
                        <p class="flex items-center">
                            <i class="fas fa-globe w-5 text-primary"></i>
                            <a href="${company.website}" target="_blank" class="hover:text-primary truncate">
                                ${company.website.replace('https://', '')}
                            </a>
                        </p>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// Fonction pour créer une section de secteur avec lazy loading
function createSectorSection(sector) {
    return `
        <div class="mb-12 opacity-0 transform translate-y-4 transition-all duration-500" 
             data-sector="${sector.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}">
            <h3 class="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
                <i class="fas fa-building mr-2 text-primary"></i>
                ${sector.name}
                <span class="ml-2 text-sm text-gray-500">(${sector.companies.length})</span>
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${sector.companies.map(company => createCompanyCard(company)).join('')}
            </div>
        </div>
    `;
}

// Fonction pour observer les sections et les animer
function observeSections() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove('opacity-0', 'translate-y-4');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('[data-sector]').forEach(section => {
        observer.observe(section);
    });
}

// Fonction pour charger et afficher l'annuaire avec gestion des erreurs
async function loadDirectory() {
    const directoryContainer = document.querySelector('#directory-container');
    if (!directoryContainer) return;

    try {
        // Afficher le loader
        directoryContainer.innerHTML = `
            <div class="text-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p class="mt-4 text-gray-600">Chargement de l'annuaire...</p>
            </div>
        `;

        // Charger les données
        const response = await fetch('/directory/companies.json');
        if (!response.ok) throw new Error('Erreur lors du chargement des données');
        
        directoryData = await response.json();
        
        // Afficher les données
        directoryContainer.innerHTML = directoryData.sectors.map(sector => createSectorSection(sector)).join('');
        
        // Initialiser l'observation des sections
        observeSections();
        
        // Initialiser la recherche
        initSearch();

    } catch (error) {
        console.error('Erreur:', error);
        directoryContainer.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
                <p class="text-gray-600">Une erreur est survenue lors du chargement de l'annuaire.</p>
                <button onclick="loadDirectory()" class="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-red-600 transition-colors">
                    Réessayer
                </button>
            </div>
        `;
    }
}

// Fonction pour initialiser la recherche avec debounce
function initSearch() {
    const searchInput = document.querySelector('#company-search');
    if (!searchInput || !directoryData) return;

    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const searchTerm = e.target.value.toLowerCase();
            const directoryContainer = document.querySelector('#directory-container');
            
            if (!searchTerm) {
                directoryContainer.innerHTML = directoryData.sectors.map(sector => createSectorSection(sector)).join('');
                observeSections();
                return;
            }

            // Filtrer les sociétés
            const filteredSectors = directoryData.sectors.map(sector => ({
                name: sector.name,
                companies: sector.companies.filter(company => 
                    company.name.toLowerCase().includes(searchTerm) ||
                    company.description.toLowerCase().includes(searchTerm) ||
                    company.address.toLowerCase().includes(searchTerm)
                )
            })).filter(sector => sector.companies.length > 0);

            directoryContainer.innerHTML = filteredSectors.length ? 
                filteredSectors.map(sector => createSectorSection(sector)).join('') :
                `<div class="text-center py-12">
                    <i class="fas fa-search text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-600">Aucun résultat trouvé pour "${e.target.value}"</p>
                </div>`;

            observeSections();
        }, 300); // Debounce de 300ms
    });
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', loadDirectory);
