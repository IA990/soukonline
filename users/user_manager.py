import json
import os
import hashlib
import datetime
from github import Github
import base64

class UserManager:
    def __init__(self, github_token):
        self.github = Github(github_token)
        self.repo = self.github.get_repo("IA990/soukonline")
        self.users_file = "users/users.json"
        self.visits_file = "users/visits.json"

    def _load_json_file(self, file_path):
        try:
            content = self.repo.get_contents(file_path)
            data = json.loads(base64.b64decode(content.content).decode())
            return data
        except:
            return {"users": []} if "users.json" in file_path else {"visits": []}

    def _save_json_file(self, file_path, data):
        try:
            content = self.repo.get_contents(file_path)
            self.repo.update_file(
                file_path,
                f"Update {file_path}",
                json.dumps(data, indent=2, ensure_ascii=False),
                content.sha
            )
        except:
            self.repo.create_file(
                file_path,
                f"Create {file_path}",
                json.dumps(data, indent=2, ensure_ascii=False)
            )

    def _hash_password(self, password):
        return hashlib.sha256(password.encode()).hexdigest()

    def register_user(self, username, email, password, user_type="user"):
        users = self._load_json_file(self.users_file)
        
        # Vérifier si l'utilisateur existe déjà
        if any(user["email"] == email for user in users["users"]):
            return False, "Email déjà utilisé"

        # Créer le nouvel utilisateur
        new_user = {
            "id": len(users["users"]) + 1,
            "username": username,
            "email": email,
            "password": self._hash_password(password),
            "type": user_type,
            "created_at": datetime.datetime.now().isoformat(),
            "last_login": None,
            "profile": {
                "name": "",
                "phone": "",
                "address": "",
                "company": "",
                "social_links": {}
            }
        }

        users["users"].append(new_user)
        self._save_json_file(self.users_file, users)
        return True, "Inscription réussie"

    def login_user(self, email, password):
        users = self._load_json_file(self.users_file)
        hashed_password = self._hash_password(password)

        for user in users["users"]:
            if user["email"] == email and user["password"] == hashed_password:
                # Mettre à jour la dernière connexion
                user["last_login"] = datetime.datetime.now().isoformat()
                self._save_json_file(self.users_file, users)
                return True, user
        
        return False, "Email ou mot de passe incorrect"

    def update_profile(self, user_id, profile_data):
        users = self._load_json_file(self.users_file)
        
        for user in users["users"]:
            if user["id"] == user_id:
                user["profile"].update(profile_data)
                self._save_json_file(self.users_file, users)
                return True, "Profil mis à jour"
        
        return False, "Utilisateur non trouvé"

    def log_visit(self, page, user_id=None, metadata=None):
        visits = self._load_json_file(self.visits_file)
        
        visit = {
            "id": len(visits["visits"]) + 1,
            "timestamp": datetime.datetime.now().isoformat(),
            "page": page,
            "user_id": user_id,
            "metadata": metadata or {}
        }

        visits["visits"].append(visit)
        self._save_json_file(self.visits_file, visits)
        return True, "Visite enregistrée"

    def get_user_stats(self):
        users = self._load_json_file(self.users_file)
        visits = self._load_json_file(self.visits_file)

        stats = {
            "total_users": len(users["users"]),
            "total_visits": len(visits["visits"]),
            "active_users": sum(1 for user in users["users"] if user["last_login"]),
            "visits_by_page": {},
            "visits_by_date": {}
        }

        for visit in visits["visits"]:
            # Compter les visites par page
            page = visit["page"]
            stats["visits_by_page"][page] = stats["visits_by_page"].get(page, 0) + 1

            # Compter les visites par date
            date = visit["timestamp"][:10]  # YYYY-MM-DD
            stats["visits_by_date"][date] = stats["visits_by_date"].get(date, 0) + 1

        return stats
