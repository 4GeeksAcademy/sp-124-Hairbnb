import React, { useEffect } from "react"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useNavigate } from "react-router-dom";

export const Home = () => {
	const navigate = useNavigate()
	const { dispatch } = useGlobalReducer();

	
	return (
		<div className="text-center mt-5">
			<img src="/public/Logo-HBNB-completo.png" width="20%"></img>
			<p className="display-6 m-4">Bienvenido a Hairbnb</p>
			<div className="mx-5 my-5">
				<button type="button" className="btn btn-outline-secondary m-2" onClick={() => navigate("/login/admin")}>Vista de admin</button>
			</div>
		</div>
	);
}; 