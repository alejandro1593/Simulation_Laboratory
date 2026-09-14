import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./auth/useAuth";
import Layout from "./components/Layout";
import Builder from "./pages/Builder";
import Calculations from "./pages/Calculations";
import Ensayos from "./pages/Ensayos";
import GeometriaVSEPR from "./pages/GeometriaVSEPR";
import InorganicCatalog from "./pages/InorganicCatalog";
import Isomeria from "./pages/Isomeria";
import LabLibre from "./pages/LabLibre";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import MiProgreso from "./pages/MiProgreso";
import NomenclaturaTutorial from "./pages/NomenclaturaTutorial";
import Nombralo from "./pages/Nombralo";
import OrganicCatalog from "./pages/OrganicCatalog";
import PeriodicTable from "./pages/PeriodicTable";
import Register from "./pages/Register";
import Retos from "./pages/Retos";
import SimulatorPage from "./pages/SimulatorPage";
import Soluciones from "./pages/Soluciones";
import Termoquimica from "./pages/Termoquimica";
import Toxicologia from "./pages/Toxicologia";
import Tutor from "./pages/Tutor";
import Valoracion from "./pages/Valoracion";

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
        <Route
          path="/ensayos"
          element={
            <AcademicZone>
              <Ensayos />
            </AcademicZone>
          }
        />
        <Route
          path="/catalogo/inorganico"
          element={
            <AcademicZone>
              <InorganicCatalog />
            </AcademicZone>
          }
        />
        <Route
          path="/catalogo/organico"
          element={
            <AcademicZone>
              <OrganicCatalog />
            </AcademicZone>
          }
        />
        <Route
          path="/catalogo/organico/aprender"
          element={
            <AcademicZone>
              <NomenclaturaTutorial />
            </AcademicZone>
          }
        />
        <Route
          path="/catalogo/organico/nombralo"
          element={
            <AcademicZone>
              <Nombralo />
            </AcademicZone>
          }
        />
        <Route
          path="/calculadora"
          element={
            <AcademicZone>
              <Calculations />
            </AcademicZone>
          }
        />
        <Route
          path="/toxicologia"
          element={
            <AcademicZone>
              <Toxicologia />
            </AcademicZone>
          }
        />
        <Route
          path="/laboratorio"
          element={
            <AcademicZone>
              <LabLibre />
            </AcademicZone>
          }
        />
        <Route
          path="/soluciones"
          element={
            <AcademicZone>
              <Soluciones />
            </AcademicZone>
          }
        />
        <Route
          path="/valoracion"
          element={
            <AcademicZone>
              <Valoracion />
            </AcademicZone>
          }
        />
        <Route
          path="/termoquimica"
          element={
            <AcademicZone>
              <Termoquimica />
            </AcademicZone>
          }
        />
        <Route
          path="/vsepr"
          element={
            <AcademicZone>
              <GeometriaVSEPR />
            </AcademicZone>
          }
        />
        <Route
          path="/isomeria"
          element={
            <AcademicZone>
              <Isomeria />
            </AcademicZone>
          }
        />
        <Route
          path="/retos"
          element={
            <AcademicZone>
              <Retos />
            </AcademicZone>
          }
        />
        <Route
          path="/progreso"
          element={
            <AcademicZone>
              <MiProgreso />
            </AcademicZone>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}