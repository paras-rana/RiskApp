import { Link } from 'react-router-dom';
import AppFrame from '../components/AppFrame';
import Icon from '../components/Icon';
import { usePpmProjects } from '../ppm/PpmProjectsContext';

function getDeliveryIndicator(project) {
  if (project.deliveryStatus === 'red') {
    return { label: 'At Risk', tone: 'red' };
  }

  if (project.deliveryStatus === 'yellow') {
    return { label: 'Watch', tone: 'yellow' };
  }

  return { label: 'On Track', tone: 'green' };
}

function getStageTone(stage) {
  if (stage === 'current') return 'low';
  if (stage === 'future') return 'medium';
  if (stage === 'submitted') return 'medium';
  return 'unknown';
}

function sortProjects(projects) {
  return [...projects].sort((left, right) => String(left.id ?? '').localeCompare(String(right.id ?? '')));
}

export default function PortfolioRegisterPage() {
  const { projects, archivedProposals } = usePpmProjects();
  const registerProjects = sortProjects([
    ...projects,
    ...archivedProposals.filter(
      (archivedProject) => !projects.some((project) => project.id === archivedProject.id),
    ),
  ]);

  return (
    <AppFrame
      title="Portfolio Register"
      description="Complete portfolio listing across current work, future pipeline, submissions, and archived items."
      topNavActions={(
        <Link className="secondary-btn" to="/dashboard">
          <Icon name="dashboard" />
          Back To Dashboard
        </Link>
      )}
    >
      <section className="panel">
        <div className="panel-header-row">
          <h2><Icon name="register" />Portfolio Register</h2>
          <div className="muted">{registerProjects.length} project(s)</div>
        </div>

        <div className="table-wrap">
          <table className="simple-table">
            <thead>
              <tr>
                <th>Delivery</th>
                <th>Portfolio ID</th>
                <th>Name</th>
                <th>Stage</th>
                <th>Executive Sponsor</th>
                <th>Business Owner</th>
                <th>Estimated Cost</th>
                <th>Target Start</th>
                <th>Classification</th>
                <th>Annual Operational Initiative</th>
                <th>Strategic Priority</th>
              </tr>
            </thead>
            <tbody>
              {registerProjects.map((project) => {
                const delivery = getDeliveryIndicator(project);

                return (
                  <tr key={project.id}>
                    <td>
                      <span className="status-indicator-cell" title={delivery.label}>
                        <span className={`status-indicator-dot ${delivery.tone}`} aria-hidden="true" />
                        <span>{delivery.label}</span>
                      </span>
                    </td>
                    <td>
                      <Link className="table-link" to={`/ppm/projects/${project.id}`}>
                        {project.id}
                      </Link>
                    </td>
                    <td>{project.name}</td>
                    <td>
                      <span className={`pill ${getStageTone(project.stage)}`}>{project.stage}</span>
                    </td>
                    <td>{project.executiveSponsor || '-'}</td>
                    <td>{project.businessOwner || '-'}</td>
                    <td>{project.estimatedCost || '-'}</td>
                    <td>{project.targetStartQuarter || '-'}</td>
                    <td>{project.currentProjectClassification || '-'}</td>
                    <td>{project.operationalInitiativeTitle || '-'}</td>
                    <td>{project.strategicPriorityTitle || project.strategicAlignment || '-'}</td>
                  </tr>
                );
              })}
              {registerProjects.length === 0 ? (
                <tr>
                  <td colSpan={11} className="muted">No project data is available yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </AppFrame>
  );
}
