import React, { useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

import gif from "../../../public/GIF.gif";

export const AIHair = () => {
    const { store } = useGlobalReducer();
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [prompt, setPrompt] = useState("");
    const [status, setStatus] = useState("idle");
    const [resultImage, setResultImage] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setResultImage(null);
        }
    };

    const useProfilePhoto = async () => {
        const userId = store.userInfo?.id;
        if (!userId) {
            alert("No se pudo identificar tu ID de usuario. Prueba a iniciar sesión de nuevo");
            return;
        }

        try {
            setStatus("processing");
            const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${userId}`, {
                method: "GET",
                headers: { 
                    "Authorization": `Bearer ${store.token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!resp.ok) throw new Error("Error al obtener los datos del servidor");
            const data = await resp.json();
            const userImage = data.client_profile_image || data.avatar; 

            if (userImage) {
                setPreviewUrl(userImage);
                setResultImage(null);
                const response = await fetch(userImage);
                const blob = await response.blob();
                const fileFromProfile = new File([blob], `profile_${userId}.jpg`, { type: "image/jpeg" });
                setFile(fileFromProfile);
                setStatus("idle");
            } else {
                setStatus("idle");
                alert("Tu usuario no tiene ninguna imagen guardada en la base de datos.");
            }
        } catch (error) {
            console.error("Error en useProfilePhoto:", error);
            setStatus("error");
        }
    };

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
                headers: { "Authorization": `Bearer ${store.token}` },
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
        <div className="card p-4 shadow-sm border-0">
            <h3 className="mb-4">
                <i className="fa-solid fa-scissors me-2"></i>AIrbnb Stylist
            </h3>

            <div className="row">
                <div className="col-md-6 border-end">
                    <label className="form-label">Elige tu imagen</label>
                    <div className="d-flex gap-2 mb-3">
                        <button className="btn btn-outline-secondary" onClick={useProfilePhoto}>
                            Usar mi foto de perfil
                        </button>
                        <input type="file" id="fileInput" hidden onChange={handleFileChange} accept="image/*" />
                        <label htmlFor="fileInput" className="btn btn-outline-secondary mb-0">
                            Subir otra foto
                        </label>
                    </div>

                    <label className="form-label">Describe el cambio</label>
                    <input
                        type="text"
                        className="form-control mb-3"
                        placeholder="Ej: Mullet rubio platino..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />

                    <div className="position-relative text-center mt-3 p-2">
                        <span className="position-absolute top-0 start-0 m-2" style={{zIndex: 3}}>Original</span>
                        {previewUrl ? (
                            <div className="preview-wrapper position-relative d-inline-block">
                                <img 
                                    src={previewUrl} 
                                    alt="Original" 
                                    className={`img-fluid rounded ${status === "processing" ? "opacity-50 blur-sm" : ""}`} 
                                    style={{ maxHeight: "150px", transition: "all 0.3s ease" }} 
                                />
                                {status === "processing" && (
                                    <div className="position-absolute top-50 start-50 translate-middle" style={{ zIndex: 5, width: "100px" }}>
                                        <img src={gif} alt="Cargando..." className="img-fluid" />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="py-5">No hay imagen seleccionada</div>
                        )}
                    </div>
                </div>

                <div className="col-md-6 d-flex flex-column align-items-center justify-content-center">
                    {status === "idle" && <p>El resultado aparecerá aquí</p>}

                    {status === "processing" && (
                        <div className="text-center">
                            <div className="spinner-grow text-primary mb-2"></div>
                            <p>Preparando tu nuevo estilo...</p>
                        </div>
                    )}

                    {status === "completed" && resultImage && (
                        <div className="text-center">
                            <img src={resultImage} alt="Resultado" className="img-fluid" style={{ maxHeight: "300px" }} />
                            <div className="mt-3">
                                <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => setStatus("idle")}>Reset</button>
                                <button className="btn btn-sm btn-primary" onClick={() => window.open(resultImage)}>Descargar</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <button
                className={`btn ${status === "processing" ? "btn-secondary" : "btn-dark"} py-3 mt-4 fw-bold`}
                onClick={handleProcess}
                disabled={status === "processing" || !file || !prompt}
            >
                {status === "processing" ? "PROCESANDO CAMBIO..." : "¡CORTAR Y PEINAR!"}
            </button>
        </div>
    );
};