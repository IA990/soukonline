from flask import Flask, request, jsonify, send_file
from media_manager import MediaManager
import os
import io
import base64

app = Flask(__name__)
media_manager = MediaManager(os.getenv("GITHUB_TOKEN"))

@app.route("/api/upload/<file_type>", methods=["POST"])
def upload_file(file_type):
    """
    Upload un fichier (image, document, CV)
    Paramètres attendus dans le formulaire:
    - file: le fichier
    - metadata: JSON avec des métadonnées (optionnel)
    """
    if 'file' not in request.files:
        return jsonify({
            "success": False,
            "message": "Aucun fichier fourni"
        }), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({
            "success": False,
            "message": "Nom de fichier invalide"
        }), 400

    # Préparer les métadonnées
    metadata = request.form.get('metadata', '{}')
    try:
        metadata = json.loads(metadata)
    except:
        metadata = {}

    # Ajouter des informations sur le fichier original
    metadata.update({
        'original_name': file.filename,
        'extension': file.filename.split('.')[-1].lower(),
        'mime_type': file.content_type
    })

    # Upload le fichier
    success, result = media_manager.upload_file(
        file.read(),
        file_type,
        metadata
    )

    if success:
        return jsonify({
            "success": True,
            "file": result
        })
    else:
        return jsonify({
            "success": False,
            "message": result
        }), 400

@app.route("/api/files/<file_type>", methods=["GET"])
def list_files(file_type):
    """
    Liste les fichiers d'un type donné avec pagination
    Paramètres GET:
    - page: numéro de page (défaut: 1)
    - per_page: nombre d'éléments par page (défaut: 20)
    """
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))

    result = media_manager.get_files_by_type(file_type, page, per_page)
    return jsonify(result)

@app.route("/api/files/<file_type>/<int:file_id>", methods=["GET"])
def get_file_info(file_type, file_id):
    """Récupère les informations d'un fichier"""
    success, result = media_manager.get_file_info(file_id, file_type)
    
    if success:
        return jsonify({
            "success": True,
            "file": result
        })
    else:
        return jsonify({
            "success": False,
            "message": result
        }), 404

@app.route("/api/files/<file_type>/<int:file_id>", methods=["DELETE"])
def delete_file(file_type, file_id):
    """Supprime un fichier"""
    success, message = media_manager.delete_file(file_id, file_type)
    
    return jsonify({
        "success": success,
        "message": message
    }), 200 if success else 404

@app.route("/api/files/<file_type>/<int:file_id>/download", methods=["GET"])
def download_file(file_type, file_id):
    """Télécharge un fichier"""
    success, result = media_manager.get_file_info(file_id, file_type)
    
    if not success:
        return jsonify({
            "success": False,
            "message": result
        }), 404

    try:
        # Récupérer le contenu du fichier depuis GitHub
        content = media_manager.repo.get_contents(result["path"])
        file_data = base64.b64decode(content.content)
        
        return send_file(
            io.BytesIO(file_data),
            mimetype=result["metadata"].get("mime_type", "application/octet-stream"),
            as_attachment=True,
            download_name=result["filename"]
        )
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

if __name__ == "__main__":
    app.run(port=5000)
