import os
from flask import Flask, request, jsonify, send_from_directory
from flask_migrate import Migrate
from api.utils import APIException, generate_sitemap
from api.models import db
from api.admin import setup_admin
from api.commands import setup_commands
from flask_cors import CORS
from flask_jwt_extended import JWTManager, decode_token
from datetime import timedelta

from flask_socketio import SocketIO, join_room

from flask_bcrypt import Bcrypt

app = Flask(__name__)
app.url_map.strict_slashes = False
bcrypt = Bcrypt(app)

socketio = SocketIO(app, 
    cors_allowed_origins="*", 
    async_mode='threading',   
    logger=True, 
    engineio_logger=True
)

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
jwt = JWTManager(app)

socketio = SocketIO(app, cors_allowed_origins="*", manage_session=False)

CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

setup_admin(app)
setup_commands(app)

from api.routes import api
app.register_blueprint(api, url_prefix='/api')

@socketio.on("connect")
def handle_connect(auth=None):
    if not auth or 'token' not in auth:
        return False
    
    try:
        token = auth['token']
        decoded = decode_token(token)
        user_id = decoded["sub"]
        
        join_room(f"user_{user_id}")
    except Exception as e:
        return False

@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code


static_file_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../dist/')

@app.route('/')
def sitemap():
    # En Render, queremos que cargue el index.html
    return send_from_directory(static_file_dir, 'index.html')

@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # evitar caché para ver cambios
    return response

if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    socketio.run(app, host='0.0.0.0', port=PORT, debug=True)
