import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const AdminEditSchedule = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const { id } = useParams();

    const [barbers, setBarbers] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [selectedBarberId, setSelectedBarberId] = useState("");
    const [selectedInvitationId, setSelectedInvitationId] = useState("");
    const [loading, setLoading] = useState(false);

    const [weeklySchedule, setWeeklySchedule] = useState({
        Monday: { t1_start: "", t1_end: "", t2_start: "", t2_end: "", active: false },
        Tuesday: { t1_start: "", t1_end: "", t2_start: "", t2_end: "", active: false },
        Wednesday: { t1_start: "", t1_end: "", t2_start: "", t2_end: "", active: false },
        Thursday: { t1_start: "", t1_end: "", t2_start: "", t2_end: "", active: false },
        Friday: { t1_start: "", t1_end: "", t2_start: "", t2_end: "", active: false },
        Saturday: { t1_start: "", t1_end: "", t2_start: "", t2_end: "", active: false },
        Sunday: { t1_start: "", t1_end: "", t2_start: "", t2_end: "", active: false },
    });

    const dayLabels = {
        Monday: "Lunes", Tuesday: "Martes", Wednesday: "Miércoles",
        Thursday: "Jueves", Friday: "Viernes", Saturday: "Sábado", Sunday: "Domingo"
    };

    const getShopHours = (dayKey) => {
        const invitation = invitations.find(i => String(i.id) === String(selectedInvitationId));
        if (!invitation || !invitation.barbershop?.working_hours) return null;
        return invitation.barbershop.working_hours[dayLabels[dayKey]] || null;
    };

    useEffect(() => {
        const initLoad = async () => {
            setLoading(true);
            const headers = { "Authorization": `Bearer ${store.token}` };
            try {
                const [resB, resI] = await Promise.all([
                    fetch(`${import.meta.env.VITE_BACKEND_URL}/barbers`, { headers }),
                    fetch(`${import.meta.env.VITE_BACKEND_URL}/invitations`, { headers })
                ]);
                const barbersData = resB.ok ? await resB.json() : [];
                console.log("ESTO LLEGA DEL BACKEND:", barbersData);
                const allInvsData = resI.ok ? await resI.json() : [];
                const acceptedInvs = allInvsData.filter(i => i.status === "accepted");

                setBarbers(barbersData);
                setInvitations(acceptedInvs);


                if (id) {
                    const resS = await fetch(`${import.meta.env.VITE_BACKEND_URL}/schedules/${id}`, { headers });
                    if (resS.ok) {
                        const scheduleRow = await resS.json();
                        const invId = scheduleRow.barber_barbershop_id;
                        const myInv = acceptedInvs.find(inv => String(inv.id) === String(invId));
                        if (myInv) {
                            setSelectedBarberId(String(myInv.barber_id));
                            setSelectedInvitationId(String(myInv.id));
                            const resFull = await fetch(`${import.meta.env.VITE_BACKEND_URL}/schedules/by_invitation/${invId}`, { headers });
                            if (resFull.ok) {
                                const fullData = await resFull.json();
                                mapToState(fullData);
                            }
                        }
                    }
                }
            } catch (error) { console.error(error); } finally { setLoading(false); }
        };
        if (store.token) initLoad();
    }, [id, store.token]);

    const mapToState = (data) => {
        const newState = {
            Monday: { t1_start: "", t1_end: "", t2_start: "", t2_end: "", active: false },
            Tuesday: { t1_start: "", t1_end: "", t2_start: "", t2_end: "", active: false },
            Wednesday: { t1_start: "", t1_end: "", t2_start: "", t2_end: "", active: false },
            Thursday: { t1_start: "", t1_end: "", t2_start: "", t2_end: "", active: false },
            Friday: { t1_start: "", t1_end: "", t2_start: "", t2_end: "", active: false },
            Saturday: { t1_start: "", t1_end: "", t2_start: "", t2_end: "", active: false },
            Sunday: { t1_start: "", t1_end: "", t2_start: "", t2_end: "", active: false },
        };
        data.forEach(item => {
            const day = item.day_of_week;
            if (newState[day]) {
                const start = item.start_time.slice(0, 5);
                const end = item.end_time.slice(0, 5);
                if (!newState[day].active) {
                    newState[day].active = true;
                    newState[day].t1_start = start;
                    newState[day].t1_end = end;
                } else {
                    newState[day].t2_start = start;
                    newState[day].t2_end = end;
                }
            }
        });
        setWeeklySchedule(newState);
    };

    const handleCheckDay = (day) => {
        setWeeklySchedule(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                active: !prev[day].active,
                t1_start: !prev[day].active ? "09:00" : "",
                t1_end: !prev[day].active ? "14:00" : ""
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const delRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/schedules/by_invitation/${selectedInvitationId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${store.token}` }
            });

            if (!delRes.ok) throw new Error("No se pudo limpiar el horario anterior.");

            const activeDays = Object.keys(weeklySchedule).filter(d => weeklySchedule[d].active);
            
            for (let day of activeDays) {
                const d = weeklySchedule[day];

                const saveTurn = async (s, e_t) => {
                    if (!s || !e_t) return;
                    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/schedules`, {
                        method: "POST",
                        headers: { 
                            "Content-Type": "application/json", 
                            "Authorization": `Bearer ${store.token}` 
                        },
                        body: JSON.stringify({ 
                            invitation_id: selectedInvitationId, 
                            day_of_week: day, 
                            start_time: s, 
                            end_time: e_t 
                        })
                    });

                    const data = await res.json();

                    if (!res.ok) {
                        throw new Error(data.message?.msg || `Error en el tramo de ${dayLabels[day]}`);
                    }
                };

                await saveTurn(d.t1_start, d.t1_end);
                if (d.t2_start && d.t2_end) {
                    await saveTurn(d.t2_start, d.t2_end);
                }
            }

            dispatch({ type: "set-message", payload: { type: "success", msg: "Horario actualizado correctamente" } });
            navigate("/4dm1n1str4t10n");

        } catch (error) {
            console.error(error);
            dispatch({ 
                type: "set-message", 
                payload: { type: "error", msg: error.message || "Error al conectar con el servidor" } 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5" style={{ maxWidth: '850px' }}>
            <div className="booking-card shadow-sm border-0">
                <div className="booking-header text-center py-4">
                    <h2 className="Oswald mb-0 text-uppercase fw-bold">
                        {id ? "Editar horario" : "Nuevo horario"}
                    </h2>
                    <div className="mt-2 mx-auto" style={{ width: '40px', height: '2px', background: '#d19f68' }}></div>
                </div>

                <div className="p-4 p-md-5">
                    <div className="row g-4 mb-4">
                        <div className="col-md-6 form-group-custom">
                            <label className="text-muted Oswald small text-uppercase fw-bold">Profesional</label>
                            <select
                                className="select-custom"
                                value={selectedBarberId}
                                onChange={(e) => { setSelectedBarberId(e.target.value); setSelectedInvitationId(""); }}
                                required
                            >
                                <option value="">Selecciona profesional</option>
                                {barbers && barbers.map(b => (
                                    <option key={b.id} value={String(b.id)}>
                                        {b.barber_name || b.full_name || b.user?.name || b.display_name || `Barbero #${b.id}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-6 form-group-custom">
                            <label className="text-muted Oswald small text-uppercase fw-bold">Lugar</label>
                            <select className="select-custom" value={selectedInvitationId} onChange={(e) => setSelectedInvitationId(e.target.value)} disabled={!selectedBarberId} required>
                                <option value="">Selecciona un local</option>
                                {invitations.filter(inv => String(inv.barber_id) === String(selectedBarberId)).map(inv => (
                                    <option key={inv.id} value={String(inv.id)}>
                                        {inv.barbershop_name || (inv.barbershop && inv.barbershop.name) || "Local sin nombre"}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {selectedInvitationId && (
                        <form onSubmit={handleSubmit} className="animate__animated animate__fadeIn">
                            <div className="mt-5">
                                <label className="Oswald text-uppercase small fw-bold mb-4 d-block text-gold border-bottom pb-2">Configuración por días</label>

                                {Object.keys(weeklySchedule).map((day) => {
                                    const shop = getShopHours(day);
                                    return (
                                        <div key={day} className={`d-flex flex-column flex-md-row align-items-md-center justify-content-between p-3 mb-2 rounded-2 border ${weeklySchedule[day].active ? 'bg-white' : 'bg-light opacity-50'}`}
                                            style={{ transition: '0.2s', borderColor: weeklySchedule[day].active ? '#d19f68' : '#eee' }}>

                                            <div className="d-flex align-items-center mb-3 mb-md-0" style={{ minWidth: '180px' }}>
                                                <div className="d-flex flex-column">
                                                    <div className="d-flex align-items-center">
                                                        <div className="form-check form-switch me-3">
                                                            <input className="form-check-input custom-switch" type="checkbox" checked={weeklySchedule[day].active} onChange={() => handleCheckDay(day)} />
                                                        </div>
                                                        <span className={`Oswald text-uppercase fw-bold ${weeklySchedule[day].active ? 'text-dark' : 'text-muted'}`}>{dayLabels[day]}</span>
                                                    </div>

                                                    {shop ? (
                                                        <div className="text-gold mt-1 Oswald" style={{ fontSize: '0.7rem', marginLeft: '3.2rem' }}>
                                                            <i className="far fa-clock me-1"></i>
                                                            LOCAL: {shop.m_start?.slice(0, 5)}-{shop.m_end?.slice(0, 5)}
                                                            {shop.a_start && ` / ${shop.a_start.slice(0, 5)}-${shop.a_end.slice(0, 5)}`}
                                                        </div>
                                                    ) : (
                                                        <div className="text-muted mt-1 Oswald" style={{ fontSize: '0.7rem', marginLeft: '3.2rem' }}>CERRADO EN LOCAL</div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="d-flex flex-wrap gap-4 align-items-center">
                                                <div className="d-flex align-items-center gap-2">
                                                    <span className="small text-muted fw-bold Oswald">T1:</span>
                                                    <input type="time" className="form-control form-control-sm border-0 border-bottom rounded-0 bg-transparent px-1" style={{ width: '80px' }} value={weeklySchedule[day].t1_start} disabled={!weeklySchedule[day].active} onChange={(e) => setWeeklySchedule({ ...weeklySchedule, [day]: { ...weeklySchedule[day], t1_start: e.target.value } })} />
                                                    <span className="text-muted">-</span>
                                                    <input type="time" className="form-control form-control-sm border-0 border-bottom rounded-0 bg-transparent px-1" style={{ width: '80px' }} value={weeklySchedule[day].t1_end} disabled={!weeklySchedule[day].active} onChange={(e) => setWeeklySchedule({ ...weeklySchedule, [day]: { ...weeklySchedule[day], t1_end: e.target.value } })} />
                                                </div>

                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="form-check">
                                                        <input type="checkbox" className="form-check-input" disabled={!weeklySchedule[day].active} checked={!!weeklySchedule[day].t2_start}
                                                            onChange={(e) => setWeeklySchedule({ ...weeklySchedule, [day]: { ...weeklySchedule[day], t2_start: e.target.checked ? "16:00" : "", t2_end: e.target.checked ? "20:00" : "" } })} />
                                                    </div>
                                                    <span className="small text-muted fw-bold Oswald">T2:</span>
                                                    <input type="time" className="form-control form-control-sm border-0 border-bottom rounded-0 bg-transparent px-1" style={{ width: '80px' }} value={weeklySchedule[day].t2_start} disabled={!weeklySchedule[day].active || !weeklySchedule[day].t2_start} onChange={(e) => setWeeklySchedule({ ...weeklySchedule, [day]: { ...weeklySchedule[day], t2_start: e.target.value } })} />
                                                    <span className="text-muted">-</span>
                                                    <input type="time" className="form-control form-control-sm border-0 border-bottom rounded-0 bg-transparent px-1" style={{ width: '80px' }} value={weeklySchedule[day].t2_end} disabled={!weeklySchedule[day].active || !weeklySchedule[day].t2_start} onChange={(e) => setWeeklySchedule({ ...weeklySchedule, [day]: { ...weeklySchedule[day], t2_end: e.target.value } })} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="d-flex justify-content-between mt-5 pt-4">
                                <button type="button" className="btn btn-link text-muted text-decoration-none Oswald small" onClick={() => navigate(-1)}>VOLVER</button>
                                <button type="submit" className="btn-confirm px-5" disabled={loading}>
                                    {loading ? "GUARDANDO..." : "GUARDAR"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};