"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import request, jsonify, Blueprint, send_from_directory
from api.models import db, User
from api.utils import generate_sitemap
from flask_cors import CORS
import os
from api.utils import generate_sitemap
from api.models import db, User, Barbershop, Owner, Barber, Schedule, BarberService, Appointment, AdminUser, BarberBarbershop
from datetime import datetime, timedelta
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from flask_cors import CORS


api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


@api.route("/login/admin", methods=["POST"])
def login_admin():
    email = request.json.get("email")
    password = request.json.get("password")

    user = AdminUser.query.filter_by(email=email, password=password).first()

    if not user:
        return jsonify({"msg": "Email o contraseña incorrectos"}), 401

    access_token = create_access_token(identity=str(
        user.id), additional_claims={"role": "admin"})
    return jsonify({"token": access_token, "user": {"id": user.id, "name": user.name, "role": "admin"}}), 200


@api.route("/login/client", methods=["POST"])
def login_client():
    email = request.json.get("email")
    password = request.json.get("password")

    user = User.query.filter_by(email=email, password=password).first()

    if not user:
        return jsonify({"msg": "Email o contraseña incorrectos"}), 401

    access_token = create_access_token(identity=str(
        user.id), additional_claims={"role": "client"})
    return jsonify({"token": access_token, "user": {"id": user.id, "name": user.name, "role": "client"}}), 200


@api.route("/login/barber", methods=["POST"])
def login_barber():
    email = request.json.get("email")
    password = request.json.get("password")

    barber = Barber.query.filter_by(email=email, password=password).first()

    if not barber:
        return jsonify({"msg": "Email o contraseña incorrectos"}), 401

    access_token = create_access_token(identity=str(
        barber.id), additional_claims={"role": "barber"})
    return jsonify({"token": access_token, "user": {"id": barber.id, "name": barber.name, "role": "barber"}}), 200


@api.route("/login/owner", methods=["POST"])
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
        "invitations": BarberBarbershop
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
    if not email:
        return jsonify({"message": {"type": "error", "msg": "Necesitas ingresar un email"}}), 400
    if not phone:
        return jsonify({"message": {"type": "error", "msg": "Necesitas ingresar un teléfono"}}), 400

    new_user = User(name=name, last_name=last_name,
                    password=password, email=email, phone=phone, notes=notes, client_profile_image=client_profile_image)
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
    user.client_profile_image = data.get(
        "client_profile_image", user.client_profile_image)

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
        return jsonify({"message": {"type": "error", "msg": "No encontrado"}}), 404

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
    data = [barbershop.serialize() for barbershop in barbershops]
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
    new_barbsh = Barbershop(
        name=data.get("name"),
        address=data.get("address"),
        phone=data.get("phone"),
        barbershop_image=data.get("barbershop_image"),
        owner_id=int(current_user_id)

    )
    if not data.get("name") or not data.get("address"):
        return jsonify({"message": {"type": "error", "msg": "Nombre y dirección son obligatorios"}}), 400

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
    barbershop.barbershop_image = data.get(
        "barbershop_image", barbershop.barbershop_image)

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

    if Owner.query.filter_by(email=email).first():
        return jsonify({"message": {"type": "error", "msg": "Email ya registrado"}}), 409
    if Owner.query.filter_by(phone=phone).first():
        return jsonify({"message": {"type": "error", "msg": "Teléfono ya registrado"}}), 409

    new_owner = Owner(
        name=name,
        email=email,
        phone=phone,
        password=password,
        owner_profile_image=owner_profile_image,

    )
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
    owner.password = data.get("password", owner.password)
    owner.owner_profile_image = data.get(
        "owner_profile_image", owner.owner_profile_image)

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

    if Barber.query.filter_by(email=email).first():
        return jsonify({"message": {"type": "error", "msg": "Email ya registrado"}}), 409

    new_barber = Barber(name=name, email=email, password=password,
                        phone=phone, barber_profile_image=barber_profile_image)
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
    barber.password = data.get("password", barber.password)
    barber.barber_profile_image = data.get(
        "barber_profile_image", barber.barber_profile_image)

    barber.barbershop_id = data.get("barbershop_id", barber.barbershop_id)

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

    if claims.get("role") != "barber":
        return jsonify({"message": "No tienes permiso"}), 403

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
    current_barber_id = get_jwt_identity()
    schedule = Schedule.query.get(schedule_id)

    if not schedule:
        return jsonify({"message": {"type": "error", "msg": "Horario no encontrado"}}), 404

    if str(schedule.invitations.barber_id) != str(current_barber_id):
        return jsonify({"message": {"type": "error", "msg": "No tienes permiso para editar este horario"}}), 403

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


