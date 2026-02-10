import React, { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";

export const AdminDashboard = () => {
    const { store } = useGlobalReducer();
    const [endpoint, setEndpoint] = useState("users");
    const [data, setData] = useState([]);

    const generalTables = [
        { route: "users", label: "Clientes" },
        { route: "barbershops", label: "Barberías" },
        { route: "owners", label: "Dueños" },
        { route: "appointments", label: "Citas" },
        { route: "adminusers", label: "Administradores" },
        { route: "barbers", label: "Barberos" },
        { route: "barber_services", label: "Servicios de Barbero" },
        { route: "schedules", label: "Horarios" },
        { route: "invitations", label: "Barbero-Barbería" },

    ];
    const navigate = useNavigate();
    const formRoutes = {
        "users": "/signup/client",
        "barbershops": "/barbershops_form",
        "owners": "/signup/owner",
        "barbers": "/signup/barber",
        "barber_services": "/barber_services_form",
        "schedules": "/schedules_form",
        "appointments": "/barber_appointment_form",
        "invitations": null
    };

    const handleEdit = (item) => {
        const route = formRoutes[endpoint];
        if (route) {
            navigate(`${route}/${item.id}`);
        } else {
            alert("Esta tabla no tiene un formulario de edición asignado.");
        }
    };

    const handleAdd = () => {
        const route = formRoutes[endpoint];
        if (route) navigate(route);
    };


    const loadData = async () => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/admin/${endpoint}`;

        try {
            const resp = await fetch(url, {
                headers: {
                    "Authorization": `Bearer ${store.token}`
                }
            });

            if (resp.ok) {
                const json = await resp.json();
                setData(Array.isArray(json) ? json : [json]);
            } else {
                console.error(`Error ${resp.status} en ${url}`);
                setData([]);
            }
        } catch (error) {
            console.error("Error de conexión");
        }
    };

    useEffect(() => {
        if (store.token) loadData();
    }, [endpoint, store.token]);

    const handleDelete = async (id) => {
        if (!confirm("¿Eliminar registro permanente?")) return;

        const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/${endpoint}/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${store.token}` }
        });

        if (resp.ok) loadData();
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4 text-primary">Base de Datos General</h2>

            <div className="nav nav-pills mb-4 bg-light p-2 rounded shadow-sm">
                {generalTables.map(item => (
                    <button
                        key={item.route}
                        className={`nav-link border-0 me-2 ${endpoint === item.route ? "active" : "text-dark"}`}
                        onClick={() => setEndpoint(item.route)}
                    >
                        {item.label}
                    </button>

                ))}

            </div>
            <div className="d-flex justify-content-end mb-3">
                <button className="btn btn-success mx-auto" onClick={handleAdd}>
                    Crear nuevo elemento en {endpoint.toLowerCase()}
                </button>
            </div>


            <div className="card ">
                <div className="table-responsive">
                    <table className="table">
                        <thead className="table-dark">
                            <tr>
                                {data.length > 0 && Object.keys(data[0]).map(key => (
                                    <th key={key}>{key}</th>
                                ))}
                                <th className="text-center">ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={index}>
                                    {Object.values(item).map((val, i) => (
                                        <td key={i}>
                                            {typeof val === 'boolean' ? (val ? '✅' : '❌') : (val === null ? "-" : String(val))}
                                        </td>
                                    ))}
                                    <td className="text-center">
                                        <button
                                            className="btn btn-outline-primary me-2"
                                            onClick={() => handleEdit(item)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className="btn btn-outline-danger"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            Borrar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};