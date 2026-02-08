"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from api.utils import APIException, generate_sitemap
from api.models import db, User, Barbershop, Owner, Barber, Schedule, BarberService, Appointment, AdminUser, BarberBarbershop
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from flask_cors import CORS
from datetime import datetime, timedelta
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager
from flask_jwt_extended import get_jwt_identity

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


app.config["JWT_SECRET_KEY"] = "Sup3rUltr4S3cr3t0"  # MOVER A .ENV!!!
jwt = JWTManager(app)


@app.route("/login/admin", methods=["POST"])
def login_admin():
    email = request.json.get("email")
    password = request.json.get("password")

    user = AdminUser.query.filter_by(email=email, password=password).first()

    if not user:
        return jsonify({"msg": "Email o contraseña incorrectos"}), 401

    access_token = create_access_token(identity=str(
        user.id), additional_claims={"role": "admin"})
    return jsonify({"token": access_token, "user": {"id": user.id, "name": user.name, "role": "admin"}}), 200


@app.route("/login/client", methods=["POST"])
def login_client():
    email = request.json.get("email")
    password = request.json.get("password")

    user = User.query.filter_by(email=email, password=password).first()

    if not user:
        return jsonify({"msg": "Email o contraseña incorrectos"}), 401

    access_token = create_access_token(identity=str(
        user.id), additional_claims={"role": "client"})
    return jsonify({"token": access_token, "user": {"id": user.id, "name": user.name, "role": "client"}}), 200


@app.route("/login/barber", methods=["POST"])
def login_barber():
    email = request.json.get("email")
    password = request.json.get("password")

    barber = Barber.query.filter_by(email=email, password=password).first()

    if not barber:
        return jsonify({"msg": "Email o contraseña incorrectos"}), 401

    access_token = create_access_token(identity=str(
        barber.id), additional_claims={"role": "barber"})
    return jsonify({"token": access_token, "user": {"id": barber.id, "name": barber.name, "role": "barber"}}), 200


@app.route("/login/owner", methods=["POST"])
def login_owner():
    email = request.json.get("email")
    password = request.json.get("password")

    owner = Owner.query.filter_by(email=email, password=password).first()

    if not owner:
        return jsonify({"msg": "Email o contraseña incorrectos"}), 401

    access_token = create_access_token(identity=str(
        owner.id), additional_claims={"role": "owner"})
    return jsonify({"token": access_token, "user": {"id": owner.id, "name": owner.name, "role": "owner"}}), 200


# Zonas privadas por rol
@app.route("/4dm1n1str4c10n")
@jwt_required()
def private_admin():
    identity = get_jwt_identity()
    if identity["role"] != "admin":
        return jsonify({"msg": "No tienes permisos"}), 403
    return jsonify({"msg": f"Bienvenido admin {identity['id']}"}), 200


@app.route("/private_owner")
@jwt_required()
def private_owner():
    owner_id = get_jwt_identity()
    claims = get_jwt()
    if claims.get("role") != "owner":
        return jsonify({"msg": "No tienes permisos"}), 403
    return jsonify({"msg": f"Bienvenido dueño {owner_id}"}), 200


@app.route("/private_barber")
@jwt_required()
def private_barber():
    identity = get_jwt_identity()
    if identity["role"] != "barber":
        return jsonify({"msg": "No tienes permisos"}), 403
    return jsonify({"msg": f"Bienvenido barbero {identity['id']}"}), 200


@app.route("/private_client")
@jwt_required()
def private_client():
    identity = get_jwt_identity()
    if identity["role"] != "client":
        return jsonify({"msg": "No tienes permisos"}), 403
    return jsonify({"msg": f"Bienvenido cliente {identity['id']}"}), 200


# ENDPOINTS DE USUARIOS
@app.route("/users", methods=["GET"])
def get_users():
    users = User.query.order_by(User.id).all()
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

    if User.query.filter_by(email=email).first():
        return jsonify({"message": {"type": "error", "msg": "Email ya registrado"}}), 409

    if User.query.filter_by(phone=phone).first():
        return jsonify({"message": {"type": "error", "msg": "Teléfono ya registrado"}}), 409

    if not name:
        return jsonify({"message": {"type": "error", "msg": "Necesitas ingresar un nombre"}}), 400
    if not last_name:
        return jsonify({"message": {"type": "error", "msg": "Necesitas ingresar un apellido"}}), 400
    if not password:
        return jsonify({"message": {"type": "error", "msg": "Necesitas una contraseña"}}), 400
    if not email:
        return jsonify({"message": {"type": "error", "msg": "Necesitas ingresar un email"}}), 400
    if not phone:
        return jsonify({"message": {"type": "error", "msg": "Necesitas ingresar un teléfono"}}), 400

    new_user = User(name=name, last_name=last_name,
                    password=password, email=email, phone=phone, notes=notes)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": {"type": "success", "msg": f"Usuario {name} {last_name} creado"}}), 201


