import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

class StorageConfig:
    # Configuration GitHub
    GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')
    GITHUB_REPO = os.getenv('GITHUB_REPO', 'IA990/soukonline')
    
    # Limites de taille des fichiers (en bytes)
    MAX_FILE_SIZES = {
        'image': 5 * 1024 * 1024,  # 5MB
        'document': 10 * 1024 * 1024,  # 10MB
        'cv': 5 * 1024 * 1024  # 5MB
    }

    # Extensions autorisées
    ALLOWED_EXTENSIONS = {
        'image': {'png', 'jpg', 'jpeg', 'gif', 'webp'},
        'document': {'pdf', 'doc', 'docx', 'txt'},
        'cv': {'pdf', 'doc', 'docx'}
    }

    # Configuration des images
    IMAGE_CONFIG = {
        'max_dimension': 1920,  # Dimension maximale en pixels
        'quality': 85,  # Qualité de compression JPEG
        'thumbnail_sizes': {
            'small': 300,
            'medium': 600,
            'large': 1200
        }
    }

    # Structure des dossiers de stockage
    STORAGE_PATHS = {
        'image': 'storage/images',
        'document': 'storage/documents',
        'cv': 'storage/cvs',
        'temp': 'storage/temp'
    }

    # Configuration de la mise en cache
    CACHE_CONFIG = {
        'enabled': True,
        'duration': 3600,  # 1 heure en secondes
        'max_size': 100 * 1024 * 1024  # 100MB
    }

    # Configuration de la sécurité
    SECURITY_CONFIG = {
        'allowed_domains': ['*.soukonline.ma'],
        'max_upload_rate': 10,  # Nombre maximum d'uploads par minute
        'require_auth': True
    }

    # Configuration des métadonnées
    METADATA_FIELDS = {
        'image': {
            'required': ['title', 'alt'],
            'optional': ['description', 'tags', 'category']
        },
        'document': {
            'required': ['title'],
            'optional': ['description', 'category', 'tags']
        },
        'cv': {
            'required': ['name', 'email'],
            'optional': ['phone', 'position', 'experience']
        }
    }

    @classmethod
    def validate_file_type(cls, file_type):
        """Valide si le type de fichier est supporté"""
        return file_type in cls.STORAGE_PATHS.keys()

    @classmethod
    def get_storage_path(cls, file_type):
        """Retourne le chemin de stockage pour un type de fichier"""
        return cls.STORAGE_PATHS.get(file_type)

    @classmethod
    def get_allowed_extensions(cls, file_type):
        """Retourne les extensions autorisées pour un type de fichier"""
        return cls.ALLOWED_EXTENSIONS.get(file_type, set())

    @classmethod
    def get_max_file_size(cls, file_type):
        """Retourne la taille maximale pour un type de fichier"""
        return cls.MAX_FILE_SIZES.get(file_type, 5 * 1024 * 1024)

    @classmethod
    def validate_metadata(cls, file_type, metadata):
        """Valide les métadonnées pour un type de fichier"""
        if file_type not in cls.METADATA_FIELDS:
            return False, "Type de fichier non supporté"

        required_fields = cls.METADATA_FIELDS[file_type]['required']
        missing_fields = [field for field in required_fields if field not in metadata]

        if missing_fields:
            return False, f"Champs requis manquants: {', '.join(missing_fields)}"

        return True, "Métadonnées valides"
