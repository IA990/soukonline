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

// Fonction pour créer une carte d'offre d'emploi
function createJobCard(job) {
    return `
        <div class="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-2 transition-all hover:shadow-xl">
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="font-semibold text-lg text-primary">${job.title}</h3>
                        <p class="text-gray-600 text-sm">${job.company} - ${job.location}</p>
                    </div>
                    <span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        Nouveau
                    </span>
                </div>
                <div class="space-y-2 mb-4">
                    <p class="text-gray-600 text-sm line-clamp-3">${job.description}</p>
                </div>
                <div class="flex justify-between items-center">
                    <a href="${job.link}" target="_blank" 
                       class="text-primary hover:text-red-600 transition-colors text-sm font-medium">
                        Voir l'offre <i class="fas fa-arrow-right ml-1"></i>
                    </a>
                    <span class="text-xs text-gray-500">${formatRelativeDate(job.posted_at)}</span>
                </div>
            </div>
        </div>
    `;
}

// Fonction pour charger et afficher les offres d'emploi
async function loadJobs() {
    try {
        const response = await fetch('/soukonline/jobs/latest_jobs.json');
        const jobs = await response.json();
        
        const jobsContainer = document.querySelector('#jobs-container');
        if (jobsContainer) {
            jobsContainer.innerHTML = jobs.map(job => createJobCard(job)).join('');
        }
    } catch (error) {
        console.error('Erreur lors du chargement des offres:', error);
    }
}

// Charger les offres au chargement de la page
document.addEventListener('DOMContentLoaded', loadJobs);
