"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from api.utils import APIException, generate_sitemap
from api.models import db, User, Barbershop
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from flask_cors import CORS

# from models import Person

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../dist/')
app = Flask(__name__)

CORS(
    app,
    resources={r"/*": {"origins": "*"}},
    supports_credentials=True
)

app.url_map.strict_slashes = False

# database condiguration
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

# add the admin
setup_admin(app)

# add the admin
setup_commands(app)

# Add all endpoints form the API with a "api" prefix
app.register_blueprint(api, url_prefix='/api')

# Handle/serialize errors like a JSON object


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# generate sitemap with all your endpoints
# ENDPOINTS DE USUARIOS
@app.route("/users", methods=["GET"])
def get_users():
    users = User.query.all()
    data = [user.serialize() for user in users]
    return jsonify(data), 200

@app.route("/users", methods=["POST"])
def new_user():
    data = request.json
    name = data.get("name")
    last_name = data.get("last_name")
    password = data.get("password")
    email = data.get("email")
    phone = data.get("phone")
    notes = data.get("notes")
    
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"msg": "Email ya registrado."}), 400 #400, o 409 que indica conflicto?
    
    if not name:
        return jsonify({"msg": "Necesitas ingresar un nombre"}), 400
    if not last_name:
        return jsonify({"msg": "Necesitas ingresar un apellido"}), 400
    if not password:
        return jsonify({"msg": "Necesitas una contraseña"}), 400
    if not email:
        return jsonify({"msg": "Necesitas ingresar un email"}), 400
    if not phone:
        return jsonify({"msg": "Necesitas ingresar un teléfono"}), 400
    
    # Añadir excepción si el email ya se encuentra en el sistema
    
    new_user = User(name=name, last_name=last_name, password=password, email=email, phone=phone, notes=notes)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg":"Usuario "+ name + " " + last_name + " creado"}), 201

@app.route("/users/<int:user_id>", methods=["GET"])
def get_single_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "No encontrado"}) , 404
    data = user.serialize()

    return jsonify(data), 200

@app.route("/users/<int:user_id>", methods=["PUT"])
def edit_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "No encontrado"}) , 404
    
    data = request.json
    
    user.name = data.get("name",user.name)
    user.last_name = data.get("last_name",user.last_name)
    user.email = data.get("email",user.email)
    user.phone = data.get("phone",user.phone)
    user.notes = data.get("notes",user.notes)
    user.password = data.get("password",user.password)
    
    db.session.commit()
    return jsonify({"msg": "Usuario " + user.name + " actualizado"}), 200

@app.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404
    
    db.session.delete(user)
    db.session.commit()
    return jsonify({"msg": "Usuario eliminado correctamente"}), 200


#ENDPOINTS DE BARBERIAS
@app.route("/barbershops", methods=["GET"])
def get_barbershops():
    barbershops = Barbershop.query.all()
    data = [barbershop.serialize() for barbershop in barbershops]
    return jsonify(data), 200

@app.route("/barbershops", methods=["POST"])
def new_barbershop():
    data = request.json
    name = data.get("name")
    address = data.get("address")
    phone = data.get("phone")
    
    existing_barbershop = Barbershop.query.filter_by(phone=phone).first()
    if existing_barbershop:
        return jsonify({"msg": "Telefono ya registrado."}), 400 #400, o 409 que indica conflicto?
    
    if not name:
        return jsonify({"msg": "Necesitas ingresar un nombre"}), 400
    if not address:
        return jsonify({"msg": "Necesitas ingresar una dirección"}), 400
    if not phone:
        return jsonify({"msg": "Necesitas ingresar un teléfono"}), 400
    
    # Añadir excepción si el email ya se encuentra en el sistema
    
    new_barbershop = Barbershop(name=name, address=address, phone=phone,)
    db.session.add(new_barbershop)
    db.session.commit()

    return jsonify({"msg":"Barbería "+ name + " creada"}), 201

@app.route("/barbershops/<int:barbershop_id>", methods=["GET"])
def get_single_barbershop(barbershop_id):
    barbershop = Barbershop.query.get(barbershop_id)
    if not barbershop:
        return jsonify({"msg": "No encontrada"}) , 404
    data = barbershop.serialize()

    return jsonify(data), 200

@app.route("/barbershops/<int:barbershop_id>", methods=["PUT"])
def edit_barbershop(barbershop_id):
    barbershop = Barbershop.query.get(barbershop_id)
    if not barbershop:
        return jsonify({"msg": "No encontrada"}) , 404
    
    data = request.json
    
    barbershop.name = data.get("name",barbershop.name)
    barbershop.address = data.get("address",barbershop.address)
    barbershop.phone = data.get("phone",barbershop.phone)
    
    db.session.commit()
    return jsonify({"msg": "Barberia " + barbershop.name + " actualizada"}), 200

@app.route("/barbershops/<int:barbershop_id>", methods=["DELETE"])
def delete_barbershop(barbershop_id):
    barbershop = Barbershop.query.get(barbershop_id)
    if not barbershop:
        return jsonify({"msg": "Barberia no encontrada"}), 404
    
    db.session.delete(barbershop)
    db.session.commit()
    return jsonify({"msg": "Barberia eliminada correctamente"}), 200



@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

# any other endpoint will try to serve it like a static file
@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # avoid cache memory
    return response


# this only runs if `$ python src/main.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
