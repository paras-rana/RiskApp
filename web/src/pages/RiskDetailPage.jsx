import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import RiskMatrix from '../components/RiskMatrix';

const API_BASE = 'http://localhost:3000';

const initialMitigationForm = {
  title: '',
  status: 'Planned',
  mitigation_owner_name: '',
  start_date: '',
  due_date: '',
  completed_date: '',
  impacts_severity: false,
  impacts_probability: false,
  confidence_level: 'Medium',
  control_type: 'Preventive',
  estimated_cost: '',
  plan_url: '',
  notes: '',
};

const initialAssessmentForm = {
  assessment_type: 'RESIDUAL',
  severity: 3,
  probability: 3,
  assessed_by: '',
  notes: '',
};

function getMitigationDirectionLabel(mitigation) {
  if (!mitigation) return 'Select a mitigation row to see how it helps';

  const sev = mitigation.impacts_severity;
  const prob = mitigation.impacts_probability;

  if (sev && prob) return 'down Severity and down Probability';
  if (sev) return 'down Severity';
  if (prob) return 'down Probability';
  return 'No direct scoring impact';
}

function getErrorMessage(err) {
  if (err instanceof Error) return err.message;
  return 'Unknown error';
}

function toDateInputValue(value) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

export default function RiskDetailPage() {
  const { riskId } = useParams();

  // Primary page data state.
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Row selections used for visual context and "selected influence" callout.
  const [selectedMitigationId, setSelectedMitigationId] = useState(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);

  // Active entity ids when editing existing records in the drawer.
  const [editingMitigationId, setEditingMitigationId] = useState(null);
  const [editingAssessmentId, setEditingAssessmentId] = useState(null);

  // Single source of truth for drawer visibility and form mode.
  // values: null | 'mitigation' | 'assessment'
  const [activeForm, setActiveForm] = useState(null);

  // Controlled form state for both drawer forms.
  const [mitigationForm, setMitigationForm] = useState(initialMitigationForm);
  const [assessmentForm, setAssessmentForm] = useState(initialAssessmentForm);

  // Submit lifecycle state.
  const [mitigationSaving, setMitigationSaving] = useState(false);
  const [assessmentSaving, setAssessmentSaving] = useState(false);

  // Form-specific error messages.
  const [mitigationError, setMitigationError] = useState('');
  const [assessmentError, setAssessmentError] = useState('');

  const isMitigationOpen = activeForm === 'mitigation';
  const isAssessmentOpen = activeForm === 'assessment';

  const closeDrawer = () => {
    setActiveForm(null);
    setEditingMitigationId(null);
    setEditingAssessmentId(null);
    setMitigationError('');
    setAssessmentError('');
  };

  // Loads all data needed by the page.
  const loadDetail = useCallback(async () => {
    if (!riskId) return;

    try {
      setLoading(true);
      setError('');
      setSelectedMitigationId(null);
      setSelectedAssessmentId(null);

      const res = await fetch(`${API_BASE}/risks/${riskId}/detail`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setDetail(data);
    } catch (err) {
      setError(`Failed to load risk detail: ${getErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  }, [riskId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const selectedMitigation = useMemo(() => {
    if (!detail || !selectedMitigationId) return null;
    return (
      detail.mitigations.find((m) => m.mitigation_id === selectedMitigationId) || null
    );
  }, [detail, selectedMitigationId]);

  const selectedAssessment = useMemo(() => {
    if (!detail || !selectedAssessmentId) return null;
    return (
      detail.assessments.find((a) => a.assessment_id === selectedAssessmentId) || null
    );
  }, [detail, selectedAssessmentId]);

  // Opens mitigation drawer in "edit existing mitigation" mode.
  function openMitigationEditor(mitigation = selectedMitigation) {
    if (!mitigation) return;

    setAssessmentError('');
    setMitigationError('');
    setEditingAssessmentId(null);
    setEditingMitigationId(mitigation.mitigation_id);
    setMitigationForm({
      title: mitigation.title ?? '',
      status: mitigation.status ?? 'Planned',
      mitigation_owner_name: mitigation.mitigation_owner_name ?? '',
      start_date: toDateInputValue(mitigation.start_date),
      due_date: toDateInputValue(mitigation.due_date),
      completed_date: toDateInputValue(mitigation.completed_date),
      impacts_severity: Boolean(mitigation.impacts_severity),
      impacts_probability: Boolean(mitigation.impacts_probability),
      confidence_level: mitigation.confidence_level ?? 'Medium',
      control_type: mitigation.control_type ?? 'Preventive',
      estimated_cost:
        mitigation.estimated_cost == null
          ? ''
          : String(mitigation.estimated_cost),
      plan_url: mitigation.plan_url ?? '',
      notes: mitigation.notes ?? '',
    });
    setActiveForm('mitigation');
  }

  // Opens assessment drawer in "edit existing assessment" mode.
  function openAssessmentEditor(assessment = selectedAssessment) {
    if (!assessment) return;

    setMitigationError('');
    setAssessmentError('');
    setEditingMitigationId(null);
    setEditingAssessmentId(assessment.assessment_id);
    setAssessmentForm({
      assessment_type: assessment.assessment_type ?? 'RESIDUAL',
      severity: assessment.severity ?? 3,
      probability: assessment.probability ?? 3,
      assessed_by: assessment.assessed_by ?? '',
      notes: assessment.notes ?? '',
    });
    setActiveForm('assessment');
  }

  // Opens mitigation drawer in "add new mitigation" mode.
  function openNewMitigationForm() {
    setMitigationError('');
    setAssessmentError('');
    setEditingMitigationId(null);
    setMitigationForm(initialMitigationForm);
    setActiveForm((prev) => (prev === 'mitigation' ? null : 'mitigation'));
  }

  // Opens assessment drawer in "add new assessment" mode.
  function openNewAssessmentForm() {
    setMitigationError('');
    setAssessmentError('');
    setEditingAssessmentId(null);
    setAssessmentForm(initialAssessmentForm);
    setActiveForm((prev) => (prev === 'assessment' ? null : 'assessment'));
  }

  // Generic input binding for mitigation form controls.
  function onMitigationChange(e) {
    const { name, value, type, checked } = e.target;
    setMitigationForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function onAssessmentChange(e) {
    const { name, value } = e.target;
    setAssessmentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // Persists mitigation changes; switches between POST/PUT based on edit state.
  async function submitMitigation(e) {
    e.preventDefault();
    setMitigationError('');

    try {
      setMitigationSaving(true);

      const payload = {
        ...mitigationForm,
        estimated_cost:
          mitigationForm.estimated_cost === ''
            ? null
            : Number(mitigationForm.estimated_cost),
      };

      const isEditing = Boolean(editingMitigationId);
      const endpoint = isEditing
        ? `${API_BASE}/risks/${riskId}/mitigations/${editingMitigationId}`
        : `${API_BASE}/risks/${riskId}/mitigations`;

      const res = await fetch(endpoint, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const msg =
          errBody && typeof errBody.message === 'string'
            ? errBody.message
            : `HTTP ${res.status}`;
        throw new Error(msg);
      }

      setMitigationForm(initialMitigationForm);
      setEditingMitigationId(null);
      setActiveForm(null);
      await loadDetail();
    } catch (err) {
      setMitigationError(
        `Failed to ${editingMitigationId ? 'update' : 'add'} mitigation: ${getErrorMessage(err)}`,
      );
    } finally {
      setMitigationSaving(false);
    }
  }

  // Persists assessment changes; switches between POST/PUT based on edit state.
  async function submitAssessment(e) {
    e.preventDefault();
    setAssessmentError('');

    try {
      setAssessmentSaving(true);

      const payload = {
        ...assessmentForm,
        severity: Number(assessmentForm.severity),
        probability: Number(assessmentForm.probability),
      };

      const isEditing = Boolean(editingAssessmentId);
      const endpoint = isEditing
        ? `${API_BASE}/risks/${riskId}/assessments/${editingAssessmentId}`
        : `${API_BASE}/risks/${riskId}/assessments`;

      const res = await fetch(endpoint, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const msg =
          errBody && typeof errBody.message === 'string'
            ? errBody.message
            : `HTTP ${res.status}`;
        throw new Error(msg);
      }

      setAssessmentForm(initialAssessmentForm);
      setEditingAssessmentId(null);
      setActiveForm(null);
      await loadDetail();
    } catch (err) {
      setAssessmentError(
        `Failed to ${editingAssessmentId ? 'update' : 'add'} assessment: ${getErrorMessage(err)}`,
      );
    } finally {
      setAssessmentSaving(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="page-header">
        <h1>Risk Detail</h1>
        <p>Review scoring, mitigations, and assessments for one risk.</p>
      </header>

      <div className="top-nav">
        <Link className="nav-link" to="/dashboard">
          Dashboard
        </Link>
        <Link className="nav-link" to="/risks">
          Risk Register
        </Link>
        <span className="nav-link active">Risk Detail</span>
      </div>

      <section className="panel detail-panel">
        {loading && <p>Loading detail...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && detail && (
          <>
            <div className="selected-id">
              Risk: <strong>{detail.risk.risk_id}</strong>
            </div>

            <div className="cards">
              <div className="card">
                <div className="label">Inherent</div>
                <div className="value">
                  S{detail.risk.inherent_severity} x P{detail.risk.inherent_probability} ={' '}
                  {detail.risk.inherent_score}
                </div>
              </div>

              <div className="card">
                <div className="label">Residual</div>
                <div className="value">
                  {detail.risk.residual_severity != null &&
                  detail.risk.residual_probability != null
                    ? `S${detail.risk.residual_severity} x P${detail.risk.residual_probability} = ${detail.risk.residual_score}`
                    : 'Not reassessed'}
                </div>
              </div>

              <div className="card">
                <div className="label">Mitigations</div>
                <div className="value">{detail.mitigations.length}</div>
              </div>

              <div className="card">
                <div className="label">Assessments</div>
                <div className="value">{detail.assessments.length}</div>
              </div>
            </div>

            <div className="detail-block">
              <h3>{detail.risk.title}</h3>
              <p className="muted">
                {detail.risk.category} - {detail.risk.status} -{' '}
                {detail.risk.site_or_program ?? 'No site/program'}
              </p>

              <div className="detail-actions-row">
                <button className="secondary-btn" onClick={openNewMitigationForm}>
                  {isMitigationOpen ? 'Close Mitigation Form' : 'Add Mitigation'}
                </button>

                <button className="secondary-btn" onClick={openNewAssessmentForm}>
                  {isAssessmentOpen ? 'Close Assessment Form' : 'Add Assessment'}
                </button>
              </div>
            </div>

            <div className="matrix-row">
              <RiskMatrix
                title="Inherent Risk"
                severity={detail.risk.inherent_severity}
                probability={detail.risk.inherent_probability}
                subtitle="Initial assessment"
              />

              <RiskMatrix
                title="Residual Risk"
                severity={detail.risk.residual_severity}
                probability={detail.risk.residual_probability}
                subtitle="Owner reassessment"
              />
            </div>

            <div className="detail-block">
              <h3>Selected Mitigation Influence</h3>
              <div className="direction-callout">
                <div className="direction-value">
                  {getMitigationDirectionLabel(selectedMitigation)}
                </div>

                {selectedMitigation ? (
                  <div className="direction-subtext">
                    {selectedMitigation.title} ({selectedMitigation.status})
                  </div>
                ) : (
                  <div className="direction-subtext">Click a mitigation row below.</div>
                )}
              </div>
            </div>

            <div className="detail-block">
              <h3>Mitigations</h3>
              {detail.mitigations.length === 0 ? (
                <p className="muted">No mitigations found.</p>
              ) : (
                <div className="table-wrap">
                  <table className="simple-table">
                    <thead>
                      <tr>
                        <th>Mitigation</th>
                        <th>Status</th>
                        <th>Severity</th>
                        <th>Probability</th>
                        <th>Due</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.mitigations.map((m) => (
                        <tr
                          key={m.mitigation_id}
                          className={
                            selectedMitigationId === m.mitigation_id ? 'row-selected' : ''
                          }
                          onClick={() => setSelectedMitigationId(m.mitigation_id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td>{m.title}</td>
                          <td>{m.status}</td>
                          <td>{m.impacts_severity ? 'down' : '-'}</td>
                          <td>{m.impacts_probability ? 'down' : '-'}</td>
                          <td>
                            {m.due_date ? new Date(m.due_date).toLocaleDateString() : '-'}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="secondary-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMitigationId(m.mitigation_id);
                                openMitigationEditor(m);
                              }}
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="detail-block">
              <h3>Assessments</h3>
              {detail.assessments.length === 0 ? (
                <p className="muted">No assessments found.</p>
              ) : (
                <div className="table-wrap">
                  <table className="simple-table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Severity</th>
                        <th>Probability</th>
                        <th>Score</th>
                        <th>Assessed By</th>
                        <th>Assessed At</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.assessments.map((a) => (
                        <tr
                          key={a.assessment_id}
                          className={
                            selectedAssessmentId === a.assessment_id ? 'row-selected' : ''
                          }
                          onClick={() => setSelectedAssessmentId(a.assessment_id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td>{a.assessment_type}</td>
                          <td>{a.severity}</td>
                          <td>{a.probability}</td>
                          <td>{a.score}</td>
                          <td>{a.assessed_by}</td>
                          <td>{new Date(a.assessed_at).toLocaleString()}</td>
                          <td>
                            <button
                              type="button"
                              className="secondary-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAssessmentId(a.assessment_id);
                                openAssessmentEditor(a);
                              }}
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* Right-side drawer overlay (single form at a time) */}
      <div
        className={`drawer-overlay ${activeForm ? 'open' : ''}`}
        onClick={closeDrawer}
      >
        <aside
          className={`drawer-panel ${activeForm ? 'open' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          {isMitigationOpen && (
            <>
              <div className="drawer-header">
                <h2>{editingMitigationId ? 'Edit Mitigation' : 'Add Mitigation'}</h2>
                <button className="icon-btn" onClick={closeDrawer} aria-label="Close">
                  x
                </button>
              </div>

              <p className="muted">
                Mitigations indicate whether they reduce severity and/or probability.
                Final cumulative scoring is captured via assessment.
              </p>

              {mitigationError && <p className="error">{mitigationError}</p>}

              <form className="risk-form" onSubmit={submitMitigation}>
                <div className="inline-form-grid">
                  <label>
                    Title *
                    <input
                      name="title"
                      value={mitigationForm.title}
                      onChange={onMitigationChange}
                      required
                    />
                  </label>

                  <label>
                    Status
                    <select
                      name="status"
                      value={mitigationForm.status}
                      onChange={onMitigationChange}
                    >
                      <option>Planned</option>
                      <option>In Progress</option>
                      <option>Implemented</option>
                      <option>On Hold</option>
                      <option>Cancelled</option>
                    </select>
                  </label>

                  <label>
                    Mitigation Owner
                    <input
                      name="mitigation_owner_name"
                      value={mitigationForm.mitigation_owner_name}
                      onChange={onMitigationChange}
                    />
                  </label>

                  <label>
                    Control Type
                    <select
                      name="control_type"
                      value={mitigationForm.control_type}
                      onChange={onMitigationChange}
                    >
                      <option>Preventive</option>
                      <option>Detective</option>
                      <option>Corrective</option>
                      <option>Compensating</option>
                    </select>
                  </label>

                  <label>
                    Confidence
                    <select
                      name="confidence_level"
                      value={mitigationForm.confidence_level}
                      onChange={onMitigationChange}
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </label>

                  <label>
                    Estimated Cost
                    <input
                      name="estimated_cost"
                      type="number"
                      step="0.01"
                      min="0"
                      value={mitigationForm.estimated_cost}
                      onChange={onMitigationChange}
                    />
                  </label>

                  <label>
                    Start Date
                    <input
                      name="start_date"
                      type="date"
                      value={mitigationForm.start_date}
                      onChange={onMitigationChange}
                    />
                  </label>

                  <label>
                    Due Date
                    <input
                      name="due_date"
                      type="date"
                      value={mitigationForm.due_date}
                      onChange={onMitigationChange}
                    />
                  </label>

                  <label>
                    Completed Date
                    <input
                      name="completed_date"
                      type="date"
                      value={mitigationForm.completed_date}
                      onChange={onMitigationChange}
                    />
                  </label>

                  <label>
                    Plan URL
                    <input
                      name="plan_url"
                      value={mitigationForm.plan_url}
                      onChange={onMitigationChange}
                      placeholder="https://..."
                    />
                  </label>

                  <div className="full-width checkbox-row">
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        name="impacts_severity"
                        checked={mitigationForm.impacts_severity}
                        onChange={onMitigationChange}
                      />
                      Reduces Severity
                    </label>

                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        name="impacts_probability"
                        checked={mitigationForm.impacts_probability}
                        onChange={onMitigationChange}
                      />
                      Reduces Probability
                    </label>
                  </div>

                  <label className="full-width">
                    Notes
                    <textarea
                      name="notes"
                      rows={3}
                      value={mitigationForm.notes}
                      onChange={onMitigationChange}
                    />
                  </label>
                </div>

                <div className="drawer-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => {
                      setMitigationForm(initialMitigationForm);
                      closeDrawer();
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setMitigationForm(initialMitigationForm)}
                  >
                    Reset
                  </button>

                  <button
                    className="primary-btn"
                    type="submit"
                    disabled={mitigationSaving}
                  >
                    {mitigationSaving
                      ? 'Saving...'
                      : editingMitigationId
                        ? 'Update Mitigation'
                        : 'Save Mitigation'}
                  </button>
                </div>
              </form>
            </>
          )}

          {isAssessmentOpen && (
            <>
              <div className="drawer-header">
                <h2>{editingAssessmentId ? 'Edit Assessment' : 'Add Assessment'}</h2>
                <button className="icon-btn" onClick={closeDrawer} aria-label="Close">
                  x
                </button>
              </div>

              <p className="muted">
                Use this to record the owner's scoring decision. Residual assessments
                update the residual matrix on this page.
              </p>

              {assessmentError && <p className="error">{assessmentError}</p>}

              <form className="risk-form" onSubmit={submitAssessment}>
                <div className="inline-form-grid">
                  <label>
                    Assessment Type
                    <select
                      name="assessment_type"
                      value={assessmentForm.assessment_type}
                      onChange={onAssessmentChange}
                    >
                      <option value="RESIDUAL">RESIDUAL</option>
                      <option value="INHERENT">INHERENT</option>
                    </select>
                  </label>

                  <label>
                    Assessed By
                    <input
                      name="assessed_by"
                      value={assessmentForm.assessed_by}
                      onChange={onAssessmentChange}
                      placeholder="Risk Owner"
                    />
                  </label>

                  <label>
                    Severity (1-5)
                    <input
                      name="severity"
                      type="number"
                      min="1"
                      max="5"
                      value={assessmentForm.severity}
                      onChange={onAssessmentChange}
                      required
                    />
                  </label>

                  <label>
                    Probability (1-5)
                    <input
                      name="probability"
                      type="number"
                      min="1"
                      max="5"
                      value={assessmentForm.probability}
                      onChange={onAssessmentChange}
                      required
                    />
                  </label>

                  <label className="full-width">
                    Notes
                    <textarea
                      name="notes"
                      rows={3}
                      value={assessmentForm.notes}
                      onChange={onAssessmentChange}
                      placeholder="Why this score was chosen..."
                    />
                  </label>
                </div>

                <div className="drawer-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => {
                      setAssessmentForm(initialAssessmentForm);
                      closeDrawer();
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setAssessmentForm(initialAssessmentForm)}
                  >
                    Reset
                  </button>

                  <button
                    className="primary-btn"
                    type="submit"
                    disabled={assessmentSaving}
                  >
                    {assessmentSaving
                      ? 'Saving...'
                      : editingAssessmentId
                        ? 'Update Assessment'
                        : 'Save Assessment'}
                  </button>
                </div>
              </form>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
