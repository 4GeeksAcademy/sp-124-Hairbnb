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
        <div className="card p-4 shadow-sm border-0 bg-white rounded-4">
            <div className="d-flex align-items-center mb-4">
                <div className="bg-gold-soft p-3 rounded-circle me-3">
                    <i className="fa-solid fa-wand-magic-sparkles text-gold fs-4"></i>
                </div>
                <div>
                    <h3 className="mb-0 Oswald text-uppercase fw-bold">AIrbnb</h3>
                    <p className="text-muted small mb-0">Prueba tu nuevo look antes de pasar por la tijera</p>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-md-6 border-end">
                    <div className="mb-4">
                        <label className="fw-bold small text-uppercase mb-2 d-block">Tu foto</label>
                        <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-outline-dark rounded-pill px-3" onClick={useProfilePhoto}>
                                <i className="fa-solid fa-user-circle me-1"></i> Usar foto de perfil
                            </button>
                            <input type="file" id="fileInput" hidden onChange={handleFileChange} accept="image/*" />
                            <label htmlFor="fileInput" className="btn btn-sm btn-outline-dark rounded-pill px-3 mb-0">
                                <i className="fa-solid fa-upload me-1"></i> Subir nueva
                            </label>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="fw-bold small text-uppercase mb-2 d-block">¿Qué quieres probar?</label>
                        <textarea
                            className="form-control border-gold border-1"
                            rows="2"
                            placeholder="Ej: Un degradado con la parte de arriba rubia platino..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                    </div>

                    <div className="bg-light rounded-3 p-3 text-center position-relative overflow-hidden" style={{ minHeight: "200px" }}>
                        {previewUrl ? (
                            <>
                                <img
                                    src={previewUrl}
                                    className={`img-fluid rounded-3 ${status === "processing" ? "opacity-25 blur-sm" : ""}`}
                                    style={{ maxHeight: "180px", objectFit: "cover" }}
                                />
                                {status === "processing" && (
                                    <div className="position-absolute top-50 start-50 translate-middle">
                                        <img src={gif} width="80" alt="Cargando" />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="d-flex flex-column justify-content-center h-100 opacity-50 ">
                                <i className="fa-solid fa-image fa-2x p-4"></i>
                                <span className="small p-4">Esperando imagen...</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="col-md-6">
                    <label className="fw-bold small text-uppercase mb-2 d-block text-center">Resultado</label>
                    <div className="d-flex flex-column align-items-center justify-content-center bg-dark rounded-3 p-3" style={{ minHeight: "350px", color: "#eee" }}>
                        {status === "idle" && (
                            <div className="text-center opacity-50">
                                <i className="fa-solid fa-scissors fa-3x mb-3"></i>
                                <p className="small">Configura tu estilo y pulsa el botón</p>
                            </div>
                        )}

                        {status === "processing" && (
                            <div className="text-center">
                                <div className="spinner-border text-gold mb-3"></div>
                                <p className="Oswald">CORTANDO Y PEINANDO...</p>
                            </div>
                        )}

                        {status === "completed" && resultImage && (
                            <div className="animate__animated animate__fadeIn text-center">
                                <img src={resultImage} className="img-fluid rounded-3 shadow-lg mb-3" style={{ maxHeight: "280px" }} />
                                <div className="d-flex gap-2 justify-content-center">
                                    <button className="btn btn-sm btn-light" onClick={() => setStatus("idle")}>Nuevo</button>
                                    <a href={resultImage} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-gold" download>Descargar</a>
                                </div>
                            </div>
                        )}

                        {status === "error" && (
                            <div className="text-center text-danger">
                                <i className="fa-solid fa-triangle-exclamation fa-2x mb-2"></i>
                                <p className="small">Hubo un error. Prueba de nuevo más tarde.</p>
                                <button className="btn btn-sm btn-outline-light" onClick={() => setStatus("idle")}>Reintentar</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <button
                className={`btn btn-lg w-100 mt-4 Oswald fw-bold ${!file || !prompt ? 'btn-secondary opacity-50' : 'btn-dark'}`}
                onClick={handleProcess}
                disabled={status === "processing" || !file || !prompt}
            >
                {status === "processing" ? "REMODELANDO..." : "¡GENERAR NUEVO LOOK!"}
            </button>
        </div>
    );
};