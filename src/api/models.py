from flask_sqlalchemy import SQLAlchemy
from typing import List
from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

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

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "password": self.password,
            "barbershop_id": self.barbershop_id,
            "barbershop_name": self.barbershop.name if self.barbershop else None
        }
