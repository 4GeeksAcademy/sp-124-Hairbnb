import React, { useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const AIHair = () => {
    const { store } = useGlobalReducer();
    const [file, setFile] = useState(null);
    const [prompt, setPrompt] = useState("");
    const [status, setStatus] = useState("idle");
    const [resultImage, setResultImage] = useState(null);

    const handleProcess = async () => {
        if (!file || !prompt) return;
        setStatus("processing");

        const formData = new FormData();
        formData.append("image", file);
        formData.append("prompt", prompt);
        formData.append("search_prompt", "hair and beard");

        try {
            const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/edit-hair`, {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${store.token}` 
                },
                body: formData
            });

            if (!resp.ok) throw new Error("Error en la respuesta de la IA");

            const data = await resp.json();
            setResultImage(data.result);
            setStatus("completed");
        } catch (error) {
            console.error("Error al transformar look:", error);
            setStatus("error");
        }
    };

    return (
        <div className="card shadow-sm p-4 border-0">
            <h3 className="fw-bold text-primary"><i className="fa-solid fa-wand-magic-sparkles me-2"></i>AI Hair Styler</h3>
            <p className="text-muted">Stability AI V2: Search & Replace</p>

            <div className="mb-3">
                <label className="form-label small fw-bold">1. ¿Qué peinado o barba quieres?</label>
                <input 
                    type="text" 
                    className="form-control mb-3" 
                    placeholder="Ej: buzz cut, curly hair, blue hair..." 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
                
                <label className="form-label small fw-bold">2. Sube tu foto (mejor si el fondo es liso)</label>
                <input 
                    type="file" 
                    className="form-control" 
                    onChange={(e) => setFile(e.target.files[0])}
                    accept="image/*"
                />
            </div>

            <button 
                className={`btn ${status === "processing" ? "btn-secondary" : "btn-dark"} w-100 py-2`}
                onClick={handleProcess}
                disabled={status === "processing" || !file}
            >
                {status === "processing" ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Cocinando tu estilo...</>
                ) : "¡Transformar mi look!"}
            </button>

            {status === "error" && <p className="text-danger mt-2 small text-center">Algo salió mal. Inténtalo de nuevo.</p>}

            <hr className="my-4" />

            <div className="text-center">
                {status === "completed" && resultImage && (
                    <div className="animate__animated animate__zoomIn">
                        <h5 className="mb-3">Tu nueva versión:</h5>
                        <img src={resultImage} alt="Resultado" className="img-fluid rounded-3 shadow-lg" style={{maxHeight: "450px"}} />
                        <div className="mt-3">
                             <button className="btn btn-outline-primary btn-sm me-2" onClick={() => window.open(resultImage)}>Guardar imagen</button>
                             <button className="btn btn-outline-secondary btn-sm" onClick={() => setStatus("idle")}>Probar otro</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};