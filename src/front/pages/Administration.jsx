import useGlobalReducer from "../hooks/useGlobalReducer";

export const Administration = () => {
  const { store } = useGlobalReducer();

  if (store.role !== "admin") {
    return (
      <div className="container mt-5">
        <h2>NO PUEDES VER NADA AQUÍ, NO TIENES PERMISOS DE ADMINISTRACÓN</h2>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2>BIENVENIDO {store.username?.toUpperCase()}. ERES ADMINISTRADOR</h2>
      <p>Aquí va todo el contenido exclusivo para admins.</p>
    </div>
  );
};

