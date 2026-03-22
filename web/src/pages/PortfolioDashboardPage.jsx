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
    () => currentProjects.filter(
      (project) => project.currentProjectClassification === 'Major project',
    ),
    [currentProjects],
  );
  const operationalInitiatives = useMemo(
    () => currentProjects.filter(
      (project) => project.currentProjectClassification === 'Operations Initiative',
    ),
    [currentProjects],
  );
  const majorProjectsApprovedBudget = useMemo(
    () => formatMillions(sumProjectCosts(majorProjects)),
    [majorProjects],
  );
  const operationalInitiativesApprovedBudget = useMemo(
    () => formatMillions(sumProjectCosts(operationalInitiatives)),
    [operationalInitiatives],
  );
  const futurePipelineEstimatedCost = useMemo(
    () => formatMillions(sumProjectCosts(futureProjects)),
    [futureProjects],
  );
  const portfolioSummary = [
    { label: 'Major Projects', value: String(majorProjects.length), note: `Approved Budget: ${majorProjectsApprovedBudget}` },
    { label: 'Operational Initiatives', value: String(operationalInitiatives.length), note: `Approved Budget: ${operationalInitiativesApprovedBudget}` },
    { label: 'Future Pipeline', value: String(futureProjects.length), note: `Estimated Cost: ${futurePipelineEstimatedCost}` },
    { label: 'New Submissions', value: String(submittedProjects.length), note: 'Awaiting portfolio review' },
  ];

  const spotlightProjects = [...submittedProjects, ...futureProjects, ...currentProjects].slice(0, 5);

  return (
    <AppFrame
      title="Portfolio Dashboard"
      description="PPM workflow across proposal intake, review, future pipeline, and active projects."
      topNavActions={(
        <Link className="primary-btn" to="/ppm/submit">
          <Icon name="plus" />
          Submit Project
        </Link>
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
              <div className="muted">{majorProjects.length} item(s)</div>
            </div>

            <div className="table-wrap">
              <table className="simple-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Project</th>
                    <th>Business Owner</th>
                    <th>Strategic Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {majorProjects.map((project) => {
                    const indicator = getProjectStatusIndicator(project.status);

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
                        <td>{project.strategicAlignment || '-'}</td>
                      </tr>
                    );
                  })}
                  {majorProjects.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="muted">No major projects are active.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </article>

          <article className="detail-block detail-section-banded band-blue">
            <div className="panel-header-row">
              <h3>Operational Initiatives</h3>
              <div className="muted">{operationalInitiatives.length} item(s)</div>
            </div>

            <div className="table-wrap">
              <table className="simple-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Initiative</th>
                    <th>Business Owner</th>
                    <th>Strategic Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {operationalInitiatives.map((project) => {
                    const indicator = getProjectStatusIndicator(project.status);

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
                        <td>{project.strategicAlignment || '-'}</td>
                      </tr>
                    );
                  })}
                  {operationalInitiatives.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="muted">No operational initiatives are active.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header-row">
          <h2><Icon name="register" />Portfolio Register</h2>
          <div className="muted">{spotlightProjects.length} highlighted project(s)</div>
        </div>

        <div className="table-wrap">
          <table className="simple-table">
            <thead>
              <tr>
                <th>Portfolio ID</th>
                <th>Name</th>
                <th>Executive Sponsor</th>
                <th>Stage</th>
                <th>Estimated Cost</th>
                <th>Target Start</th>
                <th>Category</th>
                <th>Current Classification</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {spotlightProjects.map((project) => (
                <tr key={project.id}>
                  <td>{project.id}</td>
                  <td>{project.name}</td>
                  <td>{project.executiveSponsor}</td>
                  <td>
                    <span className={`pill ${project.stage === 'current' ? 'low' : project.stage === 'future' ? 'medium' : 'unknown'}`}>
                      {project.stage}
                    </span>
                  </td>
                  <td>{project.estimatedCost}</td>
                  <td>{project.targetStartQuarter}</td>
                  <td>{project.category}</td>
                  <td>{project.stage === 'current' ? project.currentProjectClassification || '-' : '-'}</td>
                  <td>{project.reviewNotes || project.strategicAlignment || project.summary}</td>
                </tr>
              ))}
              {spotlightProjects.length === 0 ? (
                <tr>
                  <td colSpan={9} className="muted">No project data available yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </AppFrame>
  );
}
