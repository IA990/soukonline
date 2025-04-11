from flask import Flask, request, jsonify
from user_manager import UserManager
import os

app = Flask(__name__)
user_manager = UserManager(os.getenv("GITHUB_TOKEN"))

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    success, message = user_manager.register_user(
        data.get("username"),
        data.get("email"),
        data.get("password")
    )
    return jsonify({
        "success": success,
        "message": message
    })

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    success, result = user_manager.login_user(
        data.get("email"),
        data.get("password")
    )
    if success:
        return jsonify({
            "success": True,
            "user": {
                "id": result["id"],
                "username": result["username"],
                "email": result["email"],
                "type": result["type"],
                "profile": result["profile"]
            }
        })
    return jsonify({
        "success": False,
        "message": result
    })

@app.route("/api/profile", methods=["PUT"])
def update_profile():
    data = request.get_json()
    success, message = user_manager.update_profile(
        data.get("user_id"),
        data.get("profile_data")
    )
    return jsonify({
        "success": success,
        "message": message
    })

@app.route("/api/visit", methods=["POST"])
def log_visit():
    data = request.get_json()
    success, message = user_manager.log_visit(
        data.get("page"),
        data.get("user_id"),
        data.get("metadata")
    )
    return jsonify({
        "success": success,
        "message": message
    })

@app.route("/api/stats", methods=["GET"])
def get_stats():
    stats = user_manager.get_user_stats()
    return jsonify(stats)

if __name__ == "__main__":
    app.run(port=5000)
