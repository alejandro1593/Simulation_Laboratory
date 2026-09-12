import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./auth/useAuth";
import Layout from "./components/Layout";
import Builder from "./pages/Builder";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import PeriodicTable from "./pages/PeriodicTable";
import Register from "./pages/Register";
import SimulatorPage from "./pages/SimulatorPage";
import Tutor from "./pages/Tutor";

function AcademicZone({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p className="muted">Comprobando credenciales…</p>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/simulador"
          element={
            <AcademicZone>
              <SimulatorPage />
            </AcademicZone>
          }
        />
        <Route
          path="/tabla"
          element={
            <AcademicZone>
              <PeriodicTable />
            </AcademicZone>
          }
        />
        <Route
          path="/constructor"
          element={
            <AcademicZone>
              <Builder />
            </AcademicZone>
          }
        />
        <Route
          path="/tutor"
          element={
            <AcademicZone>
              <Tutor />
            </AcademicZone>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}