// Gestionnaire de médias pour SoukOnline
class MediaManager {
    constructor() {
        this.apiBaseUrl = '/api';
        this.uploadEndpoint = `${this.apiBaseUrl}/upload`;
        this.filesEndpoint = `${this.apiBaseUrl}/files`;
    }

    // Upload d'un fichier
    async uploadFile(file, type, metadata = {}) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('metadata', JSON.stringify({
                ...metadata,
                uploaded_by: localStorage.getItem('user_id'),
                upload_date: new Date().toISOString()
            }));

            const response = await fetch(`${this.uploadEndpoint}/${type}`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.message);
            }

            return result.file;
        } catch (error) {
            console.error('Erreur lors de l\'upload:', error);
            throw error;
        }
    }

    // Récupération de la liste des fichiers
    async getFiles(type, page = 1, perPage = 20) {
        try {
            const response = await fetch(
                `${this.filesEndpoint}/${type}?page=${page}&per_page=${perPage}`
            );
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la récupération des fichiers:', error);
            throw error;
        }
    }

    // Suppression d'un fichier
    async deleteFile(type, fileId) {
        try {
            const response = await fetch(`${this.filesEndpoint}/${type}/${fileId}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            throw error;
        }
    }

    // Prévisualisation d'image
    createImagePreview(file) {
        return new Promise((resolve, reject) => {
            if (!file.type.startsWith('image/')) {
                reject(new Error('Le fichier n\'est pas une image'));
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(file);
        });
    }

    // Validation de fichier
    validateFile(file, type) {
        const allowedTypes = {
            image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
            cv: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        };

        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes[type].includes(file.type)) {
            throw new Error(`Type de fichier non autorisé. Types acceptés: ${allowedTypes[type].join(', ')}`);
        }

        if (file.size > maxSize) {
            throw new Error(`Fichier trop volumineux. Taille maximale: 5MB`);
        }

        return true;
    }

    // Création d'une galerie d'images
    createGallery(containerId, images) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        
        images.forEach(image => {
            const card = document.createElement('div');
            card.className = 'relative bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform';
            
            card.innerHTML = `
                <img src="${this.filesEndpoint}/${image.path}" 
                     alt="${image.metadata.alt || ''}"
                     class="w-full h-48 object-cover">
                <div class="p-4">
                    <p class="text-sm text-gray-600">${image.filename}</p>
                    <div class="flex justify-between items-center mt-2">
                        <span class="text-xs text-gray-500">
                            ${new Date(image.uploaded_at).toLocaleDateString()}
                        </span>
                        <button class="text-red-500 hover:text-red-700" 
                                onclick="deleteImage(${image.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            container.appendChild(card);
        });
    }

    // Création d'un gestionnaire de CV
    createCVManager(containerId, cvFiles) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        
        cvFiles.forEach(cv => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg shadow-md p-4 mb-4';
            
            card.innerHTML = `
                <div class="flex justify-between items-center">
                    <div>
                        <h3 class="font-semibold">${cv.metadata.title || cv.filename}</h3>
                        <p class="text-sm text-gray-600">
                            Ajouté le ${new Date(cv.uploaded_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div class="flex space-x-2">
                        <a href="${this.filesEndpoint}/${cv.path}" 
                           class="text-blue-500 hover:text-blue-700"
                           target="_blank">
                            <i class="fas fa-download"></i>
                        </a>
                        <button class="text-red-500 hover:text-red-700"
                                onclick="deleteCV(${cv.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            container.appendChild(card);
        });
    }

    // Création d'un uploader de fichiers avec prévisualisation
    createUploader(containerId, type, onUploadComplete) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input type="file" id="fileInput" class="hidden">
                <label for="fileInput" class="cursor-pointer">
                    <i class="fas fa-cloud-upload-alt text-4xl text-gray-400"></i>
                    <p class="mt-2 text-gray-600">Cliquez ou glissez un fichier ici</p>
                </label>
                <div id="preview" class="mt-4"></div>
                <div id="uploadProgress" class="hidden mt-4">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-primary h-2 rounded-full" style="width: 0%"></div>
                    </div>
                </div>
            </div>
        `;

        const fileInput = container.querySelector('#fileInput');
        const preview = container.querySelector('#preview');
        const progress = container.querySelector('#uploadProgress div');

        // Gestion du drag & drop
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            container.classList.add('border-primary');
        });

        container.addEventListener('dragleave', () => {
            container.classList.remove('border-primary');
        });

        container.addEventListener('drop', async (e) => {
            e.preventDefault();
            container.classList.remove('border-primary');
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
        });

        fileInput.addEventListener('change', () => {
            const file = fileInput.files[0];
            if (file) handleFile(file);
        });

        const handleFile = async (file) => {
            try {
                this.validateFile(file, type);

                // Afficher la prévisualisation pour les images
                if (type === 'image') {
                    const previewUrl = await this.createImagePreview(file);
                    preview.innerHTML = `
                        <img src="${previewUrl}" 
                             alt="Prévisualisation" 
                             class="max-w-full h-auto max-h-48 mx-auto">
                    `;
                } else {
                    preview.innerHTML = `
                        <div class="text-gray-600">
                            <i class="fas fa-file text-2xl"></i>
                            <p>${file.name}</p>
                        </div>
                    `;
                }

                // Afficher la barre de progression
                progress.parentElement.classList.remove('hidden');

                // Simuler la progression
                let width = 0;
                const interval = setInterval(() => {
                    if (width >= 90) clearInterval(interval);
                    width += 10;
                    progress.style.width = `${width}%`;
                }, 100);

                // Upload du fichier
                const result = await this.uploadFile(file, type);
                progress.style.width = '100%';

                // Callback de succès
                if (onUploadComplete) onUploadComplete(result);

                // Réinitialiser après 1 seconde
                setTimeout(() => {
                    preview.innerHTML = '';
                    progress.parentElement.classList.add('hidden');
                    progress.style.width = '0%';
                    fileInput.value = '';
                }, 1000);

            } catch (error) {
                preview.innerHTML = `
                    <div class="text-red-500">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>${error.message}</p>
                    </div>
                `;
                progress.parentElement.classList.add('hidden');
            }
        };
    }
}

// Export de l'instance
window.mediaManager = new MediaManager();
