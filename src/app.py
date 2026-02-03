"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from api.utils import APIException, generate_sitemap
from api.models import db, User, Barbershop, Owner, Service, Barber, Schedule, BarberService
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from flask_cors import CORS
from datetime import datetime

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

    # Añadir excepción si el email ya se encuentra en el sistema

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
@app.route("/barbershops", methods=["GET"])
def get_barbershops():
    barbershops = Barbershop.query.order_by(Barbershop.id).all()
    data = [barbershop.serialize() for barbershop in barbershops]
    return jsonify(data), 200


@app.route("/barbershops", methods=["POST"])
def new_barbershop():
    data = request.json
    name = data.get("name")
    address = data.get("address")
    phone = data.get("phone")

    if Barbershop.query.filter_by(phone=phone).first():
        return jsonify({"message": {"type": "error", "msg": "Teléfono ya registrado"}}), 409

    if not name:
        return jsonify({"message": {"type": "error", "msg": "Necesitas ingresar un nombre"}}), 400
    if not address:
        return jsonify({"message": {"type": "error", "msg": "Necesitas ingresar una dirección"}}), 400
    if not phone:
        return jsonify({"message": {"type": "error", "msg": "Necesitas ingresar un teléfono"}}), 400

    new_barbershop = Barbershop(name=name, address=address, phone=phone)
    db.session.add(new_barbershop)
    db.session.commit()

    return jsonify({"message": {"type": "success", "msg": f"Barbería {name} creada"}}), 201


@app.route("/barbershops/<int:barbershop_id>", methods=["GET"])
def get_single_barbershop(barbershop_id):
    barbershop = Barbershop.query.get(barbershop_id)
    if not barbershop:
        return jsonify({"message": {"type": "error", "msg": "No encontrada"}}), 404
    data = barbershop.serialize()

    return jsonify(data), 200


