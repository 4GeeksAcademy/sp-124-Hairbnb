from flask_sqlalchemy import SQLAlchemy
from typing import List
from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy import Time
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import time, datetime, timedelta

db = SQLAlchemy()

class AdminUser(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)
    email: Mapped[str] = mapped_column(nullable=False, unique=True)
    password: Mapped[str] = mapped_column(nullable=False)

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
    password: Mapped[str] = mapped_column(nullable=False)
    email: Mapped[str] = mapped_column(nullable=False, unique=True)
    phone: Mapped[str] = mapped_column(nullable=False, unique=True)
    notes: Mapped[str] = mapped_column(nullable=True)

    appointments: Mapped[List["Appointment"]] = relationship(back_populates="user")

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "last_name": self.last_name,
            "email": self.email,
            "phone": self.phone,
            "notes": self.notes,
        }


class Barbershop(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)
    address: Mapped[str] = mapped_column(nullable=False)
    phone: Mapped[str] = mapped_column(nullable=False, unique=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("owner.id"))

    barbers: Mapped[List["Barber"]] = relationship(back_populates="barbershop")
    owner: Mapped["Owner"] = relationship(back_populates="barbershops")
    appointments: Mapped[List["Appointment"]] = relationship(back_populates="barbershop")
    local = relationship("BarberBarbershop", back_populates="barbershop")

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "address": self.address,
            "phone": self.phone,
        }


class Owner(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)
    email: Mapped[str] = mapped_column(nullable=False, unique=True)
    phone: Mapped[str] = mapped_column(nullable=False, unique=True)
    password: Mapped[str] = mapped_column(nullable=False)

    barbershops: Mapped[List["Barbershop"]] = relationship(back_populates="owner"
    )

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "barbershops": [barbershop.id for barbershop in self.barbershops]
        }


class Service(db.Model): 
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)
    duration: Mapped[int] = mapped_column(nullable=False)
    price: Mapped[int] = mapped_column(nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "duration": self.duration,
            "price": self.price
        }


class Barber(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)
    email: Mapped[str] = mapped_column(nullable=False, unique=True)
    password: Mapped[str] = mapped_column(nullable=False)
    barbershop_id: Mapped[int] = mapped_column(ForeignKey("barbershop.id"), nullable=True)

    barbershop: Mapped["Barbershop"] = relationship(back_populates="barbers")

    barber_services: Mapped[List["BarberService"]] = relationship(back_populates="barber")
    appointments: Mapped[List["Appointment"]] = relationship(back_populates="barber")
    professional = relationship("BarberBarbershop", back_populates="barber")

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "barbershop_id": self.barbershop_id if self.barbershop else None,
            "barbershop_name": self.barbershop.name if self.barbershop else "Sin asignar",
        }


class Schedule(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    day_of_week: Mapped[str] = mapped_column(String(20), nullable=False)
    
    barber_barbershop_id: Mapped[int] = mapped_column(ForeignKey("barber_barbershop.id", ondelete="CASCADE"),nullable=False)
    
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
    barber_id: Mapped[int] = mapped_column(ForeignKey("barber.id"), nullable=False)
    
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    price: Mapped[int] = mapped_column(nullable=False)
    duration: Mapped[int] = mapped_column(nullable=False)

    barber: Mapped["Barber"] = relationship(back_populates="barber_services")
    appointments: Mapped[List["Appointment"]] = relationship(back_populates="selected_service")

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "price": self.price,
            "duration": self.duration,
            "barber_id": self.barber_id
        }
    

class Appointment(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    date: Mapped[datetime] = mapped_column(nullable=False)
    end_time: Mapped[datetime] = mapped_column(nullable=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    barber_id: Mapped[int] = mapped_column(ForeignKey("barber.id"), nullable=False)
    barber_service_id: Mapped[int] = mapped_column(ForeignKey("barber_service.id"), nullable=False)
    barbershop_id: Mapped[int] = mapped_column(ForeignKey("barbershop.id"), nullable=True)

    status: Mapped[str] = mapped_column(nullable=False, default="pending")
    notes: Mapped[str] = mapped_column(nullable=True)

    user: Mapped["User"] = relationship(back_populates="appointments")
    barber: Mapped["Barber"] = relationship(back_populates="appointments")
    selected_service: Mapped["BarberService"] = relationship(back_populates="appointments")
    barbershop: Mapped["Barbershop"] = relationship(back_populates="appointments")

    def __init__(self, date, user_id, end_time, barber_id, barber_service_id, barbershop_id, notes=None):
        self.date = date
        self.user_id = user_id
        self.barber_id = barber_id
        self.barber_service_id = barber_service_id
        self.barbershop_id = barbershop_id
        self.notes = notes
        
    def serialize(self):
        actual_end_time = self.end_time
        if actual_end_time is None and self.selected_service:
            actual_end_time = self.date + timedelta(minutes=self.selected_service.duration)

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
    __tablename__ = "barber_barbershop" # Harta de que me de error de que no lo encuentra, pues se lo pongo literal
    id: Mapped[int] = mapped_column(primary_key=True)
    barber_id: Mapped[int] = mapped_column(ForeignKey("barber.id"), nullable=False)
    barbershop_id: Mapped[int] = mapped_column(ForeignKey("barbershop.id"), nullable=False)
    status: Mapped[str] = mapped_column(default="pending")

    barber: Mapped["Barber"] = relationship(back_populates="professional")
    barbershop: Mapped["Barbershop"] = relationship(back_populates="local")
    schedule: Mapped[List["Schedule"]] = relationship(back_populates="invitations", cascade="all, delete-orphan")

    def serialize(self):
        return {
            "id": self.id,
            "status": self.status,
            "barbershop_id": self.barbershop_id,
            "barber": self.barber.serialize() if hasattr(self.barber, 'serialize') else {
                "id": self.barber.id,
                "name": self.barber.name,
                "email": self.barber.email
            }
        }