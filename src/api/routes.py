"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import request, jsonify, Blueprint, send_from_directory, current_app
from api.models import db, User
from api.utils import generate_sitemap
from flask_cors import CORS
import os
from api.utils import generate_sitemap
from api.models import db, User, Barbershop, Owner, Barber, Schedule, BarberService, Appointment, AdminUser, BarberBarbershop, Conversation, ChatMessage
from datetime import datetime, timedelta, timezone
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from flask_cors import CORS
from google import genai
from google.genai import types
import requests
import calendar
import base64
import deepl
import stripe
from dotenv import load_dotenv

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

load_dotenv()
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")


@api.route("/login/admin", methods=["POST"])
def login_admin():
    email = request.json.get("email")
    password = request.json.get("password")

    user = AdminUser.query.filter_by(email=email).first()

    if user and user.check_password(password):
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={"role": "admin"}
        )
        return jsonify({
            "token": access_token,
            "user": {"id": user.id, "name": user.name, "role": "admin"}
        }), 200
    return jsonify({"msg": "Email o contraseña incorrectos"}), 401


@api.route("/login/client", methods=["POST"])
def login_client():
    email = request.json.get("email")
    password = request.json.get("password")

    client = User.query.filter_by(email=email).first()

    if client and client.check_password(password):
        access_token = create_access_token(
            identity=str(client.id),
            additional_claims={"role": "client"}
        )
        return jsonify({
            "token": access_token,
            "user": {"id": client.id, "name": client.name, "role": "client"}
        }), 200
    return jsonify({"msg": "Email o contraseña incorrectos"}), 401


@api.route("/login/barber", methods=["POST"])
def login_barber():
    email = request.json.get("email")
    password = request.json.get("password")

    barber = Barber.query.filter_by(email=email).first()

    if barber and barber.check_password(password):
        access_token = create_access_token(
            identity=str(barber.id),
            additional_claims={"role": "barber"}
        )
        return jsonify({
            "token": access_token,
            "user": {"id": barber.id, "name": barber.name, "role": "barber"}
        }), 200
    return jsonify({"msg": "Email o contraseña incorrectos"}), 401


@api.route("/login/owner", methods=["POST"])
def login_owner():
    email = request.json.get("email")
    password = request.json.get("password")

    owner = Owner.query.filter_by(email=email).first()

    if owner and owner.check_password(password):
        access_token = create_access_token(
            identity=str(owner.id),
            additional_claims={"role": "owner"}
        )
        return jsonify({
            "token": access_token,
            "user": {"id": owner.id, "name": owner.name, "role": "owner"}
        }), 200
    return jsonify({"msg": "Email o contraseña incorrectos"}), 401


# Zonas privadas por rol
@api.route("/4dm1n1str4c10n")
@jwt_required()
def private_admin():
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"msg": "No tienes permisos"}), 403
    return jsonify({"msg": f"Hola de nuevo, {current_user_id}"}), 200


@api.route("/private_owner")
@jwt_required()
def private_owner():
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    if claims.get("role") != "owner":
        return jsonify({"msg": "No tienes permisos"}), 403
    return jsonify({"msg": f"Hola de nuevo, {current_user_id}"}), 200


@api.route("/private_barber")
@jwt_required()
def private_barber():
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    if claims.get("role") != "barber":
        return jsonify({"msg": "No tienes permisos"}), 403
    return jsonify({"msg": f"Hola de nuevo, {current_user_id}"}), 200


@api.route("/private_client")
@jwt_required()
def private_client():
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    if claims.get("role") != "client":
        return jsonify({"msg": "No tienes permisos"}), 403
    return jsonify({"msg": f"Hola de nuevo, {current_user_id}"}), 200


@api.route("/adminusers", methods=["GET"])
@jwt_required()
def get_adminusers():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"msg": "No tienes permisos"}), 403

    adminusers = AdminUser.query.order_by(AdminUser.id).all()
    data = [adminuser.serialize() for adminuser in adminusers]
    return jsonify(data), 200


@api.route("/admin/<string:model_name>", methods=["GET"])
@jwt_required()
def get_admin_data(model_name):
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"msg": "Acceso restringido a administradores"}), 403

    models_map = {
        "users": User,
        "barbershops": Barbershop,
        "owners": Owner,
        "appointments": Appointment,
        "adminusers": AdminUser,
        "barbers": Barber,
        "barber_services": BarberService,
        "schedules": Schedule,
        "invitations": BarberBarbershop,
        "conversations": Conversation,
        "messages": ChatMessage
    }

    model = models_map.get(model_name)
    if not model:
        return jsonify({"msg": "Tabla no encontrada"}), 404

    items = model.query.all()
    return jsonify([item.serialize() for item in items]), 200


# ENDPOINTS DE USUARIOS
@api.route("/users", methods=["GET"])
@jwt_required()
def get_users():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"msg": "Acceso restringido"}), 403
    users = User.query.order_by(User.id).all()
    data = [user.serialize() for user in users]
    return jsonify(data), 200


@api.route("/users", methods=["POST"])
def new_user():
    data = request.json
    name = data.get("name")
    last_name = data.get("last_name")
    password = data.get("password")
    email = data.get("email")
    phone = data.get("phone")
    notes = data.get("notes")
    client_profile_image = data.get("client_profile_image")

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
    if len(password) < 8:
        return jsonify({"message": {"type": "error", "msg": "La contraseña debe tener al menos 8 caracteres"}}), 400
    if len(phone) < 8:
        return jsonify({"message": {"type": "error", "msg": "Introduce un número de teléfono correcto"}}), 400
    if not email:
        return jsonify({"message": {"type": "error", "msg": "Necesitas ingresar un email"}}), 400
    if not phone:
        return jsonify({"message": {"type": "error", "msg": "Necesitas ingresar un teléfono"}}), 400

    new_user = User(name=name, last_name=last_name, email=email, phone=phone,
                    notes=notes, client_profile_image=client_profile_image)

    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": {"type": "success", "msg": f"Usuario {name} {last_name} creado"}}), 201


