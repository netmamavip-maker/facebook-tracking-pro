import os
import json
import logging
import sqlite3
from datetime import datetime, timedelta
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
import requests
from bs4 import BeautifulSoup
from threading import Thread, Lock
import time
import re

# ================================================================================
# CONFIGURATION
# ================================================================================

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

DATABASE = 'tracker.db'
FACEBOOK_EMAIL = os.getenv('FB_EMAIL', 'nusratparisa2@gmail.com')
FACEBOOK_PASSWORD = os.getenv('FB_PASSWORD', 'Parisa310724')
PORT = int(os.getenv('PORT', 5000))

# ================================================================================
# DATABASE
# ================================================================================

def init_db():
    """Initialize database with all tables"""
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    
    # Profiles table
    c.execute('''
        CREATE TABLE IF NOT EXISTS profiles (
            id INTEGER PRIMARY KEY,
            fb_id TEXT UNIQUE,
            name TEXT,
            profile_url TEXT,
            avatar_url TEXT,
            added_at TIMESTAMP,
            is_public BOOLEAN,
            is_friend BOOLEAN
        )
    ''')
    
    # Activity table (tracking history)
    c.execute('''
        CREATE TABLE IF NOT EXISTS activity (
            id INTEGER PRIMARY KEY,
            fb_id TEXT,
            status TEXT,
            last_seen TEXT,
            online_status TEXT,
            timestamp TIMESTAMP,
            duration_minutes INTEGER,
            session_id TEXT
        )
    ''')
    
    # Sessions table (for analytics)
    c.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY,
            fb_id TEXT,
            session_date DATE,
            session_start TIMESTAMP,
            session_end TIMESTAMP,
            duration_seconds INTEGER,
            session_number INTEGER
        )
    ''')
    
    # Settings table
    c.execute('''
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY,
            setting_key TEXT UNIQUE,
            setting_value TEXT
        )
    ''')
    
    conn.commit()
    conn.close()
    logger.info('[DB] Database initialized')

# ================================================================================
# FACEBOOK SESSION MANAGER
# ================================================================================

class FacebookTracker:
    def __init__(self):
        self.session = requests.Session()
        self.authenticated = False
        self.lock = Lock()
        self.init_session()
    
    def init_session(self):
        """Initialize session with anti-detection headers"""
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0',
        }
        self.session.headers.update(headers)
        self.login()
    
    def login(self):
        """Attempt Facebook login"""
        try:
            logger.info('[FB] Attempting login...')
            
            response = self.session.get('https://www.facebook.com/login', timeout=15)
            logger.info(f'[FB] Login page: {response.status_code}')
            
            login_data = {
                'email': FACEBOOK_EMAIL,
                'pass': FACEBOOK_PASSWORD,
                'login': 'Log In'
            }
            
            response = self.session.post(
                'https://www.facebook.com/login.php',
                data=login_data,
                allow_redirects=True,
                timeout=15
            )
            
            if 'c_user' in self.session.cookies or 'home' in response.url.lower():
                self.authenticated = True
                logger.info('[FB] ✅ Authenticated')
                return True
            else:
                logger.warning('[FB] ⚠️ Authentication may have failed')
                self.authenticated = False
                return False
                
        except Exception as e:
            logger.error(f'[FB] Login error: {type(e).__name__}: {str(e)}')
            self.authenticated = False
            return False
    
    def get_profile_data(self, profile_url):
        """Fetch complete profile data"""
        if not self.authenticated:
            return self._create_error_response('Not authenticated')
        
        try:
            logger.info(f'[FB] Fetching: {profile_url}')
            
            response = self.session.get(profile_url, timeout=15)
            if response.status_code != 200:
                logger.warning(f'[FB] Status: {response.status_code}')
                return self._create_error_response(f'Status {response.status_code}')
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract name
            name = self._extract_name(soup, response.text)
            
            # Extract avatar
            avatar = self._extract_avatar(soup)
            
            # Check online status
            is_online, online_text = self._check_online_status(response.text)
            
            # Extract last seen
            last_seen = self._extract_last_seen(response.text)
            
            logger.info(f'[FB] ✅ Data: {name} - {online_text}')
            
            return {
                'success': True,
                'name': name,
                'avatar_url': avatar,
                'online_status': 'online' if is_online else 'offline',
                'online_text': online_text,
                'last_seen': last_seen,
                'is_public': True,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f'[FB] Fetch error: {type(e).__name__}')
            return self._create_error_response(str(e))
    
    def _extract_name(self, soup, html_text):
        """Extract profile name"""
        try:
            # Try multiple patterns
            name_elem = soup.find('h1')
            if name_elem:
                return name_elem.text.strip()
            
            # Fallback pattern
            if '"name":"' in html_text:
                match = re.search(r'"name":"([^"]+)"', html_text)
                if match:
                    return match.group(1)
            
            return 'Unknown'
        except:
            return 'Unknown'
    
    def _extract_avatar(self, soup):
        """Extract profile avatar URL"""
        try:
            img = soup.find('img', {'alt': True})
            if img and img.get('src'):
                return img['src']
            return None
        except:
            return None
    
    def _check_online_status(self, html_text):
        """Check if profile is currently online"""
        try:
            online_patterns = [
                'active now',
                'is active now',
                'active_now',
                'data-testid="online_indicator"',
                'active_c',
                'presence_online'
            ]
            
            for pattern in online_patterns:
                if pattern.lower() in html_text.lower():
                    return True, 'now'
            
            return False, 'offline'
        except:
            return False, 'offline'
    
    def _extract_last_seen(self, html_text):
        """Extract last seen time"""
        try:
            patterns = [
                r'(\d+\s+(?:minute|hour|day|second)s?\s+ago)',
                r'(?:Last seen|Seen)\s+(\d+\s+\w+\s+ago)'
            ]
            
            for pattern in patterns:
                match = re.search(pattern, html_text, re.IGNORECASE)
                if match:
                    return match.group(1)
            
            return 'unknown'
        except:
            return 'unknown'
    
    def _create_error_response(self, error_msg):
        """Create standardized error response"""
        return {
            'success': False,
            'name': 'Error',
            'avatar_url': None,
            'online_status': 'unknown',
            'online_text': 'unknown',
            'last_seen': 'unknown',
            'error': error_msg,
            'timestamp': datetime.now().isoformat()
        }

fb_tracker = FacebookTracker()

# ================================================================================
# TRACKING ENGINE
# ================================================================================

class TrackingEngine:
    def __init__(self, check_interval=30):
        self.check_interval = check_interval
        self.tracking = {}
        self.running = False
        self.lock = Lock()
    
    def add_profile(self, fb_id, profile_url):
        """Add profile to tracking"""
        try:
            with self.lock:
                if fb_id in self.tracking:
                    return {'success': False, 'message': 'Already tracking'}
                
                profile_data = fb_tracker.get_profile_data(profile_url)
                
                if not profile_data['success']:
                    return {'success': False, 'message': 'Failed to fetch profile'}
                
                conn = sqlite3.connect(DATABASE)
                c = conn.cursor()
                
                try:
                    c.execute(
                        'INSERT INTO profiles (fb_id, name, profile_url, avatar_url, added_at, is_public) VALUES (?, ?, ?, ?, ?, ?)',
                        (fb_id, profile_data['name'], profile_url, profile_data.get('avatar_url'), 
                         datetime.now().isoformat(), True)
                    )
                    
                    c.execute(
                        'INSERT INTO activity (fb_id, status, last_seen, online_status, timestamp) VALUES (?, ?, ?, ?, ?)',
                        (fb_id, profile_data['online_status'], profile_data['last_seen'], 
                         profile_data['online_text'], datetime.now().isoformat())
                    )
                    
                    conn.commit()
                    conn.close()
                    
                    self.tracking[fb_id] = {
                        'url': profile_url,
                        'name': profile_data['name'],
                        'last_status': profile_data['online_status'],
                        'session_start': None
                    }
                    
                    logger.info(f'✅ Tracking: {profile_data["name"]} ({fb_id})')
                    return {'success': True, 'message': f'Added {profile_data["name"]}'}
                    
                except sqlite3.IntegrityError:
                    conn.close()
                    return {'success': False, 'message': 'Profile already tracked'}
        
        except Exception as e:
            logger.error(f'[TRACKER] Add error: {str(e)}')
            return {'success': False, 'message': str(e)}
    
    def get_all_profiles(self):
        """Get all tracked profiles"""
        try:
            conn = sqlite3.connect(DATABASE)
            c = conn.cursor()
            c.execute('SELECT fb_id, name, profile_url, avatar_url, added_at FROM profiles')
            profiles = c.fetchall()
            conn.close()
            
            result = []
            for p in profiles:
                result.append({
                    'fb_id': p[0],
                    'name': p[1],
                    'profile_url': p[2],
                    'avatar_url': p[3],
                    'added_at': p[4]
                })
            return result
        except Exception as e:
            logger.error(f'[TRACKER] Get profiles error: {str(e)}')
            return []
    
    def get_profile_status(self, fb_id):
        """Get latest status of profile"""
        try:
            conn = sqlite3.connect(DATABASE)
            c = conn.cursor()
            c.execute(
                'SELECT status, last_seen, online_status, timestamp FROM activity WHERE fb_id = ? ORDER BY timestamp DESC LIMIT 1',
                (fb_id,)
            )
            row = c.fetchone()
            conn.close()
            
            if row:
                return {
                    'status': row[0],
                    'last_seen': row[1],
                    'online_status': row[2],
                    'timestamp': row[3]
                }
            return None
        except Exception as e:
            logger.error(f'[TRACKER] Get status error: {str(e)}')
            return None
    
    def get_profile_history(self, fb_id, days=30):
        """Get activity history"""
        try:
            conn = sqlite3.connect(DATABASE)
            c = conn.cursor()
            since = (datetime.now() - timedelta(days=days)).isoformat()
            c.execute(
                'SELECT status, last_seen, online_status, timestamp FROM activity WHERE fb_id = ? AND timestamp >= ? ORDER BY timestamp DESC',
                (fb_id, since)
            )
            rows = c.fetchall()
            conn.close()
            
            result = []
            for row in rows:
                result.append({
                    'status': row[0],
                    'last_seen': row[1],
                    'online_status': row[2],
                    'timestamp': row[3]
                })
            return result
        except Exception as e:
            logger.error(f'[TRACKER] Get history error: {str(e)}')
            return []
    
    def get_analytics(self, fb_id):
        """Get analytics for profile"""
        try:
            conn = sqlite3.connect(DATABASE)
            c = conn.cursor()
            
            # Today's sessions
            today = datetime.now().date().isoformat()
            c.execute('SELECT COUNT(*) FROM activity WHERE fb_id = ? AND status = "online" AND timestamp LIKE ?', (fb_id, f'{today}%'))
            today_sessions = c.fetchone()[0]
            
            # Total checks
            c.execute('SELECT COUNT(*) FROM activity WHERE fb_id = ?', (fb_id,))
            total_checks = c.fetchone()[0]
            
            # Last 7 days
            seven_days = (datetime.now() - timedelta(days=7)).isoformat()
            c.execute('SELECT COUNT(*) FROM activity WHERE fb_id = ? AND status = "online" AND timestamp >= ?', (fb_id, seven_days))
            week_sessions = c.fetchone()[0]
            
            conn.close()
            
            return {
                'today_sessions': today_sessions,
                'total_checks': total_checks,
                'week_sessions': week_sessions,
                'avg_daily_sessions': week_sessions / 7 if week_sessions > 0 else 0
            }
        except Exception as e:
            logger.error(f'[TRACKER] Analytics error: {str(e)}')
            return {}
    
    def remove_profile(self, fb_id):
        """Remove profile from tracking"""
        try:
            with self.lock:
                conn = sqlite3.connect(DATABASE)
                c = conn.cursor()
                c.execute('DELETE FROM profiles WHERE fb_id = ?', (fb_id,))
                c.execute('DELETE FROM activity WHERE fb_id = ?', (fb_id,))
                conn.commit()
                conn.close()
                
                if fb_id in self.tracking:
                    del self.tracking[fb_id]
                
                logger.info(f'✅ Removed: {fb_id}')
                return {'success': True}
        except Exception as e:
            logger.error(f'[TRACKER] Remove error: {str(e)}')
            return {'success': False, 'message': str(e)}
    
    def check_all(self):
        """Continuous checking loop"""
        self.running = True
        logger.info('[TRACKER] Checking started (30s interval)')
        
        while self.running:
            try:
                if not fb_tracker.authenticated:
                    logger.warning('[TRACKER] Not authenticated')
                    time.sleep(10)
                    continue
                
                profiles = self.get_all_profiles()
                
                for profile in profiles:
                    try:
                        profile_data = fb_tracker.get_profile_data(profile['profile_url'])
                        
                        if profile_data['success']:
                            conn = sqlite3.connect(DATABASE)
                            c = conn.cursor()
                            c.execute(
                                'INSERT INTO activity (fb_id, status, last_seen, online_status, timestamp) VALUES (?, ?, ?, ?, ?)',
                                (profile['fb_id'], profile_data['online_status'], profile_data['last_seen'], 
                                 profile_data['online_text'], datetime.now().isoformat())
                            )
                            conn.commit()
                            conn.close()
                            
                            # Emit update to connected clients
                            socketio.emit('profile_update', {
                                'fb_id': profile['fb_id'],
                                'status': profile_data['online_status'],
                                'online_text': profile_data['online_text'],
                                'timestamp': datetime.now().isoformat()
                            }, broadcast=True)
                        
                    except Exception as e:
                        logger.error(f'[TRACKER] Check error {profile["fb_id"]}: {str(e)}')
                        time.sleep(1)
                
                time.sleep(self.check_interval)
                
            except Exception as e:
                logger.error(f'[TRACKER] Loop error: {str(e)}')
                time.sleep(5)
    
    def start(self):
        """Start tracking"""
        if not self.running:
            Thread(target=self.check_all, daemon=True).start()
    
    def stop(self):
        """Stop tracking"""
        self.running = False

tracker = TrackingEngine(check_interval=30)

# ================================================================================
# FLASK ROUTES
# ================================================================================

@app.route('/')
def index():
    return jsonify({
        'status': 'ok',
        'service': 'Facebook Tracker Premium',
        'version': '1.0',
        'authenticated': fb_tracker.authenticated
    })

@app.route('/api/profiles', methods=['GET'])
def get_profiles():
    """Get all tracked profiles"""
    profiles = tracker.get_all_profiles()
    
    # Enrich with latest status
    for profile in profiles:
        status = tracker.get_profile_status(profile['fb_id'])
        if status:
            profile['current_status'] = status['status']
            profile['online_text'] = status['online_status']
            profile['last_check'] = status['timestamp']
    
    return jsonify({'success': True, 'profiles': profiles})

@app.route('/api/profiles/add', methods=['POST'])
def add_profile():
    """Add new profile"""
    data = request.json
    profile_url = data.get('profile_url')
    
    if not profile_url:
        return jsonify({'success': False, 'message': 'No URL provided'}), 400
    
    # Extract FB ID from URL
    fb_id = profile_url.rstrip('/').split('/')[-1]
    
    result = tracker.add_profile(fb_id, profile_url)
    return jsonify(result)

@app.route('/api/profiles/<fb_id>/status', methods=['GET'])
def get_status(fb_id):
    """Get profile status"""
    status = tracker.get_profile_status(fb_id)
    if status:
        return jsonify({'success': True, 'status': status})
    return jsonify({'success': False, 'message': 'Not found'}), 404

@app.route('/api/profiles/<fb_id>/history', methods=['GET'])
def get_history(fb_id):
    """Get profile history"""
    days = request.args.get('days', 30, type=int)
    history = tracker.get_profile_history(fb_id, days)
    return jsonify({'success': True, 'history': history})

@app.route('/api/profiles/<fb_id>/analytics', methods=['GET'])
def get_analytics(fb_id):
    """Get analytics"""
    analytics = tracker.get_analytics(fb_id)
    return jsonify({'success': True, 'analytics': analytics})

@app.route('/api/profiles/<fb_id>/remove', methods=['DELETE'])
def remove_profile(fb_id):
    """Remove profile"""
    result = tracker.remove_profile(fb_id)
    return jsonify(result)

@app.route('/api/refresh/<fb_id>', methods=['POST'])
def manual_refresh(fb_id):
    """Manual refresh for specific profile"""
    try:
        conn = sqlite3.connect(DATABASE)
        c = conn.cursor()
        c.execute('SELECT profile_url FROM profiles WHERE fb_id = ?', (fb_id,))
        row = c.fetchone()
        conn.close()
        
        if not row:
            return jsonify({'success': False, 'message': 'Profile not found'}), 404
        
        profile_data = fb_tracker.get_profile_data(row[0])
        
        if profile_data['success']:
            conn = sqlite3.connect(DATABASE)
            c = conn.cursor()
            c.execute(
                'INSERT INTO activity (fb_id, status, last_seen, online_status, timestamp) VALUES (?, ?, ?, ?, ?)',
                (fb_id, profile_data['online_status'], profile_data['last_seen'], 
                 profile_data['online_text'], datetime.now().isoformat())
            )
            conn.commit()
            conn.close()
            
            return jsonify({'success': True, 'data': profile_data})
        else:
            return jsonify({'success': False, 'message': profile_data.get('error')}), 500
    
    except Exception as e:
        logger.error(f'[API] Refresh error: {str(e)}')
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/settings', methods=['GET', 'POST'])
def settings():
    """Get/Set settings"""
    if request.method == 'GET':
        conn = sqlite3.connect(DATABASE)
        c = conn.cursor()
        c.execute('SELECT setting_key, setting_value FROM settings')
        settings_data = dict(c.fetchall())
        conn.close()
        return jsonify(settings_data)
    
    elif request.method == 'POST':
        data = request.json
        conn = sqlite3.connect(DATABASE)
        c = conn.cursor()
        for key, value in data.items():
            c.execute('INSERT OR REPLACE INTO settings (setting_key, setting_value) VALUES (?, ?)', 
                     (key, str(value)))
        conn.commit()
        conn.close()
        return jsonify({'success': True})

# ================================================================================
# SOCKETIO EVENTS
# ================================================================================

@socketio.on('connect')
def on_connect():
    logger.info('[SOCKETIO] Client connected')
    emit('connection_response', {'data': 'Connected'})

@socketio.on('disconnect')
def on_disconnect():
    logger.info('[SOCKETIO] Client disconnected')

@socketio.on('request_update')
def on_request_update(data):
    """Client requests update for specific profile"""
    fb_id = data.get('fb_id')
    status = tracker.get_profile_status(fb_id)
    if status:
        emit('status_update', {'fb_id': fb_id, 'status': status})

# ================================================================================
# MAIN
# ================================================================================

if __name__ == '__main__':
    logger.info('=' * 80)
    logger.info('Facebook Tracker Premium v1.0 - STARTING')
    logger.info('=' * 80)
    
    init_db()
    
    if fb_tracker.authenticated:
        logger.info('✅ Facebook authenticated')
    else:
        logger.warning('⚠️ Facebook authentication failed - using limited mode')
    
    # Start tracking engine
    tracker.start()
    
    logger.info(f'[SERVER] Running on 0.0.0.0:{PORT}')
    socketio.run(app, host='0.0.0.0', port=PORT, debug=False, allow_unsafe_werkzeug=True)
