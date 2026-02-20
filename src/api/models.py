from flask_sqlalchemy import SQLAlchemy
from typing import List
from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy import Time
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from datetime import time, datetime, timedelta, timezone
from flask_bcrypt import generate_password_hash, check_password_hash

db = SQLAlchemy()

class AdminUser(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)
    email: Mapped[str] = mapped_column(nullable=False, unique=True)
    password: Mapped[str] = mapped_column(String(255), nullable=False)

    def set_password(self, password):
        self.password = generate_password_hash(password).decode('utf-8')
    def check_password(self, password):
        return check_password_hash(self.password, password)
    
    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email
        }

class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)
    last_name: Mapped[str] = mapped_column(nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(nullable=False, unique=True)
    phone: Mapped[str] = mapped_column(nullable=False, unique=True)
    notes: Mapped[str] = mapped_column(nullable=True)
    client_profile_image: Mapped[str] = mapped_column(String(255), nullable=True)

    appointments: Mapped[List["Appointment"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    conversations: Mapped[List["Conversation"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    
    def set_password(self, password):
        self.password = generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return check_password_hash(self.password, password)
    
    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "last_name": self.last_name,
            "email": self.email,
            "phone": self.phone,
            "notes": self.notes,
            "client_profile_image": self.client_profile_image,
        }


class Barbershop(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)
    address: Mapped[str] = mapped_column(nullable=True)
    phone: Mapped[str] = mapped_column(nullable=False, unique=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("owner.id"))
    barbershop_image: Mapped[str] = mapped_column(String(255), nullable=True)
    barbershop_description: Mapped[str] = mapped_column(String(1500), nullable=True)

    latitude: Mapped[float] = mapped_column(db.Float, nullable=True)
    longitude: Mapped[float] = mapped_column(db.Float, nullable=True)
    working_hours: Mapped[dict] = mapped_column(db.JSON, nullable=True)

    barbers: Mapped[List["Barber"]] = relationship(back_populates="barbershop", cascade="all, delete-orphan")
    owner: Mapped["Owner"] = relationship(back_populates="barbershops")
    appointments: Mapped[List["Appointment"]] = relationship(back_populates="barbershop", cascade="all, delete-orphan")
    local = relationship("BarberBarbershop", back_populates="barbershop", cascade="all, delete-orphan")
    conversations: Mapped[List["Conversation"]] = relationship(back_populates="barbershop", cascade="all, delete-orphan")
    
    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "address": self.address,
            "phone": self.phone,
            "barbershop_image": self.barbershop_image,
            "barbershop_description": self.barbershop_description,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "working_hours": self.working_hours
        }
    
    
class Owner(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)
    email: Mapped[str] = mapped_column(nullable=False, unique=True)
    phone: Mapped[str] = mapped_column(nullable=False, unique=True)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    owner_profile_image: Mapped[str] = mapped_column(String(255), nullable=True)

    barbershops: Mapped[List["Barbershop"]] = relationship(
        back_populates="owner", cascade="all, delete-orphan")
    conversations: Mapped[List["Conversation"]] = relationship(back_populates="owner", cascade="all, delete-orphan")

    def set_password(self, password):
        self.password = generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return check_password_hash(self.password, password)
    
    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "barbershops": [barbershop.id for barbershop in self.barbershops],
            "owner_profile_image": self.owner_profile_image,
        }


class Barber(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)
    email: Mapped[str] = mapped_column(nullable=False, unique=True)
    phone: Mapped[str] = mapped_column(nullable=False, unique=True)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    barbershop_id: Mapped[int] = mapped_column(ForeignKey("barbershop.id"), nullable=True)
    barber_profile_image: Mapped[str] = mapped_column(String(255), nullable=True)

    barbershop: Mapped["Barbershop"] = relationship(back_populates="barbers")

    barber_services: Mapped[List["BarberService"]] = relationship(back_populates="barber", cascade="all, delete-orphan")
    appointments: Mapped[List["Appointment"]] = relationship(back_populates="barber", cascade="all, delete-orphan")
    professional = relationship("BarberBarbershop", back_populates="barber", cascade="all, delete-orphan")

    def set_password(self, password):
        self.password = generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return check_password_hash(self.password, password)
    
    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "barbershop_id": self.barbershop_id if self.barbershop else None,
            "barbershop_name": self.barbershop.name if self.barbershop else "Sin asignar",
            "barber_profile_image": self.barber_profile_image,
        }


class Schedule(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    day_of_week: Mapped[str] = mapped_column(String(20), nullable=False)

    barber_barbershop_id: Mapped[int] = mapped_column(ForeignKey("barber_barbershop.id"), nullable=False)

    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)

    invitations: Mapped["BarberBarbershop"] = relationship(back_populates="schedule")

    def serialize(self):
        return {
            "id": self.id,
            "day_of_week": self.day_of_week,
            "barber_barbershop_id": self.barber_barbershop_id,
            "start_time": self.start_time.strftime("%H:%M"),
            "end_time": self.end_time.strftime("%H:%M"),
            "barber_id": self.invitations.barber_id,
            "barbershop_id": self.invitations.barbershop_id,
            "barber_name": self.invitations.barber.name,
            "barbershop_name": self.invitations.barbershop.name
        }


class BarberService(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    barber_id: Mapped[int] = mapped_column(
        ForeignKey("barber.id"), nullable=False)

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    price: Mapped[float] = mapped_column(nullable=False)
    duration: Mapped[int] = mapped_column(nullable=False)
    service_description: Mapped[str] = mapped_column(String(500), nullable=True)
    service_demo_image: Mapped[str] = mapped_column(String(255), nullable=True)

    barber: Mapped["Barber"] = relationship(back_populates="barber_services")
    appointments: Mapped[List["Appointment"]] = relationship(
        back_populates="selected_service", cascade="all, delete-orphan")

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "price": self.price,
            "duration": self.duration,
            "barber_id": self.barber_id,
            "barber_name": self.barber.name,
            "service_description": self.service_description,
            "service_demo_image": self.service_demo_image,  
        }


class Appointment(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    date: Mapped[datetime] = mapped_column(nullable=False)
    end_time: Mapped[datetime] = mapped_column(nullable=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    barber_id: Mapped[int] = mapped_column(
        ForeignKey("barber.id"), nullable=False)
    barber_service_id: Mapped[int] = mapped_column(
        ForeignKey("barber_service.id"), nullable=False)
    barbershop_id: Mapped[int] = mapped_column(
        ForeignKey("barbershop.id"), nullable=True)

    status: Mapped[str] = mapped_column(nullable=False, default="pending")
    notes: Mapped[str] = mapped_column(nullable=True)

    user: Mapped["User"] = relationship(back_populates="appointments")
    barber: Mapped["Barber"] = relationship(back_populates="appointments")
    selected_service: Mapped["BarberService"] = relationship(
        back_populates="appointments")
    barbershop: Mapped["Barbershop"] = relationship(
        back_populates="appointments")

    def __init__(self, date, end_time, user_id, barber_id, barber_service_id, barbershop_id, notes=None):
        self.date = date
        self.end_time = end_time
        self.user_id = user_id
        self.barber_id = barber_id
        self.barber_service_id = barber_service_id
        self.barbershop_id = barbershop_id
        self.notes = notes

    def serialize(self):
        actual_end_time = self.end_time
        if actual_end_time is None and self.selected_service:
            actual_end_time = self.date + \
                timedelta(minutes=self.selected_service.duration)

        return {
            "id": self.id,
            "date": self.date.isoformat(),
            "end_time": actual_end_time.isoformat() if actual_end_time else None,
            "user_id": self.user_id,
            "user_name": f"{self.user.name} {self.user.last_name}" if self.user else "Usuario no asignado",
            "barbershop_id": self.barbershop_id,
            "barbershop_name": self.barbershop.name if self.barbershop else "Sede desconocida",
            "barber_id": self.barber_id,
            "barber_name": self.barber.name if self.barber else "Barbero no asignado",
            "barber_service_id": self.barber_service_id,
            "service_name": self.selected_service.name if self.selected_service else "Servicio no encontrado",
            "duration": self.selected_service.duration if self.selected_service else 0,
            "price": self.selected_service.price if self.selected_service else 0,
            "notes": self.notes,
            "status": self.status
        }


class BarberBarbershop(db.Model):
    # Harta de que me de error de que no lo encuentra, pues se lo pongo literal
    __tablename__ = "barber_barbershop"
    id: Mapped[int] = mapped_column(primary_key=True)
    barber_id: Mapped[int] = mapped_column(
        ForeignKey("barber.id"), nullable=False)
    barbershop_id: Mapped[int] = mapped_column(
        ForeignKey("barbershop.id"), nullable=False)
    status: Mapped[str] = mapped_column(default="pending")

    barber: Mapped["Barber"] = relationship(back_populates="professional")
    barbershop: Mapped["Barbershop"] = relationship(back_populates="local")
    schedule: Mapped[List["Schedule"]] = relationship(
        back_populates="invitations", cascade="all, delete-orphan")

    def serialize(self):
        return {
            "id": self.id,
            "status": self.status,
            "barbershop_id": self.barbershop_id,
            "barber_name": self.barber.name,
            "barbershop_name": self.barbershop.name,
            "barber_image": self.barber.barber_profile_image,
            "barbershop": self.barbershop.serialize()
            }
    

class Conversation(db.Model):
    __tablename__ = "conversation"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    owner_id: Mapped[int] = mapped_column(ForeignKey("owner.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))
    last_message_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc)
    )
    barbershop_id: Mapped[int] = mapped_column(ForeignKey("barbershop.id"), nullable=False)


    user: Mapped["User"] = relationship(back_populates="conversations")
    owner: Mapped["Owner"] = relationship(back_populates="conversations")
    barbershop: Mapped["Barbershop"] = relationship(back_populates="conversations")

    
    chat_messages: Mapped[List["ChatMessage"]] = relationship(
        back_populates="conversation", 
        cascade="all, delete-orphan",
        order_by="ChatMessage.timestamp"
    )

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "owner_id": self.owner_id,
            "user_name": self.user.name if self.user else "Usuario",
            "owner_name": self.owner.name if self.owner else "Dueño",
            "barbershop_name": self.barbershop.name,
            "last_message_at": self.last_message_at.isoformat(),
            "last_message": self.chat_messages[-1].content if self.chat_messages else None
        }


class ChatMessage(db.Model):
    __tablename__ = "chat_message"
    id: Mapped[int] = mapped_column(primary_key=True)
    conversation_id: Mapped[int] = mapped_column(ForeignKey("conversation.id"), nullable=False)
    
    sender_id: Mapped[int] = mapped_column(nullable=False) 
    sender_type: Mapped[str] = mapped_column(String(10), nullable=False)
    
    content: Mapped[str] = mapped_column(String(500), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))
    is_read: Mapped[bool] = mapped_column(default=False)

    conversation: Mapped["Conversation"] = relationship(back_populates="chat_messages")

    def serialize(self):
        return {
            "id": self.id,
            "conversation_id": self.conversation_id,
            "sender_id": self.sender_id,
            "sender_type": self.sender_type,
            "content": self.content,
            "timestamp": self.timestamp.isoformat(),
            "is_read": self.is_read
        }
    
