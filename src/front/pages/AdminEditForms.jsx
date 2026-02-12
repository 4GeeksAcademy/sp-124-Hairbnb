import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminEditClient } from "../components/AdminEditClient";
import { AdminEditBarbershop } from "../components/AdminEditBarbershop";
import { AdminEditBarber } from "../components/AdminEditBarber";
import { AdminEditOwner } from "../components/AdminEditOwners";
import { AdminEditAppt } from "../components/AdminEditAppt";
import { AdminEditAdmin } from "../components/AdminEditAdmin";
import { AdminEditBarberServices } from "../components/AdminEditBarberServices";
import { AdminEditSchedule } from "../components/AdminEditSchedule";
import { AdminEditInvitation } from "../components/AdminEditInvitation";


export const AdminEditForms = () => {
    const { entity, id } = useParams();
    const navigate = useNavigate();

    const renderForm = () => {
        switch (entity) {
            case "users":
                return <AdminEditClient />;
            case "barbershops":
                return <AdminEditBarbershop />;
            case "barbers":
                return <AdminEditBarber />;
            case "owners":
                return <AdminEditOwner />;
            case "appointments":
                return <AdminEditAppt />;
            case "adminusers":
                return <AdminEditAdmin />;
            case "barber_services":
                return <AdminEditBarberServices />;
            case "schedules":
                return <AdminEditSchedule />;
            case "invitations":
                return <AdminEditInvitation />;

            default:
                return (
                    <div className="container mt-5 text-center">
                        <h2 className="text-muted">Formulario no encontrado</h2>
                        <hr/>
                        <p>No existe un editor para la entidad: <strong>{entity}</strong></p>
                        <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>Volver</button>
                    </div>
                );
        }
    };

    return (
        <div className="admin-editor-wrapper py-4">
            {renderForm()}
        </div>
    );
};