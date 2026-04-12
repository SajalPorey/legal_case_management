import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ClientsPage from "./pages/ClientsPage";
import CasesPage from "./pages/CasesPage";
import DocumentsPage from "./pages/DocumentsPage";
import HearingsPage from "./pages/HearingsPage";
import TimelinePage from "./pages/TimelinePage";
import AdminRequestsPage from "./pages/AdminRequestsPage";

const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="clients" element={<ClientsPage />} />
      <Route path="cases" element={<CasesPage />} />
      <Route path="documents" element={<DocumentsPage />} />
      <Route path="hearings" element={<HearingsPage />} />
      <Route path="timeline" element={<TimelinePage />} />
      <Route path="admin-requests" element={<AdminRequestsPage />} />
    </Route>
  </Routes>
);

export default App;
