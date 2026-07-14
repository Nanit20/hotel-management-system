import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Inventario.css";

const estadoLabels = {
  disponible: "Disponible",
  agotado: "Agotado",
  bajo_stock: "Bajo stock",
};

const formInicial = {
  nombreProducto: "",
  cantidad: "",
  estado: "disponible",
};

export default function Inventario() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [items, setItems] = useState([]);
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

    cargarInventario();
  }, []);

  const cargarInventario = async () => {
    try {
      setCargando(true);
      const res = await fetch("/api/inventario/", {
        headers: {
          "X-User-Type": user?.tipo || "",
        },
      });
      const data = await res.json();

      if (res.ok) {
        setItems(data);
        setError("");
      } else {
        setError(data.error || "No se pudo cargar el inventario");
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor");
    } finally {
      setCargando(false);
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
      alert("No tienes permisos para modificar el inventario");
      return;
    }

    const url = editandoId
      ? `/api/inventario/${editandoId}/`
      : "/api/inventario/";

    const method = editandoId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-User-Type": user.tipo,
      },
      body: JSON.stringify({
        nombreProducto: form.nombreProducto,
        cantidad: Number(form.cantidad),
        estado: form.estado,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      limpiarFormulario();
      cargarInventario();
    } else {
      alert(data.error || "No se pudo guardar el producto");
    }
  };

  const editarItem = (item) => {
    setEditandoId(item.id);
    setForm({
      nombreProducto: item.nombreProducto,
      cantidad: item.cantidad,
      estado: item.estado,
    });
  };

  const eliminarItem = async (itemId) => {
    if (!puedeModificar) {
      alert("No tienes permisos para eliminar productos");
      return;
    }

    const confirmar = window.confirm("¿Seguro que quieres eliminar este producto?");
    if (!confirmar) return;

    const res = await fetch(`/api/inventario/${itemId}/`, {
      method: "DELETE",
      headers: {
        "X-User-Type": user.tipo,
      },
    });

    const data = await res.json();

    if (res.ok) {
      cargarInventario();
    } else {
      alert(data.error || "No se pudo eliminar el producto");
    }
  };

  return (
    <div className="inventario-container">
      <div className="inventario-header">
        <div>
          <h1>Inventario</h1>
          <p>
            Usuario: <strong>{user?.nombre}</strong> · Rol: <strong>{user?.tipo}</strong>
          </p>
          {!puedeModificar && (
            <span className="readonly-badge">Modo solo lectura</span>
          )}
        </div>

        <button className="back-button" onClick={() => navigate("/dashboard")}>
          Volver al dashboard
        </button>
      </div>

      {puedeModificar && (
        <form className="inventario-form" onSubmit={handleSubmit}>
          <h2>{editandoId ? "Actualizar producto" : "Agregar producto"}</h2>

          <div className="form-grid">
            <input
              name="nombreProducto"
              placeholder="Nombre del producto"
              value={form.nombreProducto}
              onChange={handleChange}
              required
            />

            <input
              name="cantidad"
              type="number"
              min="0"
              placeholder="Cantidad"
              value={form.cantidad}
              onChange={handleChange}
              required
            />

            <select name="estado" value={form.estado} onChange={handleChange}>
              <option value="disponible">Disponible</option>
              <option value="bajo_stock">Bajo stock</option>
              <option value="agotado">Agotado</option>
            </select>
          </div>

          <div className="form-actions">
            <button className="save-button" type="submit">
              {editandoId ? "Guardar cambios" : "Agregar"}
            </button>

            {editandoId && (
              <button className="cancel-button" type="button" onClick={limpiarFormulario}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}

      <div className="inventario-table-card">
        <h2>Listado de productos</h2>

        {cargando && <p className="info-text">Cargando inventario...</p>}
        {error && <p className="error-text">{error}</p>}

        {!cargando && !error && items.length === 0 && (
          <p className="info-text">No hay productos registrados.</p>
        )}

        {!cargando && !error && items.length > 0 && (
          <div className="table-wrapper">
            <table className="inventario-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Estado</th>
                  {puedeModificar && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.nombreProducto}</td>
                    <td>{item.cantidad}</td>
                    <td>
                      <span className={`estado estado-${item.estado}`}>
                        {estadoLabels[item.estado] || item.estado}
                      </span>
                    </td>
                    {puedeModificar && (
                      <td className="actions-cell">
                        <button className="edit-button" onClick={() => editarItem(item)}>
                          Editar
                        </button>
                        <button className="delete-button" onClick={() => eliminarItem(item.id)}>
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
