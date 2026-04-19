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

const PROJECT_HEALTH_BY_ID = {
  'PRJ-301': {
    scope: 'green',
    schedule: 'yellow',
    cost: 'green',
    risk: 'yellow',
    quality: 'green',
  },
  'PRJ-302': {
    scope: 'green',
    schedule: 'green',
    cost: 'yellow',
    risk: 'yellow',
    quality: 'green',
  },
  'PRJ-303': {
    scope: 'green',
    schedule: 'green',
    cost: 'green',
    risk: 'yellow',
    quality: 'green',
  },
  'PRJ-304': {
    scope: 'green',
    schedule: 'yellow',
    cost: 'green',
    risk: 'yellow',
    quality: 'green',
  },
  'PRJ-305': {
    scope: 'yellow',
    schedule: 'yellow',
    cost: 'green',
    risk: 'yellow',
    quality: 'green',
  },
  'PRJ-306': {
    scope: 'green',
    schedule: 'green',
    cost: 'yellow',
    risk: 'yellow',
    quality: 'green',
  },
  'PRJ-307': {
    scope: 'green',
    schedule: 'yellow',
    cost: 'green',
    risk: 'red',
    quality: 'green',
  },
  'PRJ-308': {
    scope: 'green',
    schedule: 'green',
    cost: 'yellow',
    risk: 'yellow',
    quality: 'green',
  },
  'PRJ-309': {
    scope: 'green',
    schedule: 'green',
    cost: 'green',
    risk: 'yellow',
    quality: 'green',
  },
  'PRJ-201': {
    scope: 'green',
    schedule: 'yellow',
    cost: 'green',
    risk: 'yellow',
    quality: 'green',
  },
  'PRJ-214': {
    scope: 'green',
    schedule: 'green',
    cost: 'yellow',
    risk: 'yellow',
    quality: 'green',
  },
  'PRJ-223': {
    scope: 'yellow',
    schedule: 'green',
    cost: 'green',
    risk: 'red',
    quality: 'yellow',
  },
  'PRJ-230': {
    scope: 'yellow',
    schedule: 'yellow',
    cost: 'green',
    risk: 'yellow',
    quality: 'green',
  },
  'PRJ-233': {
    scope: 'green',
    schedule: 'yellow',
    cost: 'yellow',
    risk: 'red',
    quality: 'green',
  },
};

function getDeliveryStatusKey(project) {
  return project.deliveryStatus === 'red'
    || project.deliveryStatus === 'yellow'
    || project.deliveryStatus === 'green'
    ? project.deliveryStatus
    : 'green';
}

function getBusinessOwnerLabel(project) {
  return project.businessOwner?.trim() || 'Unassigned';
}

function getHealthLabel(tone) {
  if (tone === 'red') return 'At Risk';
  if (tone === 'yellow') return 'Watch';
  if (tone === 'green') return 'On Track';
  return 'Not Started';
}

function getProjectSheetHealth(project) {
  const configuredHealth = PROJECT_HEALTH_BY_ID[project.id];
  if (configuredHealth) return configuredHealth;

  if (project.currentProjectClassification === 'Operational project') {
    if (project.category === 'Compliance') {
      return {
        scope: 'green',
        schedule: 'green',
        cost: 'yellow',
        risk: 'yellow',
        quality: 'green',
      };
    }

    return {
      scope: 'green',
      schedule: 'green',
      cost: 'green',
      risk: 'yellow',
      quality: 'green',
    };
  }

  return {
    scope: 'grey',
    schedule: 'grey',
    cost: 'grey',
    risk: 'grey',
    quality: 'grey',
  };
}

function renderHealthStatusCell(tone) {
  return (
    <span className="status-indicator-cell">
      <span className={`status-indicator-dot ${tone}`} aria-hidden="true" />
      <span>{getHealthLabel(tone)}</span>
    </span>
  );
}