@app.route("/users/<int:user_id>", methods=["GET"])
def get_single_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": {"type": "error", "msg": "No encontrado"}}), 404
    data = user.serialize()

    return jsonify(data), 200


@app.route("/users/search", methods=["GET"])
def search_user():
    phone = request.args.get("phone")
    user = User.query.filter_by(phone=phone).first()
    if user:
        return jsonify(user.serialize()), 200
    return jsonify({"msg": "No encontrado"}), 404


@app.route("/users/<int:user_id>", methods=["PUT"])
def edit_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": {"type": "error", "msg": "No encontrado"}}), 404

    data = request.json

    if "email" in data:
        existing_email = User.query.filter(
            User.email == data["email"], User.id != user_id).first()
        if existing_email:
            return jsonify({"message": {"type": "error", "msg": "Email ya registrado"}}), 409
        user.email = data["email"]

    if "phone" in data:
        existing_phone = User.query.filter(
            User.phone == data["phone"], User.id != user_id).first()
        if existing_phone:
            return jsonify({"message": {"type": "error", "msg": "Teléfono ya registrado"}}), 409
        user.phone = data["phone"]

    user.name = data.get("name", user.name)
    user.last_name = data.get("last_name", user.last_name)
    user.password = data.get("password", user.password)
    user.notes = data.get("notes", user.notes)

    db.session.commit()
    return jsonify({"message": {"type": "success", "msg": f"Usuario {user.name} actualizado"}}), 200


@app.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": {"type": "error", "msg": "Usuario no encontrado"}}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": {"type": "success", "msg": "Usuario eliminado correctamente"}}), 200


# ENDPOINTS DE BARBERIAS
@app.route("/owners/barbershops")
@jwt_required()
def get_my_barbershops():
    owner_id = get_jwt_identity()
    claims = get_jwt()

    if claims.get("role") != "owner":
        return jsonify({"msg": "Acceso denegado: No eres Owner"}), 403

    barbershops = Barbershop.query.filter_by(owner_id=int(owner_id)).all()
    return jsonify([barb.serialize() for barb in barbershops]), 200


@app.route("/barbershops", methods=["GET"])
def get_barbershops():
    barbershops = Barbershop.query.order_by(Barbershop.id).all()
    data = [barbershop.serialize() for barbershop in barbershops]
    return jsonify(data), 200


@app.route("/barbershops", methods=["POST"])
@jwt_required()
def new_barbershop():
    owner_id = get_jwt_identity()
    claims = get_jwt()

    if claims.get("role") != "owner":
        return jsonify({"message": {"type": "error", "msg": "No tienes permiso"}}), 403

    data = request.json
    new_barbsh = Barbershop(
        name=data.get("name"),
        address=data.get("address"),
        phone=data.get("phone"),
        owner_id=int(owner_id)
    )
    db.session.add(new_barbsh)
    db.session.commit()
    return jsonify({"message": {"type": "success", "msg": f"Barbería {new_barbsh.name} creada"}}), 201


@app.route("/barbershops/<int:barbershop_id>", methods=["GET"])
def get_single_barbershop(barbershop_id):
    barbershop = Barbershop.query.get(barbershop_id)
    if not barbershop:
        return jsonify({"message": {"type": "error", "msg": "No encontrada"}}), 404
    data = barbershop.serialize()

    return jsonify(data), 200


@app.route("/barbershops/<int:barbershop_id>", methods=["PUT"])
@jwt_required()
def update_barbershop(barbershop_id):
    owner_id = get_jwt_identity()
    barbershop = Barbershop.query.get(barbershop_id)

    if not barbershop or str(barbershop.owner_id) != str(owner_id):
        return jsonify({"message": {"type": "error", "msg": "No encontrada o no te pertenece"}}), 404

    data = request.json
    barbershop.name = data.get("name", barbershop.name)
    barbershop.address = data.get("address", barbershop.address)
    barbershop.phone = data.get("phone", barbershop.phone)

    db.session.commit()
    return jsonify({"message": {"type": "success", "msg": f"Barberia {barbershop.name} actualizada"}}), 200


@app.route("/barbershops/<int:shop_id>/barbers", methods=["GET"])
@jwt_required()
def get_barbers_linked(shop_id):
    owner_id = get_jwt_identity()
    claims = get_jwt()

    if claims.get("role") != "owner":
        return jsonify({"message": {"type": "error", "msg": "No tienes permiso"}}), 403

    links = BarberBarbershop.query.filter_by(barbershop_id=shop_id).all()

    return jsonify([
        {
            "id": link.id,
            "barber": {
                "id": link.barber.id,
                "name": link.barber.name,
                "email": link.barber.email
            },
            "status": link.status
        } for link in links
    ]), 200


