import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Turnos.css";

const formInicial = {
  idEmpleado: "",
  fecha: "",
  horaInicio: "",
  horaFin: "",
};

export default function Turnos() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [turnos, setTurnos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [form, setForm] = useState(formInicial);
  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const puedeModificar = user?.tipo === "ADMIN" || user?.tipo === "JEFE";

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    cargarTurnos();
    cargarEmpleados();
  }, []);

  const headersBase = () => ({
    "Content-Type": "application/json",
    "X-User-Type": user?.tipo || "",
    "X-User-ID": user?.id || "",
  });

  const cargarTurnos = async () => {
    try {
      setCargando(true);
      const res = await fetch("/api/turnos/", {
        headers: headersBase(),
      });
      const data = await res.json();

      if (res.ok) {
        setTurnos(data);
        setError("");
      } else {
        setError(data.error || "No se pudieron cargar los turnos");
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor");
    } finally {
      setCargando(false);
    }
  };

  const cargarEmpleados = async () => {
    try {
      const res = await fetch("/api/usuarios/", {
        headers: headersBase(),
      });
      const data = await res.json();

      if (res.ok) {
        setEmpleados(data.filter((usuario) => usuario.tipo === "EMPLEADO"));
      }
    } catch (err) {
      console.error("No se pudieron cargar los empleados", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const limpiarFormulario = () => {
    setForm(formInicial);
    setEditandoId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!puedeModificar) {
      alert("No tienes permisos para modificar los turnos");
      return;
    }

    const url = editandoId ? `/api/turnos/${editandoId}/` : "/api/turnos/";
    const method = editandoId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: headersBase(),
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        limpiarFormulario();
        cargarTurnos();
      } else {
        alert(data.error || "No se pudo guardar el turno");
      }
    } catch (err) {
      alert("No se pudo conectar con el servidor");
    }
  };

  const editarTurno = (turno) => {
    setEditandoId(turno.id);
    setForm({
      idEmpleado: String(turno.idEmpleado),
      fecha: turno.fecha,
      horaInicio: turno.horaInicio,
      horaFin: turno.horaFin,
    });
  };

  const eliminarTurno = async (turnoId) => {
    if (!puedeModificar) {
      alert("No tienes permisos para eliminar turnos");
      return;
    }

    const confirmar = window.confirm("¿Seguro que quieres eliminar este turno?");
    if (!confirmar) return;

    try {
      const res = await fetch(`/api/turnos/${turnoId}/`, {
        method: "DELETE",
        headers: headersBase(),
      });
      const data = await res.json();

      if (res.ok) {
        cargarTurnos();
      } else {
        alert(data.error || "No se pudo eliminar el turno");
      }
    } catch (err) {
      alert("No se pudo conectar con el servidor");
    }
  };

  return (
    <div className="turnos-container">
      <div className="turnos-header">
        <div>
          <h1>Turnos</h1>
          <p>
            Usuario: <strong>{user?.nombre}</strong> · Rol: <strong>{user?.tipo}</strong>
          </p>
          {!puedeModificar && (
            <span className="readonly-badge-turnos">Modo solo lectura</span>
          )}
        </div>

        <div className="turnos-header-actions">
          <button className="home-button-turnos" onClick={() => navigate("/")}> 
            Página principal
          </button>
          <button className="back-button-turnos" onClick={() => navigate("/dashboard")}> 
            Volver al dashboard
          </button>
        </div>
      </div>

      {puedeModificar && (
        <form className="turnos-form" onSubmit={handleSubmit}>
          <h2>{editandoId ? "Modificar turno" : "Asignar turno"}</h2>

          <div className="turnos-form-grid">
            <select
              name="idEmpleado"
              value={form.idEmpleado}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona un empleado</option>
              {empleados.map((empleado) => (
                <option key={empleado.id} value={empleado.id}>
                  {empleado.nombre} ({empleado.usuario})
                </option>
              ))}
            </select>

            <input
              name="fecha"
              type="date"
              value={form.fecha}
              onChange={handleChange}
              required
            />

            <input
              name="horaInicio"
              type="time"
              value={form.horaInicio}
              onChange={handleChange}
              required
            />

            <input
              name="horaFin"
              type="time"
              value={form.horaFin}
              onChange={handleChange}
              required
            />
          </div>

          <div className="turnos-form-actions">
            <button className="save-button-turnos" type="submit">
              {editandoId ? "Guardar cambios" : "Asignar turno"}
            </button>

            {editandoId && (
              <button className="cancel-button-turnos" type="button" onClick={limpiarFormulario}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}

      <div className="turnos-table-card">
        <h2>Tabla de turnos</h2>

        {cargando && <p className="info-text-turnos">Cargando turnos...</p>}
        {error && <p className="error-text-turnos">{error}</p>}

        {!cargando && !error && turnos.length === 0 && (
          <p className="info-text-turnos">No hay turnos registrados.</p>
        )}

        {!cargando && !error && turnos.length > 0 && (
          <div className="turnos-table-wrapper">
            <table className="turnos-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Hora inicio</th>
                  <th>Hora fin</th>
                  <th>Empleado asignado</th>
                  {puedeModificar && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {turnos.map((turno) => (
                  <tr key={turno.id}>
                    <td>{turno.id}</td>
                    <td>{turno.fecha}</td>
                    <td>{turno.horaInicio}</td>
                    <td>{turno.horaFin}</td>
                    <td>{turno.nombreEmpleado}</td>
                    {puedeModificar && (
                      <td className="turnos-actions-cell">
                        <button className="edit-button-turnos" onClick={() => editarTurno(turno)}>
                          Editar
                        </button>
                        <button className="delete-button-turnos" onClick={() => eliminarTurno(turno.id)}>
                          Eliminar
                        </button>
                      </td>
                    )}
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
