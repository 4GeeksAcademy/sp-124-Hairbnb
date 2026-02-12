import React, { useEffect, useRef } from "react";

export const UploadCloudinary = ({ onUploadSuccess }) => {
    const widgetRef = useRef();

    useEffect(() => {
        widgetRef.current = window.cloudinary.createUploadWidget({
            cloudName: 'dk3nfnwcq',
            uploadPreset: 'hairbnb_preset',
            multiple: false,
            maxFiles: 1,
        }, (error, result) => {
            if (!error && result && result.event === "success") {
                onUploadSuccess(result.info.secure_url);
            }
        });
    }, []);

    return (
        <button type="button" className="btn btn-info" onClick={() => widgetRef.current.open()}>
            Selecciona una foto
        </button>
    );
};