@app.route("/barbershops/<int:barbershop_id>/services", methods=["GET"])
@jwt_required()
def services_of_barbershop(barbershop_id):
    owner_id = get_jwt_identity()
    claims = get_jwt()

    if claims.get("role") != "owner":
        return jsonify({"message": {"type": "error", "msg": "No tienes permiso"}}), 403

    barbershop = Barbershop.query.get(barbershop_id)
    if not barbershop or barbershop.owner_id != int(owner_id):
        return jsonify({"message": {"type": "error", "msg": "Barbería no encontrada o no te pertenece"}}), 404

    services = Service.query.filter_by(barbershop_id=barbershop_id).all()
    return jsonify([s.serialize() for s in services]), 200


@app.route("/barbershops/<int:barbershop_id>/appointments", methods=["GET"])
@jwt_required()
def appointments_of_barbershop(barbershop_id):
    owner_id = get_jwt_identity()
    claims = get_jwt()

    if claims.get("role") != "owner":
        return jsonify({"message": {"type": "error", "msg": "No tienes permiso"}}), 403

    barbershop = Barbershop.query.get(barbershop_id)
    if not barbershop or barbershop.owner_id != int(owner_id):
        return jsonify({"message": {"type": "error", "msg": "Barbería no encontrada o no te pertenece"}}), 404

    barber_ids = [b.id for b in Barber.query.filter_by(
        barbershop_id=barbershop_id).all()]
    appointments = Appointment.query.filter(
        Appointment.barber_id.in_(barber_ids)).all()
    return jsonify([a.serialize() for a in appointments]), 200


@app.route("/barbershops/<int:barbershop_id>", methods=["DELETE"])
def delete_barbershop(barbershop_id):
    barbershop = Barbershop.query.get(barbershop_id)
    if not barbershop:
        return jsonify({"message": {"type": "error", "msg": "Barberia no encontrada"}}), 404

    db.session.delete(barbershop)
    db.session.commit()
    return jsonify({"message": {"type": "success", "msg": "Barberia eliminada correctamente"}}), 200


# ENDPOINTS DE DUEÑOS

@app.route("/owners", methods=["GET"])
def get_owners():
    owners = Owner.query.order_by(Owner.id).all()
    data = [owner.serialize() for owner in owners]
    return jsonify(data), 200


@app.route("/owners", methods=["POST"])
def new_owner():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")

    if not name:
        return jsonify({"message": {"type": "error", "msg": "Necesitas ingresar un nombre"}}), 400
    if not email:
        return jsonify({"message": {"type": "error", "msg": "Necesitas ingresar un email"}}), 400
    if not phone:
        return jsonify({"message": {"type": "error", "msg": "Necesitas ingresar un teléfono"}}), 400
    if not password:
        return jsonify({"message": {"type": "error", "msg": "Necesitas ingresar una contraseña"}}), 400

    if Owner.query.filter_by(email=email).first():
        return jsonify({"message": {"type": "error", "msg": "Email ya registrado"}}), 409
    if Owner.query.filter_by(phone=phone).first():
        return jsonify({"message": {"type": "error", "msg": "Teléfono ya registrado"}}), 409

    new_owner = Owner(
        name=name,
        email=email,
        phone=phone,
        password=password,

    )
    db.session.add(new_owner)
    db.session.commit()

    return jsonify({"message": {"type": "success", "msg": f"Dueño {name} creado"}}), 201


@app.route("/owners/<int:owner_id>", methods=["GET"])
def get_single_owner(owner_id):

    owner = Owner.query.get(owner_id)
    if not owner:
        return jsonify({"message": {"type": "error", "msg": "Dueño no encontrado"}}), 404
    return jsonify(owner.serialize()), 200


@app.route("/owners/<int:owner_id>", methods=["PUT"])
def edit_owner(owner_id):
    owner = Owner.query.get(owner_id)
    if not owner:
        return jsonify({"message": {"type": "error", "msg": "Dueño no encontrado"}}), 404

    data = request.json

    if "email" in data:
        existing_email = Owner.query.filter(
            Owner.email == data["email"], Owner.id != owner_id).first()
        if existing_email:
            return jsonify({"message": {"type": "error", "msg": "Email ya registrado"}}), 409
        owner.email = data["email"]

    if "phone" in data:
        existing_phone = Owner.query.filter(
            Owner.phone == data["phone"], Owner.id != owner_id).first()
        if existing_phone:
            return jsonify({"message": {"type": "error", "msg": "Teléfono ya registrado"}}), 409
        owner.phone = data["phone"]

    owner.name = data.get("name", owner.name)
    owner.password = data.get("password", owner.password)
    owner.barbershop_id = data.get("barbershop_id", owner.barbershop_id)
    db.session.commit()
    return jsonify({"message": {"type": "success", "msg": f"Dueño {owner.name} actualizado"}}), 200


@app.route("/owners/<int:owner_id>", methods=["DELETE"])
def delete_owner(owner_id):
    owner = Owner.query.get(owner_id)
    if not owner:
        return jsonify({"message": {"type": "error", "msg": "Dueño no encontrado"}}), 404

    db.session.delete(owner)
    db.session.commit()
    return jsonify({"message": {"type": "success", "msg": f"Dueño {owner.name} eliminado correctamente"}}), 200


# ENDPOINTS DE SERVICIOS

