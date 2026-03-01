import React from "react";
import "../styles/services.css";
import { HashLink } from "react-router-hash-link";

export const Services = () => {
  window.scrollTo(0,0);
  return (
    <div className="services-container">
      <section className="services-hero py-5 border-bottom">
        <div className="container text-center py-5">
          <span className="text-gold fw-bold ls-2 text-uppercase">Ecosistema Digital</span>
          <h1 className="display-3 Oswald fw-bold mt-3">SERVICIOS QUE TRANSFORMAN EL SECTOR</h1>
          <p className="lead text-muted mx-auto mt-4" style={{ maxWidth: "800px" }}>
            Hairbnb no es solo una agenda. Es el motor que conecta el talento con la demanda,
            eliminando las esperas para el cliente y optimizando cada minuto de trabajo para el profesional.
          </p>
        </div>
      </section>

      <section className="py-5 bg-white">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-5">
              <h2 className="Oswald display-5 fw-bold mb-4">PARA EL CLIENTE: <br /><span className="text-gold">TU ESTILO SIN ESPERAS</span></h2>
              <div className="service-content-item mb-4">
                <h4 className="Oswald h5">✦ Exploración en Tiempo Real</h4>
                <p className="text-muted">
                  Visualiza en un solo vistazo todas las barberías disponibles a tu alrededor.
                  Sin rodeos: localiza los salones más cercanos mediante nuestro <strong>mapa interactivo</strong> y decide dónde ir hoy mismo.
                </p>
              </div>
              <div className="service-content-item mb-4">
                <h4 className="Oswald h5">✦ Reserva Inmediata 24/7</h4>
                <p className="text-muted">Visualiza la disponibilidad real de cada silla. Olvídate de llamar o escribir por WhatsApp esperando una respuesta que no llega. Eliges hora, confirmas y listo.</p>
              </div>
              <div className="service-content-item mb-4">
                <h4 className="Oswald h5">✦ Conexión Directa por Chat</h4>
                <p className="text-muted">
                  ¿Dudas sobre un servicio o disponibilidad? <strong>Chatea en tiempo real</strong> con los dueños de las barberías.
                  Sin esperas al teléfono ni mensajes perdidos; comunicación directa desde la app para resolver tus dudas al instante.
                </p>
              </div>
            </div>
            <div className="col-lg-7 ps-lg-5 mt-5 mt-lg-0">
              <img src="https://images.unsplash.com/photo-1761148438883-e34e0289a214?q=80&w=1473&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" className="img-fluid shadow-lg rounded" alt="Client Experience" style={{ height: '450px', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-dark text-white">
        <div className="container">
          <div className="row align-items-center flex-row-reverse">
            <div className="col-lg-5 ps-lg-5">
              <h2 className="Oswald display-5 fw-bold mb-4">
                PARA EL BARBERO: <br /><span className="text-gold">POTENCIA TU MARCA</span>
              </h2>

              <div className="service-content-item mb-4">
                <h4 className="Oswald h5 text-white">✦ Independencia y Reputación</h4>
                <p className="text-white-50">Tu perfil en Hairbnb es tu activo más valioso. Construye una base de datos de clientes propia y gestiona tu reputación allá donde trabajes.</p>
              </div>

              <div className="service-content-item mb-4">
                <h4 className="Oswald h5 text-white">✦ Optimización de Agenda</h4>
                <p className="text-white-50">Optimización inteligente de agenda: el sistema identifica tus espacios libres y ofrece automáticamente a cada cliente solo los huecos que encajan con la duración de su servicio.</p>
              </div>

              <div className="service-content-item mb-4">
                <h4 className="Oswald h5 text-white">✦ Control de tu Jornada</h4>
                <p className="text-white-50">
                  Visualiza tus citas del día de un vistazo. Organiza tu tiempo y evita huecos
                  muertos gracias a la gestión de reservas en tiempo real.
                </p>
              </div>
            </div>

            <div className="col-lg-7 mt-5 mt-lg-0">
              <img
                src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=1000"
                className="img-fluid shadow-lg rounded w-100"
                alt="Barber Tools"
                style={{ filter: 'grayscale(0.3)', height: '450px', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-white mb-5 border-top">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-5">
              <h2 className="Oswald display-5 fw-bold mb-4">
                PARA EL DUEÑO: <br /><span className="text-gold">CONTROL TOTAL DEL SALÓN</span>
              </h2>
              <div className="service-content-item mb-4">
                <h4 className="Oswald h5">✦ Tarifa Única Multisede</h4>
                <p className="text-muted">
                  Haz crecer tu imperio sin costes sorpresa. Con Hairbnb <strong>solo pagas una vez por el servicio</strong>, sin importar si gestionas una sola barbería o una red de diez locales. Escalabilidad real para tu negocio.
                </p>
              </div>
              <div className="service-content-item mb-4">
                <h4 className="Oswald h5">✦ Control Centralizado de Plantilla</h4>
                <p className="text-muted">
                  Gestiona a todo tu equipo desde una sola pantalla. Supervisa en tiempo real el flujo de trabajo de cada barbero, sus citas asignadas y el rendimiento global de tus sedes de un solo vistazo.
                </p>
              </div>
              <div className="service-content-item mb-4">
                <h4 className="Oswald h5">✦ Monitorización de Citas en Vivo</h4>
                <p className="text-muted">
                  Mantén el pulso de tu negocio. Accede al historial y a la agenda en vivo para verificar la ocupación de tus sillones, asegurándote de que cada minuto en tu salón está siendo aprovechado al máximo.
                </p>
              </div>
            </div>
            <div className="col-lg-7 ps-lg-5 mt-5 mt-lg-0">
              <img
                src="https://images.unsplash.com/photo-1546641082-f149d4c3c907?q=80&w=1470&auto=format&fit=crop"
                className="img-fluid shadow-lg rounded w-100"
                alt="Office Management"
                style={{ height: '450px', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 text-center">
        <div className="container py-4">
          <h2 className="Oswald display-4 fw-bold">¿LISTO PARA DIGITALIZAR TU PASIÓN?</h2>
          <div className="mt-4">
            <HashLink
              smooth
              to="/#community"
              className="nav-link hairbnb-btn px-4"
              style={{ fontSize: "24px" }}
            >
              ÚNETE AHORA
            </HashLink>
          </div>
        </div>
      </section>
    </div>
  );
};