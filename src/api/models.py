from flask_sqlalchemy import SQLAlchemy
from typing import List
from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy import Time
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import time, datetime, timedelta

db = SQLAlchemy()


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

    owners: Mapped[List["Owner"]] = relationship(back_populates="barbershop")
    services: Mapped[List["Service"]] = relationship(
        back_populates="barbershop")
    barbers: Mapped[List["Barber"]] = relationship(back_populates="barbershop")

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
    barbershop_id: Mapped[int] = mapped_column(ForeignKey("barbershop.id"))

    barbershop: Mapped["Barbershop"] = relationship(back_populates="owners")

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "barbershop_id": self.barbershop_id,
            "barbershop_name": self.barbershop.name if self.barbershop else None
        }


class Service(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)
    duration: Mapped[int] = mapped_column(nullable=False)
    price: Mapped[int] = mapped_column(nullable=False)
    barbershop_id: Mapped[int] = mapped_column(ForeignKey("barbershop.id"))

    barbershop: Mapped["Barbershop"] = relationship(back_populates="services")
    barber_services: Mapped[List["BarberService"]] = relationship(back_populates="service")
    appointments: Mapped[List["Appointment"]] = relationship(back_populates="service")

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "duration": self.duration,
            "price": self.price,
            "barbershop_id": self.barbershop_id,
            "barbershop_name": self.barbershop.name if self.barbershop else None
        }


class Barber(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)
    email: Mapped[str] = mapped_column(nullable=False, unique=True)
    password: Mapped[str] = mapped_column(nullable=False)
    barbershop_id: Mapped[int] = mapped_column(ForeignKey("barbershop.id"))

    barbershop: Mapped["Barbershop"] = relationship(back_populates="barbers")

    schedules: Mapped[List["Schedule"]] = relationship(
        "Schedule", back_populates="barber", cascade="all, delete-orphan"
    )
    barber_services: Mapped[List["BarberService"]] = relationship(back_populates="barber")
    appointments: Mapped[List["Appointment"]] = relationship(back_populates="barber")

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "barbershop_id": self.barbershop_id,
            "barbershop_name": self.barbershop.name if self.barbershop else None
        }


class Schedule(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    barber_id: Mapped[int] = mapped_column(ForeignKey("barber.id"), nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)

    barber: Mapped["Barber"] = relationship(back_populates="schedules")

    def serialize(self):
        return {
            "id": self.id,
            "start_time": self.start_time.strftime("%H:%M") if self.start_time else None,
            "end_time": self.end_time.strftime("%H:%M") if self.end_time else None,
            "barber_id": self.barber_id,
            "barber_name": self.barber.name if self.barber else None,
            "barbershop_name": self.barber.barbershop.name if self.barber and self.barber.barbershop else None
        }


class BarberService(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)

    barber_id: Mapped[int] = mapped_column(ForeignKey("barber.id"), nullable=False)
    service_id: Mapped[int] = mapped_column(ForeignKey("service.id"), nullable=False)

    barber: Mapped["Barber"] = relationship(back_populates="barber_services")
    service: Mapped["Service"] = relationship(back_populates="barber_services")

    def serialize(self):
        return {
            "id": self.id,
            "barber_id": self.barber_id,
            "barber_name": self.barber.name if self.barber else None,
            "service_id": self.service_id,
            "service_name": self.service.name if self.service else None
        }
    

class Appointment(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)

    date: Mapped[datetime] = mapped_column(nullable=False)
    end_time: Mapped[datetime] = mapped_column(nullable=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    barber_id: Mapped[int] = mapped_column(ForeignKey("barber.id"), nullable=False)
    service_id: Mapped[int] = mapped_column(ForeignKey("service.id"), nullable=False)

    status: Mapped[str] = mapped_column(nullable=False, default="pending")
    notes: Mapped[str] = mapped_column(nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="appointments")
    barber: Mapped["Barber"] = relationship("Barber", back_populates="appointments")
    service: Mapped["Service"] = relationship("Service", back_populates="appointments")

    def __init__(self, date, user_id, barber_id, service_id, notes=None):
        self.date = date
        self.user_id = user_id
        self.barber_id = barber_id
        self.service_id = service_id
        self.notes = notes

        if hasattr(self, 'service') and self.service:
            self.end_time = date + timedelta(minutes=self.service.duration)
        else:
            self.end_time = date

    def serialize(self):
        end_time = self.end_time
        if end_time is None:
            duration = self.service.duration if self.service else 0
            end_time = self.date + timedelta(minutes=duration)

        return {
            "id": self.id,
            "date": self.date.isoformat(),
            "end_time": end_time.isoformat(),
            "user_id": self.user_id,
            "user_name": f"{self.user.name} {self.user.last_name}" if self.user else None,
            "barber_id": self.barber_id,
            "barber_name": self.barber.name if self.barber else None,
            "service_id": self.service_id,
            "service_name": self.service.name if self.service else None,
            "duration": self.service.duration if self.service else None,
            "notes": self.notes
    }   