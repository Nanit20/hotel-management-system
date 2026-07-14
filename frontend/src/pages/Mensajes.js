import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Mensajes.css";

export default function Mensajes() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [usuarios, setUsuarios] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [destinatario, setDestinatario] = useState("");
  const [contenido, setContenido] = useState("");
  const [tab, setTab] = useState("recibidos");
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [mensajeOk, setMensajeOk] = useState("");

  const esAdmin = user?.tipo === "ADMIN";

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    cargarDatos();

    const intervalo = setInterval(() => {
      cargarMensajes(false);
    }, 5000);

    return () => clearInterval(intervalo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const headersUsuario = () => ({
    "Content-Type": "application/json",
    "X-User-Type": user?.tipo || "",
    "X-User-ID": user?.id || "",
  });

  const cargarDatos = async () => {
    setCargando(true);
    await Promise.all([cargarUsuarios(), cargarMensajes(false)]);
    setCargando(false);
  };

  const cargarUsuarios = async () => {
    try {
      const res = await fetch("/api/usuarios/", {
        headers: headersUsuario(),
      });
      const data = await res.json();

      if (res.ok) {
        setUsuarios(data.filter((usuario) => usuario.id !== user.id));
      } else {
        setError(data.error || "No se pudieron cargar los usuarios");
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor");
    }
  };

  const cargarMensajes = async (mostrarCarga = true) => {
    try {
      if (mostrarCarga) setCargando(true);

      const res = await fetch("/api/mensajes/", {
        headers: headersUsuario(),
      });
      const data = await res.json();

      if (res.ok) {
        setMensajes(data);
        setError("");
      } else {
        setError(data.error || "No se pudieron cargar los mensajes");
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor");
    } finally {
      if (mostrarCarga) setCargando(false);
    }
  };

  const enviarMensaje = async (e) => {
    e.preventDefault();

    if (!destinatario || !contenido.trim()) {
      setError("Debes seleccionar un destinatario y escribir un mensaje");
      return;
    }

    try {
      setEnviando(true);
      setError("");
      setMensajeOk("");

      const res = await fetch("/api/mensajes/", {
        method: "POST",
        headers: headersUsuario(),
        body: JSON.stringify({
          idDestinatario: destinatario,
          contenido,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setContenido("");
        setDestinatario("");
        setMensajeOk("Mensaje enviado correctamente");
        await cargarMensajes(false);
        setTab("enviados");
      } else {
        setError(data.error || "No se pudo enviar el mensaje");
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor");
    } finally {
      setEnviando(false);
    }
  };

  const marcarLeido = async (mensajeId) => {
    try {
      const res = await fetch(`/api/mensajes/${mensajeId}/leido/`, {
        method: "PUT",
        headers: headersUsuario(),
      });
      const data = await res.json();

      if (res.ok) {
        await cargarMensajes(false);
      } else {
        alert(data.error || "No se pudo marcar el mensaje como leído");
      }
    } catch (err) {
      alert("No se pudo conectar con el servidor");
    }
  };

  const mensajesFiltrados = useMemo(() => {
    if (!user) return [];

    if (tab === "todos" && esAdmin) {
      return mensajes;
    }

    if (tab === "enviados") {
      return mensajes.filter((mensaje) => mensaje.idRemitente === user.id);
    }

    return mensajes.filter((mensaje) => mensaje.idDestinatario === user.id);
  }, [mensajes, tab, user, esAdmin]);

  const formatearFecha = (fecha) => {
    try {
      return new Date(fecha).toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (err) {
      return fecha;
    }
  };

  return (
    <div className="mensajes-container">
      <div className="mensajes-header">
        <div>
          <h1>Mensajería interna</h1>
          <p>
            Usuario: <strong>{user?.nombre}</strong> · Rol: <strong>{user?.tipo}</strong>
          </p>
        </div>

        <div className="mensajes-header-actions">
          <button className="mensajes-home-button" onClick={() => navigate("/")}> 
            Página principal
          </button>
          <button className="mensajes-back-button" onClick={() => navigate("/dashboard")}> 
            Volver al dashboard
          </button>
        </div>
      </div>

      <form className="mensajes-form" onSubmit={enviarMensaje}>
        <h2>Enviar mensaje</h2>

        <label>Destinatario</label>
        <select value={destinatario} onChange={(e) => setDestinatario(e.target.value)}>
          <option value="">Selecciona un usuario</option>
          {usuarios.map((usuario) => (
            <option key={usuario.id} value={usuario.id}>
              {usuario.nombre} ({usuario.tipo})
            </option>
          ))}
        </select>

        <label>Mensaje</label>
        <textarea
          placeholder="Escribe el mensaje..."
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          rows="4"
        />

        <button className="mensajes-send-button" type="submit" disabled={enviando}>
          {enviando ? "Enviando..." : "Enviar"}
        </button>

        {mensajeOk && <p className="mensajes-success">{mensajeOk}</p>}
        {error && <p className="mensajes-error">{error}</p>}
      </form>

      <div className="mensajes-card">
        <div className="mensajes-tabs">
          <button
            className={tab === "recibidos" ? "active" : ""}
            onClick={() => setTab("recibidos")}
          >
            Recibidos
          </button>
          <button
            className={tab === "enviados" ? "active" : ""}
            onClick={() => setTab("enviados")}
          >
            Enviados
          </button>
          {esAdmin && (
            <button
              className={tab === "todos" ? "active" : ""}
              onClick={() => setTab("todos")}
            >
              Todos
            </button>
          )}
          <button className="refresh-button" onClick={() => cargarMensajes()}>
            Actualizar
          </button>
        </div>

        {cargando && <p className="mensajes-info">Cargando mensajes...</p>}

        {!cargando && mensajesFiltrados.length === 0 && (
          <p className="mensajes-info">No hay mensajes en esta pestaña.</p>
        )}

        {!cargando && mensajesFiltrados.length > 0 && (
          <div className="mensajes-list">
            {mensajesFiltrados.map((mensaje) => {
              const recibidoPorUsuario = mensaje.idDestinatario === user?.id;
              return (
                <div
                  key={mensaje.id}
                  className={`mensaje-item ${mensaje.leido ? "leido" : "no-leido"}`}
                >
                  <div className="mensaje-item-header">
                    <div>
                      <p>
                        <strong>De:</strong> {mensaje.nombreRemitente} ({mensaje.tipoRemitente})
                      </p>
                      <p>
                        <strong>Para:</strong> {mensaje.nombreDestinatario} ({mensaje.tipoDestinatario})
                      </p>
                    </div>
                    <span className="mensaje-fecha">{formatearFecha(mensaje.fecha)}</span>
                  </div>

                  <p className="mensaje-contenido">{mensaje.contenido}</p>

                  <div className="mensaje-footer">
                    <span className={mensaje.leido ? "estado-leido" : "estado-pendiente"}>
                      {mensaje.leido ? "Leído" : "No leído"}
                    </span>

                    {!mensaje.leido && (recibidoPorUsuario || esAdmin) && (
                      <button onClick={() => marcarLeido(mensaje.id)}>
                        Marcar como leído
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
