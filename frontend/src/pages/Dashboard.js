import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Bienvenido {user.nombre}</h1>
      <h2>Tipo de usuario: {user.tipo}</h2>

      <button onClick={logout}>
        Cerrar sesión
      </button>
    </div>
  );
}