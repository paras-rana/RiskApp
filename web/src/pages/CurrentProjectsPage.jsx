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

  if (status === 'hold') {
    return { label: 'On hold', tone: 'grey' };
  }

  if (status === 'denied') {
    return { label: 'Denied', tone: 'red' };
  }

  return { label: 'Unknown', tone: 'grey' };
}

function renderProjectsTable(projects) {
  return (
    <div className="table-wrap">
      <table className="simple-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Project ID</th>
            <th>Name</th>
            <th>Executive Sponsor</th>
            <th>Business Owner</th>
            <th>Estimated Cost</th>
            <th>Target Quarter for Start</th>
            <th>Category</th>
            <th>Current Classification</th>
            <th>Strategic Alignment</th>
            <th>Summary</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => {
            const indicator = getProjectStatusIndicator(project.status);

            return (
              <tr key={project.id}>
                <td>
                  <span className="status-indicator-cell">
                    <span
                      className={`status-indicator-dot ${indicator.tone}`}
                      aria-hidden="true"
                    />
                    <span>{indicator.label}</span>
                  </span>
                </td>
                <td>
                  <Link className="table-link" to={`/ppm/projects/${project.id}`}>
                    {project.id}
                  </Link>
                </td>
                <td>{project.name}</td>
                <td>{project.executiveSponsor}</td>
                <td>{project.businessOwner}</td>
                <td>{project.estimatedCost}</td>
                <td>{project.targetStartQuarter}</td>
                <td>{project.category}</td>
                <td>{project.currentProjectClassification || '-'}</td>
                <td>{project.strategicAlignment || '-'}</td>
                <td>{project.summary}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function CurrentProjectsPage() {
  const { currentProjects } = usePpmProjects();
  const majorProjects = currentProjects.filter(
    (project) => project.currentProjectClassification === 'Major project',
  );
  const operationalInitiatives = currentProjects.filter(
    (project) => project.currentProjectClassification === 'Operations Initiative',
  );

  return (
    <AppFrame
      title="Current Projects"
      description="Approved future projects move here once the portfolio manager activates them."
    >
      <section className="panel">
        <div className="panel-header-row">
          <h2><Icon name="dashboard" />Active Portfolio</h2>
          <div className="muted">{currentProjects.length} current project(s)</div>
        </div>

        {currentProjects.length === 0 ? (
          <p className="muted">No approved projects are active yet.</p>
        ) : (
          <div>
            <article className="detail-block detail-section-banded band-purple">
              <div className="panel-header-row">
                <h3>Major Projects</h3>
                <div className="muted">{majorProjects.length} item(s)</div>
              </div>
              {majorProjects.length > 0 ? (
                renderProjectsTable(majorProjects)
              ) : (
                <p className="muted">No major projects are active.</p>
              )}
            </article>

            <article className="detail-block detail-section-banded band-blue">
              <div className="panel-header-row">
                <h3>Operational Initiatives</h3>
                <div className="muted">{operationalInitiatives.length} item(s)</div>
              </div>
              {operationalInitiatives.length > 0 ? (
                renderProjectsTable(operationalInitiatives)
              ) : (
                <p className="muted">No operational initiatives are active.</p>
              )}
            </article>
          </div>
        )}
      </section>
    </AppFrame>
  );
}
