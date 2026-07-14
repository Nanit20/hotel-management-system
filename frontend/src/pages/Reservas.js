import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Reservas.css";

const formInicial = {
  fecha: "",
  hora: "",
  numeroPersonas: "",
};

export default function Reservas() {
  const navigate = useNavigate();

  const [codigo, setCodigo] = useState("");
  const [codigoValidado, setCodigoValidado] = useState(false);
  const [form, setForm] = useState(formInicial);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleCodigoChange = (e) => {
    setCodigo(e.target.value.toUpperCase());
    setError("");
    setMensaje("");
  };

  const validarCodigo = async (e) => {
    e.preventDefault();

    try {
      setCargando(true);
      setError("");
      setMensaje("");

      const res = await fetch("/api/reservas/validar-codigo/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ codigoAcceso: codigo }),
      });

      const data = await res.json();

      if (res.ok) {
        setCodigoValidado(true);
        setCodigo(data.codigoAcceso);
        setMensaje("Código válido. Ya puedes completar la reserva.");
      } else {
        setCodigoValidado(false);
        setError(data.error || "El código es erróneo o ha expirado");
      }
    } catch (err) {
      setCodigoValidado(false);
      setError("No se pudo conectar con el servidor");
    } finally {
      setCargando(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const crearReserva = async (e) => {
    e.preventDefault();

    try {
      setCargando(true);
      setError("");
      setMensaje("");

      const res = await fetch("/api/reservas/crear/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codigoAcceso: codigo,
          fecha: form.fecha,
          hora: form.hora,
          numeroPersonas: Number(form.numeroPersonas),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje("Reserva realizada correctamente. Queda pendiente de confirmación.");
        setCodigoValidado(false);
        setCodigo("");
        setForm(formInicial);
      } else {
        setError(data.error || "No se pudo realizar la reserva");
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="reservas-container">
      <button className="reservas-home-button" onClick={() => navigate("/")}> 
        Página principal
      </button>

      <div className="reservas-card">
        <h1>Realizar reserva</h1>
        <p className="reservas-subtitle">
          Introduce el código facilitado por el personal del hotel para continuar.
        </p>

        {!codigoValidado && (
          <form className="codigo-form" onSubmit={validarCodigo}>
            <input
              value={codigo}
              onChange={handleCodigoChange}
              placeholder="Código de reserva"
              maxLength="12"
              required
            />

            <button type="submit" disabled={cargando}>
              {cargando ? "Comprobando..." : "Validar código"}
            </button>
          </form>
        )}

        {codigoValidado && (
          <form className="reserva-form" onSubmit={crearReserva}>
            <div className="codigo-validado">
              Código validado: <strong>{codigo}</strong>
            </div>

            <div className="reserva-grid">
              <label>
                Fecha
                <input
                  type="date"
                  name="fecha"
                  value={form.fecha}
                  onChange={handleFormChange}
                  required
                />
              </label>

              <label>
                Hora
                <input
                  type="time"
                  name="hora"
                  value={form.hora}
                  onChange={handleFormChange}
                  required
                />
              </label>

              <label>
                Número de personas
                <input
                  type="number"
                  min="1"
                  name="numeroPersonas"
                  value={form.numeroPersonas}
                  onChange={handleFormChange}
                  required
                />
              </label>
            </div>

            <div className="reserva-actions">
              <button type="submit" disabled={cargando}>
                {cargando ? "Guardando..." : "Confirmar solicitud"}
              </button>

              <button
                type="button"
                className="cancelar-codigo-button"
                onClick={() => {
                  setCodigoValidado(false);
                  setCodigo("");
                  setForm(formInicial);
                  setMensaje("");
                  setError("");
                }}
              >
                Usar otro código
              </button>
            </div>
          </form>
        )}

        {error && <p className="reserva-error">{error}</p>}
        {mensaje && <p className="reserva-success">{mensaje}</p>}
      </div>
    </div>
  );
}
