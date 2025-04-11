import os
import json
import base64
from datetime import datetime
from PIL import Image
from github import Github
import io

class MediaManager:
    def __init__(self, github_token):
        self.github = Github(github_token)
        self.repo = self.github.get_repo("IA990/soukonline")
        self.media_index_file = "storage/media_index.json"
        self.allowed_extensions = {
            'image': {'png', 'jpg', 'jpeg', 'gif', 'webp'},
            'document': {'pdf', 'doc', 'docx', 'txt'},
            'cv': {'pdf', 'doc', 'docx'}
        }
        self.max_file_size = 5 * 1024 * 1024  # 5MB
        self.image_quality = 85

    def _load_media_index(self):
        try:
            content = self.repo.get_contents(self.media_index_file)
            return json.loads(base64.b64decode(content.content).decode())
        except:
            return {
                "images": [],
                "documents": [],
                "cvs": []
            }

    def _save_media_index(self, index_data):
        try:
            content = self.repo.get_contents(self.media_index_file)
            self.repo.update_file(
                self.media_index_file,
                "Update media index",
                json.dumps(index_data, indent=2, ensure_ascii=False),
                content.sha
            )
        except:
            self.repo.create_file(
                self.media_index_file,
                "Create media index",
                json.dumps(index_data, indent=2, ensure_ascii=False)
            )

    def _optimize_image(self, image_data):
        """Optimise une image pour réduire sa taille"""
        img = Image.open(io.BytesIO(image_data))
        
        # Convertir en RGB si nécessaire
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
        
        # Redimensionner si l'image est trop grande
        max_size = 1920
        if max(img.size) > max_size:
            ratio = max_size / max(img.size)
            new_size = tuple(int(dim * ratio) for dim in img.size)
            img = img.resize(new_size, Image.LANCZOS)
        
        # Sauvegarder avec compression
        output = io.BytesIO()
        img.save(output, format='JPEG', quality=self.image_quality, optimize=True)
        return output.getvalue()

    def upload_file(self, file_data, file_type, metadata=None):
        """
        Upload un fichier (image, document, CV)
        file_data: bytes du fichier
        file_type: 'image', 'document', ou 'cv'
        metadata: dictionnaire avec des informations supplémentaires
        """
        try:
            # Vérifier le type de fichier
            extension = metadata.get('extension', '').lower()
            if extension not in self.allowed_extensions[file_type]:
                return False, f"Type de fichier non autorisé. Extensions permises: {self.allowed_extensions[file_type]}"

            # Vérifier la taille du fichier
            if len(file_data) > self.max_file_size:
                return False, f"Fichier trop volumineux. Taille maximale: {self.max_file_size/1024/1024}MB"

            # Optimiser si c'est une image
            if file_type == 'image':
                file_data = self._optimize_image(file_data)

            # Générer le chemin du fichier
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"{timestamp}_{metadata.get('original_name', 'file')}"
            file_path = f"storage/{file_type}s/{filename}"

            # Uploader le fichier
            self.repo.create_file(
                file_path,
                f"Upload {file_type}",
                base64.b64encode(file_data).decode()
            )

            # Mettre à jour l'index
            index = self._load_media_index()
            file_info = {
                "id": len(index[f"{file_type}s"]) + 1,
                "path": file_path,
                "filename": filename,
                "size": len(file_data),
                "uploaded_at": datetime.now().isoformat(),
                "metadata": metadata or {}
            }
            index[f"{file_type}s"].append(file_info)
            self._save_media_index(index)

            return True, file_info

        except Exception as e:
            return False, str(e)

    def get_file_info(self, file_id, file_type):
        """Récupère les informations d'un fichier"""
        index = self._load_media_index()
        files = index.get(f"{file_type}s", [])
        for file in files:
            if file["id"] == file_id:
                return True, file
        return False, "Fichier non trouvé"

    def delete_file(self, file_id, file_type):
        """Supprime un fichier"""
        try:
            index = self._load_media_index()
            files = index.get(f"{file_type}s", [])
            
            # Trouver le fichier
            file_to_delete = None
            for file in files:
                if file["id"] == file_id:
                    file_to_delete = file
                    break
            
            if not file_to_delete:
                return False, "Fichier non trouvé"

            # Supprimer le fichier de GitHub
            content = self.repo.get_contents(file_to_delete["path"])
            self.repo.delete_file(
                file_to_delete["path"],
                f"Delete {file_type}",
                content.sha
            )

            # Mettre à jour l'index
            files.remove(file_to_delete)
            self._save_media_index(index)

            return True, "Fichier supprimé avec succès"

        except Exception as e:
            return False, str(e)

    def get_files_by_type(self, file_type, page=1, per_page=20):
        """Récupère la liste des fichiers d'un type donné avec pagination"""
        index = self._load_media_index()
        files = index.get(f"{file_type}s", [])
        
        # Pagination
        start = (page - 1) * per_page
        end = start + per_page
        paginated_files = files[start:end]
        
        return {
            "files": paginated_files,
            "total": len(files),
            "page": page,
            "per_page": per_page,
            "total_pages": (len(files) + per_page - 1) // per_page
        }
