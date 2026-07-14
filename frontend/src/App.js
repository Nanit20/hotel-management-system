import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventario from "./pages/Inventario";
import Reservas from "./pages/Reservas";
import ReservasRealizadas from "./pages/ReservasRealizadas";
import Mensajes from "./pages/Mensajes";
import Turnos from "./pages/Turnos";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/reservas" element={<Reservas />} />
        <Route path="/reservas-realizadas" element={<ReservasRealizadas />} />
        <Route path="/mensajes" element={<Mensajes />} />
        <Route path="/turnos" element={<Turnos />} />
      </Routes>
    </BrowserRouter>
  );
}
