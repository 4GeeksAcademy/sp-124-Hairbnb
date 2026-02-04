import useGlobalReducer from "../hooks/useGlobalReducer";

export const PrivateClient = () => {
  const { store } = useGlobalReducer();

  if (store.role !== "client") {
    return (
      <div className="container mt-5">
        <h2>NO PUEDES VER NADA AQUÍ, NO TIENES PERMISOS DE CLIENTE</h2>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2>BIENVENIDO {store.username?.toUpperCase()}. ERES CLIENTE</h2>
      <p>Aquí va todo el contenido exclusivo para el cliente.</p>
    </div>
  );
};

