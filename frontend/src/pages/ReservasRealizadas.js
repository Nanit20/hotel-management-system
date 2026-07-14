import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ReservasRealizadas.css";

const estadoLabels = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
};

export default function ReservasRealizadas() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const puedeVer = user?.tipo === "ADMIN" || user?.tipo === "JEFE";

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!puedeVer) {
      navigate("/dashboard");
      return;
    }

    cargarReservas();
  }, []);

  const cargarReservas = async () => {
    try {
      setCargando(true);
      setError("");

      const res = await fetch("/api/reservas/", {
        headers: {
          "X-User-Type": user.tipo,
          "X-User-ID": user.id,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setReservas(data);
      } else {
        setError(data.error || "No se pudieron cargar las reservas");
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor");
    } finally {
      setCargando(false);
    }
  };

  const cambiarEstado = async (reservaId, estado) => {
    try {
      const res = await fetch(`/api/reservas/${reservaId}/estado/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-User-Type": user.tipo,
          "X-User-ID": user.id,
        },
        body: JSON.stringify({ estado }),
      });

      const data = await res.json();

      if (res.ok) {
        cargarReservas();
      } else {
        alert(data.error || "No se pudo actualizar la reserva");
      }
    } catch (err) {
      alert("No se pudo conectar con el servidor");
    }
  };

  if (!user || !puedeVer) {
    return null;
  }

  return (
    <div className="reservas-realizadas-container">
      <div className="reservas-realizadas-header">
        <div>
          <h1>Reservas realizadas</h1>
          <p>
            Usuario: <strong>{user.nombre}</strong> · Rol: <strong>{user.tipo}</strong>
          </p>
        </div>

        <div className="reservas-realizadas-actions">
          <button onClick={() => navigate("/")} className="rr-home-button">
            Página principal
          </button>
          <button onClick={() => navigate("/dashboard")} className="rr-dashboard-button">
            Volver al dashboard
          </button>
        </div>
      </div>

      <div className="reservas-realizadas-card">
        <h2>Listado de reservas</h2>

        {cargando && <p className="rr-info">Cargando reservas...</p>}
        {error && <p className="rr-error">{error}</p>}

        {!cargando && !error && reservas.length === 0 && (
          <p className="rr-info">No hay reservas registradas.</p>
        )}

        {!cargando && !error && reservas.length > 0 && (
          <div className="rr-table-wrapper">
            <table className="rr-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Personas</th>
                  <th>Código</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map((reserva) => (
                  <tr key={reserva.id}>
                    <td>{reserva.id}</td>
                    <td>{reserva.fecha}</td>
                    <td>{reserva.hora}</td>
                    <td>{reserva.numeroPersonas}</td>
                    <td className="rr-code">{reserva.codigoAcceso}</td>
                    <td>
                      <span className={`rr-estado rr-estado-${reserva.estado}`}>
                        {estadoLabels[reserva.estado] || reserva.estado}
                      </span>
                    </td>
                    <td className="rr-actions-cell">
                      <button
                        className="rr-confirm-button"
                        onClick={() => cambiarEstado(reserva.id, "confirmada")}
                        disabled={reserva.estado === "confirmada"}
                      >
                        Confirmar
                      </button>
                      <button
                        className="rr-cancel-button"
                        onClick={() => cambiarEstado(reserva.id, "cancelada")}
                        disabled={reserva.estado === "cancelada"}
                      >
                        Cancelar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
