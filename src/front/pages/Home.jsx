import React, { useEffect } from "react"
import rigoImageUrl from "../assets/img/rigo-baby.jpg";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useNavigate } from "react-router-dom";

export const Home = () => {
	const navigate = useNavigate()
	return (
		<div className="text-center mt-5">
			<img src="/public/Logo-HBNB-completo.png" width="20%"></img>
			<p className="display-6 m-4">Bienvenido a la base de datos de Hairbnb</p>
			<div className="mx-5 my-5">
				<button type="button" className="btn btn-outline-secondary m-2" onClick={() => navigate("/users")}>Sección de usuarios</button>
				<button type="button" className="btn btn-outline-secondary m-2" onClick={() => navigate("/owners")}>Sección de dueños</button>
				<button type="button" className="btn btn-outline-secondary m-2" onClick={() => navigate("/barbershops")}>Sección de barberías</button>
			</div>

			<hr className="m-auto w-50" />

			<div className="mx-5 my-5">
				<button type="button" className="btn btn-outline-secondary m-2" onClick={() => navigate("/services")}>Sección de servicios</button>
			</div>
		</div>
	);
}; 