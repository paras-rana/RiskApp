import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppFrame from '../components/AppFrame';
import Icon from '../components/Icon';
import { usePpmProjects } from '../ppm/PpmProjectsContext';

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

const DELIVERY_STATUS_VISUAL_CONFIG = [
  { key: 'red', label: 'Off Track', tone: 'red' },
  { key: 'yellow', label: 'At Risk', tone: 'yellow' },
  { key: 'green', label: 'On Track', tone: 'green' },
];

function getDeliveryStatusKey(project) {
  return project.deliveryStatus === 'red'
    || project.deliveryStatus === 'yellow'
    || project.deliveryStatus === 'green'
    ? project.deliveryStatus
    : 'green';
}

export default function PortfolioDashboardPage() {
  const { projects, currentProjects, futureProjects, submittedProjects } = usePpmProjects();
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedSummaryCard, setSelectedSummaryCard] = useState(null);
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
  const futureProjectsSorted = useMemo(
    () => sortProjectsForDashboard(futureProjects),
    [futureProjects],
  );
  const submittedProjectsSorted = useMemo(
    () => sortProjectsForDashboard(submittedProjects),
    [submittedProjects],
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
  const portfolioSummary = useMemo(
    () => [
      {
        key: 'major',
        label: 'Major Projects',
        value: String(majorProjects.length),
        note: `Approved Budget: ${majorProjectsApprovedBudget}`,
        projects: majorProjects,
      },
      {
        key: 'operational',
        label: 'Operational Projects',
        value: String(operationalProjects.length),
        note: `Approved Budget: ${operationalProjectsApprovedBudget}`,
        projects: operationalProjects,
      },
      {
        key: 'future',
        label: 'Future Pipeline',
        value: String(futureProjects.length),
        note: `Estimated Cost: ${futurePipelineEstimatedCost}`,
        projects: futureProjectsSorted,
      },
      {
        key: 'submitted',
        label: 'New Submissions',
        value: String(submittedProjects.length),
        note: 'Awaiting portfolio review',
        projects: submittedProjectsSorted,
      },
    ],
    [
      futurePipelineEstimatedCost,
      futureProjects.length,
      futureProjectsSorted,
      majorProjects,
      majorProjects.length,
      majorProjectsApprovedBudget,
      operationalProjects,
      operationalProjects.length,
      operationalProjectsApprovedBudget,
      submittedProjects.length,
      submittedProjectsSorted,
    ],
  );
  const projectsByStatus = useMemo(
    () => DELIVERY_STATUS_VISUAL_CONFIG.map((statusConfig) => {
      const matchingProjects = sortProjectsForDashboard(
        projects.filter((project) => getDeliveryStatusKey(project) === statusConfig.key),
      );

      return {
        ...statusConfig,
        count: matchingProjects.length,
        projects: matchingProjects,
      };
    }),
    [projects],
  );
  const selectedStatusGroup = useMemo(
    () => projectsByStatus.find((statusGroup) => statusGroup.key === selectedStatus) ?? null,
    [projectsByStatus, selectedStatus],
  );
  const selectedSummaryGroup = useMemo(
    () => portfolioSummary.find((card) => card.key === selectedSummaryCard) ?? null,
    [portfolioSummary, selectedSummaryCard],
  );

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
            <button
              key={card.key}
              type="button"
              className={`card portfolio-summary-card${selectedSummaryGroup?.key === card.key ? ' is-selected' : ''}`}
              onClick={() => setSelectedSummaryCard((current) => (current === card.key ? null : card.key))}
              aria-pressed={selectedSummaryGroup?.key === card.key}
            >
              <div className="label">{card.label}</div>
              <div className="value portfolio-summary-value">{card.value}</div>
              <div className="muted">{card.note}</div>
            </button>
          ))}
        </div>

        {selectedSummaryGroup ? (
          <div className="portfolio-summary-drilldown">
            <div className="panel-header-row">
              <h3>{selectedSummaryGroup.label}</h3>
              <div className="muted">{selectedSummaryGroup.projects.length} item(s)</div>
            </div>

            <div className="table-wrap portfolio-summary-table-wrap">
              <table className="simple-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Stage</th>
                    <th>Owner</th>
                    <th>Classification</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSummaryGroup.projects.map((project) => (
                    <tr key={project.id}>
                      <td>
                        <Link className="table-link" to={`/ppm/projects/${project.id}`}>
                          {project.name}
                        </Link>
                      </td>
                      <td>{project.stage || '-'}</td>
                      <td>{project.businessOwner || '-'}</td>
                      <td>{project.currentProjectClassification || '-'}</td>
                      <td>{getDeliveryStatusIndicator(project).label}</td>
                    </tr>
                  ))}
                  {!selectedSummaryGroup.projects.length ? (
                    <tr>
                      <td colSpan={5} className="muted">No projects are in this view.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </section>

      <section className="panel band-blue">
        <div className="panel-header-row">
          <h2><Icon name="assessment" />Projects By Status</h2>
          <div className="muted">Select a red, yellow, or green bar to drill into matching projects</div>
        </div>

        <div className={`portfolio-status-layout${selectedStatusGroup ? ' has-selection' : ''}`}>
          <div className="portfolio-status-visual-wrap">
            <div className="portfolio-status-visual" role="list" aria-label="Projects by status">
              {projectsByStatus.map((statusGroup) => {
                const isSelected = selectedStatusGroup?.key === statusGroup.key;

                return (
                  <button
                    key={statusGroup.key}
                    type="button"
                    className={`portfolio-status-bar tone-${statusGroup.tone}${isSelected ? ' is-selected' : ''}`}
                    onClick={() => setSelectedStatus((current) => (
                      current === statusGroup.key ? null : statusGroup.key
                    ))}
                    aria-pressed={isSelected}
                  >
                    <span className="portfolio-status-bar-header">
                      <span className="portfolio-status-bar-label">{statusGroup.label}</span>
                      <span className="portfolio-status-bar-count">{statusGroup.count}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedStatusGroup ? (
            <div className="portfolio-status-drilldown">
              <div className="panel-header-row">
                <h3>{selectedStatusGroup.label} Projects</h3>
                <div className="muted">{selectedStatusGroup.count} item(s)</div>
              </div>

              <div className="table-wrap portfolio-status-table-wrap">
                <table className="simple-table">
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>Stage</th>
                      <th>Owner</th>
                      <th>Classification</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStatusGroup.projects.map((project) => (
                      <tr key={project.id}>
                        <td>
                          <Link className="table-link" to={`/ppm/projects/${project.id}`}>
                            {project.name}
                          </Link>
                        </td>
                        <td>{project.stage || '-'}</td>
                        <td>{project.businessOwner || '-'}</td>
                        <td>{project.currentProjectClassification || '-'}</td>
                        <td>{getDeliveryStatusIndicator(project).label}</td>
                      </tr>
                    ))}
                    {!selectedStatusGroup.projects.length ? (
                      <tr>
                        <td colSpan={5} className="muted">No projects are in this status.</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      </section>

    </AppFrame>
  );
}