@api.route("/schedules/<int:schedule_id>", methods=["DELETE"])
@jwt_required()
def delete_schedule(schedule_id):
    current_user_id = get_jwt_identity()

    schedule = Schedule.query.get(schedule_id)
    if not schedule:
        return jsonify({"message": {"type": "error", "msg": "Horario no encontrado"}}), 404

    if str(schedule.invitation.barber_id) != str(current_user_id):
        return jsonify({"message": {"type": "error", "msg": "No tienes permiso para borrar este horario"}}), 403

    db.session.delete(schedule)
    db.session.commit()

    return jsonify({"message": {"type": "success", "msg": "Horario eliminado correctamente"}}), 200

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
    current_barber_id = get_jwt_identity()
    claims = get_jwt()
    data = request.json

    if claims.get("role") != "barber":
        return jsonify({"message": {"type": "error", "msg": "Solo los barberos pueden gestionar sus servicios"}}), 403

    name = data.get("name")
    price = data.get("price")
    duration = data.get("duration")
    service_demo_image = data.get("service_demo_image")

    if not all([name, price, duration]):
        return jsonify({"message": {"type": "error", "msg": "Faltan datos: nombre, precio y duración son obligatorios"}}), 400

    existing = BarberService.query.filter_by(
        barber_id=current_barber_id, name=name).first()
    if existing:
        return jsonify({"message": {"type": "error", "msg": "Ya tienes un servicio con este nombre"}}), 400

    try:
        new_bs = BarberService(
            barber_id=current_barber_id,
            name=name,
            price=price,
            duration=duration,
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
    current_barber_id = get_jwt_identity()

    bs = BarberService.query.get(barber_service_id)
    if not bs:
        return jsonify({"message": {"type": "error", "msg": "No encontrado"}}), 404

    if str(bs.barber_id) != str(current_barber_id):
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
            new_start_date = datetime.strptime(
                f"{data['date']} {data['time']}", "%Y-%m-%d %H:%M")
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

    new_schedule = Schedule.query.filter_by(
        barber_barbershop_id=relation.id,
        day_of_week=day_name_en
    ).first()

    if not new_schedule:
        return jsonify({"message": {"type": "error", "msg": f"No hay turno para el {day_name_en}."}}), 400

    if not (new_schedule.start_time <= new_start_date.time() < new_schedule.end_time):
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


@api.route("/appointments/<int:appointment_id>", methods=["DELETE"])
@jwt_required()
def delete_appointment(appointment_id):
    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return jsonify({"message": {"type": "error", "msg": "Reserva no encontrada"}}), 404

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

    valid_statuses = ['pending', 'confirmed', 'completed', 'no_show', 'rejected']
    if new_status not in valid_statuses:
        return jsonify({"message": {"type": "error", "msg": "Estado no válido"}}), 400

    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return jsonify({"message": {"type": "error", "msg": "Cita no encontrada"}}), 404

    print(f"DEBUG: Identidad JWT: {current_user_id} (Tipo: {type(current_user_id)})")
    print(f"DEBUG: Barber ID de la cita: {appointment.barber_id} (Tipo: {type(appointment.barber_id)})")
    print(f"DEBUG: Rol del usuario: {role}")

    try:
        user_id_int = int(current_user_id)
        is_barber = (role == "barber" and int(appointment.barber_id) == user_id_int)
        is_owner = (role == "owner" and int(appointment.barbershop.owner_id) == user_id_int)
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
        day_name = date_obj.strftime('%A')
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
        Appointment.status.in_(['pending', 'confirmed', 'completed'])
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

# NO TOCAR


@api.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

# any other endpoint will try to serve it like a static file


@api.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # avoid cache memory
    return response
