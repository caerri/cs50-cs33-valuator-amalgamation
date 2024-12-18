#!/home/dh_kfekwx/bin/python3

from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
from flup.server.fcgi import WSGIServer

def register_user(username, password):
    # Register a new user with the given username and password
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256') # Used recommended method
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO users (username, password)
            VALUES (?, ?)
        ''', (username, hashed_password))
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return "Username already exists"
    conn.close()
    return None

def validate_user(username, password):
    """Validate the user’s credentials, return user_id if valid"""
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute('SELECT id, password FROM users WHERE username = ?', (username,))
    user = cursor.fetchone()
    conn.close()

    if user and check_password_hash(user[1], password):
        return user[0]  # Return user ID if valid
    return None