@app.route("/services", methods=["GET"])
def get_services():
    all_services = Service.query.order_by(Service.id).all()
    data = [service.serialize() for service in all_services]
    return jsonify(data), 200


@app.route("/services", methods=["POST"])
def new_service():
    data = request.json
    name = data.get("name")
    duration = data.get("duration")
    price = data.get("price")
    barbershop_id = data.get("barbershop_id")

    if not name:
        return jsonify({"message": {"type": "error", "msg": "Necesitas ingresar un nombre"}}), 400
    if not duration:
        return jsonify({"message": {"type": "error", "msg": "Necesitas añadir su duración"}}), 400
    if not price:
        return jsonify({"message": {"type": "error", "msg": "Necesitas indicar el precio"}}), 400
    if not barbershop_id:
        return jsonify({"message": {"type": "error", "msg": "Necesitas ingresar una barbería"}}), 400

    if Service.query.filter_by(name=name, barbershop_id=barbershop_id).first():
        return jsonify({"message": {"type": "error", "msg": "Servicio ya existe en esta barbería"}}), 409

    new_service = Service(name=name, duration=duration,
                          price=price, barbershop_id=barbershop_id)
    db.session.add(new_service)
    db.session.commit()

    return jsonify({"message": {"type": "success", "msg": f"Servicio {name} creado"}}), 201


@app.route("/services/<int:service_id>", methods=["GET"])
def get_single_service(service_id):
    service = Service.query.get(service_id)
    if not service:
        return jsonify({"message": {"type": "error", "msg": "No encontrado"}}), 404
    data = service.serialize()

    return jsonify(data), 200


@app.route("/services/<int:service_id>", methods=["PUT"])
def edit_service(service_id):
    service = Service.query.get(service_id)
    if not service:
        return jsonify({"message": {"type": "error", "msg": "No encontrado"}}), 404

    data = request.json

    if "name" in data:
        existing_service = Service.query.filter(
            Service.name == data["name"],
            Service.barbershop_id == service.barbershop_id,
            Service.id != service_id
        ).first()
        if existing_service:
            return jsonify({"message": {"type": "error", "msg": "Servicio ya existe en esta barbería"}}), 409
        service.name = data["name"]

    service.duration = data.get("duration", service.duration)
    service.price = data.get("price", service.price)
    service.barbershop_id = data.get("barbershop_id", service.barbershop_id)

    db.session.commit()
    return jsonify({"message": {"type": "success", "msg": f"Servicio {service.name} actualizado"}}), 200


@app.route("/services/<int:service_id>", methods=["DELETE"])
def delete_service(service_id):
    service = Service.query.get(service_id)
    if not service:
        return jsonify({"message": {"type": "error", "msg": "Servicio no encontrado"}}), 404

    db.session.delete(service)
    db.session.commit()
    return jsonify({"message": {"type": "success", "msg": "Servicio eliminado correctamente"}}), 200


# ENDPOINTS DE BARBEROS

@app.route("/barbers", methods=["GET"])
def get_barber():
    barbers = Barber.query.order_by(Barber.id).all()
    data = [barber.serialize() for barber in barbers]
    return jsonify(data), 200


@app.route("/barbers", methods=["POST"])
def new_barber():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name:
        return jsonify({"message": {"type": "error", "msg": "Necesitas ingresar un nombre"}}), 400
    if not email:
        return jsonify({"message": {"type": "error", "msg": "Necesitas añadir un email"}}), 400
    if not password:
        return jsonify({"message": {"type": "error", "msg": "Necesitas indicar una contraseña"}}), 400

    if Barber.query.filter_by(email=email).first():
        return jsonify({"message": {"type": "error", "msg": "Email ya registrado"}}), 409

    new_barber = Barber(name=name, email=email,
                        password=password)
    db.session.add(new_barber)
    db.session.commit()

    return jsonify({"message": {"type": "success", "msg": f"Barbero {name} creado"}}), 201


@app.route("/barbers/<int:barber_id>", methods=["GET"])
def get_single_barber(barber_id):
    barber = Barber.query.get(barber_id)
    if not barber:
        return jsonify({"message": {"type": "error", "msg": "No encontrado"}}), 404
    data = barber.serialize()

    return jsonify(data), 200


@app.route("/barbers/<int:barber_id>", methods=["PUT"])
def edit_barber(barber_id):
    barber = Barber.query.get(barber_id)
    if not barber:
        return jsonify({"message": {"type": "error", "msg": "No encontrado"}}), 404

    data = request.json

    if "email" in data:
        existing_email = Barber.query.filter(
            Barber.email == data["email"], Barber.id != barber_id).first()
        if existing_email:
            return jsonify({"message": {"type": "error", "msg": "Email ya registrado"}}), 409
        barber.email = data["email"]

    barber.name = data.get("name", barber.name)
    barber.password = data.get("password", barber.password)
    barber.barbershop_id = data.get("barbershop_id", barber.barbershop_id)
    db.session.commit()
    return jsonify({"message": {"type": "success", "msg": f"Barbero {barber.name} actualizado"}}), 200


