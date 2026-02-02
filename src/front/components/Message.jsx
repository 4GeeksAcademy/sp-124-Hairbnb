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

    return (
        <div
            className={`position-fixed top-50 start-50 text-center translate-middle-x mt-3 alert shadow-lg ${message.type === "error" ? "alert-danger" : "alert-success"
                }`}
            style={{ zIndex: 9999, minWidth: "300px" }}
        >
            {message.msg}
        </div>
    );
};