export const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "hairbnb_preset"); 

    try {
        const response = await fetch(
            "https://api.cloudinary.com/v1_1/dk3nfnwcq/image/upload", 
            {
                method: "POST",
                body: formData,
            }
        );
        
        if (response.ok) {
            const data = await response.json();
            return data.secure_url;
        } else {
            const errorData = await response.json();
            console.error("Error detallado de Cloudinary:", errorData);
            return null;
        }
    } catch (error) {
        console.error("Error de conexión con Cloudinary:", error);
        return null;
    }
};