// Cache pour stocker les données
let directoryData = null;

// Fonction pour normaliser le texte pour la recherche
function normalizeText(text) {
    return text.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');
}

// Fonction pour normaliser un numéro de téléphone
function normalizePhone(phone) {
    return phone.replace(/[^0-9+]/g, '');
}

// Fonction pour créer une carte de société avec mise en surbrillance des termes recherchés
function createCompanyCard(company, searchTerm = '') {
    const highlightText = (text, term) => {
        if (!term) return text;
        const normalizedText = text;
        const normalizedTerm = term.toLowerCase();
        const index = normalizedText.toLowerCase().indexOf(normalizedTerm);
        if (index >= 0) {
            return `${text.slice(0, index)}<mark class="bg-yellow-200">${text.slice(index, index + term.length)}</mark>${text.slice(index + term.length)}`;
        }
        return text;
    };

    return `
        <div class="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-2 transition-all duration-300 hover:shadow-xl">
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="font-semibold text-xl text-primary">
                        ${highlightText(company.name, searchTerm)}
                    </h3>
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
                
                <p class="text-gray-600 mb-4 line-clamp-2">
                    ${highlightText(company.description, searchTerm)}
                </p>
                
                <div class="space-y-2 text-sm text-gray-600">
                    <p class="flex items-center">
                        <i class="fas fa-map-marker-alt w-5 text-primary"></i>
                        <span class="line-clamp-1">
                            ${highlightText(company.address, searchTerm)}
                        </span>
                    </p>
                    <p class="flex items-center">
                        <i class="fas fa-phone w-5 text-primary"></i>
                        <a href="tel:${company.phone}" class="hover:text-primary">
                            ${highlightText(company.phone, searchTerm)}
                        </a>
                    </p>
                    <p class="flex items-center">
                        <i class="fas fa-envelope w-5 text-primary"></i>
                        <a href="mailto:${company.email}" class="hover:text-primary truncate">
                            ${highlightText(company.email, searchTerm)}
                        </a>
                    </p>
                    ${company.website ? `
                        <p class="flex items-center">
                            <i class="fas fa-globe w-5 text-primary"></i>
                            <a href="${company.website}" target="_blank" class="hover:text-primary truncate">
                                ${highlightText(company.website.replace('https://', ''), searchTerm)}
                            </a>
                        </p>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// Fonction pour créer une section de secteur
function createSectorSection(sector, searchTerm = '') {
    return `
        <div class="mb-12 opacity-0 transform translate-y-4 transition-all duration-500" 
             data-sector="${sector.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}">
            <h3 class="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
                <i class="fas fa-building mr-2 text-primary"></i>
                ${sector.name}
                <span class="ml-2 text-sm text-gray-500">(${sector.companies.length})</span>
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${sector.companies.map(company => createCompanyCard(company, searchTerm)).join('')}
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

// Fonction pour rechercher dans les données
function searchDirectory(searchTerm) {
    if (!directoryData) return [];

    const normalizedSearch = normalizeText(searchTerm);
    const normalizedPhone = normalizePhone(searchTerm);

    return directoryData.sectors.map(sector => ({
        name: sector.name,
        companies: sector.companies.filter(company => 
            normalizeText(company.name).includes(normalizedSearch) ||
            normalizeText(company.description).includes(normalizedSearch) ||
            normalizeText(company.address).includes(normalizedSearch) ||
            normalizePhone(company.phone).includes(normalizedPhone) ||
            normalizeText(company.email).includes(normalizedSearch)
        )
    })).filter(sector => sector.companies.length > 0);
}

// Fonction pour charger et afficher l'annuaire
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

// Fonction pour initialiser la recherche en temps réel
function initSearch() {
    const searchInput = document.querySelector('#company-search');
    if (!searchInput || !directoryData) return;

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim();
        const directoryContainer = document.querySelector('#directory-container');
        
        if (!searchTerm) {
            directoryContainer.innerHTML = directoryData.sectors.map(sector => createSectorSection(sector)).join('');
            observeSections();
            return;
        }

        const filteredSectors = searchDirectory(searchTerm);
        directoryContainer.innerHTML = filteredSectors.length ? 
            filteredSectors.map(sector => createSectorSection(sector, searchTerm)).join('') :
            `<div class="text-center py-12">
                <i class="fas fa-search text-4xl text-gray-400 mb-4"></i>
                <p class="text-gray-600">Aucun résultat trouvé pour "${searchTerm}"</p>
            </div>`;

        observeSections();
    });
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', loadDirectory);
