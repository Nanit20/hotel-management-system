import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [codigoReserva, setCodigoReserva] = useState(null);
  const [errorCodigo, setErrorCodigo] = useState("");
  const [generando, setGenerando] = useState(false);

  if (!user) {
    navigate("/login");
    return null;
  }

  const puedeVerReservas = user.tipo === "ADMIN" || user.tipo === "JEFE";

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const generarCodigoReserva = async () => {
    try {
      setGenerando(true);
      setErrorCodigo("");

      const res = await fetch("/api/reservas/generar-codigo/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Type": user.tipo,
          "X-User-ID": user.id,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setCodigoReserva(data);
      } else {
        setErrorCodigo(data.error || "No se pudo generar el código de reserva");
      }
    } catch (err) {
      setErrorCodigo("No se pudo conectar con el servidor");
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="dashboard-container">
      <button className="dashboard-home-button" onClick={() => navigate("/")}> 
        Página principal
      </button>

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

          {puedeVerReservas && (
            <button
              className="dashboard-button primary green"
              onClick={() => navigate("/reservas-realizadas")}
            >
              Ver reservas realizadas
            </button>
          )}

          <button
            className="dashboard-button warning"
            onClick={generarCodigoReserva}
            disabled={generando}
          >
            {generando ? "Generando..." : "Generar código de reserva"}
          </button>

          <button className="dashboard-button secondary" onClick={logout}>
            Cerrar sesión
          </button>
        </div>

        {(codigoReserva || errorCodigo) && (
          <div className="reservation-code-card">
            {codigoReserva && (
              <>
                <p className="reservation-code-label">Código generado</p>
                <p className="reservation-code-value">{codigoReserva.codigoAcceso}</p>
                <p className="reservation-code-help">
                  Facilita este código al cliente para que pueda realizar la reserva desde la página principal.
                </p>
              </>
            )}

            {errorCodigo && <p className="reservation-code-error">{errorCodigo}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
