import jwt
import os
from functools import wraps
from flask import request, jsonify, current_app
from datetime import datetime, timedelta

def create_jwt_token(user_id, username):
    payload = {
        'user_id': str(user_id),
        'username': username,
        'exp': datetime.now(datetime.timezone.utc) + timedelta(hours=24),
        'iat': datetime.now(datetime.timezone.utc)
    }
    return jwt.encode(payload, os.getenv('JWT_SECRET_KEY'), algorithm='HS256')

def verify_jwt_token(token):
    try:
        payload = jwt.decode(token, os.getenv('JWT_SECRET_KEY'), algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        if token.startswith('Bearer '):
            token = token[7:]
        
        payload = verify_jwt_token(token)
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        request.current_user = payload
        return f(*args, **kwargs)
    return decorated_function