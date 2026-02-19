import React, { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";

export const ScheduleForm = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const [selectedInvitation, setSelectedInvitation] = useState("");
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

    const myBarbershops = store.invitations?.filter(inv => inv.status === "accepted") || [];

    const toN = (t) => t ? parseInt(t.replace(":", ""), 10) : 0;

    useEffect(() => {
        if (!selectedInvitation) {
            resetForm();
            return;
        }

        const loadExistingSchedules = async () => {
            setLoading(true);
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/schedules/by_invitation/${selectedInvitation}`;
                const resp = await fetch(url, {
                    headers: { "Authorization": `Bearer ${store.token}` }
                });

                if (resp.ok) {
                    const data = await resp.json();
                    if (data && data.length > 0) mapToState(data);
                    else resetForm();
                }
            } catch (error) {
                console.error("Error cargando:", error);
            } finally {
                setLoading(false);
            }
        };
        loadExistingSchedules();
    }, [selectedInvitation]);

    const resetForm = () => {
        const clean = {};
        Object.keys(weeklySchedule).forEach(day => {
            clean[day] = { t1_start: "", t1_end: "", t2_start: "", t2_end: "", active: false };
        });
        setWeeklySchedule(clean);
    };

    const mapToState = (data) => {
        const newState = {};
        Object.keys(weeklySchedule).forEach(day => {
            newState[day] = { t1_start: "", t1_end: "", t2_start: "", t2_end: "", active: false };
        });

        data.forEach(item => {
            const dayKey = item.day_of_week;
            if (newState[dayKey]) {
                if (!newState[dayKey].active) {
                    newState[dayKey].active = true;
                    newState[dayKey].t1_start = item.start_time.slice(0, 5);
                    newState[dayKey].t1_end = item.end_time.slice(0, 5);
                } else {
                    newState[dayKey].t2_start = item.start_time.slice(0, 5);
                    newState[dayKey].t2_end = item.end_time.slice(0, 5);
                }
            }
        });
        setWeeklySchedule(newState);
    };

    const getShopHours = (dayKey) => {
        const invitation = myBarbershops.find(i => String(i.id) === String(selectedInvitation));
        if (!invitation || !invitation.barbershop?.working_hours) return null;
        return invitation.barbershop.working_hours[dayLabels[dayKey]] || null;
    };

    const handleCheckDay = (day) => {
        setWeeklySchedule(prev => ({
            ...prev,
            [day]: { ...prev[day], active: !prev[day].active, t1_start: !prev[day].active ? "09:00" : "", t1_end: !prev[day].active ? "14:00" : "" }
        }));
    };

    const handleTimeChange = (day, field, value) => {
        setWeeklySchedule(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const invitation = myBarbershops.find(i => String(i.id) === String(selectedInvitation));
        if (!invitation) return;

        const activeDays = Object.keys(weeklySchedule).filter(d => weeklySchedule[d].active);

        for (let day of activeDays) {
            const myHours = weeklySchedule[day];
            const shop = invitation.barbershop.working_hours?.[dayLabels[day]];

            if (!shop) {
                dispatch({ type: "set-message", payload: { type: "error", msg: `El local parece estar cerrado el ${dayLabels[day]}` } });
                return;
            }

            const isInsideRange = (start, end) => {
                if (!start || !end) return true;
                const s = toN(start);
                const e = toN(end);

                const inMorning = shop.m_start && (s >= toN(shop.m_start) && e <= toN(shop.m_end));
                const inAfternoon = shop.a_start && (s >= toN(shop.a_start) && e <= toN(shop.a_end));

                return inMorning || inAfternoon;
            };

            if (!isInsideRange(myHours.t1_start, myHours.t1_end)) {
                dispatch({
                    type: "set-message",
                    payload: { type: "error", msg: `Tu Turno 1 del ${dayLabels[day]} está fuera del horario del local.` }
                });
                return;
            }

            if (myHours.t2_start && !isInsideRange(myHours.t2_start, myHours.t2_end)) {
                dispatch({
                    type: "set-message",
                    payload: { type: "error", msg: `Tu Turno 2 del ${dayLabels[day]} está fuera del horario del local.` }
                });
                return;
            }
        }

        setLoading(true);
        try {
            await fetch(`${import.meta.env.VITE_BACKEND_URL}/schedules/by_invitation/${selectedInvitation}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${store.token}` }
            });

            for (let day of activeDays) {
                const d = weeklySchedule[day];
                const sendBody = async (s, e_time) => {
                    await fetch(`${import.meta.env.VITE_BACKEND_URL}/schedules`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${store.token}` },
                        body: JSON.stringify({
                            invitation_id: selectedInvitation,
                            day_of_week: day,
                            start_time: s,
                            end_time: e_time
                        })
                    });
                };

                if (d.t1_start && d.t1_end) await sendBody(d.t1_start, d.t1_end);
                if (d.t2_start && d.t2_end) await sendBody(d.t2_start, d.t2_end);
            }

            dispatch({ type: "set-message", payload: { type: "success", msg: "Horario verificado y guardado" } });
            navigate(-1);
        } catch (err) {
            console.error(err);
            dispatch({ type: "set-message", payload: { type: "error", msg: "Error al conectar con el servidor" } });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="display-6 m-0">Mi Horario Personal</h1>
                <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                    <i className="fas fa-arrow-left me-2"></i>Volver
                </button>
            </div>

            <div className="card shadow-sm p-4">
                <label className="form-label fw-bold">Selecciona la Barbería:</label>
                <select className="form-select mb-4" value={selectedInvitation} onChange={(e) => setSelectedInvitation(e.target.value)}>
                    <option value="">-- Selecciona --</option>
                    {myBarbershops.map(inv => (
                        <option key={inv.id} value={inv.id}>{inv.barbershop?.name}</option>
                    ))}
                </select>

                {loading ? (
                    <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>
                ) : selectedInvitation && (
                    <form onSubmit={handleSubmit}>
                        <div className="bg-light p-3 rounded border">
                            {Object.keys(weeklySchedule).map((day) => {
                                const shop = getShopHours(day);
                                return (
                                    <div key={day} className="row mb-3 align-items-center border-bottom pb-3">
                                        <div className="col-md-3">
                                            <div className="form-check form-switch">
                                                <input className="form-check-input" type="checkbox" checked={weeklySchedule[day].active} onChange={() => handleCheckDay(day)} />
                                                <span className="fw-bold">{dayLabels[day]}</span>
                                            </div>
                                            {shop ? (
                                                <div className="text-primary mt-1" style={{ fontSize: '0.75rem' }}>
                                                    <i className="far fa-clock me-1"></i>
                                                    {shop.m_start?.slice(0, 5)}-{shop.m_end?.slice(0, 5)}
                                                    {shop.a_start && ` / ${shop.a_start.slice(0, 5)}-${shop.a_end.slice(0, 5)}`}
                                                </div>
                                            ) : (
                                                <div className="text-muted mt-1" style={{ fontSize: '0.7rem' }}>Cerrado o sin horario</div>
                                            )}
                                        </div>
                                        <div className="col-md-4 d-flex align-items-center gap-1">
                                            <span className="badge bg-secondary">T1</span>
                                            <input type="time" className="form-control" value={weeklySchedule[day].t1_start} disabled={!weeklySchedule[day].active} onChange={(e) => handleTimeChange(day, "t1_start", e.target.value)} />
                                            <input type="time" className="form-control" value={weeklySchedule[day].t1_end} disabled={!weeklySchedule[day].active} onChange={(e) => handleTimeChange(day, "t1_end", e.target.value)} />
                                        </div>
                                        <div className="col-md-5 d-flex align-items-center gap-1">
                                            <div className="form-check form-switch">
                                                <input className="form-check-input" type="checkbox" disabled={!weeklySchedule[day].active} checked={!!weeklySchedule[day].t2_start}
                                                    onChange={(e) => {
                                                        handleTimeChange(day, "t2_start", e.target.checked ? "16:00" : "");
                                                        handleTimeChange(day, "t2_end", e.target.checked ? "20:00" : "");
                                                    }}
                                                />
                                            </div>
                                            <span className="badge bg-secondary">T2</span>
                                            <input type="time" className="form-control" value={weeklySchedule[day].t2_start} disabled={!weeklySchedule[day].active || !weeklySchedule[day].t2_start} onChange={(e) => handleTimeChange(day, "t2_start", e.target.value)} />
                                            <input type="time" className="form-control" value={weeklySchedule[day].t2_end} disabled={!weeklySchedule[day].active || !weeklySchedule[day].t2_start} onChange={(e) => handleTimeChange(day, "t2_end", e.target.value)} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <button type="submit" className="btn btn-primary btn-lg w-100 mt-4">
                            <i className="fas fa-save me-2"></i>Guardar Horario
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};