export default function PortfolioDashboardPage() {
  const { projects, currentProjects, futureProjects, submittedProjects } = usePpmProjects();
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedSummaryCard, setSelectedSummaryCard] = useState(null);
  const [selectedOwnerStatusCell, setSelectedOwnerStatusCell] = useState(null);
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
  const businessOwnerStatusMatrix = useMemo(() => {
    const rowsByOwner = projects.reduce((accumulator, project) => {
      const owner = getBusinessOwnerLabel(project);
      const statusKey = getDeliveryStatusKey(project);
      const existingRow = accumulator.get(owner) ?? {
        owner,
        projects: [],
        red: 0,
        yellow: 0,
        green: 0,
        total: 0,
      };

      existingRow[statusKey] += 1;
      existingRow.total += 1;
      existingRow.projects.push(project);
      accumulator.set(owner, existingRow);
      return accumulator;
    }, new Map());

    return [...rowsByOwner.values()].sort((left, right) => {
      if (right.total !== left.total) return right.total - left.total;
      return left.owner.localeCompare(right.owner);
    });
  }, [projects]);
  const businessOwnerMatrixTotals = useMemo(
    () => businessOwnerStatusMatrix.reduce(
      (totals, row) => ({
        red: totals.red + row.red,
        yellow: totals.yellow + row.yellow,
        green: totals.green + row.green,
        total: totals.total + row.total,
      }),
      {
        red: 0,
        yellow: 0,
        green: 0,
        total: 0,
      },
    ),
    [businessOwnerStatusMatrix],
  );
  const selectedStatusGroup = useMemo(
    () => projectsByStatus.find((statusGroup) => statusGroup.key === selectedStatus) ?? null,
    [projectsByStatus, selectedStatus],
  );
  const selectedSummaryGroup = useMemo(
    () => portfolioSummary.find((card) => card.key === selectedSummaryCard) ?? null,
    [portfolioSummary, selectedSummaryCard],
  );
  const selectedOwnerStatusGroup = useMemo(() => {
    if (!selectedOwnerStatusCell) return null;

    const ownerRow = businessOwnerStatusMatrix.find((row) => row.owner === selectedOwnerStatusCell.owner);
    if (!ownerRow) return null;

    const statusConfig = DELIVERY_STATUS_VISUAL_CONFIG.find(
      (config) => config.key === selectedOwnerStatusCell.statusKey,
    );
    const matchingProjects = sortProjectsForDashboard(
      selectedOwnerStatusCell.statusKey === 'total'
        ? ownerRow.projects
        : ownerRow.projects.filter(
          (project) => getDeliveryStatusKey(project) === selectedOwnerStatusCell.statusKey,
        ),
    );

    return {
      owner: ownerRow.owner,
      statusKey: selectedOwnerStatusCell.statusKey,
      label: statusConfig ? statusConfig.label : 'All Statuses',
      count: matchingProjects.length,
      projects: matchingProjects,
    };
  }, [businessOwnerStatusMatrix, selectedOwnerStatusCell]);

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
                      <th>Owner</th>
                      <th>Scope</th>
                      <th>Schedule</th>
                      <th>Cost</th>
                      <th>Quality</th>
                      <th>Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStatusGroup.projects.map((project) => {
                      const health = getProjectSheetHealth(project);

                      return (
                        <tr key={project.id}>
                          <td>
                            <Link className="table-link" to={`/ppm/projects/${project.id}`}>
                              {project.name}
                            </Link>
                          </td>
                          <td>{project.businessOwner || '-'}</td>
                          <td>{renderHealthStatusCell(health.scope)}</td>
                          <td>{renderHealthStatusCell(health.schedule)}</td>
                          <td>{renderHealthStatusCell(health.cost)}</td>
                          <td>{renderHealthStatusCell(health.quality)}</td>
                          <td>{renderHealthStatusCell(health.risk)}</td>
                        </tr>
                      );
                    })}
                    {!selectedStatusGroup.projects.length ? (
                      <tr>
                        <td colSpan={7} className="muted">No projects are in this status.</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>

        <div className="portfolio-owner-matrix">
          <div className="panel-header-row">
            <h3>Business Owner Status Matrix</h3>
            <div className="muted">Select a count to drill into that owner and status combination</div>
          </div>

          <div className={`portfolio-owner-status-layout${selectedOwnerStatusGroup ? ' has-selection' : ''}`}>
            <div className="portfolio-owner-status-visual-wrap">
              <div className="table-wrap portfolio-owner-matrix-wrap">
                <table className="simple-table portfolio-owner-matrix-table">
                  <thead>
                    <tr>
                      <th>Business Owner</th>
                      {DELIVERY_STATUS_VISUAL_CONFIG.map((statusConfig) => (
                        <th key={statusConfig.key}>{statusConfig.label}</th>
                      ))}
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {businessOwnerStatusMatrix.map((row) => (
                      <tr key={row.owner}>
                        <th scope="row">{row.owner}</th>
                        {DELIVERY_STATUS_VISUAL_CONFIG.map((statusConfig) => {
                          const isSelected = selectedOwnerStatusGroup?.owner === row.owner
                            && selectedOwnerStatusGroup.statusKey === statusConfig.key;

                          return (
                            <td key={`${row.owner}-${statusConfig.key}`}>
                              <button
                                type="button"
                                className={`owner-status-count tone-${statusConfig.tone}${isSelected ? ' is-selected' : ''}`}
                                onClick={() => setSelectedOwnerStatusCell((current) => (
                                  current?.owner === row.owner && current?.statusKey === statusConfig.key
                                    ? null
                                    : { owner: row.owner, statusKey: statusConfig.key }
                                ))}
                                aria-pressed={isSelected}
                              >
                                {row[statusConfig.key]}
                              </button>
                            </td>
                          );
                        })}
                        <td>
                          <button
                            type="button"
                            className={`owner-status-total${selectedOwnerStatusGroup?.owner === row.owner && selectedOwnerStatusGroup.statusKey === 'total' ? ' is-selected' : ''}`}
                            onClick={() => setSelectedOwnerStatusCell((current) => (
                              current?.owner === row.owner && current?.statusKey === 'total'
                                ? null
                                : { owner: row.owner, statusKey: 'total' }
                            ))}
                            aria-pressed={selectedOwnerStatusGroup?.owner === row.owner && selectedOwnerStatusGroup.statusKey === 'total'}
                          >
                            {row.total}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!businessOwnerStatusMatrix.length ? (
                      <tr>
                        <td colSpan={5} className="muted">No project data is available for the owner matrix.</td>
                      </tr>
                    ) : null}
                  </tbody>
                  {businessOwnerStatusMatrix.length ? (
                    <tfoot>
                      <tr>
                        <th scope="row">Total</th>
                        <td>{businessOwnerMatrixTotals.red}</td>
                        <td>{businessOwnerMatrixTotals.yellow}</td>
                        <td>{businessOwnerMatrixTotals.green}</td>
                        <td>{businessOwnerMatrixTotals.total}</td>
                      </tr>
                    </tfoot>
                  ) : null}
                </table>
              </div>
            </div>

            {selectedOwnerStatusGroup ? (
              <div className="portfolio-owner-status-drilldown">
                <div className="panel-header-row">
                  <h3>{selectedOwnerStatusGroup.owner} - {selectedOwnerStatusGroup.label}</h3>
                  <div className="muted">{selectedOwnerStatusGroup.count} item(s)</div>
                </div>

                <div className="table-wrap portfolio-owner-status-table-wrap">
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
                      {selectedOwnerStatusGroup.projects.map((project) => (
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
                      {!selectedOwnerStatusGroup.projects.length ? (
                        <tr>
                          <td colSpan={5} className="muted">No projects are in this owner/status selection.</td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

    </AppFrame>
  );
}
