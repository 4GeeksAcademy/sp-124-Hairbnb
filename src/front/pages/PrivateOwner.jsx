import useGlobalReducer from "../hooks/useGlobalReducer";

export const PrivateOwner = () => {
  const { store } = useGlobalReducer();

  if (store.role !== "owner") {
    return (
      <div className="container mt-5">
        <h2>NO PUEDES VER NADA AQUÍ, NO TIENES PERMISOS DE DUEÑO</h2>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2>BIENVENIDO {store.username?.toUpperCase()}. ERES DUEÑO</h2>
      <p>Aquí va todo el contenido exclusivo para dueños.</p>
    </div>
  );
};