@api.route("/users/<int:user_id>", methods=["GET"])
@jwt_required()
def get_single_user(user_id):
    current_user_id = get_jwt_identity()
    claims = get_jwt()

    if str(current_user_id) != str(user_id) and claims.get("role") != "admin":
        return jsonify({"msg": "No autorizado"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": {"type": "error", "msg": "Usuario no encontrado"}}), 404

    data = user.serialize()

    return jsonify(data), 200


@api.route("/users/search", methods=["GET"])
@jwt_required()
def search_user():
    claims = get_jwt()
    if claims.get("role") not in ["admin", "owner", "barber"]:
        return jsonify({"msg": "No tienes permiso para buscar usuarios"}), 403

    phone = request.args.get("phone")
    user = User.query.filter_by(phone=phone).first()
    if user:
        return jsonify(user.serialize()), 200
    return jsonify({"msg": "No encontrado"}), 404


@api.route("/users/<int:user_id>", methods=["PUT"])
@jwt_required()
def edit_user(user_id):
    current_user_id = get_jwt_identity()
    claims = get_jwt()

    if str(current_user_id) != str(user_id) and claims.get("role") != "admin":
        return jsonify({"message": {"type": "error", "msg": "No tienes permiso"}}), 403

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
        if len(user.phone) < 8:
            return jsonify({"message": {"type": "error", "msg": "Introduce un número de teléfono correcto"}}), 400

    user.name = data.get("name", user.name)
    user.last_name = data.get("last_name", user.last_name)
    user.notes = data.get("notes", user.notes)
    user.client_profile_image = data.get(
        "client_profile_image", user.client_profile_image)

    if "password" in data and data["password"]:
        user.set_password(data["password"])

    db.session.commit()
    return jsonify({"message": {"type": "success", "msg": f"Usuario {user.name} actualizado"}}), 200


@api.route("/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    current_user_id = get_jwt_identity()
    claims = get_jwt()

    if str(current_user_id) != str(user_id) and claims.get("role") != "admin":
        return jsonify({"message": {"type": "error", "msg": "No autorizado"}}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": {"type": "error", "msg": "Usuario no encontrado"}}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": {"type": "success", "msg": "Usuario eliminado correctamente"}}), 200


# ENDPOINTS DE BARBERIAS
@api.route("/owners/barbershops")
@jwt_required()
def get_my_barbershops():
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role")

    if role not in ["owner", "admin"]:
        return jsonify({"msg": "Acceso denegado: No tienes permisos"}), 403

    if role == "admin":
        barbershops = Barbershop.query.all()
    else:
        barbershops = Barbershop.query.filter_by(
            owner_id=int(current_user_id)).all()
    return jsonify([barb.serialize() for barb in barbershops]), 200


@api.route("/barbershops", methods=["GET"])
def get_barbershops():
    barbershops = Barbershop.query.order_by(Barbershop.id).all()
    data = [barbershop.serialize()
            for barbershop in barbershops if barbershop.active_subscription()]
    return jsonify(data), 200


@api.route("/barbershops", methods=["POST"])
@jwt_required()
def new_barbershop():
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role")

    if role not in ["owner", "admin"]:
        return jsonify({"msg": "Acceso denegado: No tienes permisos"}), 403

    data = request.json

    if not data.get("name") or not data.get("address"):
        return jsonify({"message": {"type": "error", "msg": "Nombre y dirección son obligatorios"}}), 400

    owner_id = data.get(
        "owner_id", current_user_id) if role == "admin" else current_user_id

    if len(data.get("phone")) < 8:
        return jsonify({"message": {"type": "error", "msg": "Introduce un número de teléfono correcto"}}), 400

    new_barbsh = Barbershop(
        name=data.get("name"),
        address=data.get("address"),
        phone=data.get("phone"),
        barbershop_description=data.get("barbershop_description"),
        barbershop_image=data.get("barbershop_image"),
        latitude=data.get("latitude"),
        longitude=data.get("longitude"),
        working_hours=data.get("working_hours"),
        owner_id=int(owner_id)
    )

    db.session.add(new_barbsh)
    db.session.commit()
    return jsonify({"message": {"type": "success", "msg": f"Barbería {new_barbsh.name} creada"}}), 201


@api.route("/barbershops/<int:barbershop_id>", methods=["GET"])
def get_single_barbershop(barbershop_id):
    barbershop = Barbershop.query.get(barbershop_id)
    if not barbershop:
        return jsonify({"message": {"type": "error", "msg": "No encontrada"}}), 404
    data = barbershop.serialize()

    return jsonify(data), 200


@api.route("/barbershops/<int:barbershop_id>", methods=["PUT"])
@jwt_required()
def update_barbershop(barbershop_id):
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role")

    if role not in ["owner", "admin"]:
        return jsonify({"msg": "Acceso denegado"}), 403

    barbershop = Barbershop.query.get(barbershop_id)
    if not barbershop:
        return jsonify({"message": {"type": "error", "msg": "Barberia no encontrada"}}), 404

    if role == "owner" and str(barbershop.owner_id) != str(current_user_id):
        return jsonify({"msg": "Esta barbería no te pertenece"}), 403

    data = request.json

    barbershop.name = data.get("name", barbershop.name)
    barbershop.address = data.get("address", barbershop.address)
    barbershop.phone = data.get("phone", barbershop.phone)
    barbershop.barbershop_description = data.get(
        "barbershop_description", barbershop.barbershop_description)
    barbershop.barbershop_image = data.get(
        "barbershop_image", barbershop.barbershop_image)

    barbershop.latitude = data.get("latitude", barbershop.latitude)
    barbershop.longitude = data.get("longitude", barbershop.longitude)
    barbershop.working_hours = data.get(
        "working_hours", barbershop.working_hours)

    db.session.commit()
    return jsonify({"message": {"type": "success", "msg": f"Barberia {barbershop.name} actualizada"}}), 200


@api.route("/barbershops/<int:shop_id>/barbers", methods=["GET"])
@jwt_required()
def get_barbers_linked(shop_id):
    claims = get_jwt()
    role = claims.get("role")

    barbershop = Barbershop.query.get(shop_id)
    if not barbershop:
        return jsonify({"message": {"type": "error", "msg": "Barbería no encontrada"}}), 404

    links = BarberBarbershop.query.filter_by(barbershop_id=shop_id).all()

    results = []
    for link in links:
        if not link.barber:
            continue

        schedules = [s.serialize() for s in link.schedule]

        results.append({
            "id": link.id,
            "barbershop_id": link.barbershop_id,
            "barber": {
                "id": link.barber.id,
                "name": link.barber.name,
                "email": link.barber.email,
                "barber_profile_image": link.barber.barber_profile_image
            },
            "status": link.status,
            "schedules": schedules
        })

    return jsonify(results), 200


@api.route("/barbershops/<int:barbershop_id>/appointments", methods=["GET"])
@jwt_required()
def appointments_of_barbershop(barbershop_id):
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role")

    if role not in ["owner", "admin", "barber", "client"]:
        return jsonify({"msg": "Acceso denegado"}), 403

    barbershop = Barbershop.query.get(barbershop_id)
    if not barbershop:
        return jsonify({"msg": "Barbería no encontrada"}), 404

    query = Appointment.query.filter_by(barbershop_id=barbershop_id)

    if role == "owner":
        if str(barbershop.owner_id) != str(current_user_id):
            return jsonify({"msg": "Esta barbería no te pertenece"}), 403

    elif role == "barber":
        query = query.filter_by(barber_id=int(current_user_id))

    elif role == "client":
        query = query.filter_by(user_id=int(current_user_id))

    appointments = query.all()
    return jsonify([a.serialize() for a in appointments]), 200


@api.route("/barbershops/<int:barbershop_id>", methods=["DELETE"])
@jwt_required()
def delete_barbershop(barbershop_id):
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role")

    if role not in ["owner", "admin"]:
        return jsonify({"msg": "Acceso denegado"}), 403

    barbershop = Barbershop.query.get(barbershop_id)
    if not barbershop:
        return jsonify({"message": {"type": "error", "msg": "Barberia no encontrada"}}), 404

    if role == "owner" and str(barbershop.owner_id) != str(current_user_id):
        return jsonify({"msg": "No tienes permiso para eliminar una barbería que no te pertenece"}), 403

    db.session.delete(barbershop)
    db.session.commit()
    return jsonify({"message": {"type": "success", "msg": "Barberia eliminada correctamente"}}), 200


# ENDPOINTS DE DUEÑOS

@api.route("/owners", methods=["GET"])
@jwt_required()
def get_owners():
    current_user_id = get_jwt_identity()
    claims = get_jwt()

    if claims.get("role") != "admin":
        return jsonify({"msg": "Acceso restringido al administrador"}), 403

    owners = Owner.query.order_by(Owner.id).all()
    data = [owner.serialize() for owner in owners]
    return jsonify(data), 200


@api.route("/owners", methods=["POST"])
def new_owner():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")
    owner_profile_image = data.get("owner_profile_image")

    if not name:
        return jsonify({"message": {"type": "error", "msg": "Necesitas ingresar un nombre"}}), 400
    if not email:
        return jsonify({"message": {"type": "error", "msg": "Necesitas ingresar un email"}}), 400
    if not phone:
        return jsonify({"message": {"type": "error", "msg": "Necesitas ingresar un teléfono"}}), 400
    if not password:
        return jsonify({"message": {"type": "error", "msg": "Necesitas ingresar una contraseña"}}), 400
    if len(password) < 8:
        return jsonify({"message": {"type": "error", "msg": "La contraseña debe tener al menos 8 caracteres"}}), 400
    if len(phone) < 8:
        return jsonify({"message": {"type": "error", "msg": "Introduce un número de teléfono correcto"}}), 400
    if Owner.query.filter_by(email=email).first():
        return jsonify({"message": {"type": "error", "msg": "Email ya registrado"}}), 409
    if Owner.query.filter_by(phone=phone).first():
        return jsonify({"message": {"type": "error", "msg": "Teléfono ya registrado"}}), 409

    new_owner = Owner(
        name=name,
        email=email,
        phone=phone,
        owner_profile_image=owner_profile_image,
    )

    new_owner.set_password(password)
    db.session.add(new_owner)
    db.session.commit()

    return jsonify({"message": {"type": "success", "msg": f"Dueño {name} creado"}}), 201


@api.route("/owners/<int:owner_id>", methods=["GET"])
@jwt_required()
def get_single_owner(owner_id):
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role")

    if str(current_user_id) != str(owner_id) and role != "admin":
        return jsonify({"msg": "No tienes permiso para ver esta información"}), 403

    owner = Owner.query.get(owner_id)
    if not owner:
        return jsonify({"message": {"type": "error", "msg": "Dueño no encontrado"}}), 404

    return jsonify(owner.serialize()), 200


@api.route("/owners/<int:owner_id>", methods=["PUT"])
@jwt_required()
def edit_owner(owner_id):
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role")

    if str(current_user_id) != str(owner_id) and role != "admin":
        return jsonify({"message": {"type": "error", "msg": "No tienes permiso para editar este perfil"}}), 403

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
    owner.owner_profile_image = data.get(
        "owner_profile_image", owner.owner_profile_image)

    if "password" in data and data["password"]:
        owner.set_password(data["password"])

    db.session.commit()
    return jsonify({"message": {"type": "success", "msg": f"Dueño {owner.name} actualizado"}}), 200


@api.route("/owners/<int:owner_id>", methods=["DELETE"])
@jwt_required()
def delete_owner(owner_id):
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role")

    if str(current_user_id) != str(owner_id) and role != "admin":
        return jsonify({"message": {"type": "error", "msg": "No tienes permiso para eliminar esta cuenta"}}), 403

    owner = Owner.query.get(owner_id)
    if not owner:
        return jsonify({"message": {"type": "error", "msg": "Dueño no encontrado"}}), 404

    owner_name = owner.name

    db.session.delete(owner)
    db.session.commit()

    return jsonify({"message": {"type": "success", "msg": f"La cuenta del dueño {owner_name} ha sido eliminada"}}), 200


# ENDPOINTS DE BARBEROS

@api.route('/barbers', methods=['GET'])
@jwt_required()
def get_all_barbers():
    claims = get_jwt()
    result = BarberBarbershop.query.all()
    return jsonify([barber_union.serialize() for barber_union in result]), 200


@api.route("/barbers", methods=["POST"])
def new_barber():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")
    barber_profile_image = data.get("barber_profile_image")

    if not name:
        return jsonify({"message": {"type": "error", "msg": "Necesitas ingresar un nombre"}}), 400
    if not email:
        return jsonify({"message": {"type": "error", "msg": "Necesitas añadir un email"}}), 400
    if not phone:
        return jsonify({"message": {"type": "error", "msg": "Necesitas añadir un teléfono"}}), 400
    if not password:
        return jsonify({"message": {"type": "error", "msg": "Necesitas indicar una contraseña"}}), 400
    if len(password) < 8:
        return jsonify({"message": {"type": "error", "msg": "La contraseña debe tener al menos 8 caracteres"}}), 400
    if len(phone) < 8:
        return jsonify({"message": {"type": "error", "msg": "Introduce un número de teléfono correcto"}}), 400
    if Barber.query.filter_by(email=email).first():
        return jsonify({"message": {"type": "error", "msg": "Email ya registrado"}}), 409

    new_barber = Barber(name=name, email=email, phone=phone,
                        barber_profile_image=barber_profile_image)

    new_barber.set_password(password)
    db.session.add(new_barber)
    db.session.commit()

    return jsonify({"message": {"type": "success", "msg": f"Barbero {name} creado"}}), 201


@api.route("/barbers/<int:barber_id>", methods=["GET"])
@jwt_required()
def get_single_barber(barber_id):
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role")

    barber = Barber.query.get(barber_id)
    if not barber:
        return jsonify({"message": {"type": "error", "msg": "Barbero no encontrado"}}), 404

    if role not in ["admin", "owner", "client"] and str(current_user_id) != str(barber_id):
        return jsonify({"msg": "Acceso denegado"}), 403

    return jsonify(barber.serialize()), 200


@api.route("/barbers/<int:barber_id>", methods=["PUT"])
@jwt_required()
def edit_barber(barber_id):
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role")

    if str(current_user_id) != str(barber_id) and role != "admin":
        return jsonify({"message": {"type": "error", "msg": "No tienes permiso para editar este perfil"}}), 403

    barber = Barber.query.get(barber_id)
    if not barber:
        return jsonify({"message": {"type": "error", "msg": "Barbero no encontrado"}}), 404

    data = request.json

    if "email" in data:
        existing_email = Barber.query.filter(
            Barber.email == data["email"], Barber.id != barber_id).first()
        if existing_email:
            return jsonify({"message": {"type": "error", "msg": "Email ya registrado"}}), 409
        barber.email = data["email"]

    barber.name = data.get("name", barber.name)
    barber.barber_profile_image = data.get(
        "barber_profile_image", barber.barber_profile_image)

    barber.barbershop_id = data.get("barbershop_id", barber.barbershop_id)

    if "password" in data and data["password"]:
        barber.set_password(data["password"])

    db.session.commit()
    return jsonify({"message": {"type": "success", "msg": f"Barbero {barber.name} actualizado"}}), 200


@api.route("/barbers/<int:barber_id>", methods=["DELETE"])
@jwt_required()
def delete_barber(barber_id):
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role")

    if str(current_user_id) != str(barber_id) and role != "admin":
        return jsonify({"message": {"type": "error", "msg": "No tienes permiso para eliminar esta cuenta"}}), 403

    barber = Barber.query.get(barber_id)
    if not barber:
        return jsonify({"message": {"type": "error", "msg": "Barbero no encontrado"}}), 404

    db.session.delete(barber)
    db.session.commit()
    return jsonify({"message": {"type": "success", "msg": "Cuenta de barbero eliminada correctamente"}}), 200


# ENDPOINTS DE INVITACIONES DE BARBEROS A BARBERIAS

@api.route("/invitations", methods=["GET"])
@jwt_required()
def get_barber_invitations():
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role")

    if role not in ["barber", "admin"]:
        return jsonify({"message": "No tienes permiso"}), 403

    if role == "admin":
        invitations = BarberBarbershop.query.filter(
            BarberBarbershop.status.in_(["pending", "accepted"])
        ).all()
    else:
        invitations = BarberBarbershop.query.filter(
            BarberBarbershop.barber_id == current_user_id,
            BarberBarbershop.status.in_(["pending", "accepted"])
        ).all()

    return jsonify([invite.serialize() for invite in invitations]), 200


@api.route("/invitations", methods=["POST"])
@jwt_required()
def invite_barber():
    current_user_id = get_jwt_identity()
    claims = get_jwt()

    if claims.get("role") != "owner":
        return jsonify({"message": {"type": "error", "msg": "No tienes permiso"}}), 403

    data = request.get_json()
    email = data.get("email")
    phone = data.get("phone")
    shop_id = data.get("barbershop_id")

    barber = None
    if email:
        barber = Barber.query.filter_by(email=email).first()
    elif phone:
        barber = Barber.query.filter_by(phone=phone).first()

    if not barber:
        return jsonify({"message": {"type": "error", "msg": "No se encontró ningún barbero con esos datos"}}), 404

    barbershop = Barbershop.query.filter_by(
        id=shop_id,
        owner_id=current_user_id
    ).first()

    if not barbershop:
        return jsonify({"message": {"type": "error", "msg": "Hay un error con tus barberías"}}), 404

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


@api.route("/invitations/<int:invitation_id>", methods=["PUT"])
@jwt_required()
def accept_barber_invitations(invitation_id):
    current_user_id = get_jwt_identity()
    claims = get_jwt()

    if claims.get("role") != "barber":
        return jsonify({"message": "No tienes permiso"}), 403

    invite = BarberBarbershop.query.filter_by(
        id=invitation_id,
        barber_id=current_user_id,
        status="pending"
    ).first()

    if not invite:
        return jsonify({"message": "No existe"}), 404

    invite.status = "accepted"
    db.session.commit()

    return jsonify({"message": "Invitación aceptada"}), 200


@api.route("/invitations/<int:invitation_id>", methods=["DELETE"])
@jwt_required()
def delete_barber_invitations(invitation_id):
    current_user_id = get_jwt_identity()
    claims = get_jwt()

    if claims.role != "admin" and (str(current_user_id) != str(invite.barber_id)):
        return jsonify({"message": "No autorizado"}), 403

    invite = BarberBarbershop.query.filter_by(
        id=invitation_id,
        barber_id=current_user_id,
    ).first()

    if not invite:
        return jsonify({"message": "No autorizado o no existe"}), 404

    db.session.delete(invite)
    db.session.commit()

    return jsonify({"message": "Invitación eliminada correctamente"}), 200


# ENDPOINTS DE HORARIOS

@api.route("/schedules", methods=["GET"])
@jwt_required()
def get_barber_schedules():
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role")

    if role == "barber":
        schedules = db.session.query(Schedule).join(BarberBarbershop).filter(
            BarberBarbershop.barber_id == current_user_id
        ).all()

    elif role == "admin":
        schedules = Schedule.query.all()

    else:
        return jsonify({"msg": "No tienes permiso para ver horarios generales"}), 403

    return jsonify([s.serialize() for s in schedules]), 200


@api.route("/schedules", methods=["POST"])
@jwt_required()
def new_schedule():
    current_barber_id = get_jwt_identity()
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

    link = BarberBarbershop.query.filter_by(
        id=invitation_id, barber_id=current_barber_id).first()

    if not link:
        return jsonify({"message": {"type": "error", "msg": "Vínculo con barbería no válido o no te pertenece"}}), 403
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


@api.route("/schedules/<int:schedule_id>", methods=["GET"])
def get_single_schedule(schedule_id):
    schedule = Schedule.query.get(schedule_id)
    if not schedule:
        return jsonify({"message": {"type": "error", "msg": "No encontrado"}}), 404
    data = schedule.serialize()

    return jsonify(data), 200


@api.route("/schedules/<int:schedule_id>", methods=["PUT"])
@jwt_required()
def edit_schedule(schedule_id):
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role")

    schedule = Schedule.query.get(schedule_id)
    if not schedule:
        return jsonify({"message": {"type": "error", "msg": "Horario no encontrado"}}), 404

    if role != "admin" and str(schedule.invitations.barber_id) != str(current_user_id):
        return jsonify({"msg": "No tienes permiso"}), 403

    data = request.json

    new_day = data.get("day_of_week", schedule.day_of_week)

    try:
        new_start = datetime.strptime(data["start_time"], "%H:%M").time(
        ) if "start_time" in data else schedule.start_time
        new_end = datetime.strptime(data["end_time"], "%H:%M").time(
        ) if "end_time" in data else schedule.end_time
    except ValueError:
        return jsonify({"message": {"type": "error", "msg": "Formato de hora inválido"}}), 400

    if new_end <= new_start:
        return jsonify({"message": {"type": "error", "msg": "La hora de fin debe ser mayor que la de inicio"}}), 400

    overlapping = db.session.query(Schedule).join(BarberBarbershop).filter(
        BarberBarbershop.barber_id == schedule.invitations.barber_id,
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


@api.route("/schedules/<int:schedule_id>", methods=["DELETE"])
@jwt_required()
def delete_schedule(schedule_id):
    current_user_id = get_jwt_identity()

    schedule = Schedule.query.get(schedule_id)
    if not schedule:
        return jsonify({"message": {"type": "error", "msg": "Horario no encontrado"}}), 404

    claims = get_jwt()
    if claims.get("role") != "admin" and str(schedule.invitations.barber_id) != str(current_user_id):
        return jsonify({"msg": "No tienes permiso"}), 403

    db.session.delete(schedule)
    db.session.commit()

    return jsonify({"message": {"type": "success", "msg": "Horario eliminado correctamente"}}), 200


@api.route("/schedules/by_invitation/<int:invitation_id>", methods=["GET"])
@jwt_required()
def get_schedules_by_invitation(invitation_id):
    try:
        schedules = Schedule.query.filter_by(
            barber_barbershop_id=invitation_id).all()

        return jsonify([s.serialize() for s in schedules]), 200
    except Exception as e:
        return jsonify({"msg": str(e)}), 500


@api.route("/schedules/by_invitation/<int:invitation_id>", methods=["DELETE"])
@jwt_required()
def delete_schedules_by_invitation(invitation_id):
    try:
        schedules = Schedule.query.filter_by(
            barber_barbershop_id=invitation_id).all()
        for s in schedules:
            db.session.delete(s)
        db.session.commit()
        return jsonify({"msg": "Horarios antiguos eliminados"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": str(e)}), 500


# ENDPOINTS DE BARBERO Y SUS SERVICIOS


@api.route("/barber_services", methods=["GET"])
def get_barber_services():
    specific_barber = request.args.get("barber_id")

    if specific_barber:
        services = BarberService.query.filter_by(
            barber_id=specific_barber).all()
    else:
        services = BarberService.query.all()

    results = [service.serialize() for service in services]
    return jsonify(results), 200


@api.route("/barber_services", methods=["POST"])
@jwt_required()
def new_barber_service():
    claims = get_jwt()
    data = request.json

    if claims.get("role") not in ["admin", "barber"]:
        return jsonify({"message": {"type": "error", "msg": "No autorizado"}}), 403

    if claims.get("role") == "admin":
        barber_id = data.get("barber_id")
    else:
        barber_id = get_jwt_identity()

    name = data.get("name")
    price = data.get("price")
    duration = data.get("duration")
    service_demo_image = data.get("service_demo_image")
    service_description = data.get("service_description")

    if not all([name, price, duration]):
        return jsonify({"message": {"type": "error", "msg": "Faltan datos: nombre, precio y duración son obligatorios"}}), 400

    existing = BarberService.query.filter_by(
        barber_id=barber_id, name=name).first()
    if existing:
        return jsonify({"message": {"type": "error", "msg": "Este barbero ya tiene un servicio con ese nombre"}}), 400

    try:
        new_bs = BarberService(
            barber_id=barber_id,
            name=name,
            price=price,
            duration=duration,
            service_description=service_description,
            service_demo_image=service_demo_image
        )

        db.session.add(new_bs)
        db.session.commit()

        return jsonify({"message": {"type": "success", "msg": "Servicio creado con éxito"}}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": {"type": "error", "msg": str(e)}}), 500


@api.route("/barber_services/<int:barber_service_id>", methods=["PUT"])
@jwt_required()
def edit_barber_service(barber_service_id):
    claims = get_jwt()
    current_barber_id = get_jwt_identity()

    bs = BarberService.query.get(barber_service_id)
    if not bs:
        return jsonify({"message": {"type": "error", "msg": "No encontrado"}}), 404

    is_admin = claims.get("role") == "admin"
    is_owner = str(bs.barber_id) == str(current_barber_id)

    if not is_admin and not is_owner:
        return jsonify({"message": {"type": "error", "msg": "No tienes permiso para editar este servicio"}}), 403

    data = request.json
    bs.name = data.get("name", bs.name)
    bs.price = data.get("price", bs.price)
    bs.duration = data.get("duration", bs.duration)
    bs.service_demo_image = data.get(
        "service_demo_image", bs.service_demo_image)

    db.session.commit()
    return jsonify({"message": {"type": "success", "msg": "Servicio actualizado"}}), 200


@api.route("/barber_services/<int:barber_service_id>", methods=["GET"])
def get_barber_service(barber_service_id):
    barber_service = BarberService.query.get(barber_service_id)
    if not barber_service:
        return jsonify({"message": {"type": "error", "msg": "No encontrado"}}), 404
    data = barber_service.serialize()

    return jsonify(data), 200


@api.route("/barber_services/<int:barber_service_id>", methods=["DELETE"])
@jwt_required()
def delete_barber_service(barber_service_id):
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role")

    barber_service = BarberService.query.get(barber_service_id)

    if not barber_service:
        return jsonify({"message": {"type": "error", "msg": "Servicio no encontrado"}}), 404

    is_owner = str(barber_service.barber_id) == str(current_user_id)
    is_admin = role == "admin"

    if not (is_owner or is_admin):
        return jsonify({"message": {"type": "error", "msg": "No tienes permiso para eliminar este servicio"}}), 403

    try:
        db.session.delete(barber_service)
        db.session.commit()
        return jsonify({"message": {"type": "success", "msg": "Servicio eliminado correctamente"}}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": {"type": "error", "msg": "Error al eliminar"}}), 500


# ENDPOINTS PARA LAS RESERVAS DE CITAS

@api.route("/appointments", methods=["GET"])
@jwt_required()
def get_appointments():
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role")

    date_str = request.args.get("date")
    shop_id = request.args.get("barbershop_id")
    query = Appointment.query

    if role == "barber":
        query = query.filter_by(barber_id=current_user_id)

    elif role == "owner":
        if shop_id:
            query = query.filter_by(barbershop_id=shop_id)
        else:
            my_shops = Barbershop.query.filter_by(
                owner_id=current_user_id).all()
            my_shop_ids = [s.id for s in my_shops]
            query = query.filter(Appointment.barbershop_id.in_(my_shop_ids))

    elif role == "user" or role == "client":
        query = query.filter_by(user_id=current_user_id)

    elif role == "admin":
        if shop_id:
            query = query.filter_by(barbershop_id=shop_id)

    if date_str:
        query = query.filter(Appointment.date.cast(
            db.String).contains(date_str))

    appointments = query.order_by(Appointment.date).all()
    return jsonify([a.serialize() for a in appointments]), 200


@api.route("/appointments/<int:appointment_id>", methods=["GET"])
@jwt_required()
def get_single_appointment(appointment_id):
    appointment = Appointment.query.get(appointment_id)

    if not appointment:
        return jsonify({"message": {"type": "error", "msg": "Cita no encontrada"}}), 404
    return jsonify(appointment.serialize()), 200


@api.route("/appointments", methods=["POST"])
@jwt_required()
def new_appointment():
    data = request.json

    barber_service = BarberService.query.get(data.get("barber_service_id"))
    if not barber_service:
        return jsonify({"message": {"type": "error", "msg": "El servicio seleccionado no existe"}}), 404

    try:
        if 'T' in data.get('date', ''):
            start_date = datetime.fromisoformat(data['date'])
        else:
            start_date = datetime.strptime(
                f"{data['date']} {data['time']}", "%Y-%m-%d %H:%M")
    except Exception as e:
        return jsonify({"message": {"type": "error", "msg": "Formato de fecha inválido"}}), 400

    new_end_time = start_date + timedelta(minutes=barber_service.duration)
    appt_start_time = start_date.time()
    appt_end_time = new_end_time.time()

    day_name_en = start_date.strftime('%A')
    barbershop_id = data.get("barbershop_id")

    relation = BarberBarbershop.query.filter_by(
        barber_id=barber_service.barber_id,
        barbershop_id=barbershop_id,
        status="accepted"
    ).first()

    if not relation:
        return jsonify({"message": {"type": "error", "msg": "No hay relación activa con esta sede."}}), 400

    new_schedule = Schedule.query.filter_by(
        barber_barbershop_id=relation.id,
        day_of_week=day_name_en
    ).first()

    if not new_schedule:
        return jsonify({"message": {"type": "error", "msg": f"El barbero no trabaja los {day_name_en}."}}), 400

    if appt_start_time < new_schedule.start_time or appt_end_time > new_schedule.end_time:
        return jsonify({
            "message": {
                "type": "error",
                "msg": f"Fuera de horario. El turno es de {new_schedule.start_time.strftime('%H:%M')} a {new_schedule.end_time.strftime('%H:%M')}."
            }
        }), 400

    collision = Appointment.query.filter(
        Appointment.barber_id == barber_service.barber_id,
        Appointment.date < new_end_time,
        Appointment.end_time > start_date,
        Appointment.status.in_(['pending', 'confirmed', 'completed'])
    ).first()

    if collision:
        return jsonify({
            "message": {
                "type": "error",
                "msg": f"El barbero está ocupado. Tiene otra cita hasta las {collision.end_time.strftime('%H:%M')}."
            }
        }), 400

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


@api.route("/appointments/<int:appointment_id>", methods=["PUT"])
@jwt_required()
def edit_appointment(appointment_id):
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role")

    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return jsonify({"message": {"type": "error", "msg": "Reserva no encontrada"}}), 404

    is_admin = (role == "admin")
    is_client = (str(appointment.user_id) == str(current_user_id))
    is_barber = (str(appointment.barber_id) == str(current_user_id))

    if not (is_admin or is_client or is_barber):
        return jsonify({"message": {"type": "error", "msg": "No tienes permiso para editar esta cita"}}), 403

    data = request.json

    bs_id = data.get("barber_service_id", appointment.barber_service_id)
    barber_service = BarberService.query.get(bs_id)
    if not barber_service:
        return jsonify({"message": {"type": "error", "msg": "El servicio no existe"}}), 404

    try:
        if 'T' in data.get('date', ''):
            new_start_date = datetime.fromisoformat(data['date'])
        elif 'date' in data and 'time' in data:
            new_start_date = datetime.strptime(
                f"{data['date']} {data['time']}", "%Y-%m-%d %H:%M")
        else:
            new_start_date = appointment.date
    except Exception:
        return jsonify({"message": {"type": "error", "msg": "Formato de fecha/hora inválido"}}), 400

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

    new_schedule = Schedule.query.filter_by(
        barber_barbershop_id=relation.id,
        day_of_week=day_name_en
    ).first()

    if not new_schedule:
        return jsonify({"message": {"type": "error", "msg": f"No hay turno para el {day_name_en}."}}), 400

    if not (new_schedule.start_time <= new_start_date.time() < new_schedule.end_time):
        return jsonify({"message": {"type": "error", "msg": "La nueva hora está fuera del horario laboral del barbero."}}), 400

    collision = Appointment.query.filter(
        Appointment.id != appointment_id,
        Appointment.barber_id == barber_service.barber_id,
        Appointment.date < new_end_time,
        Appointment.end_time > new_start_date,
        Appointment.status.in_(['pending', 'confirmed', 'completed'])
    ).first()

    if collision:
        return jsonify({"message": {"type": "error", "msg": f"Conflicto: Ocupado hasta las {collision.end_time.strftime('%H:%M')}"}}), 400

    appointment.date = new_start_date
    appointment.end_time = new_end_time
    appointment.barbershop_id = shop_id
    appointment.barber_id = barber_service.barber_id
    appointment.barber_service_id = barber_service.id
    appointment.notes = data.get("notes", appointment.notes)

    if is_admin and "user_id" in data:
        appointment.user_id = data.get("user_id")

    try:
        db.session.commit()
        return jsonify({"message": {"type": "success", "msg": "Reserva actualizada correctamente"}}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": {"type": "error", "msg": str(e)}}), 500


@api.route("/appointments/<int:appointment_id>", methods=["DELETE"])
@jwt_required()
def delete_appointment(appointment_id):
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role")

    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return jsonify({"message": {"type": "error", "msg": "Reserva no encontrada"}}), 404

    is_admin = (role == "admin")
    is_owner_of_appointment = (
        str(appointment.user_id) == str(current_user_id))
    is_barber_of_appointment = (
        str(appointment.barber_id) == str(current_user_id))

    if not (is_admin or is_owner_of_appointment or is_barber_of_appointment):
        return jsonify({"message": {"type": "error", "msg": "No tienes permiso para borrar esta reserva"}}), 403

    db.session.delete(appointment)
    db.session.commit()

    return jsonify({"message": {"type": "success", "msg": "Reserva eliminada correctamente"}}), 200


@api.route("/appointments/<int:appointment_id>/status", methods=["PUT"])
@jwt_required()
def change_appointment_status(appointment_id):
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role")

    data = request.json
    new_status = data.get("status")

    valid_statuses = ['pending', 'confirmed',
                      'completed', 'no_show']
    if new_status not in valid_statuses:
        return jsonify({"message": {"type": "error", "msg": "Estado no válido"}}), 400

    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return jsonify({"message": {"type": "error", "msg": "Cita no encontrada"}}), 404

    try:
        user_id_int = int(current_user_id)
        is_barber = (role == "barber" and int(
            appointment.barber_id) == user_id_int)
        is_owner = (role == "owner" and int(
            appointment.barbershop.owner_id) == user_id_int)
        is_admin = (role == "admin")
    except (ValueError, TypeError):
        return jsonify({"message": {"type": "error", "msg": "Error de autenticación: ID no válido"}}), 401

    if not (is_barber or is_owner or is_admin):
        return jsonify({"message": {"type": "error", "msg": "No tienes permiso para gestionar esta cita"}}), 403

    appointment.status = new_status

    try:
        db.session.commit()
        return jsonify({
            "message": {"type": "success", "msg": f"Cita marcada como {new_status}"}
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": {"type": "error", "msg": f"Error al actualizar: {str(e)}"}}), 500


@api.route("/my-appointments", methods=["GET"])
@jwt_required()
def get_my_appointments():
    current_user_id = get_jwt_identity()
    my_appts = Appointment.query.filter_by(user_id=current_user_id).all()
    return jsonify([appt.serialize() for appt in my_appts]), 200


@api.route("/barber_availability", methods=["GET"])
def get_availability():
    barber_id = request.args.get("barber_id")
    barbershop_id = request.args.get("barbershop_id")
    date_str = request.args.get("date")
    service_id = request.args.get("service_id")

    if not all([barber_id, barbershop_id, date_str]):
        return jsonify({"msg": "Faltan parámetros"}), 400

    duration = 30
    if service_id:
        service = BarberService.query.get(service_id)
        if service:
            duration = service.duration

    try:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d")
        day_name = calendar.day_name[date_obj.weekday()]
    except:
        return jsonify({"msg": "Fecha inválida"}), 400

    relation = BarberBarbershop.query.filter_by(
        barber_id=barber_id,
        barbershop_id=barbershop_id,
        status="accepted"
    ).first()

    if not relation:
        return jsonify([]), 200

    new_schedule = Schedule.query.filter_by(
        barber_barbershop_id=relation.id,
        day_of_week=day_name
    ).first()

    if not new_schedule:
        return jsonify([]), 200

    all_slots = []
    current_time = datetime.combine(date_obj.date(), new_schedule.start_time)
    end_time_limit = datetime.combine(date_obj.date(), new_schedule.end_time)

    while current_time < end_time_limit:
        all_slots.append(current_time)
        current_time += timedelta(minutes=30)

    existing_appointments = Appointment.query.filter(
        Appointment.barber_id == barber_id,
        Appointment.date >= datetime.combine(
            date_obj.date(), datetime.min.time()),
        Appointment.date <= datetime.combine(
            date_obj.date(), datetime.max.time()),
        Appointment.status.in_(['pending', 'confirmed'])
    ).all()

    valid_slots = []
    for slot_start_dt in all_slots:
        slot_end_dt = slot_start_dt + timedelta(minutes=duration)

        if slot_end_dt.time() > new_schedule.end_time:
            continue

        collision = False
        for appt in existing_appointments:

            appt_end = appt.end_time if appt.end_time else (
                appt.date + timedelta(minutes=15))

            if slot_start_dt < appt_end and slot_end_dt > appt.date:
                collision = True
                break

        if not collision:
            valid_slots.append(slot_start_dt.strftime("%H:%M"))

    return jsonify(valid_slots), 200


# ENDPOINTS PARA LOS CHATS

@api.route("/conversations", methods=["GET"])
@jwt_required()
def get_conversations():
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role")

    query = Conversation.query

    if role == "owner":
        query = query.filter_by(owner_id=current_user_id)
    elif role == "user" or role == "client":
        query = query.filter_by(user_id=current_user_id)
    elif role == "admin":
        pass
    else:
        return jsonify({"msg": "Rol no autorizado para ver chats"}), 403

    conversations = query.order_by(Conversation.last_message_at.desc()).all()
    return jsonify([c.serialize() for c in conversations]), 200


@api.route('/conversations', methods=['POST'])
@jwt_required()
def create_conversation():
    current_user_id = get_jwt_identity()
    body = request.get_json()
    barbershop_id = body.get("barbershop_id")

    if not barbershop_id:
        return jsonify({"msg": "Falta el ID de la barbería"}), 400

    barbershop = Barbershop.query.get(barbershop_id)
    if not barbershop:
        return jsonify({"msg": "La barbería no existe"}), 404

    owner_id = barbershop.owner_id

    existing_conv = Conversation.query.filter_by(
        user_id=current_user_id,
        barbershop_id=barbershop_id
    ).first()

    if existing_conv:
        return jsonify(existing_conv.serialize()), 200

    new_conv = Conversation(
        user_id=current_user_id,
        owner_id=owner_id,
        barbershop_id=barbershop_id
    )

    db.session.add(new_conv)
    db.session.commit()

    return jsonify(new_conv.serialize()), 201


@api.route("/conversations/<int:conv_id>/messages", methods=["GET"])
@jwt_required()
def get_conversation_messages(conv_id):
    current_user_id = str(get_jwt_identity())
    claims = get_jwt()
    role = claims.get("role")

    conv = Conversation.query.get(conv_id)
    if not conv:
        return jsonify({"msg": "Conversación no encontrada"}), 404

    is_owner = str(conv.owner_id) == current_user_id
    is_user = str(conv.user_id) == current_user_id
    is_admin = (role == "admin")

    if not (is_owner or is_user or is_admin):
        return jsonify({"msg": "No tienes permiso para ver este chat"}), 403

    return jsonify([m.serialize() for m in conv.chat_messages]), 200


@api.route("/messages", methods=["POST"])
@jwt_required()
def send_message():
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role")

    data = request.json
    content = data.get("content")
    conversation_id = data.get("conversation_id")

    if not content or not conversation_id:
        return jsonify({"msg": "Faltan datos obligatorios"}), 400

    new_message = ChatMessage(
        conversation_id=conversation_id,
        sender_id=current_user_id,
        sender_type=role,
        content=content
    )

    conv = Conversation.query.get(conversation_id)
    if conv:
        conv.last_message_at = datetime.now(timezone.utc)

    db.session.add(new_message)
    db.session.commit()

    serialized = new_message.serialize()

    receiver_id = conv.user_id if role == "owner" else conv.owner_id
    socketio = current_app.extensions['socketio']

    socketio.emit("message:new", serialized, room=f"user_{receiver_id}")
    socketio.emit("message:new", serialized, room=f"user_{current_user_id}")

    return jsonify(new_message.serialize()), 201


@api.route("/messages/<int:message_id>", methods=["DELETE"])
@jwt_required()
def delete_message(message_id):
    claims = get_jwt()

    if claims.get("role") != "admin":
        return jsonify({"message": {"type": "error", "msg": "Solo el administrador puede eliminar mensajes"}}), 403

    message = ChatMessage.query.get(message_id)
    if not message:
        return jsonify({"message": {"type": "error", "msg": "Mensaje no encontrado"}}), 404

    try:
        db.session.delete(message)
        db.session.commit()
        return jsonify({"message": {"type": "success", "msg": "Mensaje eliminado por el administrador"}}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": {"type": "error", "msg": str(e)}}), 500


@api.route("/conversations/<int:conv_id>", methods=["DELETE"])
@jwt_required()
def delete_conversation(conv_id):
    claims = get_jwt()

    if claims.get("role") != "admin":
        return jsonify({"message": {"type": "error", "msg": "No tienes permisos de administrador para borrar el chat completo"}}), 403

    conv = Conversation.query.get(conv_id)
    if not conv:
        return jsonify({"message": {"type": "error", "msg": "Conversación no encontrada"}}), 404

    try:
        db.session.delete(conv)
        db.session.commit()
        return jsonify({"message": {"type": "success", "msg": "Conversación eliminada correctamente"}}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": {"type": "error", "msg": str(e)}}), 500


# ENDPOINTS DE IA

@api.route('/edit-hair', methods=['POST'])
def edit_hair():
    stability_key = os.getenv("STABILITY_API_KEY")
    translator = deepl.Translator(os.environ.get('DEEPL_API_KEY'))

    if not stability_key:
        return jsonify({"msg": "Error: API Key no configurada en el servidor"}), 500

    if 'image' not in request.files:
        return jsonify({"msg": "No se ha subido ninguna imagen"}), 400

    image = request.files['image']
    prompt = request.form.get('prompt')
    search_prompt = request.form.get('search_prompt', 'hair')

    try:
        result = translator.translate_text(prompt, target_lang="EN-US")
        prompt_en_ingles = result.text
        response = requests.post(
            "https://api.stability.ai/v2beta/stable-image/edit/search-and-replace",
            headers={
                "authorization": f"Bearer {stability_key}",
                "accept": "image/*"
            },
            files={"image": (image.filename, image.read(),
                             image.content_type)},
            data={
                "prompt": prompt_en_ingles,
                "search_prompt": search_prompt,
                "output_format": "webp"
            },
        )

        if response.status_code == 200:
            image_base64 = base64.b64encode(response.content).decode('utf-8')
            return jsonify({
                "result": f"data:image/webp;base64,{image_base64}"
            }), 200
        else:
            error_data = response.json()
            return jsonify({"msg": f"Error de IA: {error_data.get('errors')}"}), response.status_code

    except Exception as e:
        return jsonify({"msg": "Fallo en la conexión con el servicio de IA"}), 500


# ENPOINTS DE STRIPE

@api.route('/verify-subscription', methods=['GET'])
@jwt_required()
def check_subscription_status():
    current_user_id = get_jwt_identity()
    owner = Owner.query.get(current_user_id)

    if not owner or not owner.subscription_id:
        return jsonify({"active_subscription": False, "next_payment": None}), 200

    try:
        subscription = stripe.Subscription.retrieve(owner.subscription_id)
        is_active = (subscription.status in ['active', 'trialing'])

        # 1. VARIABLE DE ORO: Si Stripe nos da el final, lo usamos y punto.
        ts_end = subscription.get('current_period_end')

        if ts_end:
            # Esto nos da la fecha exacta que tiene Stripe en sus servidores
            end_date = datetime.fromtimestamp(ts_end)
            print(f"DEBUG: Usando fecha oficial de Stripe: {end_date}")
        else:
            # 2. PLAN B: Si Stripe no la manda, calculamos manualmente
            start_ts = subscription.get('current_period_start')
            start_date = datetime.fromtimestamp(
                start_ts) if start_ts else datetime.now()
            price_id = subscription['items']['data'][0]['price']['id']

            # Cargamos IDs limpios
            MONTHLY = (os.getenv("PRICE_ONE_MONTH") or "").strip()
            QUARTERLY = (os.getenv("PRICE_THREE_MONTHS") or "").strip()
            YEARLY = (os.getenv("PRICE_TWELVE_MONTHS") or "").strip()

            # PRIORIDAD: Comprobamos el anual PRIMERO
            if price_id == YEARLY:
                end_date = start_date + timedelta(days=365)
                print("DEBUG: Detectado Plan ANUAL (Manual)")
            elif price_id == QUARTERLY:
                end_date = start_date + timedelta(days=90)
                print("DEBUG: Detectado Plan TRIMESTRAL (Manual)")
            elif price_id == MONTHLY:
                end_date = start_date + timedelta(days=30)
                print("DEBUG: Detectado Plan MENSUAL (Manual)")
            else:
                end_date = start_date + timedelta(days=30)
                print("DEBUG: ID no reconocido, asignando 30 días")

        return jsonify({
            "active_subscription": is_active,
            "next_payment": end_date.strftime('%d/%m/%Y')
        }), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"active_subscription": False, "error": str(e)}), 500


@api.route('/activate-subscription', methods=['POST'])
@jwt_required()
def activate_subscription():
    current_user_id = get_jwt_identity()
    owner = Owner.query.get(current_user_id)
    data = request.json
    session_id = data.get('session_id')

    if not owner or not session_id:
        return jsonify({"msg": "Datos incompletos"}), 400

    try:
        session = stripe.checkout.Session.retrieve(session_id)
        if session.payment_status == 'paid':
            owner.active_subscription = True
            owner.stripe_owner_id = session.customer
            owner.subscription_id = session.subscription
            db.session.commit()
            return jsonify({"active_subscription": True}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({"active_subscription": False}), 400


@api.route('/create-checkout-session', methods=['POST'])
@jwt_required()
def create_checkout_session():
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    if claims.get("role") != "owner":
        return jsonify({"msg": "No tienes permisos"}), 403

    data = request.json

    plan_type = data.get('plan')

    if plan_type == 'mensual':
        price_id = os.getenv("PRICE_ONE_MONTH")
    elif plan_type == 'trimestral':
        price_id = os.getenv("PRICE_THREE_MONTHS")
    elif plan_type == 'anual':
        price_id = os.getenv("PRICE_TWELVE_MONTHS")

    try:
        session = stripe.checkout.Session.create(
            client_reference_id=current_user_id,
            payment_method_types=['card'],
            line_items=[{'price': price_id, 'quantity': 1}],
            mode='subscription',
            success_url=f"{os.getenv('VITE_FRONTEND_URL')}/subscription?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{os.getenv('VITE_FRONTEND_URL')}/pricing",
        )

        return jsonify({'url': session.url})
    except Exception as e:
        return jsonify(error=str(e)), 500


# NO TOCAR


# @api.route('/')
# def sitemap():
#     if ENV == "development":
#         return generate_sitemap(app)
#     return send_from_directory(static_file_dir, 'index.html')

# # any other endpoint will try to serve it like a static file


# @api.route('/<path:path>', methods=['GET'])
# def serve_any_other_file(path):
#     if not os.path.isfile(os.path.join(static_file_dir, path)):
#         path = 'index.html'
#     response = send_from_directory(static_file_dir, path)
#     response.cache_control.max_age = 0  # avoid cache memory
#     return response
