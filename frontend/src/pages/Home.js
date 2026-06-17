import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1 className="home-title">Bienvenido al hotel</h1>

      <p className="home-subtitle">
        Realice el inicio de sesión para continuar
      </p>

      <button
        className="home-button"
        onClick={() => navigate("/login")}
      >
        Iniciar sesión
      </button>
    </div>
  );
}