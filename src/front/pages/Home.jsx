import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";
import { useEffect, useState } from "react";
import decoration from "../../../public/about-shape.png"

export const Home = () => {
    
    const navigate = useNavigate();
    const texts = [
        { title: <>TU PRÓXIMO CORTE<br />A UN CLICK</>, sub: "Encuentra a los mejores barberos y gestiona tus citas." },
        { title: <>ESTILO EXCLUSIVO<br />A TU ALCANCE</>, sub: "Transforma tu imagen en los salones más exclusivos." },
        { title: <>RESERVA RÁPIDA<br />Y SENCILLA</>, sub: "La plataforma definitiva donde el estilo se une con la comodidad." },
        { title: <>POTENCIA TU<br />SALÓN</>, sub: "La herramienta integral para gestionar tu equipo, tus citas y el crecimiento de tu negocio." },
        { title: <>OLVÍDATE DE<br />LAS ESPERAS</>, sub: "Reserva en tiempo real y recibe recordatorios para que tu única preocupación sea lucir bien." },
        { title: <>TU IMAGEN,<br />TU IDENTIDAD</>, sub: "Conecta con estilistas que entienden tu estilo y elevan tu confianza al siguiente nivel." },
    ];
    const [index, setIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setIndex((prev) => (prev + 1) % texts.length);
                setFade(true);
            }, 500);
        }, 4000);
        window.scrollTo(0,0);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="home-container">
            <section className="hero-section d-flex align-items-center">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8">
                            <div className="hero-content text-start">
                                <span className="text-gold text-uppercase fw-bold ls-2">Estilo & Profesionalidad</span>
                                <div className={`hero-animated-box ${fade ? 'fade-in' : 'fade-out'}`}>
                                    <h1 className="display-2 text-white fw-bold mt-4 hairbnb-title">
                                        {texts[index].title}
                                    </h1>
                                    <p className="lead text-white mb-5">
                                        {texts[index].sub}
                                    </p>
                                </div>
                                <div className="hero-btns">
                                    <button
                                        className="hairbnb-btn me-3"
                                        onClick={() => document.getElementById('community').scrollIntoView({ behavior: 'smooth' })}
                                    >
                                        Empezar ahora
                                    </button>
                                    <button className="btn-outline-gold" onClick={() => navigate("/asociates")}>
                                        Explorar centros
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="about-section py-5 position-relative overflow-hidden">
                <img
                    src={decoration}
                    alt="Decoración"
                    className="about-decor-img d-none d-lg-block"
                />

                <div className="container py-5">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <div className="about-img-wrap position-relative">
                                <div className="border-decoration-gold" />
                                <img
                                    src="https://images.unsplash.com/photo-1596728325488-58c87691e9af?q=80&w=1473&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                    alt="Barbería Premium"
                                    className="img-fluid position-relative z-index-1 shadow-lg"
                                />
                            </div>
                        </div>

                        <div className="col-lg-6 ps-lg-5 mt-5 mt-lg-0">
                            <h2 className="text-gold my-4 Oswald display-5 fw-bold text-uppercase">¿QUÉ ES HAIRBNB?</h2>
                            <p className="text-black-50 fs-5 lh-base mb-4">
                                Somos el puente entre los profesionales de la tijera y quienes buscan no solo un corte, sino una experiencia personalizada.
                            </p>
                            <p className="text-black-50 fs-5 lh-base mb-4">
                                Hairbnb nace como la herramienta definitiva para digitalizar el sector de la barbería y peluquería, eliminando las barreras tradicionales y optimizando el tiempo de todos los integrantes del ecosistema.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="steps-section py-5 text-white">
                <div className="container py-5">
                    <div className="text-center mb-5">
                        <span className="text-gold text-uppercase fw-bold ls-2">Simplifica tu vida</span>
                        <h2 className="Oswald display-5 fw-bold mt-2">TU RESERVA EN 3 PASOS</h2>
                    </div>

                    <div className="row text-center g-4">
                        <div className="col-md-4">
                            <div className="step-item">
                                <div className="step-number Oswald">01</div>
                                <h3 className="Oswald h4 mt-3">ENCUENTRA</h3>
                                <p className="text-white-50">Explora los mejores barberos y salones<br />cerca de tu ubicación actual.</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="step-item">
                                <div className="step-number Oswald">02</div>
                                <h3 className="Oswald h4 mt-3">RESERVA</h3>
                                <p className="text-white-50">Elige el servicio, el profesional<br />y la hora que mejor te convenga.</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="step-item">
                                <div className="step-number Oswald">03</div>
                                <h3 className="Oswald h4 mt-3">DISFRUTA</h3>
                                <p className="text-white-50">Recibe tu recordatorio, acude a tu cita<br />y luce tu mejor versión.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="expert-container">
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="text-dark Oswald display-4 fw-bold" id="community">NUESTRA COMUNIDAD</h2>
                        <div className="mx-auto" style={{ width: '60px', height: '4px', backgroundColor: '#d19f68' }}></div>
                    </div>

                    <div className="row expert-row g-4">

                        <div className="col-lg-4 col-md-12 col-sm-12">
                            <div className="expert-card">
                                <div className="expert-profile">
                                    <img src="https://d3sc42dkmius1e.cloudfront.net/mb/2023/09/How-To-Manage-Barbershop-Clients-Expectations.jpg" alt="Cliente" />
                                </div>
                                <div className="brush-wrapper">
                                    <img src="brush_black.png" className="brush-img brush-black" alt="brush" />
                                    <img src="brush_gold.png" className="brush-img brush-gold" alt="brush" />
                                    <h4>PARA<br />CLIENTES</h4>
                                </div>
                                <div className="expert-description-container">
                                    <p className="expert-description">
                                        Somos el puente hacia tu mejor versión. Encuentra a los mejores profesionales de la tijera, reserva tu cita en segundos y disfruta de una experiencia personalizada en los salones más exclusivos de tu ciudad.
                                    </p>
                                    <hr className="border-white opacity-75 my-3" />
                                    <p className="fw-bold text-gold text-uppercase ls-2 mt-auto" style={{ fontSize: '1.1rem' }}>
                                        No es solo un corte, es tu carta de presentación.
                                    </p>

                                    <button className="btn-outline-gold w-100 mt-auto" onClick={() => navigate("/signup/client")}>EMPEZAR</button>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4 col-md-12 col-sm-12">
                            <div className="expert-card">
                                <div className="expert-profile">
                                    <img src="https://us.123rf.com/450wm/ivanshenets/ivanshenets2004/ivanshenets200400480/145538070-peluquero-peluquero-de-primer-plano-con-tijeras-para-cortar-el-cabello.jpg?ver=6" alt="Barbero" />
                                </div>
                                <div className="brush-wrapper">
                                    <img src="brush_black.png" className="brush-img brush-black" alt="brush" />
                                    <img src="brush_gold.png" className="brush-img brush-gold" alt="brush" />
                                    <h4>PARA<br />BARBEROS</h4>
                                </div>
                                <div className="expert-description-container">
                                    <p className="expert-description">
                                        Digitaliza tu talento y elimina las barreras tradicionales. Optimiza tu tiempo de trabajo, tus horarios, date a conocer en una comunidad creciente y conecta directamente con clientes que buscan tu estilo único.
                                    </p>
                                    <hr className="border-white opacity-75 my-3" />
                                    <p className="fw-bold text-gold text-uppercase ls-2 mt-auto" style={{ fontSize: '1.1rem' }}>
                                        Tú pones el talento, nosotros la herramienta para que brille.
                                    </p>


                                    <button className="btn-outline-gold w-100 mt-auto" onClick={() => navigate("/signup/barber")}>UNIRME</button>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4 col-md-12 col-sm-12">
                            <div className="expert-card">
                                <div className="expert-profile">
                                    <img src="https://media.istockphoto.com/id/1245229656/photo/hairdresser-stands-in-a-hairdressing-studio.jpg?s=612x612&w=0&k=20&c=l3U90beypNBKpkHIq-2FFPjDvF__8vNlZLZsvw0znp8=" alt="Dueño" />
                                </div>
                                <div className="brush-wrapper">
                                    <img src="brush_black.png" className="brush-img brush-black" alt="brush" />
                                    <img src="brush_gold.png" className="brush-img brush-gold" alt="brush" />
                                    <h4>PARA<br />DUEÑOS</h4>
                                </div>
                                <div className="expert-description-container">
                                    <p className="expert-description">
                                        Descubre la herramienta definitiva para tu negocio. Digitaliza tus diferentes salones, gestiona a tu equipo de barberos y obtén datos claros para optimizar cada uno de los rincones de tu ecosistema de trabajo.
                                    </p>
                                    <hr className="border-white opacity-75 my-3" />
                                    <p className="fw-bold text-gold text-uppercase ls-2 mt-auto" style={{ fontSize: '1.1rem' }}>
                                        Toma el control y transforma tu pasión en éxito.
                                    </p>

                                    <button className="btn-outline-gold w-100 mt-auto" onClick={() => navigate("/signup/owner")}>GESTIONAR</button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};