@app.route("/barbers/<int:barber_id>", methods=["DELETE"])
def delete_barber(barber_id):
    barber = Barber.query.get(barber_id)
    if not barber:
        return jsonify({"message": {"type": "error", "msg": "Barbero no encontrado"}}), 404

    db.session.delete(barber)
    db.session.commit()
    return jsonify({"message": {"type": "success", "msg": "Barbero eliminado correctamente"}}), 200


@app.route("/barbershops/<int:shop_id>/barbers", methods=["GET"])
@jwt_required()
def get_barbers(shop_id):
    barbershop = Barbershop.query.get(shop_id)
    if not barbershop:
        return jsonify({"message": {"type": "error", "msg": "Barbería no encontrada"}}), 404

    links = BarberBarbershop.query.filter_by(barbershop_id=shop_id).all()

    return jsonify([{
        "id": link.id,
        "barber": {
            "id": link.barber.id,
            "name": link.barber.name,
            "email": link.barber.email
        },
        "status": link.status
    } for link in links]), 200


# ENDPOINTS DE INVITACIONES DE BARBEROS A BARBERIAS

@app.route("/invitations", methods=["POST"])
@jwt_required()
def invite_barber():
    owner_id = get_jwt_identity()
    claims = get_jwt()

    if claims.get("role") != "owner":
        return jsonify({"message": {"type": "error", "msg": "No tienes permiso"}}), 403

    data = request.get_json()
    email = data.get("email")
    shop_id = data.get("barbershop_id")

    if not email:
        return jsonify({"message": {"type": "error", "msg": "Es necesario un email"}}), 400

    barbershop = Barbershop.query.filter_by(
        id=shop_id,
        owner_id=owner_id
    ).first()

    if not barbershop:
        return jsonify({"message": {"type": "error", "msg": "Hay un error con tus barberías"}}), 404

    barber = Barber.query.filter_by(email=email).first()
    if not barber:
        return jsonify({"message": {"type": "error", "msg": "No existe ningún barbero con ese email"}}), 404

    pending = BarberBarbershop.query.filter_by(
        barber_id=barber.id,
        barbershop_id=shop_id, status="pending"
    ).first()

    if pending:
        return jsonify({"message": {"type": "error", "msg": "Ya hay una solicitud pendiente"}}), 400

    existing = BarberBarbershop.query.filter_by(
        barber_id=barber.id,
        barbershop_id=shop_id
    ).first()

    if existing:
        return jsonify({"message": {"type": "error", "msg": "Este barbero ya forma parte de la barbería"}}), 400

    invite = BarberBarbershop(
        barber_id=barber.id,
        barbershop_id=shop_id,
        status="pending"
    )

    db.session.add(invite)
    db.session.commit()

    return jsonify({"message": {"type": "success", "msg": "Solicitud enviada correctamente"}}), 201


@app.route("/invitations", methods=["GET"])
@jwt_required()
def get_barber_invitations():
    current_user = get_jwt_identity()
    claims = get_jwt()

    if claims.get("role") != "barber":
        return jsonify({"message": "No tienes permiso"}), 403

    invitations = BarberBarbershop.query.filter(
        BarberBarbershop.barber_id == current_user,
        BarberBarbershop.status.in_(["pending", "accepted"])
    ).all()

    return jsonify([
        {
            "id": invite.id,
            "barbershop": {
                "id": invite.barbershop.id,
                "name": invite.barbershop.name
            },
            "status": invite.status
        }
        for invite in invitations
    ]), 200


@app.route("/invitations/<int:invitation_id>", methods=["PUT"])
@jwt_required()
def accept_barber_invitations(invitation_id):
    current_user = get_jwt_identity()
    claims = get_jwt()

    if claims.get("role") != "barber":
        return jsonify({"message": "No tienes permiso"}), 403

    invite = BarberBarbershop.query.filter_by(
        id=invitation_id,
        barber_id=current_user,
        status="pending"
    ).first()

    if not invite:
        return jsonify({"message": "No existe"}), 404

    invite.status = "accepted"
    db.session.commit()

    return jsonify({"message": "Invitación aceptada"}), 200


@app.route("/invitations/<int:invitation_id>", methods=["DELETE"])
@jwt_required()
def delete_barber_invitations(invitation_id):
    user_id = get_jwt_identity()
    claims = get_jwt()

    if claims.get("role") != "barber":
        return jsonify({"message": "No tienes permiso"}), 403

    invite = BarberBarbershop.query.filter_by(
        id=invitation_id,
        barber_id=user_id,
    ).first()

    if not invite:
        return jsonify({"message": "No autorizado o no existe"}), 404

    db.session.delete(invite)
    db.session.commit()

    return jsonify({"message": "Invitación eliminada correctamente"}), 200


# ENDPOINTS DE HORARIOS

