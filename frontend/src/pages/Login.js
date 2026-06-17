import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState("");
  const [contraseña, setContraseña] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usuario,
        contraseña,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("user", JSON.stringify(data));
      navigate("/dashboard");
    } else {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Hotel Management</h2>
        <p className="login-subtitle">Inicia sesión en tu cuenta</p>

        <form onSubmit={handleLogin} className="login-form">
          <input
            className="login-input"
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />

          <input
            className="login-input"
            type="password"
            placeholder="Contraseña"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
          />

          <button className="login-button" type="submit">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}