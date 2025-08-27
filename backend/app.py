from flask import Flask, request, jsonify
import os, time
import webview
import threading
import pymongo
from dotenv import load_dotenv
from pathlib import Path
from passlib.context import CryptContext
from bson.objectid import ObjectId
import datetime
from google import genai
from chatbot import Chatbot
from middleware import create_jwt_token, require_auth

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-this')

# CORS headers
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Simple in-memory store: {session_id: [messages]}
SESSIONS = {}

SCRIPT_DIRECTORY = Path(__file__).parent
USER_DATA_FILE_PATH = SCRIPT_DIRECTORY / "user_data" / "users.csv"
PASSWORD_HASH = CryptContext(schemes=["argon2"], deprecated="auto")
def get_db():
    try:
        load_dotenv()
        db_url = os.getenv("MONGODB_URL")
        return pymongo.MongoClient(db_url)
    except pymongo.errors.ConfigurationError:
        raise pymongo.errors.ConfigurationError("An Invalid URI host error was received. Is your Atlas host name correct in your connection string?")

#db
def build_user_content(user_text, code, lang):
    parts = []
    if user_text:
        parts.append(user_text.strip())
    if code:
        parts.append(f"```{lang or ''}\n{code.strip()}\n```")
    return "\n\n".join(parts).strip()

#db
def get_sessions(uuid):

    object_id = ObjectId(uuid)
    client = get_db()
    db = client["user_chat_histories"]
    collection = db["chats"]
    doc = collection.find_one({"_id": object_id})
    if doc:
        return doc
    else:
        raise pymongo.errors.OperationFailure("Could not find session data")

#db
def create_doc(dict):
    client = get_db()
    db = client["user_chat_histories"]
    collection = db["chats"]
    insert_result = collection.insert_one(dict)
    new_uuid = insert_result.inserted_id
    return str(new_uuid)

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
    client = get_db()
    db = client["user_chat_histories"]
    users_collection = db["users"]
    # Check if user already exists
    if users_collection.find_one({"username": username}):
        return jsonify({"error": "Username already exists"}), 409

    try:
        new_uuid = create_doc({"username": username, "created_at": time.time(), "chat_history":[]})
        
        # Hash the password
        password_hash = check_password_hash(password)
        
        # Insert the new user document into MongoDB
        users_collection.insert_one({
            "username": username,
            "password_hash": password_hash,
            "created_at": datetime.utcnow(),
            "user_id": str(new_uuid)
        })
    except Exception as e:
        return jsonify({"error": "Registration failed"}), 500

    return jsonify({"message": "User registered successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    # Validate inputs to prevent NoSQL injection
    if not isinstance(username, str) or not isinstance(password, str):
        return jsonify({"error": "Invalid username or password"}), 401

    client = get_db()
    db = client["user_chat_histories"]
    user_collection = db["users"]

    user = user_collection.find_one({"username": username})

    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({"error": "Invalid username or password"}), 401
    
    # Generate JWT token
    token = create_jwt_token(user['_id'], username)
    return jsonify({
        "token": token,
        "user_id": str(user['_id']),
        "username": username
    })

#db
@app.route("/chat", methods=["POST"])
@require_auth
def chat():
    try:    
        chatbot = Chatbot()
        data = request.get_json(force=True)
        user_id = data.get("user_id")
        user_text = data.get("user_text", "")
        code = data.get("code", "")
        lang = data.get("lang", "plaintext")

        user = chatbot.users[user_id]

        # Enforce code size cap
        if code:
            if code.count("\n") + 1 > 152:
                return jsonify({
                    "error": "code_too_large",
                    "message": "Please paste a smaller snippet (<= 150 lines) or share a repro gist.",
                }), 400

        # Initialize session
        history = user.chat_history
        user_content = build_user_content(user_text, code, lang)
        prompt = {"role": "user", "content": user_content}

        response_dict = chatbot.make_llm_request(user_id=user.user_id, prompt=prompt, history=history)
        return jsonify(response_dict)
    except Exception as e:
        return jsonify({"error": e})
    

def check_password_hash(password):
    return PASSWORD_HASH.hash(password)

def start_flask():
    app.run()

if __name__ == "__main__":
    t = threading.Thread(target=start_flask)
    t.daemon = True
    t.start()

    webview.create_window("Coding Assistant", 'http://localhost:5173')
    webview.start()