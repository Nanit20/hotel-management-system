import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1 className="home-title">Bienvenido al hotel</h1>

      <p className="home-subtitle">
        Inicia sesión o realiza una reserva con un código válido
      </p>

      <div className="home-actions">
        <button
          className="home-button"
          onClick={() => navigate("/login")}
        >
          Iniciar sesión
        </button>

        <button
          className="home-button reserve"
          onClick={() => navigate("/reservas")}
        >
          Realizar reserva
        </button>
      </div>
    </div>
  );
}
