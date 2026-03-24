import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, Navigate, useParams } from 'react-router-dom';
import pptxgen from 'pptxgenjs';
import { useAuth } from '../auth/useAuth';
import AppFrame from '../components/AppFrame';
import Icon from '../components/Icon';
import { apiFetch } from '../lib/api';
import { usePpmProjects } from '../ppm/PpmProjectsContext';

const PROJECT_HEALTH_BY_ID = {
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

const PROJECT_COST_TRACKING_BY_ID = {
  'PRJ-201': [
    {
      item: 'Platform configuration and integration',
      budget: 2.2,
      actualToDate: 1.4,
      estimateAtCompletion: 2.3,
    },
    {
      item: 'Patient intake and scheduling experience',
      budget: 1.5,
      actualToDate: 0.9,
      estimateAtCompletion: 1.4,
    },
    {
      item: 'Training, adoption, and launch support',
      budget: 1.1,
      actualToDate: 0.5,
      estimateAtCompletion: 1.1,
    },
  ],
  'PRJ-214': [
    {
      item: 'Staffing analytics platform rollout',
      budget: 1.4,
      actualToDate: 0.8,
      estimateAtCompletion: 1.5,
    },
    {
      item: 'Site redesign and workforce planning',
      budget: 1.1,
      actualToDate: 0.6,
      estimateAtCompletion: 1.0,
    },
    {
      item: 'Change management and training',
      budget: 0.7,
      actualToDate: 0.3,
      estimateAtCompletion: 0.7,
    },
  ],
  'PRJ-223': [
    {
      item: 'AI triage engine and vendor services',
      budget: 1.0,
      actualToDate: 0.5,
      estimateAtCompletion: 1.1,
    },
    {
      item: 'Workflow configuration and testing',
      budget: 0.7,
      actualToDate: 0.2,
      estimateAtCompletion: 0.6,
    },
    {
      item: 'Revenue cycle adoption support',
      budget: 0.4,
      actualToDate: 0.1,
      estimateAtCompletion: 0.4,
    },
  ],
  'PRJ-230': [
    {
      item: 'Source system mapping and data model',
      budget: 0.6,
      actualToDate: 0.2,
      estimateAtCompletion: 0.7,
    },
    {
      item: 'Dashboard and shortage alerting design',
      budget: 0.5,
      actualToDate: 0.1,
      estimateAtCompletion: 0.5,
    },
    {
      item: 'Launch readiness and operating transition',
      budget: 0.5,
      actualToDate: 0.0,
      estimateAtCompletion: 0.5,
    },
  ],
  'PRJ-233': [
    {
      item: 'Privileged access controls uplift',
      budget: 2.3,
      actualToDate: 1.0,
      estimateAtCompletion: 2.5,
    },
    {
      item: 'Recovery testing and resilience exercises',
      budget: 1.8,
      actualToDate: 0.7,
      estimateAtCompletion: 1.7,
    },
    {
      item: 'Program governance and audit readiness',
      budget: 1.3,
      actualToDate: 0.4,
      estimateAtCompletion: 1.4,
    },
  ],
};

const PROJECT_MILESTONE_DETAILS_BY_ID = {
  'PRJ-201': {
    'MS-201-1': {
      description: 'Complete patient journey mapping, intake requirements, and integration design decisions.',
      plannedDate: '2026-05-15',
      actualDate: '2026-05-20',
    },
    'MS-201-2': {
      description: 'Build core scheduling, intake, and engagement workflows with downstream system integration.',
      plannedDate: '2026-08-20',
      actualDate: '',
    },
    'MS-201-3': {
      description: 'Launch pilot clinics and monitor adoption, defects, and handoff performance.',
      plannedDate: '2026-11-10',
      actualDate: '',
    },
  },
  'PRJ-214': {
    'MS-214-1': {
      description: 'Baseline current staffing model and capture labor utilization opportunities by site.',
      plannedDate: '2026-05-30',
      actualDate: '2026-05-28',
    },
    'MS-214-2': {
      description: 'Roll out analytics tools and redesigned staffing workflows to priority sites.',
      plannedDate: '2026-08-12',
      actualDate: '',
    },
    'MS-214-3': {
      description: 'Expand adoption site by site and confirm workforce productivity improvements.',
      plannedDate: '2026-11-18',
      actualDate: '',
    },
  },
  'PRJ-223': {
    'MS-223-1': {
      description: 'Finalize vendor selection, architecture approach, and governance sign-off.',
      plannedDate: '2026-06-05',
      actualDate: '2026-06-07',
    },
    'MS-223-2': {
      description: 'Configure triage workflows, routing rules, and denial-prevention logic.',
      plannedDate: '2026-08-25',
      actualDate: '',
    },
    'MS-223-3': {
      description: 'Deploy to production and transition revenue cycle teams to the new operating model.',
      plannedDate: '2026-11-21',
      actualDate: '',
    },
  },
  'PRJ-230': {
    'MS-230-1': {
      description: 'Map source systems, item data structures, and event triggers for shortages.',
      plannedDate: '2026-05-22',
      actualDate: '',
    },
    'MS-230-2': {
      description: 'Deliver dashboard prototype and validate inventory and sourcing visibility scenarios.',
      plannedDate: '2026-08-14',
      actualDate: '',
    },
    'MS-230-3': {
      description: 'Launch operating view and embed escalation workflows with supply chain leaders.',
      plannedDate: '2026-11-06',
      actualDate: '',
    },
  },
  'PRJ-233': {
    'MS-233-1': {
      description: 'Design privileged identity controls, recovery scope, and implementation waves.',
      plannedDate: '2026-06-12',
      actualDate: '',
    },
    'MS-233-2': {
      description: 'Roll out controls across priority platforms and validate access governance operation.',
      plannedDate: '2026-09-04',
      actualDate: '',
    },
    'MS-233-3': {
      description: 'Run recovery exercise and close resilience gaps before production sign-off.',
      plannedDate: '2026-11-19',
      actualDate: '',
    },
  },
};

function getRiskBand(score) {
  if (score == null) return 'unknown';
  if (score <= 6) return 'low';
  if (score >= 15) return 'high';
  return 'medium';
}

function getErrorMessage(err) {
  if (err instanceof Error) return err.message;
  return 'Unknown error';
}

function getHealthLabel(tone) {
  if (tone === 'green') return 'On Track';
  if (tone === 'yellow') return 'Watch';
  if (tone === 'red') return 'At Risk';
  return 'Not Set';
}

function parseTimelineDate(value) {
  if (!value || value === '-') return null;

  const normalized = String(value).trim();
  const isoMatch = normalized.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
  if (isoMatch) {
    return new Date(
      Number(isoMatch[1]),
      Number(isoMatch[2]) - 1,
      Number(isoMatch[3] ?? '1'),
    );
  }

  const quarterMatch = normalized.match(/^Q([1-4])\s+(\d{4})$/i);
  if (quarterMatch) {
    return new Date(Number(quarterMatch[2]), (Number(quarterMatch[1]) - 1) * 3, 1);
  }

  return null;
}

function drawMilestoneTimeline(slide, pptx, milestones, options) {
  const parsedMilestones = milestones
    .map((milestone, index) => ({
      ...milestone,
      timelineDate: parseTimelineDate(milestone.plannedDate),
      order: index,
    }))
    .filter((milestone) => milestone.timelineDate);

  if (!parsedMilestones.length) {
    slide.addText('No milestone dates available.', {
      x: options.x,
      y: options.y + 0.1,
      w: options.w,
      h: 0.3,
      fontFace: 'Aptos',
      fontSize: 10,
      color: '50617D',
    });
    return;
  }

  const sortedMilestones = [...parsedMilestones].sort((left, right) => left.timelineDate - right.timelineDate);
  const firstDate = sortedMilestones[0].timelineDate;
  const lastDate = sortedMilestones[sortedMilestones.length - 1].timelineDate;
  const monthSpan = Math.max(
    1,
    ((lastDate.getFullYear() - firstDate.getFullYear()) * 12) + (lastDate.getMonth() - firstDate.getMonth()),
  );
  const bandY = options.y + (options.bandOffsetY ?? 0.32);
  const bandH = options.bandHeight ?? 0.18;
  const upperTextY = options.y;
  const lowerTextY = bandY + bandH + (options.lowerTextOffset ?? 0.22);
  const stemHeight = options.stemHeight ?? 0.2;
  const textWidth = options.textWidth ?? 1.3;
  const textHeight = options.textHeight ?? 0.28;
  const fontSize = options.fontSize ?? 7.5;

  slide.addShape(pptx.ShapeType.roundRect, {
    x: options.x,
    y: bandY,
    w: options.w,
    h: bandH,
    rectRadius: 0.04,
    line: { color: '9DB7E8', pt: 0.5 },
    fill: { color: 'DCE8FF' },
  });

  sortedMilestones.forEach((milestone, index) => {
    const monthOffset = ((milestone.timelineDate.getFullYear() - firstDate.getFullYear()) * 12)
      + (milestone.timelineDate.getMonth() - firstDate.getMonth());
    const ratio = monthSpan === 0 ? 0.5 : monthOffset / monthSpan;
    const centerX = options.x + 0.24 + (ratio * Math.max(options.w - 0.48, 0.6));
    const isTop = index % 2 === 0;
    const lineTop = isTop ? bandY - stemHeight : bandY + bandH;
    const textY = isTop ? upperTextY : lowerTextY;

    slide.addShape(pptx.ShapeType.line, {
      x: centerX,
      y: lineTop,
      w: 0,
      h: stemHeight,
      line: { color: '1F2940', pt: 1 },
    });
    slide.addShape(pptx.ShapeType.ellipse, {
      x: centerX - 0.045,
      y: bandY + (bandH / 2) - 0.045,
      w: 0.09,
      h: 0.09,
      line: { color: '1F2940', pt: 1 },
      fill: { color: '1F2940' },
    });
    slide.addShape(pptx.ShapeType.diamond, {
      x: centerX - 0.05,
      y: isTop ? bandY - stemHeight - 0.1 : bandY + bandH + stemHeight,
      w: 0.1,
      h: 0.1,
      line: { color: '1F2940', pt: 1 },
      fill: { color: '1F2940' },
    });
    slide.addText(
      `${milestone.title}\n${milestone.plannedDate}`,
      {
        x: centerX - (textWidth / 2),
        y: textY,
        w: textWidth,
        h: textHeight,
        fontFace: 'Aptos',
        fontSize,
        bold: true,
        color: '1F2940',
        align: 'center',
        valign: 'mid',
        margin: 0.01,
        fit: 'shrink',
      },
    );
  });
}

function getProjectHealth(projectId) {
  return PROJECT_HEALTH_BY_ID[projectId] ?? {
    scope: 'grey',
    schedule: 'grey',
    cost: 'grey',
    risk: 'grey',
    quality: 'grey',
  };
}

function getOverallHealthTone(health) {
  const tones = Object.values(health);
  if (tones.includes('red')) return 'red';
  if (tones.includes('yellow')) return 'yellow';
  if (tones.every((tone) => tone === 'green')) return 'green';
  return 'grey';
}

function formatMillions(value) {
  return `$${value.toFixed(1)}M`;
}

function getHealthColor(tone) {
  if (tone === 'green') return '2E9B56';
  if (tone === 'yellow') return 'D4A728';
  if (tone === 'red') return 'C74A5F';
  return '8B93A9';
}

function formatWeekStartLabel(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function formatMonthStartLabel(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function getWeekStartIso(date) {
  return date.toISOString().slice(0, 10);
}

function getReferenceWeekStarts(date = new Date()) {
  const currentWeekStart = new Date(date);
  const day = currentWeekStart.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  currentWeekStart.setHours(0, 0, 0, 0);
  currentWeekStart.setDate(currentWeekStart.getDate() + diffToMonday);

  const pastWeekStart = new Date(currentWeekStart);
  pastWeekStart.setDate(currentWeekStart.getDate() - 7);

  const upcomingWeekStart = new Date(currentWeekStart);
  upcomingWeekStart.setDate(currentWeekStart.getDate() + 7);

  return {
    pastWeekStart: getWeekStartIso(pastWeekStart),
    pastWeekLabel: formatWeekStartLabel(pastWeekStart),
    currentWeekStart: getWeekStartIso(currentWeekStart),
    currentWeekLabel: formatWeekStartLabel(currentWeekStart),
    upcomingWeekLabel: formatWeekStartLabel(upcomingWeekStart),
  };
}

function getReferenceMonthStarts(date = new Date()) {
  const currentMonthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const pastMonthStart = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  const upcomingMonthStart = new Date(date.getFullYear(), date.getMonth() + 1, 1);

  return {
    pastWeekStart: getWeekStartIso(pastMonthStart),
    pastWeekLabel: formatMonthStartLabel(pastMonthStart),
    currentWeekStart: getWeekStartIso(currentMonthStart),
    currentWeekLabel: formatMonthStartLabel(currentMonthStart),
    upcomingWeekLabel: formatMonthStartLabel(upcomingMonthStart),
  };
}

function downloadProjectDocument(fileName) {
  const blob = new Blob([`Placeholder download for ${fileName}`], { type: 'text/plain;charset=utf-8' });
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(objectUrl);
}

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const { token, logout } = useAuth();
  const { getProjectById, saveWeeklyUpdate, saveTeamMembers, saveDocumentVersion } = usePpmProjects();
  const project = getProjectById(projectId);
  const isOperationalInitiative = project?.currentProjectClassification === 'Operations Initiative';
  const {
    pastWeekStart,
    pastWeekLabel,
    currentWeekStart,
    currentWeekLabel,
  } = isOperationalInitiative ? getReferenceMonthStarts() : getReferenceWeekStarts();
  const [activeTab, setActiveTab] = useState('key-info');
  const [activeOverlay, setActiveOverlay] = useState(null);
  const [progressForm, setProgressForm] = useState({
    progress: '',
    nextWeekPlan: '',
    overallStatus: '',
  });
  const [teamFormText, setTeamFormText] = useState('');
  const [documentVersionForm, setDocumentVersionForm] = useState({
    category: 'Cost Estimate Breakdown',
    fileName: '',
    comments: '',
  });
  const [projectRisks, setProjectRisks] = useState([]);
  const [projectRisksLoading, setProjectRisksLoading] = useState(true);
  const [projectRisksError, setProjectRisksError] = useState('');

  const sortedProjectRisks = useMemo(
    () => [...projectRisks].sort((left, right) => String(left.risk_id).localeCompare(String(right.risk_id))),
    [projectRisks],
  );

  useEffect(() => {
    if (!project?.id) {
      setProjectRisks([]);
      setProjectRisksLoading(false);
      setProjectRisksError('');
      return;
    }

    async function loadProjectRisks() {
      try {
        setProjectRisksLoading(true);
        setProjectRisksError('');

        const response = await apiFetch('/risks', { token, onUnauthorized: logout });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const risks = await response.json();
        setProjectRisks(
          risks.filter((risk) => risk.site_or_program === project.id),
        );
      } catch (err) {
        setProjectRisksError(`Failed to load project risks: ${getErrorMessage(err)}`);
      } finally {
        setProjectRisksLoading(false);
      }
    }

    void loadProjectRisks();
  }, [project?.id, token, logout]);

  if (!projectId) {
    return <Navigate to="/ppm/current" replace />;
  }

  if (!project) {
    return (
      <AppFrame
        title="Project Not Found"
        description={`No project matches ${projectId}.`}
        detailLabel="Project Detail"
      >
        <section className="panel">
          <p className="muted">The selected project could not be found in the portfolio register.</p>
          <div className="detail-actions-row">
            <Link className="secondary-btn" to="/ppm/current">
              Back to Current Projects
            </Link>
          </div>
        </section>
      </AppFrame>
    );
  }

  const projectHealth = getProjectHealth(project.id);
  const overallHealthTone = getOverallHealthTone(projectHealth);
  const healthCards = [
    { label: 'Scope', tone: projectHealth.scope },
    { label: 'Schedule', tone: projectHealth.schedule },
    { label: 'Cost', tone: projectHealth.cost },
    { label: 'Risk', tone: projectHealth.risk },
    { label: 'Quality', tone: projectHealth.quality },
  ];
  const costTrackingRows = PROJECT_COST_TRACKING_BY_ID[project.id] ?? [];
  const milestoneRows = project.milestones.map((milestone) => {
    const details = PROJECT_MILESTONE_DETAILS_BY_ID[project.id]?.[milestone.id];

    return {
      id: milestone.id,
      title: milestone.name || 'Unnamed milestone',
      description: details?.description || `Planned for ${milestone.quarter || 'TBD'}.`,
      plannedDate: details?.plannedDate || milestone.quarter || '-',
      actualDate: details?.actualDate || '-',
    };
  });
  const costTrackingTotals = costTrackingRows.reduce(
    (totals, row) => ({
      budget: totals.budget + row.budget,
      actualToDate: totals.actualToDate + row.actualToDate,
      estimateAtCompletion: totals.estimateAtCompletion + row.estimateAtCompletion,
    }),
    { budget: 0, actualToDate: 0, estimateAtCompletion: 0 },
  );
  const updateCadence = isOperationalInitiative ? 'monthly' : 'weekly';
  const updateTitle = isOperationalInitiative ? 'Monthly Update' : 'Weekly Update';
  const progressButtonLabel = isOperationalInitiative ? 'Monthly Progress Update' : 'Progress Update';
  const progressSummaryLabel = isOperationalInitiative
    ? 'Monthly planning and execution snapshot'
    : 'Weekly planning and execution snapshot';
  const previousPlanHeading = isOperationalInitiative ? 'Previous Month Plan' : 'Previous Week Plan';
  const pastPeriodProgressLabel = isOperationalInitiative
    ? `Progress Against the Plan for ${pastWeekLabel}`
    : `Progress Against the Plan for the Week of ${pastWeekLabel}`;
  const currentPeriodPlanLabel = isOperationalInitiative
    ? `Plan for ${currentWeekLabel}`
    : `Plan for the Week of ${currentWeekLabel}`;
  const emptyPastPlanText = isOperationalInitiative
    ? 'No prior monthly plan is recorded yet.'
    : 'No prior weekly plan is recorded yet.';
  const emptyPastProgressText = isOperationalInitiative
    ? 'Monthly progress has not been recorded yet.'
    : 'Weekly progress has not been recorded yet.';
  const currentProgressPlaceholder = isOperationalInitiative
    ? 'To be filled in next month after execution progress is reviewed.'
    : 'To be filled in next week after execution progress is reviewed.';
  const currentReviewPlaceholder = isOperationalInitiative
    ? 'To be filled in next month after the monthly review is completed.'
    : 'To be filled in next week after the weekly review is completed.';
  const periodLabel = isOperationalInitiative ? 'month' : 'week';
  const pastWeekUpdate = project.weeklyUpdates?.find(
    (entry) => entry.weekStart === pastWeekStart && (entry.cadence ?? 'weekly') === updateCadence,
  ) ?? null;
  const currentWeekUpdate = project.weeklyUpdates?.find(
    (entry) => entry.weekStart === currentWeekStart && (entry.cadence ?? 'weekly') === updateCadence,
  ) ?? null;
  const projectDocuments = (project.documentVersions ?? [])
    .filter((document) => document.isCurrent)
    .sort((left, right) => left.category.localeCompare(right.category));
  const overlayTitle = activeOverlay === 'progress-update' ? 'Progress Update' : '';
  const overlayHeading =
    activeOverlay === 'team-edit'
      ? 'Edit Team Members'
      : activeOverlay === 'document-version'
        ? 'Upload Document'
        : overlayTitle;

  function openProgressUpdate() {
    setProgressForm({
      progress: pastWeekUpdate?.progress ?? '',
      nextWeekPlan: currentWeekUpdate?.plan ?? '',
      overallStatus: pastWeekUpdate?.overallStatus ?? '',
    });
    setActiveOverlay('progress-update');
  }

  const overlay =
    typeof document !== 'undefined'
      ? createPortal(
          <div
            className={`drawer-overlay ${activeOverlay ? 'open' : ''}`}
            onClick={() => setActiveOverlay(null)}
          >
            <aside
              className={`drawer-panel ${activeOverlay ? 'open' : ''}`}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="drawer-header">
                <h2>{overlayHeading}</h2>
                <button type="button" className="icon-btn" onClick={() => setActiveOverlay(null)}>
                  x
                </button>
              </div>

              {activeOverlay === 'progress-update' ? (
                <form
                  className="risk-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    submitProgressUpdate();
                  }}
                >
                  <div className="detail-block">
                    <h3><Icon name="assessment" />{previousPlanHeading}</h3>
                    <p className="muted">
                      {pastWeekUpdate?.plan || (project.milestones[0]?.name
                        ? `Focus on ${project.milestones[0].name} and keep delivery aligned to ${project.milestones[0].quarter || 'the planned quarter'}.`
                        : emptyPastPlanText)}
                    </p>
                  </div>

                  <div className="form-grid single-column">
                    {isOperationalInitiative ? (
                      <label>
                        Brief Explanation of the Overall Status of the Project
                        <textarea
                          rows={4}
                          value={progressForm.overallStatus}
                          onChange={(event) => setProgressForm((current) => ({
                            ...current,
                            overallStatus: event.target.value,
                          }))}
                          placeholder="Summarize the overall project status for this month."
                          required
                        />
                      </label>
                    ) : null}

                    <label>
                      {pastPeriodProgressLabel}
                      <textarea
                        rows={5}
                        value={progressForm.progress}
                        onChange={(event) => setProgressForm((current) => ({
                          ...current,
                          progress: event.target.value,
                        }))}
                      />
                    </label>

                    <label>
                      {currentPeriodPlanLabel}
                      <textarea
                        rows={5}
                        value={progressForm.nextWeekPlan}
                        onChange={(event) => setProgressForm((current) => ({
                          ...current,
                          nextWeekPlan: event.target.value,
                        }))}
                      />
                    </label>
                  </div>

                  <div className="drawer-actions">
                    <button type="button" className="secondary-btn" onClick={() => setActiveOverlay(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="primary-btn">
                      Save Update
                    </button>
                  </div>
                </form>
              ) : null}

              {activeOverlay === 'team-edit' ? (
                <form
                  className="risk-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    submitTeamMembers();
                  }}
                >
                  <p className="muted">
                    Add or remove team members. Enter one name per line.
                  </p>

                  <div className="form-grid single-column">
                    <label>
                      Team Members
                      <textarea
                        rows={10}
                        value={teamFormText}
                        onChange={(event) => setTeamFormText(event.target.value)}
                        placeholder="Enter one team member per line"
                      />
                    </label>
                  </div>

                  <div className="drawer-actions">
                    <button type="button" className="secondary-btn" onClick={() => setActiveOverlay(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="primary-btn">
                      Save Team
                    </button>
                  </div>
                </form>
              ) : null}

              {activeOverlay === 'document-version' ? (
                <form
                  className="risk-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    submitDocumentVersion();
                  }}
                >
                  <div className="form-grid single-column">
                    <label>
                      Document Type
                      <select
                        value={documentVersionForm.category}
                        onChange={(event) => setDocumentVersionForm((current) => ({
                          ...current,
                          category: event.target.value,
                        }))}
                      >
                        <option value="Cost Estimate Breakdown">Cost Estimate Breakdown</option>
                        <option value="Scope Statement">Scope Statement</option>
                      </select>
                    </label>

                    <label>
                      File Name
                      <input
                        value={documentVersionForm.fileName}
                        onChange={(event) => setDocumentVersionForm((current) => ({
                          ...current,
                          fileName: event.target.value,
                        }))}
                        placeholder="Enter the new file name"
                        required
                      />
                    </label>

                    <label>
                      Comments
                      <textarea
                        rows={4}
                        value={documentVersionForm.comments}
                        onChange={(event) => setDocumentVersionForm((current) => ({
                          ...current,
                          comments: event.target.value,
                        }))}
                        placeholder="Describe what changed in this version"
                      />
                    </label>
                  </div>

                  <div className="drawer-actions">
                    <button type="button" className="secondary-btn" onClick={() => setActiveOverlay(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="primary-btn">
                      Save Version
                    </button>
                  </div>
                </form>
              ) : null}
            </aside>
          </div>,
          document.body,
        )
      : null;

  function openTeamEditor() {
    setTeamFormText(project.teamMembers.join('\n'));
    setActiveOverlay('team-edit');
  }

  function openDocumentVersionEditor(category) {
    setDocumentVersionForm({
      category,
      fileName: '',
      comments: '',
    });
    setActiveOverlay('document-version');
  }

  function openNewDocumentEditor() {
    setDocumentVersionForm({
      category: 'Cost Estimate Breakdown',
      fileName: '',
      comments: '',
    });
    setActiveOverlay('document-version');
  }

  function submitProgressUpdate() {
    saveWeeklyUpdate(project.id, {
      weekStart: pastWeekStart,
      cadence: updateCadence,
      plan: pastWeekUpdate?.plan
        ?? (project.milestones[0]?.name
          ? `Focus on ${project.milestones[0].name} and keep delivery aligned to ${project.milestones[0].quarter || 'the planned quarter'}.`
          : ''),
      progress: progressForm.progress.trim(),
      overallStatus: isOperationalInitiative ? progressForm.overallStatus.trim() : '',
    });

    saveWeeklyUpdate(project.id, {
      weekStart: currentWeekStart,
      cadence: updateCadence,
      plan: progressForm.nextWeekPlan.trim(),
      progress: currentWeekUpdate?.progress ?? '',
      overallStatus: currentWeekUpdate?.overallStatus ?? '',
    });

    setActiveOverlay(null);
  }

  function submitTeamMembers() {
    saveTeamMembers(
      project.id,
      teamFormText
        .split('\n')
        .map((member) => member.trim())
        .filter(Boolean),
    );
    setActiveOverlay(null);
  }

  function submitDocumentVersion() {
    saveDocumentVersion(project.id, {
      category: documentVersionForm.category,
      fileName: documentVersionForm.fileName.trim(),
      comments: documentVersionForm.comments.trim(),
    });
    setActiveOverlay(null);
  }

  async function exportProjectSlide() {
    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_WIDE';
    pptx.author = 'OpenAI Codex';
    pptx.company = 'Risk App';
    pptx.subject = `${project.id} project summary`;
    pptx.title = `${project.id} | ${project.name}`;

    const slide = pptx.addSlide();
    const headerFill = 'EAF2FF';
    const panelFill = 'FFFFFF';
    const panelBorder = 'C9D6EA';
    const headerText = `${project.id} | ${project.name}`;
    const headerSubtext = `Ex Sponr. ${project.executiveSponsor || '-'}   |   Bus Ownr. ${project.businessOwner || '-'}   |   ${project.summary}`;
    const statusLines = [
      `Overall Status: ${getHealthLabel(overallHealthTone)}`,
      ...healthCards.map((card) => `${card.label}: ${getHealthLabel(card.tone)}`),
    ];
    const milestoneLines = milestoneRows.length > 0
      ? milestoneRows.slice(0, 4).map((milestone) => `${milestone.title} (${milestone.plannedDate})`)
      : ['No milestones available'];
    const milestonePreviewRows = milestoneRows.slice(0, 5);
    const riskLines = sortedProjectRisks.length > 0
      ? sortedProjectRisks.slice(0, 4).map((risk) => `${risk.risk_id}: ${risk.title}`)
      : ['No linked ERM risks'];
    const nextWeekPlan = currentWeekUpdate?.plan
      || (project.milestones[1]?.name
        ? `Continue with ${project.milestones[1].name} and prepare delivery against ${project.milestones[1].quarter || 'the current plan'}.`
        : project.milestones[0]?.name
          ? `Continue execution on ${project.milestones[0].name} for the current ${periodLabel}.`
          : `Current-${periodLabel} plan has not been defined yet.`);
    const lastWeekProgress = pastWeekUpdate?.progress || emptyPastProgressText;
    const overallStatusSummary = isOperationalInitiative
      ? (pastWeekUpdate?.overallStatus || 'Overall project status has not been recorded yet.')
      : '';

    slide.addShape(pptx.ShapeType.rect, {
      x: 0.2,
      y: 0.2,
      w: 12.9,
      h: 0.95,
      line: { color: 'BBD0EE', pt: 1 },
      fill: { color: headerFill },
      radius: 0.08,
    });
    slide.addText(headerText, {
      x: 0.45,
      y: 0.34,
      w: 7.6,
      h: 0.28,
      fontFace: 'Aptos',
      fontSize: 24,
      bold: true,
      color: '1B2A4A',
    });
    slide.addText(headerSubtext, {
      x: 0.45,
      y: 0.66,
      w: 12,
      h: 0.18,
      fontFace: 'Aptos',
      fontSize: 9,
      color: '50617D',
    });
    slide.addShape(pptx.ShapeType.ellipse, {
      x: 12.25,
      y: 0.42,
      w: 0.28,
      h: 0.28,
      line: { color: getHealthColor(overallHealthTone), pt: 1 },
      fill: { color: getHealthColor(overallHealthTone) },
    });

    const quadrants = [
      { title: 'Status', x: 0.35, y: 1.35, lines: statusLines },
      { title: 'Milestones', x: 6.7, y: 1.35, lines: milestoneLines },
      { title: 'Risks', x: 0.35, y: 4.0, lines: riskLines },
      {
        title: 'Progress And Plan',
        x: 6.7,
        y: 4.0,
        lines: [
          `Progress Last ${isOperationalInitiative ? 'Month' : 'Week'}: ${lastWeekProgress}`,
          `Plan For Next ${isOperationalInitiative ? 'Month' : 'Week'}: ${nextWeekPlan}`,
          ...(overallStatusSummary ? [`Overall Status: ${overallStatusSummary}`] : []),
        ],
      },
    ];

    quadrants.forEach((quadrant) => {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: quadrant.x,
        y: quadrant.y,
        w: 6.05,
        h: 2.35,
        rectRadius: 0.06,
        line: { color: panelBorder, pt: 1 },
        fill: { color: panelFill },
      });
      slide.addText(quadrant.title, {
        x: quadrant.x + 0.2,
        y: quadrant.y + 0.16,
        w: 3.5,
        h: 0.22,
        fontFace: 'Aptos',
        fontSize: 16,
        bold: true,
        color: '1B2A4A',
      });
      slide.addText(quadrant.lines.map((line) => ({ text: line, options: { bullet: { indent: 12 } } })), {
        x: quadrant.x + 0.22,
        y: quadrant.y + 0.48,
        w: 5.6,
        h: 1.6,
        fontFace: 'Aptos',
        fontSize: 10,
        color: '32445F',
        breakLine: true,
        margin: 0.02,
        valign: 'top',
        fit: 'shrink',
      });
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.35,
      y: 6.52,
      w: 12.4,
      h: 0.72,
      rectRadius: 0.06,
      line: { color: panelBorder, pt: 1 },
      fill: { color: panelFill },
    });
    slide.addText('Milestone Timeline', {
      x: 0.55,
      y: 6.62,
      w: 2.4,
      h: 0.14,
      fontFace: 'Aptos',
      fontSize: 12,
      bold: true,
      color: '1B2A4A',
    });
    drawMilestoneTimeline(slide, pptx, milestonePreviewRows, {
      x: 2.1,
      y: 6.57,
      w: 10.25,
      bandOffsetY: 0.18,
      bandHeight: 0.12,
      stemHeight: 0.16,
      lowerTextOffset: 0.18,
      textWidth: 1.45,
      textHeight: 0.18,
      fontSize: 6.5,
    });

    await pptx.writeFile({ fileName: `${project.id}-project-summary.pptx` });
  }

  return (
    <AppFrame
      title={project.name}
      description={project.summary}
      detailLabel={(
        <span className="project-title-with-status">
          <span className={`status-indicator-dot ${overallHealthTone}`} aria-hidden="true" />
          <span>{project.id}</span>
        </span>
      )}
      topNavActions={(
        <div className="project-header-meta">
          <div className="project-header-meta-item">
            <div className="project-header-meta-label">Ex Sponr.</div>
            <div className="project-header-meta-value">{project.executiveSponsor || '-'}</div>
          </div>
          <div className="project-header-meta-item">
            <div className="project-header-meta-label">Bus Ownr.</div>
            <div className="project-header-meta-value">{project.businessOwner || '-'}</div>
          </div>
        </div>
      )}
    >
      <section className="panel">
        <div className="project-health-grid">
          {healthCards.map((card) => (
            <article key={card.label} className="card project-health-card">
              <div className="project-health-header">
                <span className={`status-indicator-dot ${card.tone}`} aria-hidden="true" />
                <div className="label">{card.label}</div>
              </div>
              <div className={`value project-health-value tone-${card.tone}`}>
                {getHealthLabel(card.tone)}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="project-tab-row" role="tablist" aria-label="Project detail tabs">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'key-info'}
            className={`project-tab ${activeTab === 'key-info' ? 'active' : ''}`}
            onClick={() => setActiveTab('key-info')}
          >
            Key Information
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'outcomes'}
            className={`project-tab ${activeTab === 'outcomes' ? 'active' : ''}`}
            onClick={() => setActiveTab('outcomes')}
          >
            Outcomes
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'team'}
            className={`project-tab ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            Team
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'documents'}
            className={`project-tab ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            Project Documents
          </button>
        </div>

        {activeTab === 'key-info' ? (
          <>
            <div className="panel-header-row">
              <h2><Icon name="detail" />Key Information</h2>
            </div>

            <div className="project-info-card-row">
              <article className="card project-info-card">
                <div className="label">Category</div>
                <div className="value">{project.category || '-'}</div>
              </article>
              <article className="card project-info-card">
                <div className="label">Strategic Alignment</div>
                <div className="value">{project.strategicAlignment || '-'}</div>
              </article>
              <article className="card project-info-card">
                <div className="label">Priority Period</div>
                <div className="value">{project.strategicPriorityPeriodLabel || '-'}</div>
              </article>
            </div>
          </>
        ) : null}

        {activeTab === 'outcomes' ? (
          <>
            <div className="panel-header-row">
              <h2><Icon name="assessment" />Expected Outcomes</h2>
              <div className="muted">Expected delivery and business results for this project</div>
            </div>
            <div className="detail-block">
              {project.expectedOutcomes.length > 0 ? (
                <ul className="ppm-inline-list">
                  {project.expectedOutcomes.map((outcome) => (
                    <li key={outcome}>{outcome}</li>
                  ))}
                </ul>
              ) : (
                <p className="muted">No expected outcomes listed.</p>
              )}
            </div>
          </>
        ) : null}

        {activeTab === 'team' ? (
          <>
            <div className="panel-header-row">
              <h2><Icon name="department" />Team Members</h2>
              <div className="detail-actions-row">
                <div className="muted">Assigned project participants and delivery contacts</div>
                <button type="button" className="secondary-btn" onClick={openTeamEditor}>
                  Edit Team
                </button>
              </div>
            </div>
            <div className="detail-block">
              {project.teamMembers.length > 0 ? (
                <ul className="ppm-inline-list">
                  {project.teamMembers.map((member) => (
                    <li key={member}>{member}</li>
                  ))}
                </ul>
              ) : (
                <p className="muted">No team members listed.</p>
              )}
            </div>
          </>
        ) : null}

        {activeTab === 'documents' ? (
          <>
            <div className="panel-header-row">
              <h2><Icon name="register" />Project Documents</h2>
              <div className="detail-actions-row">
                <div className="muted">Supporting attachments and scope documentation</div>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={openNewDocumentEditor}
                >
                  Add New Document
                </button>
              </div>
            </div>
            <div className="table-wrap">
              <table className="simple-table">
                <thead>
                  <tr>
                    <th>Document Type</th>
                    <th>File Name</th>
                    <th>Comments</th>
                    <th>Version</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {projectDocuments.map((document) => (
                    <tr key={`${document.category}-${document.fileName}`}>
                      <td>{document.category}</td>
                      <td>{document.fileName}</td>
                      <td>{document.comments || '-'}</td>
                      <td>v{document.versionNumber}</td>
                      <td>
                        <div className="detail-actions-row">
                          <button
                            type="button"
                            className="secondary-btn"
                            onClick={() => downloadProjectDocument(document.fileName)}
                          >
                            Download
                          </button>
                          <button
                            type="button"
                            className="secondary-btn"
                            onClick={() => openDocumentVersionEditor(document.category)}
                          >
                            Upload New Version
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {projectDocuments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="muted">No files attached.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </section>

      <section className="panel">
        <div className="panel-header-row">
          <h2><Icon name="review" />{updateTitle}</h2>
          <div className="detail-actions-row">
            <div className="muted">{progressSummaryLabel}</div>
            <button type="button" className="secondary-btn" onClick={openProgressUpdate}>
              {progressButtonLabel}
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table className="simple-table weekly-update-table">
            <thead>
              <tr>
                <th>{isOperationalInitiative ? 'Month Of' : 'Week Of'}</th>
                <th>Plan</th>
                <th>Progress</th>
                <th>{isOperationalInitiative ? 'Overall Status' : 'Review Notes'}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="weekly-update-week-cell">{pastWeekLabel}</td>
                <td>
                  {pastWeekUpdate?.plan || (project.milestones[0]?.name
                    ? `Focus on ${project.milestones[0].name} and keep delivery aligned to ${project.milestones[0].quarter || 'the planned quarter'}.`
                    : `${isOperationalInitiative ? 'Monthly' : 'Weekly'} plan has not been defined yet.`)}
                </td>
                <td>
                  {pastWeekUpdate?.progress || emptyPastProgressText}
                </td>
                <td>
                  {isOperationalInitiative
                    ? (pastWeekUpdate?.overallStatus || 'Overall project status has not been recorded yet.')
                    : (project.reviewNotes || 'No review notes recorded.')}
                </td>
              </tr>
              <tr>
                <td className="weekly-update-week-cell">{currentWeekLabel}</td>
                <td>
                  {currentWeekUpdate?.plan || (project.milestones[1]?.name
                    ? `Continue with ${project.milestones[1].name} and prepare delivery against ${project.milestones[1].quarter || 'the current plan'}.`
                    : project.milestones[0]?.name
                      ? `Continue execution on ${project.milestones[0].name} for the current ${periodLabel}.`
                      : `Current-${periodLabel} plan has not been defined yet.`)}
                </td>
                <td className="muted">{currentProgressPlaceholder}</td>
                <td className="muted">{currentReviewPlaceholder}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header-row">
          <h2><Icon name="dashboard" />Milestones</h2>
          <div className="muted">{milestoneRows.length} milestone(s)</div>
        </div>

        {milestoneRows.length > 0 ? (
          <div className="table-wrap">
            <table className="simple-table">
              <thead>
                <tr>
                  <th>Milestone title</th>
                  <th>Description</th>
                  <th>Planned Date</th>
                  <th>Actual Date</th>
                </tr>
              </thead>
              <tbody>
                {milestoneRows.map((milestone) => (
                  <tr key={milestone.id}>
                    <td>{milestone.title}</td>
                    <td>{milestone.description}</td>
                    <td>{milestone.plannedDate}</td>
                    <td>{milestone.actualDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">No milestones have been defined yet.</p>
        )}
      </section>

      <section className="panel">
        <div className="panel-header-row">
          <h2><Icon name="risk" />ERM Risks</h2>
          <div className="muted">{sortedProjectRisks.length} linked risk(s)</div>
        </div>

        {projectRisksLoading ? <p>Loading project risks...</p> : null}
        {projectRisksError ? <p className="error">{projectRisksError}</p> : null}

        {!projectRisksLoading && !projectRisksError ? (
          <div className="table-wrap">
            <table className="simple-table">
              <thead>
                <tr>
                  <th>Risk ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Risk Level</th>
                  <th>Owner</th>
                  <th>Next Review</th>
                  <th>Open</th>
                </tr>
              </thead>
              <tbody>
                {sortedProjectRisks.map((risk) => (
                  <tr key={risk.risk_id}>
                    <td>{risk.risk_id}</td>
                    <td>{risk.title}</td>
                    <td>{risk.category}</td>
                    <td>{risk.status}</td>
                    <td>
                      <span className={`pill ${getRiskBand(risk.inherent_score)}`}>
                        {getRiskBand(risk.inherent_score)}
                      </span>
                    </td>
                    <td>{risk.owner_name || '-'}</td>
                    <td>{risk.next_review_due ? String(risk.next_review_due).slice(0, 10) : '-'}</td>
                    <td>
                      <Link className="link-btn" to={`/risks/${risk.risk_id}`}>
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
                {sortedProjectRisks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="muted">No ERM risks are linked to this project yet.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section className="panel">
        <div className="panel-header-row">
          <h2><Icon name="assessment" />Cost Tracking</h2>
          <div className="muted">{costTrackingRows.length} cost item(s)</div>
        </div>

        <div className="table-wrap">
          <table className="simple-table">
            <thead>
              <tr>
                <th>Breakdown of Project Cost Items</th>
                <th>Budget</th>
                <th>Actual to date</th>
                <th>Estimate at completion</th>
              </tr>
            </thead>
            <tbody>
              {costTrackingRows.map((row) => (
                <tr key={row.item}>
                  <td>{row.item}</td>
                  <td>{formatMillions(row.budget)}</td>
                  <td>{formatMillions(row.actualToDate)}</td>
                  <td>{formatMillions(row.estimateAtCompletion)}</td>
                </tr>
              ))}
              <tr className="cost-tracking-total-row">
                <td>Total</td>
                <td>{formatMillions(costTrackingTotals.budget)}</td>
                <td>{formatMillions(costTrackingTotals.actualToDate)}</td>
                <td>{formatMillions(costTrackingTotals.estimateAtCompletion)}</td>
              </tr>
              {costTrackingRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="muted">No cost tracking items are available for this project.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <div className="detail-actions-row">
          <button type="button" className="primary-btn" onClick={() => void exportProjectSlide()}>
            <Icon name="register" />
            Create PowerPoint Slide
          </button>
        </div>
      </section>

      {overlay}
    </AppFrame>
  );
}
