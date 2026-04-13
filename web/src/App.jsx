import AnnualOperationalInitiativesPage from './pages/AnnualOperationalInitiativesPage';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import './App.css';
import { useAuth } from './auth/useAuth';
import { WORKSPACES } from './lib/workspace';
import CurrentProjectsPage from './pages/CurrentProjectsPage';
import CreateAnnualOperationalInitiativePage from './pages/CreateAnnualOperationalInitiativePage';
import CreateStrategicPriorityPeriodPage from './pages/CreateStrategicPriorityPeriodPage';
import DashboardPage from './pages/DashboardPage';
import FutureProjectsPage from './pages/FutureProjectsPage';
import LoginPage from './pages/LoginPage';
import PortfolioDashboardPage from './pages/PortfolioDashboardPage';
import PortfolioRegisterPage from './pages/PortfolioRegisterPage';
import ProposalReviewPage from './pages/ProposalReviewPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import RiskRegisterPage from './pages/RiskRegisterPage';
import RiskDetailPage from './pages/RiskDetailPage';
import OperationalInitiativeRegisterPage from './pages/OperationalInitiativeRegisterPage';
import StrategicPriorityPeriodRegisterPage from './pages/StrategicPriorityPeriodRegisterPage';
import StrategicPrioritiesPage from './pages/StrategicPrioritiesPage';
import SubmissionReviewPage from './pages/SubmissionReviewPage';
import SubmitProjectPage from './pages/SubmitProjectPage';

function RequireAuth({ children }) {
  const { authReady, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!authReady) {
    return <div className="app-loading">Checking session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

function RequireWorkspace({ allowed, children }) {
  const { workspace } = useAuth();

  if (!allowed.includes(workspace)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function DashboardRoute() {
  const { workspace } = useAuth();
  return workspace === WORKSPACES.PPM ? <PortfolioDashboardPage /> : <DashboardPage />;
}

export default function App() {
  // Router map for the SPA.
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={(
            <RequireAuth>
              <DashboardRoute />
            </RequireAuth>
          )}
        />
        <Route
          path="/risks"
          element={(
            <RequireAuth>
              <RequireWorkspace allowed={[WORKSPACES.ERM]}>
                <RiskRegisterPage />
              </RequireWorkspace>
            </RequireAuth>
          )}
        />
        <Route
          path="/risks/:riskId"
          element={(
            <RequireAuth>
              <RequireWorkspace allowed={[WORKSPACES.ERM]}>
                <RiskDetailPage />
              </RequireWorkspace>
            </RequireAuth>
          )}
        />
        <Route
          path="/ppm/current"
          element={(
            <RequireAuth>
              <RequireWorkspace allowed={[WORKSPACES.PPM]}>
                <CurrentProjectsPage />
              </RequireWorkspace>
            </RequireAuth>
          )}
        />
        <Route
          path="/ppm/operational-initiatives"
          element={(
            <RequireAuth>
              <RequireWorkspace allowed={[WORKSPACES.PPM]}>
                <AnnualOperationalInitiativesPage />
              </RequireWorkspace>
            </RequireAuth>
          )}
        />
        <Route
          path="/ppm/operational-initiatives/new"
          element={(
            <RequireAuth>
              <RequireWorkspace allowed={[WORKSPACES.PPM]}>
                <CreateAnnualOperationalInitiativePage />
              </RequireWorkspace>
            </RequireAuth>
          )}
        />
        <Route
          path="/ppm/operational-initiatives/register"
          element={(
            <RequireAuth>
              <RequireWorkspace allowed={[WORKSPACES.PPM]}>
                <OperationalInitiativeRegisterPage />
              </RequireWorkspace>
            </RequireAuth>
          )}
        />
        <Route
          path="/ppm/register"
          element={(
            <RequireAuth>
              <RequireWorkspace allowed={[WORKSPACES.PPM]}>
                <PortfolioRegisterPage />
              </RequireWorkspace>
            </RequireAuth>
          )}
        />
        <Route
          path="/ppm/projects/:projectId"
          element={(
            <RequireAuth>
              <RequireWorkspace allowed={[WORKSPACES.PPM]}>
                <ProjectDetailPage />
              </RequireWorkspace>
            </RequireAuth>
          )}
        />
        <Route
          path="/ppm/future"
          element={(
            <RequireAuth>
              <RequireWorkspace allowed={[WORKSPACES.PPM]}>
                <FutureProjectsPage />
              </RequireWorkspace>
            </RequireAuth>
          )}
        />
        <Route
          path="/ppm/submit"
          element={(
            <RequireAuth>
              <RequireWorkspace allowed={[WORKSPACES.PPM]}>
                <SubmitProjectPage />
              </RequireWorkspace>
            </RequireAuth>
          )}
        />
        <Route
          path="/ppm/review"
          element={(
            <RequireAuth>
              <RequireWorkspace allowed={[WORKSPACES.PPM]}>
                <SubmissionReviewPage />
              </RequireWorkspace>
            </RequireAuth>
          )}
        />
        <Route
          path="/ppm/review/:projectId"
          element={(
            <RequireAuth>
              <RequireWorkspace allowed={[WORKSPACES.PPM]}>
                <ProposalReviewPage />
              </RequireWorkspace>
            </RequireAuth>
          )}
        />
        <Route
          path="/ppm/strategic-priorities"
          element={(
            <RequireAuth>
              <RequireWorkspace allowed={[WORKSPACES.PPM]}>
                <StrategicPrioritiesPage />
              </RequireWorkspace>
            </RequireAuth>
          )}
        />
        <Route
          path="/ppm/strategic-priorities/register"
          element={(
            <RequireAuth>
              <RequireWorkspace allowed={[WORKSPACES.PPM]}>
                <StrategicPriorityPeriodRegisterPage />
              </RequireWorkspace>
            </RequireAuth>
          )}
        />
        <Route
          path="/ppm/strategic-priorities/new"
          element={(
            <RequireAuth>
              <RequireWorkspace allowed={[WORKSPACES.PPM]}>
                <CreateStrategicPriorityPeriodPage />
              </RequireWorkspace>
            </RequireAuth>
          )}
        />
      </Routes>
    </BrowserRouter>
  );
}
