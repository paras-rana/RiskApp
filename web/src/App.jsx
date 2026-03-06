import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import DashboardPage from './pages/DashboardPage';
import RiskRegisterPage from './pages/RiskRegisterPage';
import RiskDetailPage from './pages/RiskDetailPage';

export default function App() {
  // Router map for the SPA.
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/risks" element={<RiskRegisterPage />} />
        <Route path="/risks/:riskId" element={<RiskDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}