@app.route("/schedules", methods=["GET"])
@jwt_required()
def get_barber_schedules():
    current_barber_id = get_jwt_identity()

    schedules = db.session.query(Schedule).join(BarberBarbershop).filter(
        BarberBarbershop.barber_id == current_barber_id
    ).all()

    data = [s.serialize() for s in schedules]
    return jsonify(data), 200


@app.route("/schedules", methods=["POST"])
@jwt_required()
def new_schedule():
    data = request.json
    invitation_id = data.get("invitation_id")
    day_of_week = data.get("day_of_week")
    start_time_str = data.get("start_time")
    end_time_str = data.get("end_time")

    if not all([invitation_id, day_of_week, start_time_str, end_time_str]):
        return jsonify({"message": {"type": "error", "msg": "Faltan datos obligatorios"}}), 400

    try:
        new_start = datetime.strptime(start_time_str, "%H:%M").time()
        new_end = datetime.strptime(end_time_str, "%H:%M").time()
    except ValueError:
        return jsonify({"message": {"type": "error", "msg": "Formato de hora inválido (HH:MM)"}}), 400

    if new_end <= new_start:
        return jsonify({"message": {"type": "error", "msg": "La hora de fin debe ser mayor a la de inicio"}}), 400

    current_barber_id = get_jwt_identity()

    overlapping = db.session.query(Schedule).join(BarberBarbershop).filter(
        BarberBarbershop.barber_id == current_barber_id,
        Schedule.day_of_week == day_of_week
    ).all()

    for s in overlapping:
        if new_start < s.end_time and new_end > s.start_time:
            return jsonify({
                "message": {
                    "type": "error",
                    "msg": f"Ya tienes un turno el {day_of_week} de {s.start_time.strftime('%H:%M')} a {s.end_time.strftime('%H:%M')}."
                }
            }), 409

    new_s = Schedule(
        start_time=new_start,
        end_time=new_end,
        day_of_week=day_of_week,
        barber_barbershop_id=invitation_id
    )

    try:
        db.session.add(new_s)
        db.session.commit()
        return jsonify({
            "message": {"type": "success", "msg": "Horario guardado correctamente"},
            "schedule": new_s.serialize()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": {"type": "error", "msg": "Error al guardar"}}), 500

@app.route("/schedules/<int:schedule_id>", methods=["GET"])
def get_single_schedule(schedule_id):
    schedule = Schedule.query.get(schedule_id)
    if not schedule:
        return jsonify({"message": {"type": "error", "msg": "No encontrado"}}), 404
    data = schedule.serialize()

    return jsonify(data), 200


@app.route("/schedules/<int:schedule_id>", methods=["PUT"])
@jwt_required()
def edit_schedule(schedule_id):
    current_barber_id = get_jwt_identity()
    schedule = Schedule.query.get(schedule_id)
    
    if not schedule:
        return jsonify({"message": {"type": "error", "msg": "Horario no encontrado"}}), 404

    if str(schedule.invitations.barber_id) != str(current_barber_id):
        return jsonify({"message": {"type": "error", "msg": "No tienes permiso para editar este horario"}}), 403

    data = request.json
    
    new_day = data.get("day_of_week", schedule.day_of_week)
    
    try:
        new_start = datetime.strptime(data["start_time"], "%H:%M").time() if "start_time" in data else schedule.start_time
        new_end = datetime.strptime(data["end_time"], "%H:%M").time() if "end_time" in data else schedule.end_time
    except ValueError:
        return jsonify({"message": {"type": "error", "msg": "Formato de hora inválido"}}), 400

    if new_end <= new_start:
        return jsonify({"message": {"type": "error", "msg": "La hora de fin debe ser mayor que la de inicio"}}), 400

    
    overlapping = db.session.query(Schedule).join(BarberBarbershop).filter(
        BarberBarbershop.barber_id == current_barber_id,
        Schedule.day_of_week == new_day,
        Schedule.id != schedule_id 
    ).all()

    for s in overlapping:
        if new_start < s.end_time and new_end > s.start_time:
            return jsonify({
                "message": {
                    "type": "error",
                    "msg": f"Conflicto: Ya tienes un turno el {new_day} de {s.start_time.strftime('%H:%M')} a {s.end_time.strftime('%H:%M')}"
                }
            }), 409

    schedule.day_of_week = new_day
    schedule.start_time = new_start
    schedule.end_time = new_end

    try:
        db.session.commit()
        return jsonify({"message": {"type": "success", "msg": "Horario actualizado correctamente"}}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": {"type": "error", "msg": "Error al guardar cambios"}}), 500

@app.route("/schedules/<int:schedule_id>", methods=["DELETE"])
def delete_schedule(schedule_id):
    schedule = Schedule.query.get(schedule_id)
    if not schedule:
        return jsonify({"message": {"type": "error", "msg": "Horario no encontrado"}}), 404

    db.session.delete(schedule)
    db.session.commit()
    return jsonify({"message": {"type": "success", "msg": "Horario eliminado correctamente"}}), 200


# ENDPOINTS DE BARBERO Y SUS SERVICIOS

@app.route("/barber_services", methods=["GET"])
@jwt_required()
def get_services_of_barber():
    current_barber_id = get_jwt_identity()
    print(f"DEBUG: Buscando servicios para el barbero ID: {current_barber_id}")
    services = BarberService.query.filter_by(barber_id=current_barber_id).all()
    return jsonify([s.serialize() for s in services]), 200


@app.route("/barber_services", methods=["POST"])
@jwt_required()
def new_barber_service():
    data = request.json
    # Usamos el ID del token por seguridad, así nadie crea servicios para otros
    current_barber_id = get_jwt_identity() 
    
    name = data.get("name")
    price = data.get("price")
    duration = data.get("duration")

    # Validación limpia: solo lo que realmente usamos
    if not all([name, price, duration]):
        return jsonify({"message": {"type": "error", "msg": "Faltan datos: nombre, precio y duración son obligatorios"}}), 400

    try:
        new_bs = BarberService(
            barber_id=current_barber_id,
            name=name,
            price=price,
            duration=duration
        )

        db.session.add(new_bs)
        db.session.commit()

        return jsonify({"message": {"type": "success", "msg": "Servicio creado con éxito"}}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": {"type": "error", "msg": str(e)}}), 500


@app.route("/barber_services/<int:barber_service_id>", methods=["PUT"])
def edit_barber_service(barber_service_id):
    bs = BarberService.query.get(barber_service_id)
    if not bs:
        return jsonify({"message": {"type": "error", "msg": "No encontrado"}}), 404

    data = request.json
    bs.price = data.get("price", bs.price)
    bs.duration = data.get("duration", bs.duration)

    db.session.commit()
    return jsonify({"message": {"type": "success", "msg": "Servicio actualizado"}}), 200


@app.route("/barber_services/<int:barber_service_id>", methods=["GET"])
def get_barber_service(barber_service_id):
    barber_service = BarberService.query.get(barber_service_id)
    if not barber_service:
        return jsonify({"message": {"type": "error", "msg": "No encontrado"}}), 404
    data = barber_service.serialize()

    return jsonify(data), 200


@app.route("/barber_services/<int:barber_service_id>", methods=["DELETE"])
def delete_barber_service(barber_service_id):
    barber_service = BarberService.query.get(barber_service_id)
    if not barber_service:
        return jsonify({"message": {"type": "error", "msg": "Relación barbero/servicio no encontrada"}}), 404

    db.session.delete(barber_service)
    db.session.commit()
    return jsonify({"message": {"type": "success", "msg": "Relación barbero/servicio eliminada correctamente"}}), 200


# ENDPOINTS PARA LAS RESERVAS DE CITAS

@app.route("/appointments", methods=["GET"])
def get_appointments():
    barbershop_id = request.args.get("barbershop_id")
    date_str = request.args.get("date")

    query = Appointment.query

    if barbershop_id:
        query = query.join(Barber).filter(Barber.barbershop_id == barbershop_id)

    if date_str:
        query = query.filter(Appointment.date.contains(date_str))

    appointments = query.order_by(Appointment.date).all()
    return jsonify([appointment.serialize() for appointment in appointments]), 200


@app.route("/appointments", methods=["POST"])
def new_appointment():
    data = request.json

    barber_service = BarberService.query.get(data.get("barber_service_id"))
    if not barber_service:
        return jsonify({"message": {"type": "error", "msg": "El servicio seleccionado no existe"}}), 404

    # 1. Procesar fechas
    try:
        if 'T' in data.get('date', ''):
            start_date = datetime.fromisoformat(data['date'])
        else:
            start_date = datetime.strptime(f"{data['date']} {data['time']}", "%Y-%m-%d %H:%M")
    except Exception as e:
        return jsonify({"message": {"type": "error", "msg": "Formato de fecha inválido"}}), 400

    new_end_time = start_date + timedelta(minutes=barber_service.duration)
    day_name_en = start_date.strftime('%A')
    barbershop_id = data.get("barbershop_id")

    # 2. Validar Relación con la Sede (Madre o Nona)
    relation = BarberBarbershop.query.filter_by(
        barber_id=barber_service.barber_id,
        barbershop_id=barbershop_id,
        status="accepted"
    ).first()

    if not relation:
        return jsonify({"message": {"type": "error", "msg": "No hay relación activa con esta sede."}}), 400

    # 3. Validar Horario Laboral
    work_schedule = Schedule.query.filter_by(
        barber_barbershop_id=relation.id,
        day_of_week=day_name_en
    ).first()

    if not work_schedule:
        return jsonify({"message": {"type": "error", "msg": f"El barbero no trabaja los {day_name_en}."}}), 400

    # Comprobación de hora con Debug
    appt_time = start_date.time()
    start = work_schedule.start_time
    end = work_schedule.end_time

    print(f"DEBUG: Cita {appt_time} | Turno {start} a {end}")

    if not (start <= appt_time < end):
        return jsonify({
            "message": {
                "type": "error", 
                "msg": f"Fuera de horario. El turno es de {start.strftime('%H:%M')} a {end.strftime('%H:%M')}."
            }
        }), 400

    # 4. Validar Colisiones (Ocupado con otro cliente)
    collision = Appointment.query.filter(
        Appointment.barber_id == barber_service.barber_id,
        Appointment.date < new_end_time,
        Appointment.end_time > start_date
    ).first()

    if collision:
        return jsonify({"message": {"type": "error", "msg": f"El barbero está ocupado hasta las {collision.end_time.strftime('%H:%M')}"}}), 400

    # 5. Crear la cita (Usando tu nuevo __init__)
    new_app = Appointment(
        date=start_date,
        end_time=new_end_time,
        user_id=data.get("user_id"),
        barber_id=barber_service.barber_id,
        barber_service_id=barber_service.id,
        barbershop_id=barbershop_id,
        notes=data.get("notes")
    )

    try:
        db.session.add(new_app)
        db.session.commit()
        return jsonify({"message": {"type": "success", "msg": "Reserva creada con éxito"}}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": {"type": "error", "msg": str(e)}}), 500


@app.route("/appointments/<int:appointment_id>", methods=["PUT"])
def edit_appointment(appointment_id):
    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return jsonify({"message": {"type": "error", "msg": "Reserva no encontrada"}}), 404

    data = request.json
    bs_id = data.get("barber_service_id", appointment.barber_service_id)
    barber_service = BarberService.query.get(bs_id)
    
    if not barber_service:
        return jsonify({"message": {"type": "error", "msg": "El servicio no existe"}}), 404

    try:
        if 'T' in data.get('date', ''):
            new_start_date = datetime.fromisoformat(data['date'])
        else:
            new_start_date = datetime.strptime(f"{data['date']} {data['time']}", "%Y-%m-%d %H:%M")
    except Exception:
        new_start_date = appointment.date

    new_end_time = new_start_date + timedelta(minutes=barber_service.duration)
    day_name_en = new_start_date.strftime('%A')
    shop_id = data.get("barbershop_id", appointment.barbershop_id)

    relation = BarberBarbershop.query.filter_by(
        barber_id=barber_service.barber_id,
        barbershop_id=shop_id,
        status="accepted"
    ).first()

    if not relation:
        return jsonify({"message": {"type": "error", "msg": "Sin relación activa con la sede."}}), 400

    work_schedule = Schedule.query.filter_by(
        barber_barbershop_id=relation.id,
        day_of_week=day_name_en
    ).first()

    if not work_schedule:
        return jsonify({"message": {"type": "error", "msg": f"No hay turno para el {day_name_en}."}}), 400

    if not (work_schedule.start_time <= new_start_date.time() < work_schedule.end_time):
        return jsonify({"message": {"type": "error", "msg": "La nueva hora está fuera de turno."}}), 400

    collision = Appointment.query.filter(
        Appointment.id != appointment_id,
        Appointment.barber_id == barber_service.barber_id,
        Appointment.date < new_end_time,
        Appointment.end_time > new_start_date
    ).first()

    if collision:
        return jsonify({"message": {"type": "error", "msg": f"Ocupado hasta las {collision.end_time.strftime('%H:%M')}"}}), 400

    appointment.date = new_start_date
    appointment.end_time = new_end_time
    appointment.user_id = data.get("user_id", appointment.user_id)
    appointment.barbershop_id = shop_id
    appointment.barber_id = barber_service.barber_id
    appointment.barber_service_id = barber_service.id
    appointment.notes = data.get("notes", appointment.notes)

    try:
        db.session.commit()
        return jsonify({"message": {"type": "success", "msg": "Reserva actualizada"}}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": {"type": "error", "msg": str(e)}}), 500


@app.route("/appointments/<int:appointment_id>", methods=["DELETE"])
def delete_appointment(appointment_id):
    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return jsonify({"message": {"type": "error", "msg": "Reserva no encontrada"}}), 404

    db.session.delete(appointment)
    db.session.commit()

    return jsonify({"message": {"type": "success", "msg": "Reserva eliminada correctamente"}}), 200

@app.route("/appointments/<int:appointment_id>/status", methods=["PUT"])
@jwt_required()
def change_appointment_status(appointment_id):
    current_user_id = get_jwt_identity()
    data = request.json
    new_status = data.get("status")
    
    valid_statuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show']
    if new_status not in valid_statuses:
        return jsonify({"message": {"type": "error", "msg": "Estado no válido"}}), 400

    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return jsonify({"message": {"type": "error", "msg": "Cita no encontrada"}}), 404

    if appointment.barber_id != current_user_id:
        return jsonify({"message": {"type": "error", "msg": "No tienes permiso para cambiar el estado de esta cita"}}), 403
    
    appointment.status = new_status
    
    try:
        db.session.commit()
        return jsonify({
            "message": {"type": "success", "msg": f"Cita marcada como {new_status}"},
            "appointment": appointment.serialize()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": {"type": "error", "msg": "Error al actualizar estado"}}), 500
    
# NO TOCAR
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
