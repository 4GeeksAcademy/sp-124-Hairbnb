import useGlobalReducer from "../hooks/useGlobalReducer";

export const PrivateBarber = () => {
  const { store } = useGlobalReducer();

  if (store.role !== "barber") {
    return (
      <div className="container mt-5">
        <h2>NO PUEDES VER NADA AQUÍ, NO TIENES PERMISOS DE BARBERO</h2>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2>BIENVENIDO {store.username?.toUpperCase()}. ERES BARBERO</h2>
      <p>Aquí va todo el contenido exclusivo para el barbero.</p>
    </div>
  );
};

