import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    navigate("/login");
    return null;
  }

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1>Bienvenido {user.nombre}</h1>
        <p className="dashboard-role">Tipo de usuario: {user.tipo}</p>

        <div className="dashboard-actions">
          <button
            className="dashboard-button primary"
            onClick={() => navigate("/inventario")}
          >
            Ir al inventario
          </button>

          <button className="dashboard-button secondary" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
