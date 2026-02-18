import React, { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { uploadToCloudinary } from "../utilities/cloudinary";

export const AIHair = () => {
    const { store, dispatch } = useGlobalReducer();
    const [file, setFile] = useState(null);
    const [prompt, setPrompt] = useState("Mullet con mechas azules");
    const [status, setStatus] = useState("idle");
    const [resultImage, setResultImage] = useState(null);
    const [imageId, setImageId] = useState(null);

    useEffect(() => {
        let interval;
        if (status === "processing" && imageId) {
            interval = setInterval(async () => {
                try {
                    const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ai-images/${imageId}`, {
                        headers: { "Authorization": `Bearer ${store.token}` }
                    });
                    const data = await resp.json();

                    if (data.status === "completed") {
                        setResultImage(data.result_url);
                        setStatus("completed");
                        clearInterval(interval);
                    }
                } catch (error) {
                    console.error("Error en polling:", error);
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [status, imageId, store.token]);

    const handleProcess = async () => {
        if (!file) return;
        setStatus("uploading");

        const uploadedUrl = await uploadToCloudinary(file);
        if (!uploadedUrl) {
            setStatus("idle");
            return;
        }

        setStatus("processing");
        try {
            const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ai-images`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${store.token}`
                },
                body: JSON.stringify({ image_url: uploadedUrl, prompt: prompt })
            });
            const data = await resp.json();
            setImageId(data.id);
        } catch (error) {
            console.error("Error al iniciar proceso:", error);
            setStatus("idle");
        }
    };

    return (
        <div className="card shadow-sm p-4">
            <h3>Simulador de Peinados con IA</h3>
            <p className="text-muted">Sube una foto de frente y describe tu nuevo estilo.</p>

            <div className="mb-3">
                <input 
                    type="text" 
                    className="form-control mb-2" 
                    placeholder="Ej: buzz cut, long blonde hair..." 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
                <input 
                    type="file" 
                    className="form-control" 
                    onChange={(e) => setFile(e.target.files[0])}
                    accept="image/*"
                />
            </div>

            <button 
                className="btn btn-primary w-100" 
                onClick={handleProcess}
                disabled={status !== "idle" && status !== "completed"}
            >
                {status === "idle" ? "Transformar mi look" : "Procesando..."}
            </button>

            <hr />

            <div className="text-center">
                {status === "processing" && (
                    <div className="p-5">
                        <div className="spinner-grow text-info" role="status"></div>
                        <p className="mt-2">La IA está trabajando en tu nuevo peinado...</p>
                    </div>
                )}
                
                {status === "completed" && resultImage && (
                    <div className="animate__animated animate__fadeIn">
                        <h5>¡Resultado listo!</h5>
                        <img src={resultImage} alt="Resultado" className="img-fluid rounded shadow" style={{maxHeight: "400px"}} />
                        <button className="btn btn-sm btn-outline-secondary d-block mx-auto mt-2" onClick={() => setStatus("idle")}>Probar otro</button>
                    </div>
                )}
            </div>
        </div>
    );
};