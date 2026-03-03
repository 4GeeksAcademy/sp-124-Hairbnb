"""
HAIRBNB - Script de Citas para Demo
=====================================
Ejecutar desde /opt/render/project/src/src:
    python3 /tmp/citas.py

Crea citas de los últimos 7 días y deja huecos libres
mañana (2026-03-05) y pasado (2026-03-06) para la demo en vivo.
"""

import sys
sys.path.insert(0, '/opt/render/project/src/src')

from app import app
from api.models import db, Appointment
from datetime import datetime, timedelta

with app.app_context():

    # Limpiar citas existentes
    Appointment.query.delete()
    db.session.commit()
    print("✅ Citas anteriores eliminadas")

    # ─────────────────────────────────────────
    # DATOS REALES DE LA BD
    # ─────────────────────────────────────────
    # Usuarios: Pedro=1, Claudia=2, Lorena=6, Abel=10, Cristian=11
    # BarberBarbershop (bb_id | barber_id | barbershop_id):
    #   Ricardo(1)  → bb1=barbería2, bb5=barbería21
    #   Estefanía(2)→ bb2=barbería2, bb16=barbería15
    #   Héctor(5)   → bb6=barbería6
    #   Pablo(6)    → bb7=barbería6, bb9=barbería8
    #   Miguel(7)   → bb4=barbería21(mal), bb8=barbería9, bb11=barbería10
    #   Sergi(8)    → bb12=barbería11, bb14=barbería13
    #   Oriol(9)    → bb13=barbería12, bb15=barbería14
    #   Ruben(10)   → bb17=barbería16, bb18=barbería17
    #   Adrian(11)  → bb19=barbería18, bb20=barbería19
    #   Manuel(12)  → bb22=barbería21, bb24=barbería23
    #   Javi(13)    → bb23=barbería24, bb25=barbería4(Pelos)
    #   Carlos(14)  → bb10=barbería7, bb26=barbería4(Pelos)

    # Formato: (user_id, barber_id, barber_service_id, barbershop_id, fecha, duracion)
    # Servicios reales:
    # Ricardo: 1(3min), 2(20min)
    # Estefanía: 3(60min)
    # Héctor: 7(30), 8(45), 9(60), 10(40), 11(25)
    # Pablo: 12(35), 13(50), 14(65), 15(60), 16(60)
    # Miguel: 17(40), 18(20), 19(55), 20(45), 21(50)
    # Sergi: 22(40), 23(50), 24(35), 25(90)
    # Oriol: 26(55), 27(45), 28(40), 29(30), 30(75)
    # Ruben: 31(30), 32(50), 33(30), 34(25)
    # Adrian: 35(45), 36(60), 37(40), 38(90), 39(55)
    # Manuel: 40(30), 41(40), 42(60), 43(15), 44(20)
    # Javi: 45(35), 46(50), 47(35), 48(80)
    # Carlos: 49(35), 50(45), 51(45), 52(40), 53(65)

    hoy = datetime(2026, 3, 4)
    manana = datetime(2026, 3, 5)      # huecos para demo
    pasado = datetime(2026, 3, 6)      # huecos para demo

    def d(dias_atras, hora, minuto=0):
        return hoy - timedelta(days=dias_atras) + timedelta(hours=hora, minutes=minuto)

    def f(fecha, hora, minuto=0):
        return fecha + timedelta(hours=hora, minutes=minuto)

    citas = [
        # ── PASADAS (últimos 7 días) ──────────────────────────────

        # Héctor en The Blade Society (barbershop_id=6)
        dict(user_id=1,  barber_id=5,  barber_service_id=7,  barbershop_id=6,  date=d(7,10,0),  end_time=d(7,10,30), status="completed"),
        dict(user_id=2,  barber_id=5,  barber_service_id=8,  barbershop_id=6,  date=d(7,11,0),  end_time=d(7,11,45), status="completed"),
        dict(user_id=6,  barber_id=5,  barber_service_id=9,  barbershop_id=6,  date=d(7,12,0),  end_time=d(7,13,0),  status="completed"),
        dict(user_id=10, barber_id=5,  barber_service_id=10, barbershop_id=6,  date=d(6,10,0),  end_time=d(6,10,40), status="completed"),
        dict(user_id=11, barber_id=5,  barber_service_id=11, barbershop_id=6,  date=d(6,11,0),  end_time=d(6,11,25), status="completed"),
        dict(user_id=1,  barber_id=5,  barber_service_id=7,  barbershop_id=6,  date=d(5,10,0),  end_time=d(5,10,30), status="completed"),
        dict(user_id=2,  barber_id=5,  barber_service_id=9,  barbershop_id=6,  date=d(5,11,0),  end_time=d(5,12,0),  status="completed"),
        dict(user_id=6,  barber_id=5,  barber_service_id=10, barbershop_id=6,  date=d(4,10,0),  end_time=d(4,10,40), status="completed"),
        dict(user_id=10, barber_id=5,  barber_service_id=8,  barbershop_id=6,  date=d(4,11,30), end_time=d(4,12,15), status="completed"),
        dict(user_id=11, barber_id=5,  barber_service_id=7,  barbershop_id=6,  date=d(3,10,0),  end_time=d(3,10,30), status="completed"),

        # Pablo en The Blade Society (barbershop_id=6)
        dict(user_id=1,  barber_id=6,  barber_service_id=12, barbershop_id=6,  date=d(7,12,0),  end_time=d(7,12,35), status="completed"),
        dict(user_id=2,  barber_id=6,  barber_service_id=13, barbershop_id=6,  date=d(7,13,0),  end_time=d(7,13,50), status="completed"),
        dict(user_id=6,  barber_id=6,  barber_service_id=14, barbershop_id=6,  date=d(6,12,0),  end_time=d(6,13,5),  status="completed"),
        dict(user_id=10, barber_id=6,  barber_service_id=15, barbershop_id=6,  date=d(5,12,0),  end_time=d(5,13,0),  status="completed"),
        dict(user_id=11, barber_id=6,  barber_service_id=16, barbershop_id=6,  date=d(4,12,0),  end_time=d(4,13,0),  status="completed"),

        # Pablo en Old School Barbers (barbershop_id=8) - lunes
        dict(user_id=1,  barber_id=6,  barber_service_id=12, barbershop_id=8,  date=d(7,9,0),   end_time=d(7,9,35),  status="completed"),
        dict(user_id=2,  barber_id=6,  barber_service_id=13, barbershop_id=8,  date=d(7,10,0),  end_time=d(7,10,50), status="completed"),

        # Miguel en Fade Factory Madrid (barbershop_id=9)
        dict(user_id=1,  barber_id=7,  barber_service_id=17, barbershop_id=9,  date=d(7,10,0),  end_time=d(7,10,40), status="completed"),
        dict(user_id=2,  barber_id=7,  barber_service_id=18, barbershop_id=9,  date=d(7,11,0),  end_time=d(7,11,20), status="completed"),
        dict(user_id=6,  barber_id=7,  barber_service_id=19, barbershop_id=9,  date=d(7,12,0),  end_time=d(7,12,55), status="completed"),
        dict(user_id=10, barber_id=7,  barber_service_id=20, barbershop_id=9,  date=d(6,10,0),  end_time=d(6,10,45), status="completed"),
        dict(user_id=11, barber_id=7,  barber_service_id=21, barbershop_id=9,  date=d(6,11,0),  end_time=d(6,11,50), status="completed"),
        dict(user_id=1,  barber_id=7,  barber_service_id=17, barbershop_id=9,  date=d(5,10,0),  end_time=d(5,10,40), status="completed"),
        dict(user_id=2,  barber_id=7,  barber_service_id=19, barbershop_id=9,  date=d(4,10,0),  end_time=d(4,10,55), status="completed"),

        # Sergi en Born Barber Club (barbershop_id=11)
        dict(user_id=1,  barber_id=8,  barber_service_id=22, barbershop_id=11, date=d(7,10,0),  end_time=d(7,10,40), status="completed"),
        dict(user_id=2,  barber_id=8,  barber_service_id=23, barbershop_id=11, date=d(7,11,0),  end_time=d(7,11,50), status="completed"),
        dict(user_id=6,  barber_id=8,  barber_service_id=24, barbershop_id=11, date=d(7,12,0),  end_time=d(7,12,35), status="completed"),
        dict(user_id=10, barber_id=8,  barber_service_id=25, barbershop_id=11, date=d(6,10,0),  end_time=d(6,11,30), status="completed"),
        dict(user_id=11, barber_id=8,  barber_service_id=22, barbershop_id=11, date=d(5,10,0),  end_time=d(5,10,40), status="completed"),
        dict(user_id=1,  barber_id=8,  barber_service_id=23, barbershop_id=11, date=d(4,10,0),  end_time=d(4,10,50), status="completed"),

        # Oriol en Gràcia Grooming (barbershop_id=12)
        dict(user_id=1,  barber_id=9,  barber_service_id=26, barbershop_id=12, date=d(7,9,30),  end_time=d(7,10,25), status="completed"),
        dict(user_id=2,  barber_id=9,  barber_service_id=27, barbershop_id=12, date=d(7,11,0),  end_time=d(7,11,45), status="completed"),
        dict(user_id=6,  barber_id=9,  barber_service_id=28, barbershop_id=12, date=d(6,9,30),  end_time=d(6,10,10), status="completed"),
        dict(user_id=10, barber_id=9,  barber_service_id=29, barbershop_id=12, date=d(5,9,30),  end_time=d(5,10,0),  status="completed"),
        dict(user_id=11, barber_id=9,  barber_service_id=30, barbershop_id=12, date=d(4,9,30),  end_time=d(4,10,45), status="completed"),

        # Ruben en La Barbería del Carmen (barbershop_id=16)
        dict(user_id=1,  barber_id=10, barber_service_id=31, barbershop_id=16, date=d(7,10,0),  end_time=d(7,10,30), status="completed"),
        dict(user_id=2,  barber_id=10, barber_service_id=32, barbershop_id=16, date=d(7,11,0),  end_time=d(7,11,50), status="completed"),
        dict(user_id=6,  barber_id=10, barber_service_id=33, barbershop_id=16, date=d(6,10,0),  end_time=d(6,10,30), status="completed"),
        dict(user_id=10, barber_id=10, barber_service_id=34, barbershop_id=16, date=d(5,10,0),  end_time=d(5,10,25), status="completed"),
        dict(user_id=11, barber_id=10, barber_service_id=31, barbershop_id=16, date=d(4,10,0),  end_time=d(4,10,30), status="completed"),

        # Adrian en Ruzafa Barbers (barbershop_id=18)
        dict(user_id=1,  barber_id=11, barber_service_id=35, barbershop_id=18, date=d(7,10,0),  end_time=d(7,10,45), status="completed"),
        dict(user_id=2,  barber_id=11, barber_service_id=36, barbershop_id=18, date=d(7,11,0),  end_time=d(7,12,0),  status="completed"),
        dict(user_id=6,  barber_id=11, barber_service_id=37, barbershop_id=18, date=d(6,10,0),  end_time=d(6,10,40), status="completed"),
        dict(user_id=10, barber_id=11, barber_service_id=39, barbershop_id=18, date=d(5,10,0),  end_time=d(5,10,55), status="completed"),
        dict(user_id=11, barber_id=11, barber_service_id=35, barbershop_id=18, date=d(4,10,0),  end_time=d(4,10,45), status="completed"),

        # Manuel en La Barbería de Triana (barbershop_id=21)
        dict(user_id=1,  barber_id=12, barber_service_id=40, barbershop_id=21, date=d(7,9,0),   end_time=d(7,9,30),  status="completed"),
        dict(user_id=2,  barber_id=12, barber_service_id=41, barbershop_id=21, date=d(7,10,0),  end_time=d(7,10,40), status="completed"),
        dict(user_id=6,  barber_id=12, barber_service_id=42, barbershop_id=21, date=d(6,9,0),   end_time=d(6,10,0),  status="completed"),
        dict(user_id=10, barber_id=12, barber_service_id=43, barbershop_id=21, date=d(5,9,0),   end_time=d(5,9,15),  status="completed"),
        dict(user_id=11, barber_id=12, barber_service_id=44, barbershop_id=21, date=d(4,9,0),   end_time=d(4,9,20),  status="completed"),
        dict(user_id=1,  barber_id=12, barber_service_id=40, barbershop_id=21, date=d(3,9,0),   end_time=d(3,9,30),  status="completed"),

        # Javi en El Barbero del Rey (barbershop_id=22) - era barbershop_id=4 en BB
        dict(user_id=1,  barber_id=13, barber_service_id=45, barbershop_id=22, date=d(7,10,0),  end_time=d(7,10,35), status="completed"),
        dict(user_id=2,  barber_id=13, barber_service_id=46, barbershop_id=22, date=d(7,11,0),  end_time=d(7,11,50), status="completed"),
        dict(user_id=6,  barber_id=13, barber_service_id=47, barbershop_id=22, date=d(6,10,0),  end_time=d(6,10,35), status="completed"),
        dict(user_id=10, barber_id=13, barber_service_id=48, barbershop_id=22, date=d(5,10,0),  end_time=d(5,11,20), status="completed"),
        dict(user_id=11, barber_id=13, barber_service_id=45, barbershop_id=22, date=d(4,10,0),  end_time=d(4,10,35), status="completed"),

        # Carlos en Gentleman's Cut (barbershop_id=7)
        dict(user_id=1,  barber_id=14, barber_service_id=49, barbershop_id=7,  date=d(7,10,0),  end_time=d(7,10,35), status="completed"),
        dict(user_id=2,  barber_id=14, barber_service_id=50, barbershop_id=7,  date=d(7,11,0),  end_time=d(7,11,45), status="completed"),
        dict(user_id=6,  barber_id=14, barber_service_id=51, barbershop_id=7,  date=d(6,10,0),  end_time=d(6,10,45), status="completed"),
        dict(user_id=10, barber_id=14, barber_service_id=52, barbershop_id=7,  date=d(5,10,0),  end_time=d(5,10,40), status="completed"),
        dict(user_id=11, barber_id=14, barber_service_id=53, barbershop_id=7,  date=d(4,10,0),  end_time=d(4,11,5),  status="completed"),

        # Ricardo en barbería 2 (New Style, Zamora)
        dict(user_id=1,  barber_id=1,  barber_service_id=2,  barbershop_id=2,  date=d(7,9,0),   end_time=d(7,9,20),  status="completed"),
        dict(user_id=2,  barber_id=1,  barber_service_id=2,  barbershop_id=2,  date=d(6,9,0),   end_time=d(6,9,20),  status="completed"),
        dict(user_id=6,  barber_id=1,  barber_service_id=2,  barbershop_id=2,  date=d(5,9,0),   end_time=d(5,9,20),  status="completed"),

        # Estefanía en barbería 2 (New Style)
        dict(user_id=10, barber_id=2,  barber_service_id=3,  barbershop_id=2,  date=d(7,10,0),  end_time=d(7,11,0),  status="completed"),
        dict(user_id=11, barber_id=2,  barber_service_id=3,  barbershop_id=2,  date=d(5,10,0),  end_time=d(5,11,0),  status="completed"),

        # ── MAÑANA (2026-03-05) - dejar HUECOS para demo ─────────
        # Solo llenamos la mañana, tarde libre para reservar en vivo

        dict(user_id=1,  barber_id=5,  barber_service_id=7,  barbershop_id=6,  date=f(manana,9,0),   end_time=f(manana,9,30),  status="confirmed"),
        dict(user_id=2,  barber_id=5,  barber_service_id=8,  barbershop_id=6,  date=f(manana,10,0),  end_time=f(manana,10,45), status="confirmed"),
        dict(user_id=6,  barber_id=6,  barber_service_id=12, barbershop_id=6,  date=f(manana,12,0),  end_time=f(manana,12,35), status="confirmed"),
        dict(user_id=1,  barber_id=7,  barber_service_id=17, barbershop_id=9,  date=f(manana,10,0),  end_time=f(manana,10,40), status="confirmed"),
        dict(user_id=2,  barber_id=8,  barber_service_id=22, barbershop_id=11, date=f(manana,10,0),  end_time=f(manana,10,40), status="confirmed"),
        dict(user_id=6,  barber_id=9,  barber_service_id=27, barbershop_id=12, date=f(manana,9,30),  end_time=f(manana,10,15), status="confirmed"),
        dict(user_id=10, barber_id=10, barber_service_id=31, barbershop_id=16, date=f(manana,10,0),  end_time=f(manana,10,30), status="confirmed"),
        dict(user_id=11, barber_id=11, barber_service_id=35, barbershop_id=18, date=f(manana,10,0),  end_time=f(manana,10,45), status="confirmed"),
        dict(user_id=1,  barber_id=12, barber_service_id=40, barbershop_id=21, date=f(manana,9,0),   end_time=f(manana,9,30),  status="confirmed"),
        dict(user_id=2,  barber_id=13, barber_service_id=45, barbershop_id=22, date=f(manana,10,0),  end_time=f(manana,10,35), status="confirmed"),
        dict(user_id=6,  barber_id=14, barber_service_id=49, barbershop_id=7,  date=f(manana,10,0),  end_time=f(manana,10,35), status="confirmed"),

        # ── PASADO MAÑANA (2026-03-06) - casi vacío para demo ────
        dict(user_id=1,  barber_id=5,  barber_service_id=9,  barbershop_id=6,  date=f(pasado,9,0),   end_time=f(pasado,10,0),  status="pending"),
        dict(user_id=2,  barber_id=7,  barber_service_id=19, barbershop_id=9,  date=f(pasado,10,0),  end_time=f(pasado,10,55), status="pending"),
        dict(user_id=6,  barber_id=12, barber_service_id=42, barbershop_id=21, date=f(pasado,9,0),   end_time=f(pasado,10,0),  status="pending"),
    ]

    total = 0
    errores = 0
    for c in citas:
        try:
            appt = Appointment(**c)
            db.session.add(appt)
            total += 1
        except Exception as e:
            print(f"❌ Error: {e}")
            errores += 1

    db.session.commit()

    print(f"\n{'='*50}")
    print(f"🎉 CITAS CREADAS: {total}")
    print(f"❌ ERRORES: {errores}")
    print(f"{'='*50}")
    print(f"\n📅 Distribución:")
    print(f"  Últimos 7 días (completadas): {len([c for c in citas if c.get('status') == 'completed'])}")
    print(f"  Mañana 05/03 (confirmadas):   {len([c for c in citas if c.get('status') == 'confirmed'])}")
    print(f"  Pasado 06/03 (pendientes):    {len([c for c in citas if c.get('status') == 'pending'])}")
    print(f"\n✅ Huecos libres para demo:")
    print(f"  Mañana tarde: 14:00 en adelante en todos los barberos")
    print(f"  Pasado: casi todo el día libre")
