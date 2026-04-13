import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import AppFrame from '../components/AppFrame';
import Icon from '../components/Icon';
import { usePpmProjects } from '../ppm/PpmProjectsContext';

function getProjectStatusIndicator(status) {
  if (status === 'active') {
    return { label: 'Active', tone: 'green' };
  }

  if (status === 'planned') {
    return { label: 'Planned', tone: 'yellow' };
  }

  if (status === 'denied') {
    return { label: 'Denied', tone: 'red' };
  }

  return { label: 'On hold', tone: 'grey' };
}

function getDeliveryStatusIndicator(project) {
  if (project.deliveryStatus === 'red') {
    return { label: 'At Risk', tone: 'red' };
  }

  if (project.deliveryStatus === 'yellow') {
    return { label: 'Watch', tone: 'yellow' };
  }

  return { label: 'On Track', tone: 'green' };
}

function getDeliveryPriority(project) {
  if (project.deliveryStatus === 'red') return 0;
  if (project.deliveryStatus === 'yellow') return 1;
  if (project.deliveryStatus === 'green') return 2;
  return 3;
}

function sortProjectsForDashboard(projects) {
  return [...projects].sort((left, right) => {
    const deliveryDelta = getDeliveryPriority(left) - getDeliveryPriority(right);
    if (deliveryDelta !== 0) return deliveryDelta;

    return String(left.name ?? '').localeCompare(String(right.name ?? ''));
  });
}

function sumProjectCosts(projects) {
  return projects.reduce((sum, project) => {
    const value = Number(String(project.estimatedCost).replace(/[^0-9.]/g, '')) || 0;
    return sum + value;
  }, 0);
}

function formatMillions(value) {
  return `$${value.toFixed(1)}M`;
}

export default function PortfolioDashboardPage() {
  const { currentProjects, futureProjects, submittedProjects } = usePpmProjects();
  const majorProjects = useMemo(
    () => sortProjectsForDashboard(
      currentProjects.filter(
        (project) => project.currentProjectClassification === 'Major project',
      ),
    ),
    [currentProjects],
  );
  const operationalProjects = useMemo(
    () => sortProjectsForDashboard(
      currentProjects.filter(
        (project) => project.currentProjectClassification === 'Operational project',
      ),
    ),
    [currentProjects],
  );
  const majorProjectsPreview = useMemo(() => majorProjects.slice(0, 7), [majorProjects]);
  const operationalProjectsPreview = useMemo(
    () => operationalProjects.slice(0, 7),
    [operationalProjects],
  );
  const majorProjectsApprovedBudget = useMemo(
    () => formatMillions(sumProjectCosts(majorProjects)),
    [majorProjects],
  );
  const operationalProjectsApprovedBudget = useMemo(
    () => formatMillions(sumProjectCosts(operationalProjects)),
    [operationalProjects],
  );
  const futurePipelineEstimatedCost = useMemo(
    () => formatMillions(sumProjectCosts(futureProjects)),
    [futureProjects],
  );
  const portfolioSummary = [
    { label: 'Major Projects', value: String(majorProjects.length), note: `Approved Budget: ${majorProjectsApprovedBudget}` },
    { label: 'Operational Projects', value: String(operationalProjects.length), note: `Approved Budget: ${operationalProjectsApprovedBudget}` },
    { label: 'Future Pipeline', value: String(futureProjects.length), note: `Estimated Cost: ${futurePipelineEstimatedCost}` },
    { label: 'New Submissions', value: String(submittedProjects.length), note: 'Awaiting portfolio review' },
  ];

  return (
    <AppFrame
      title="Portfolio Dashboard"
      description="PPM workflow across proposal intake, review, future pipeline, and active projects."
      topNavActions={(
        <>
          <Link className="secondary-btn" to="/ppm/register">
            <Icon name="register" />
            Portfolio Register
          </Link>
          <Link className="primary-btn" to="/ppm/submit">
            <Icon name="plus" />
            Submit Project
          </Link>
        </>
      )}
    >
      <section className="panel">
        <div className="panel-header-row">
          <h2><Icon name="portfolio" />Portfolio Snapshot</h2>
          <div className="muted">{submittedProjects.length} proposal(s) are waiting for review</div>
        </div>

        <div className="cards portfolio-cards">
          {portfolioSummary.map((card) => (
            <article key={card.label} className="card portfolio-summary-card">
              <div className="label">{card.label}</div>
              <div className="value portfolio-summary-value">{card.value}</div>
              <div className="muted">{card.note}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header-row">
          <h2><Icon name="portfolio" />Current Work Breakdown</h2>
          <div className="muted">{currentProjects.length} active item(s)</div>
        </div>

        <div className="portfolio-project-groups">
          <article className="detail-block detail-section-banded band-purple">
            <div className="panel-header-row">
              <h3>Major Projects</h3>
              <div className="muted">Showing {majorProjectsPreview.length} of {majorProjects.length}</div>
            </div>

            <div className="table-wrap">
              <table className="simple-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Project</th>
                    <th>Business Owner</th>
                    <th>Operational Initiative</th>
                    <th>Estimated Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {majorProjectsPreview.map((project) => {
                    const indicator = getDeliveryStatusIndicator(project);

                    return (
                      <tr key={project.id}>
                        <td>
                          <span className="status-indicator-cell" title={indicator.label}>
                            <span
                              className={`status-indicator-dot ${indicator.tone}`}
                              aria-hidden="true"
                            />
                          </span>
                        </td>
                        <td>{project.name}</td>
                        <td>{project.businessOwner || '-'}</td>
                        <td>{project.operationalInitiativeTitle || '-'}</td>
                        <td>{project.estimatedCost || '-'}</td>
                      </tr>
                    );
                  })}
                  {majorProjectsPreview.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="muted">No major projects are active.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </article>

          <article className="detail-block detail-section-banded band-blue">
            <div className="panel-header-row">
              <h3>Operational Projects</h3>
              <div className="muted">Showing {operationalProjectsPreview.length} of {operationalProjects.length}</div>
            </div>

            <div className="table-wrap">
              <table className="simple-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Initiative</th>
                    <th>Business Owner</th>
                    <th>Operational Initiative</th>
                    <th>Estimated Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {operationalProjectsPreview.map((project) => {
                    const indicator = getDeliveryStatusIndicator(project);

                    return (
                      <tr key={project.id}>
                        <td>
                          <span className="status-indicator-cell" title={indicator.label}>
                            <span
                              className={`status-indicator-dot ${indicator.tone}`}
                              aria-hidden="true"
                            />
                          </span>
                        </td>
                        <td>{project.name}</td>
                        <td>{project.businessOwner || '-'}</td>
                        <td>{project.operationalInitiativeTitle || '-'}</td>
                        <td>{project.estimatedCost || '-'}</td>
                      </tr>
                    );
                  })}
                  {operationalProjectsPreview.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="muted">No operational projects are active.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </section>

    </AppFrame>
  );
}
