import { useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Message = () => {
    const { store, dispatch } = useGlobalReducer();
    const { message } = store;

    useEffect(() => {
        if (!message) return;

        const timer = setTimeout(() => {
            dispatch({ type: "set-message", payload: null });
        }, 3000);

        return () => clearTimeout(timer);
    }, [message, dispatch]);

    if (!message) return null;

    const isError = message.type === "error";
    const accentColor = isError ? "#b02a37" : "#d19f68";

    return (
        <div
            className="position-fixed start-50 translate-middle-x mt-2 shadow"
            style={{
                zIndex: 10001,
                minWidth: "320px",
                backgroundColor: "#ffffff",
                color: "#111",
                border: `1px solid ${accentColor}`,
                borderTop: `4px solid ${accentColor}`,
                borderRadius: "4px",
                padding: "12px 20px",
                animation: "fadeInDown 0.4s ease-out"
            }}
        >
            <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                    <i className={`fa-solid ${isError ? 'fa-triangle-exclamation' : 'fa-check'} me-3`}
                        style={{ color: accentColor, fontSize: "1.1rem" }}></i>
                    <span className="Oswald text-uppercase fw-bold small" style={{ letterSpacing: "1px", color: "#333" }}>
                        {message.msg}
                    </span>
                </div>

            </div>
        </div>
    );
};