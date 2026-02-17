import React, { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";

export const AdminDashboard = () => {
    const { store, dispatch } = useGlobalReducer();
    const [endpoint, setEndpoint] = useState("users");
    const [data, setData] = useState([]);
    const navigate = useNavigate();

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
        { route: "conversations", label: "Conversaciones" },
        { route: "messages", label: "Mensajes" },
    ];

    const handleEdit = (item) => {
        const nonEditableTables = ["invitations", "conversations", "messages"];

        if (nonEditableTables.includes(endpoint)) {
            dispatch({
                type: "set-message",
                payload: {
                    type: "error",
                    msg: `Los registros de ${endpoint} no se pueden editar por seguridad e integridad de datos.`
                }
            });
            return;
        }

        navigate(`/admin/${endpoint}/${item.id}`);
    };


const handleAdd = () => {
    navigate(`/admin/${endpoint}`);
};

const loadData = async () => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/admin/${endpoint}`;
    try {
        const response = await fetch(url, {
            headers: { "Authorization": `Bearer ${store.token}` }
        });
        if (response.ok) {
            const json = await response.json();
            setData(Array.isArray(json) ? json : [json]);
        } else {
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

    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/${endpoint}/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${store.token}` }
        });

        if (response.ok) {
            loadData();
        }
    } catch (error) {
        console.error("Error en la petición de borrado:", error);
    }
};

if (store.role !== "admin") {
    return (
        <div className="container mt-4">
            <h2 className="text-danger">Acceso denegado</h2>
            <p>Inicia sesión para acceder al panel de administración.</p>
        </div>
    );
}

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

        <div className="card shadow-sm border-0">
            <div className="table-responsive">
                <table className="table align-middle">
                    <thead className="table-dark">
                        <tr>
                            {data.length > 0 && Object.keys(data[0]).map(key => (
                                <th key={key}>{key.toUpperCase()}</th>
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
                                        className={`btn me-2 ${endpoint === 'invitations' ? 'btn-outline-secondary' : 'btn-outline-primary'}`}
                                        onClick={() => handleEdit(item)}
                                    >
                                        {endpoint === 'invitations' ? 'Info' : 'Editar'}
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