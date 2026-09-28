from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash, generate_password_hash
import sqlite3

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "your-secret-key"
jwt = JWTManager(app)
CORS(app)
DB_NAME = "bugs.db"

def get_db():
    conn = sqlite3.connect(DB_NAME, timeout=30.0)
    conn.row_factory = sqlite3.Row  # Fixes dict(bug) conversion
    return conn

def init_db():
    with get_db() as conn:
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute('''
            CREATE TABLE IF NOT EXISTS bugs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                severity TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'open'
            )
        ''')
        conn.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL
            )
        ''')

@app.route("/")
def home():
    return "Bug Tracker coming soon!"

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")
    
    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    hashed_password = generate_password_hash(password)
    with get_db() as conn:
        cursor = conn.cursor()
        try:
            cursor.execute(
                "INSERT INTO users (username, password) VALUES (?, ?)",
                (username, hashed_password)
            )
            conn.commit()
            return jsonify({"message": "User registered successfully"}), 201
        except sqlite3.IntegrityError:
            return jsonify({"error": "Username already exists"}), 400
        finally:
            cursor.close()

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM users WHERE username = ?", (username,)
        )
        user = cursor.fetchone()
        
        if user and check_password_hash(user["password"], password):
            access_token = create_access_token(identity=username)
            return jsonify(access_token=access_token), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 401

@app.route("/api/bugs", methods=["GET"])
@jwt_required()
def get_bugs():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM bugs")
        bugs = cursor.fetchall()
    
    bugs_list = [dict(bug) for bug in bugs]
    return jsonify(bugs_list), 200

@app.route("/api/bugs", methods=["POST"])
@jwt_required()
def add_bug():
    data = request.get_json() or {}
    title = data.get("title")
    description = data.get("description")
    severity = data.get("severity")

    if not title or not description or not severity:
        return jsonify({"error": "All fields are required"}), 400

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO bugs (title, description, severity, status) VALUES (?, ?, ?, ?)",
            (title, description, severity, "open")
        )
        conn.commit()

    return jsonify({"message": "Bug added successfully"}), 201


@app.route("/api/bugs/<int:bug_id>", methods=["PUT"])
@jwt_required()
def resolve_bug(bug_id):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT status FROM bugs WHERE id = ?", (bug_id,))
        bug = cursor.fetchone()

        if bug is None:
            return jsonify({"error": "Bug not found"}), 404

        new_status = "open" if bug["status"] == "resolved" else "resolved"
        cursor.execute("UPDATE bugs SET status = ? WHERE id = ?", (new_status, bug_id))
        conn.commit()

    return jsonify({"message": f"Bug status changed to {new_status}"}), 200

@app.route("/api/bugs/<int:bug_id>", methods=["DELETE"])
@jwt_required()  # Added JWT protection here
def delete_bug(bug_id):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM bugs WHERE id = ?", (bug_id,))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "Bug not found"}), 404

    return jsonify({"message": "Bug deleted successfully"}), 200

if __name__ == "__main__":
    init_db()
    app.run(debug=True)