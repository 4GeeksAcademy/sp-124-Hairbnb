import React, { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";
import "../styles/admindashboard.css";

export const AdminDashboard = () => {
    const { store, dispatch } = useGlobalReducer();
    const [endpoint, setEndpoint] = useState("users");
    const [data, setData] = useState([]);
    const navigate = useNavigate();
    

    const generalTables = [
        { route: "users", label: "CLIENTE", icon: "fa-users" },
        { route: "barbershops", label: "BARBERÍA", icon: "fa-shop" },
        { route: "owners", label: "DUEÑO", icon: "fa-user-tie" },
        { route: "appointments", label: "CITA", icon: "fa-calendar-check" },
        { route: "adminusers", label: "ADMIN", icon: "fa-user-shield" },
        { route: "barbers", label: "BARBERO", icon: "fa-scissors" },
        { route: "barber_services", label: "SERVICIO", icon: "fa-hand-sparkles" },
        { route: "schedules", label: "HORARIO", icon: "fa-clock" },
        { route: "conversations", label: "CHAT", icon: "fa-comments" },
        { route: "messages", label: "MENSAJE", icon: "fa-envelope" },
    ];

    const currentTable = generalTables.find(t => t.route === endpoint);
    const currentLabel = currentTable ? currentTable.label : endpoint;

    const loadData = async () => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/admin/${endpoint}`;
        try {
            const response = await fetch(url, { headers: { "Authorization": `Bearer ${store.token}` } });
            if (response.ok) {
                const json = await response.json();
                setData(Array.isArray(json) ? json : [json]);
            } else { setData([]); }
        } catch (error) { console.error("Error de conexión"); }
    };

    useEffect(() => { if (store.token) loadData(); }, [endpoint, store.token]);

    const handleEdit = (item) => {
        if (["conversations", "messages", "invitations"].includes(endpoint)) {
            dispatch({ type: "set-message", payload: { type: "error", msg: `Registros de ${endpoint} protegidos.` } });
            return;
        }
        navigate(`/admin/${endpoint}/${item.id}`);
    };

    const handleDelete = async (id) => {
        if (!confirm("¿Deseas eliminar este registro de forma permanente?")) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/${endpoint}/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${store.token}` }
            });
            if (response.ok) loadData();
        } catch (error) { console.error("Error al borrar"); }
    };

    if (store.role !== "admin") {
        return (
            <div className="container mt-5 text-center">
                <h2 className="Oswald text-uppercase">Acceso restringido</h2>
            </div>
        );
    }

    return (
        <div className="container admin-container mt-4">
            <div className="admin-header d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="Oswald text-uppercase fw-bold mb-0">Panel de control</h2>
                    <span className="text-muted small">Gestión de datos</span>
                </div>
                <button className="btn-confirm" onClick={() => navigate(`/admin/${endpoint}`)}>
                    <i className="fa-solid fa-plus me-2"></i> 
                    NUEVO {currentLabel.slice(-1) === 's' ? currentLabel.slice(0, -1) : currentLabel}
                </button>
            </div>

            <div className="admin-nav-console mb-4">
                {generalTables.map(item => (
                    <button
                        key={item.route}
                        className={`nav-item-btn Oswald text-uppercase ${endpoint === item.route ? "active" : ""}`}
                        onClick={() => setEndpoint(item.route)}
                    >
                        <i className={`fa-solid ${item.icon} me-2`}></i>
                        {item.label}
                    </button>
                ))}
            </div>

            <div className="admin-table-card">
                <div className="table-responsive" style={{ maxHeight: "500px" }}>
                    <table className="table custom-admin-table align-middle">
                        <thead>
                            <tr>
                                {data.length > 0 && Object.keys(data[0]).map(key => (
                                    <th key={key}>{key.replace('_', ' ')}</th>
                                ))}
                                <th className="text-center">ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={index}>
                                    {Object.values(item).map((val, i) => (
                                        <td key={i} className="text-truncate" style={{ maxWidth: "150px" }}>
                                            {typeof val === 'boolean' ? (
                                                <span className={`admin-badge ${val ? 'admin-badge-true' : 'admin-badge-false'}`}>
                                                    {val ? 'SÍ' : 'NO'}
                                                </span>
                                            ) : (val === null ? "-" : String(val))}
                                        </td>
                                    ))}
                                    <td>
                                        <div className="d-flex justify-content-center gap-2">
                                            <button className="action-btn action-btn-edit" onClick={() => handleEdit(item)}>
                                                <i className="fa-solid fa-pen"></i>
                                            </button>
                                            <button className="action-btn action-btn-delete" onClick={() => handleDelete(item.id)}>
                                                <i className="fa-solid fa-trash-can"></i>
                                            </button>
                                        </div>
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