@app.route("/barbershops/<int:barbershop_id>", methods=["PUT"])
def edit_barbershop(barbershop_id):
    barbershop = Barbershop.query.get(barbershop_id)
    if not barbershop:
        return jsonify({"message": {"type": "error", "msg": "No encontrada"}}), 404

    data = request.json

    if "phone" in data:
        existing_phone = Barbershop.query.filter(
            Barbershop.phone == data["phone"], Barbershop.id != barbershop_id
        ).first()
        if existing_phone:
            return jsonify({"message": {"type": "error", "msg": "Teléfono ya registrado"}}), 409
        barbershop.phone = data["phone"]

    barbershop.name = data.get("name", barbershop.name)
    barbershop.address = data.get("address", barbershop.address)

    db.session.commit()
    return jsonify({"message": {"type": "success", "msg": f"Barberia {barbershop.name} actualizada"}}), 200


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
    barbershop_id = data.get("barbershop_id")

    if not name:
        return jsonify({"message": {"type": "error", "msg": "Necesitas ingresar un nombre"}}), 400
    if not email:
        return jsonify({"message": {"type": "error", "msg": "Necesitas ingresar un email"}}), 400
    if not phone:
        return jsonify({"message": {"type": "error", "msg": "Necesitas ingresar un teléfono"}}), 400
    if not password:
        return jsonify({"message": {"type": "error", "msg": "Necesitas ingresar una contraseña"}}), 400
    if not barbershop_id:
        return jsonify({"message": {"type": "error", "msg": "Necesitas asignar una barbería"}}), 400

    if Owner.query.filter_by(email=email).first():
        return jsonify({"message": {"type": "error", "msg": "Email ya registrado"}}), 409
    if Owner.query.filter_by(phone=phone).first():
        return jsonify({"message": {"type": "error", "msg": "Teléfono ya registrado"}}), 409

    # Crear owner
    new_owner = Owner(
        name=name,
        email=email,
        phone=phone,
        password=password,
        barbershop_id=barbershop_id
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
    barbershop_id = data.get("barbershop_id")

    if not name:
        return jsonify({"message": {"type": "error", "msg": "Necesitas ingresar un nombre"}}), 400
    if not email:
        return jsonify({"message": {"type": "error", "msg": "Necesitas añadir un email"}}), 400
    if not password:
        return jsonify({"message": {"type": "error", "msg": "Necesitas indicar una contraseña"}}), 400
    if not barbershop_id:
        return jsonify({"message": {"type": "error", "msg": "Necesitas ingresar una barbería"}}), 400

    if Barber.query.filter_by(email=email).first():
        return jsonify({"message": {"type": "error", "msg": "Email ya registrado"}}), 409

    new_barber = Barber(name=name, email=email,
                        password=password, barbershop_id=barbershop_id)
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


# ENDPOINTS DE HORARIOS

@app.route("/schedules", methods=["GET"])
def get_schedule():
    schedules = Schedule.query.order_by(Schedule.id).all()
    data = [schedule.serialize() for schedule in schedules]
    return jsonify(data), 200


@app.route("/schedules", methods=["POST"])
def new_schedule():
    data = request.json
    barber_id = data.get("barber_id")
    start_time = data.get("start_time")
    end_time = data.get("end_time")

    if not start_time:
        return jsonify({"message": {"type": "error", "msg": "Necesitas indicar la hora de inicio"}}), 400
    if not end_time:
        return jsonify({"message": {"type": "error", "msg": "Necesitas indicar la hora de fin"}}), 400
    if not barber_id:
        return jsonify({"message": {"type": "error", "msg": "Necesitas indicar el barbero"}}), 400

    start_time_obj = datetime.strptime(start_time, "%H:%M").time()
    end_time_obj = datetime.strptime(end_time, "%H:%M").time()
    if end_time_obj <= start_time_obj:
        return jsonify({"message": {"type": "error", "msg": "La hora de fin debe ser mayor que la de inicio"}}), 400

    if Schedule.query.filter_by(barber_id=barber_id).first():
        return jsonify({"message": {"type": "error", "msg": "Este barbero ya tiene un horario"}}), 409
    
    new_schedule = Schedule(
        start_time=start_time_obj,
        end_time=end_time_obj,
        barber_id=barber_id
    )
    db.session.add(new_schedule)
    db.session.commit()

    return jsonify({"message": {"type": "success", "msg": f"Horario creado para el barbero {barber_id}"}}), 201


@app.route("/schedules/<int:schedule_id>", methods=["GET"])
def get_single_schedule(schedule_id):
    schedule = Schedule.query.get(schedule_id)
    if not schedule:
        return jsonify({"message": {"type": "error", "msg": "No encontrado"}}), 404
    data = schedule.serialize()

    return jsonify(data), 200


@app.route("/schedules/<int:schedule_id>", methods=["PUT"])
def edit_schedule(schedule_id):
    schedule = Schedule.query.get(schedule_id)
    if not schedule:
        return jsonify({"message": {"type": "error", "msg": "Horario no encontrado"}}), 404

    data = request.json
    barber_id = data.get("barber_id", schedule.barber_id)
    start_time = data.get("start_time")
    end_time = data.get("end_time")

    if start_time and end_time:
        start_obj = datetime.strptime(start_time, "%H:%M").time()
        end_obj = datetime.strptime(end_time, "%H:%M").time()
        if end_obj <= start_obj:
            return jsonify({"message": {"type": "error", "msg": "La hora de fin debe ser mayor que la de inicio"}}), 400

    if start_time:
        schedule.start_time = datetime.strptime(start_time, "%H:%M").time()
    if end_time:
        schedule.end_time = datetime.strptime(end_time, "%H:%M").time()

    schedule.barber_id = barber_id
    db.session.commit()

    return jsonify({"message": {"type": "success", "msg": f"Horario {schedule_id} actualizado correctamente"}}), 200

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
def get_barber_services():
    barber_services = BarberService.query.order_by(BarberService.id).all()
    data = [barber_service.serialize() for barber_service in barber_services]
    return jsonify(data), 200


@app.route("/barber_services", methods=["POST"])
def new_barber_service():
    data = request.json
    barber_id = data.get("barber_id")
    service_id = data.get("service_id")

    if not barber_id:
        return jsonify({"message": {"type": "error", "msg": "Necesitas indicar un barbero"}}), 400
    if not service_id:
        return jsonify({"message": {"type": "error", "msg": "Necesitas indicar un servicio"}}), 400
    
    barber_service = BarberService(barber_id=barber_id,service_id=service_id)

    if BarberService.query.filter_by(barber_id=barber_id,service_id=service_id).first():
        return jsonify({"message": {"type": "error", "msg": "Este barbero ya tiene asignado este servicio"}}), 409
    
    db.session.add(barber_service)
    db.session.commit()

    return jsonify({"message": {"type": "success", "msg": f"Servicio {service_id} vinculado al barbero {barber_id}"}}), 201

@app.route("/barber_services/<int:barber_service_id>", methods=["GET"])
def get_barber_service(barber_service_id):
    barber_service = BarberService.query.get(barber_service_id)
    if not barber_service:
        return jsonify({"message": {"type": "error", "msg": "No encontrado"}}), 404
    data = barber_service.serialize()

    return jsonify(data), 200

# Aquí había un endpoint para un método PUT, pero no creo que merezca la pena
# Al ser un muchos a muchos solo con ver, crear y eliminar valdría, no?

@app.route("/barber_services/<int:barber_service_id>", methods=["DELETE"])
def delete_barber_service(barber_service_id):
    barber_service = BarberService.query.get(barber_service_id)
    if not barber_service:
        return jsonify({"message": {"type": "error", "msg": "Relación barbero/servicio no encontrada"}}), 404


    db.session.delete(barber_service)
    db.session.commit()
    return jsonify({"message": {"type": "success", "msg": "Relación barbero/servicio eliminada correctamente"}}), 200








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
