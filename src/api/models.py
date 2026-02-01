from flask_sqlalchemy import SQLAlchemy
from typing import List
from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy import Time
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import time, datetime

db = SQLAlchemy()


class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)
    last_name: Mapped[str] = mapped_column(nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    email: Mapped[str] = mapped_column(nullable=False, unique=True)
    phone: Mapped[int] = mapped_column(nullable=False, unique=True)
    notes: Mapped[str] = mapped_column(nullable=True)

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
    phone: Mapped[int] = mapped_column(nullable=False, unique=True)

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
    phone: Mapped[int] = mapped_column(nullable=False, unique=True)
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
    schedules: Mapped[List["Schedule"]] = relationship(back_populates="barber")

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
    barber_id: Mapped[int] = mapped_column(ForeignKey("barber.id"))
    start_time = mapped_column(Time, nullable=False)
    end_time = mapped_column(Time, nullable=False)
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