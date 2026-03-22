import { useEffect, useMemo, useState } from 'react';
import AppFrame from '../components/AppFrame';
import Icon from '../components/Icon';
import { usePpmProjects } from '../ppm/PpmProjectsContext';

function createPeriodForm() {
  return {
    label: '',
    cadenceLabel: 'Quarterly review',
    effectiveStart: new Date().toISOString().slice(0, 10),
  };
}

function createPriorityForm() {
  return {
    name: '',
    description: '',
  };
}

export default function StrategicPrioritiesPage() {
  const {
    strategicPriorityPeriods,
    activeStrategicPriorityPeriod,
    addStrategicPriorityPeriod,
    addStrategicPriority,
    activateStrategicPriorityPeriod,
  } = usePpmProjects();
  const [periodForm, setPeriodForm] = useState(() => createPeriodForm());
  const [priorityForm, setPriorityForm] = useState(() => createPriorityForm());
  const [selectedPeriodId, setSelectedPeriodId] = useState(activeStrategicPriorityPeriod?.id ?? '');

  useEffect(() => {
    if (!selectedPeriodId && activeStrategicPriorityPeriod?.id) {
      setSelectedPeriodId(activeStrategicPriorityPeriod.id);
    }
  }, [activeStrategicPriorityPeriod, selectedPeriodId]);

  const selectedPeriod = useMemo(
    () => strategicPriorityPeriods.find((period) => period.id === selectedPeriodId)
      ?? activeStrategicPriorityPeriod
      ?? null,
    [activeStrategicPriorityPeriod, selectedPeriodId, strategicPriorityPeriods],
  );

  function onPeriodChange(event) {
    const { name, value } = event.target;
    setPeriodForm((current) => ({ ...current, [name]: value }));
  }

  function onPriorityChange(event) {
    const { name, value } = event.target;
    setPriorityForm((current) => ({ ...current, [name]: value }));
  }

  function onCreatePeriod(event) {
    event.preventDefault();
    const nextPeriod = addStrategicPriorityPeriod(periodForm);
    setSelectedPeriodId(nextPeriod.id);
    setPeriodForm(createPeriodForm());
    setPriorityForm(createPriorityForm());
  }

  function onAddPriority(event) {
    event.preventDefault();
    if (!activeStrategicPriorityPeriod) return;

    addStrategicPriority(activeStrategicPriorityPeriod.id, priorityForm);
    setPriorityForm(createPriorityForm());
  }

  return (
    <AppFrame
      title="Strategic Priorities"
      description="Portfolio manager workspace for managing active strategic priority periods and reviewing prior cycles."
    >
      <section className="panel">
        <div className="panel-header-row">
          <h2><Icon name="assessment" />Create New Priority Period</h2>
          <div className="muted">
            Creating a new period archives the previous active set and makes the new set available for submissions.
          </div>
        </div>

        <form className="risk-form ppm-form" onSubmit={onCreatePeriod}>
          <div className="inline-form-grid">
            <label>
              Period Name
              <input
                name="label"
                value={periodForm.label}
                onChange={onPeriodChange}
                placeholder="Example: FY2027 Strategic Priorities"
                required
              />
            </label>

            <label>
              Review Cadence
              <input
                name="cadenceLabel"
                value={periodForm.cadenceLabel}
                onChange={onPeriodChange}
                placeholder="Quarterly review"
                required
              />
            </label>

            <label>
              Effective Start
              <input
                type="date"
                name="effectiveStart"
                value={periodForm.effectiveStart}
                onChange={onPeriodChange}
                required
              />
            </label>
          </div>

          <div className="drawer-actions ppm-form-actions">
            <button type="submit" className="primary-btn">
              Create Active Period
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel-header-row">
          <h2><Icon name="portfolio" />Priority Period Register</h2>
          <div className="muted">{strategicPriorityPeriods.length} period set(s)</div>
        </div>

        <div className="ppm-period-grid">
          {strategicPriorityPeriods.map((period) => (
            <article
              key={period.id}
              className={`detail-block ppm-period-card ${selectedPeriod?.id === period.id ? 'is-selected' : ''}`}
            >
              <div className="panel-header-row">
                <div>
                  <div className="label">{period.id}</div>
                  <h3>{period.label}</h3>
                </div>
                <span className={`pill ${period.status === 'active' ? 'low' : 'unknown'}`}>
                  {period.status}
                </span>
              </div>

              <p className="muted">
                {period.cadenceLabel} | Effective {period.effectiveStart} | {period.priorities.length} priorities
              </p>

              <div className="detail-actions-row">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setSelectedPeriodId(period.id)}
                >
                  View Period
                </button>
                {period.status !== 'active' ? (
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() => activateStrategicPriorityPeriod(period.id)}
                  >
                    Make Active
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header-row">
          <h2><Icon name="review" />Selected Period Detail</h2>
          <div className="muted">
            {selectedPeriod
              ? `${selectedPeriod.label} is ${selectedPeriod.status === 'active' ? 'currently used' : 'available as history'}`
              : 'No period selected'}
          </div>
        </div>

        {selectedPeriod ? (
          <>
            {selectedPeriod.status === 'active' ? (
              <form className="risk-form ppm-form" onSubmit={onAddPriority}>
                <div className="inline-form-grid">
                  <label>
                    Strategic Priority
                    <input
                      name="name"
                      value={priorityForm.name}
                      onChange={onPriorityChange}
                      required
                    />
                  </label>

                  <label className="full-width">
                    Description
                    <textarea
                      name="description"
                      rows={4}
                      value={priorityForm.description}
                      onChange={onPriorityChange}
                      placeholder="Describe the intent, expected outcomes, and how project proposals should align."
                      required
                    />
                  </label>
                </div>

                <div className="drawer-actions ppm-form-actions">
                  <button type="submit" className="primary-btn">
                    Add Priority To Active Period
                  </button>
                </div>
              </form>
            ) : (
              <p className="muted">
                Archived periods are read-only so prior priorities remain historically accurate.
              </p>
            )}

            <div className="ppm-card-list">
              {selectedPeriod.priorities.map((priority) => (
                <article key={priority.id} className="detail-block ppm-project-card">
                  <div className="label">{priority.id}</div>
                  <h3>{priority.name}</h3>
                  <p className="risk-description">{priority.description}</p>
                </article>
              ))}
              {selectedPeriod.priorities.length === 0 ? (
                <p className="muted">No priorities have been defined for this period yet.</p>
              ) : null}
            </div>
          </>
        ) : null}
      </section>
    </AppFrame>
  );
}
