import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import pptxgen from 'pptxgenjs';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import AppFrame from '../components/AppFrame';
import Icon from '../components/Icon';
import { apiFetch } from '../lib/api';
import { usePpmProjects } from '../ppm/PpmProjectsContext';

const HEALTH_DIMENSIONS = ['scope', 'schedule', 'cost', 'quality', 'risk'];
const STATUS_OPTIONS = ['green', 'yellow', 'red'];

function getStatusSelectClass(value) {
  return `ppm-status-select tone-${value}`;
}

const PROJECT_HEALTH_BY_ID = {
  'PRJ-301': { scope: 'green', schedule: 'yellow', cost: 'green', risk: 'yellow', quality: 'green' },
  'PRJ-302': { scope: 'green', schedule: 'green', cost: 'yellow', risk: 'yellow', quality: 'green' },
  'PRJ-303': { scope: 'green', schedule: 'green', cost: 'green', risk: 'yellow', quality: 'green' },
  'PRJ-304': { scope: 'green', schedule: 'yellow', cost: 'green', risk: 'yellow', quality: 'green' },
  'PRJ-305': { scope: 'yellow', schedule: 'yellow', cost: 'green', risk: 'yellow', quality: 'green' },
  'PRJ-306': { scope: 'green', schedule: 'green', cost: 'yellow', risk: 'yellow', quality: 'green' },
  'PRJ-307': { scope: 'green', schedule: 'yellow', cost: 'green', risk: 'red', quality: 'green' },
  'PRJ-308': { scope: 'green', schedule: 'green', cost: 'yellow', risk: 'yellow', quality: 'green' },
  'PRJ-309': { scope: 'green', schedule: 'green', cost: 'green', risk: 'yellow', quality: 'green' },
  'PRJ-201': { scope: 'green', schedule: 'yellow', cost: 'green', risk: 'yellow', quality: 'green' },
  'PRJ-214': { scope: 'green', schedule: 'green', cost: 'yellow', risk: 'yellow', quality: 'green' },
  'PRJ-223': { scope: 'yellow', schedule: 'green', cost: 'green', risk: 'red', quality: 'yellow' },
  'PRJ-230': { scope: 'yellow', schedule: 'yellow', cost: 'green', risk: 'yellow', quality: 'green' },
  'PRJ-233': { scope: 'green', schedule: 'yellow', cost: 'yellow', risk: 'red', quality: 'green' },
};

function parseCost(value) {
  return Number(String(value ?? '').replace(/[^0-9.]/g, '')) || 0;
}

function formatMillions(value) {
  return `$${value.toFixed(1)}M`;
}

function formatMonthYearLabel(value) {
  const normalized = String(value ?? '').slice(0, 7);
  const parsed = new Date(`${normalized}-01T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value || '-';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  }).format(parsed).replace(' ', '-');
}

function getHealthColor(tone) {
  if (tone === 'green') return '2E9B56';
  if (tone === 'yellow') return 'D4A728';
  if (tone === 'red') return 'C74A5F';
  return '8B93A9';
}

function getHealthLabel(tone) {
  if (tone === 'red') return 'At Risk';
  if (tone === 'yellow') return 'Watch';
  if (tone === 'green') return 'On Track';
  return 'Not Started';
}

function getHealthPriority(tone) {
  if (tone === 'red') return 0;
  if (tone === 'yellow') return 1;
  if (tone === 'green') return 2;
  return 3;
}

function getRiskBand(score) {
  if (score >= 15) return 'high';
  if (score >= 8) return 'medium';
  return 'low';
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : 'Unknown error';
}

function getProjectHealth(project) {
  return PROJECT_HEALTH_BY_ID[project.id] ?? {
    scope: 'grey',
    schedule: 'grey',
    cost: 'grey',
    quality: 'grey',
    risk: 'grey',
  };
}

function buildInitiativeProgressForm(initiative, initiativeHealth) {
  const latestUpdate = Array.isArray(initiative.monthlyProgressUpdates) && initiative.monthlyProgressUpdates.length
    ? [...initiative.monthlyProgressUpdates].sort(
      (left, right) => String(right.month ?? '').localeCompare(String(left.month ?? '')),
    )[0]
    : null;

  return {
    month: new Date().toISOString().slice(0, 7),
    scopeStatus: latestUpdate?.scopeStatus ?? initiativeHealth.scope,
    scheduleStatus: latestUpdate?.scheduleStatus ?? initiativeHealth.schedule,
    costStatus: latestUpdate?.costStatus ?? initiativeHealth.cost,
    riskStatus: latestUpdate?.riskStatus ?? initiativeHealth.risk,
    qualityStatus: latestUpdate?.qualityStatus ?? initiativeHealth.quality,
    overallStatus: latestUpdate?.overallStatus ?? getOverallHealthTone(initiativeHealth),
    statusExplanation: latestUpdate?.statusExplanation ?? '',
    accomplishments: latestUpdate?.accomplishments?.length
      ? [...latestUpdate.accomplishments.slice(0, 3), '', '', ''].slice(0, 3)
      : ['', '', ''],
    commitments: latestUpdate?.commitments?.length
      ? [...latestUpdate.commitments.slice(0, 3), '', '', ''].slice(0, 3)
      : ['', '', ''],
    milestoneChanges: latestUpdate?.milestoneChanges ?? '',
    newRisks: latestUpdate?.newRisks?.length ? [...latestUpdate.newRisks] : [''],
    decisionsNeeded: latestUpdate?.decisionsNeeded ?? '',
    helpNeeded: latestUpdate?.helpNeeded ?? '',
    notes: latestUpdate?.notes ?? '',
  };
}

function buildInitiativeHealth(relatedProjects) {
  if (!relatedProjects.length) {
    return {
      scope: 'grey',
      schedule: 'grey',
      cost: 'grey',
      quality: 'grey',
      risk: 'grey',
    };
  }

  return HEALTH_DIMENSIONS.reduce((health, dimension) => {
    const tone = relatedProjects.reduce((worst, project) => {
      const nextTone = getProjectHealth(project)[dimension];
      return getHealthPriority(nextTone) < getHealthPriority(worst) ? nextTone : worst;
    }, 'grey');

    return { ...health, [dimension]: tone };
  }, {});
}

function getOverallHealthTone(health) {
  if (HEALTH_DIMENSIONS.some((dimension) => health[dimension] === 'red')) return 'red';
  if (HEALTH_DIMENSIONS.some((dimension) => health[dimension] === 'yellow')) return 'yellow';
  if (HEALTH_DIMENSIONS.some((dimension) => health[dimension] === 'green')) return 'green';
  return 'grey';
}

function renderHealthCell(tone) {
  return (
    <span className="status-indicator-cell">
      <span className={`status-indicator-dot ${tone}`} aria-hidden="true" />
      <span>{getHealthLabel(tone)}</span>
    </span>
  );
}

function buildInitiativeOutcomes(initiative, relatedProjects) {
  const directOutcomes = relatedProjects.flatMap((project) => project.expectedOutcomes ?? []);
  const uniqueOutcomes = [...new Set(directOutcomes.filter(Boolean))];
  if (uniqueOutcomes.length) return uniqueOutcomes.slice(0, 6);

  return [
    `Advance delivery for ${initiative.title.toLowerCase()}.`,
    'Maintain visibility into initiative status, cost, and risk.',
    'Keep linked major projects aligned to the initiative outcome.',
  ];
}

function buildInitiativeTeam(initiative, relatedProjects) {
  const members = [
    ...relatedProjects.flatMap((project) => project.teamMembers ?? []),
    ...relatedProjects.map((project) => project.businessOwner),
  ].filter(Boolean);

  const uniqueMembers = [...new Set(members)];
  if (uniqueMembers.length) return uniqueMembers;

  return ['Initiative Lead', 'Business Owner', 'PMO'];
}

function buildInitiativeDocuments(initiative, relatedProjects) {
  const documents = relatedProjects.flatMap((project) => (
    (project.documentVersions ?? [])
      .filter((document) => document.isCurrent)
      .map((document) => ({
        ...document,
        sourceProjectName: project.name,
      }))
  ));

  if (documents.length) {
    return documents.sort((left, right) => left.category.localeCompare(right.category));
  }

  const initiativeSlug = initiative.id.toLowerCase();
  return [
    {
      id: `${initiative.id}-charter`,
      category: 'Initiative Charter',
      versionNumber: 1,
      fileName: `${initiativeSlug}-charter.pdf`,
      comments: 'Initial initiative charter',
      uploadedAt: `${initiative.year}-01-15`,
      sourceProjectName: '-',
    },
    {
      id: `${initiative.id}-roadmap`,
      category: 'Roadmap',
      versionNumber: 1,
      fileName: `${initiativeSlug}-roadmap.pdf`,
      comments: 'Baseline initiative roadmap',
      uploadedAt: `${initiative.year}-01-20`,
      sourceProjectName: '-',
    },
  ];
}

function buildInitiativeMilestones(relatedProjects) {
  const milestones = relatedProjects.flatMap((project) => (
    (project.milestones ?? []).map((milestone) => ({
      id: `${project.id}-${milestone.id}`,
      title: milestone.name || 'Unnamed milestone',
      description: `${project.name} milestone`,
      plannedDate: milestone.quarter || '-',
      actualDate: '-',
      projectName: project.name,
    }))
  ));

  if (milestones.length) {
    return milestones.sort((left, right) => String(left.plannedDate).localeCompare(String(right.plannedDate)));
  }

  return [
    {
      id: 'milestone-1',
      title: 'Initiative kickoff',
      description: 'Confirm scope, owners, and delivery plan for the initiative.',
      plannedDate: 'Q1',
      actualDate: '-',
      projectName: '-',
    },
    {
      id: 'milestone-2',
      title: 'Mid-year review',
      description: 'Review status, costs, risks, and any scope adjustments.',
      plannedDate: 'Q2',
      actualDate: '-',
      projectName: '-',
    },
    {
      id: 'milestone-3',
      title: 'Year-end closeout',
      description: 'Confirm results and close out the initiative year plan.',
      plannedDate: 'Q4',
      actualDate: '-',
      projectName: '-',
    },
  ];
}

function buildInitiativeCostTracking(relatedProjects) {
  if (relatedProjects.length) {
    return relatedProjects.map((project) => {
      const budget = parseCost(project.estimatedCost);
      return {
        item: project.name,
        budget,
        actualToDate: Number((budget * 0.55).toFixed(2)),
        estimateAtCompletion: Number((budget * 1.04).toFixed(2)),
      };
    });
  }

  return [
    {
      item: 'Program coordination and management',
      budget: 0.35,
      actualToDate: 0.18,
      estimateAtCompletion: 0.36,
    },
    {
      item: 'Delivery support and reporting',
      budget: 0.25,
      actualToDate: 0.12,
      estimateAtCompletion: 0.24,
    },
  ];
}

function getTimelineDate(value, fallbackYear) {
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const quarterMatch = String(value ?? '').match(/Q([1-4])\s+(\d{4})/i);
  if (quarterMatch) {
    const quarter = Number(quarterMatch[1]);
    const year = Number(quarterMatch[2]);
    return new Date(Date.UTC(year, (quarter - 1) * 3, 1));
  }

  return new Date(Date.UTC(Number(fallbackYear) || new Date().getFullYear(), 0, 1));
}

function drawMilestoneTimeline(slide, pptx, milestones, options) {
  if (!milestones.length) return;

  const sortedMilestones = milestones
    .map((milestone) => ({
      ...milestone,
      timelineDate: getTimelineDate(milestone.plannedDate, options.fallbackYear),
    }))
    .sort((left, right) => left.timelineDate - right.timelineDate);

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
    slide.addText(`${milestone.title}\n${milestone.plannedDate}`, {
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
    });
  });
}

function buildMonthlyUpdates(initiative, relatedProjects, milestones) {
  if (Array.isArray(initiative.monthlyProgressUpdates) && initiative.monthlyProgressUpdates.length) {
    return [...initiative.monthlyProgressUpdates]
      .sort((left, right) => String(right.month ?? '').localeCompare(String(left.month ?? '')))
      .map((update) => ({
        weekStart: `${update.month || initiative.year}-01`,
        monthLabel: formatMonthYearLabel(update.month || String(initiative.year ?? '')),
        cadence: 'monthly',
        plan: (update.commitments ?? []).filter(Boolean).slice(0, 3).join(' | ')
          || 'Next month commitments have not been recorded yet.',
        progress: (update.accomplishments ?? []).filter(Boolean).slice(0, 3).join(' | ')
          || update.statusExplanation
          || 'Monthly initiative progress has been recorded.',
        overallStatus: getHealthLabel(update.overallStatus),
        sourceProjectName: 'Initiative update',
        sourceUpdate: update,
      }));
  }

  const latestProjectUpdates = relatedProjects
    .flatMap((project) => (project.weeklyUpdates ?? [])
      .filter((entry) => (entry.cadence ?? 'weekly') === 'monthly')
      .map((entry) => ({
        ...entry,
        sourceProjectName: project.name,
        monthLabel: formatMonthYearLabel(String(entry.weekStart ?? '').slice(0, 7)),
      })))
    .sort((left, right) => String(right.weekStart).localeCompare(String(left.weekStart)));

  if (latestProjectUpdates.length) {
    return latestProjectUpdates.slice(0, 3);
  }

  return [
    {
      weekStart: `${initiative.year}-02-01`,
      monthLabel: formatMonthYearLabel(`${initiative.year}-02`),
      cadence: 'monthly',
      plan: milestones[0]?.title
        ? `Advance ${milestones[0].title.toLowerCase()} and align project owners on delivery priorities.`
        : 'Confirm initiative scope and delivery plan.',
      progress: `Initial coordination is underway for ${initiative.title.toLowerCase()}.`,
      overallStatus: 'On track',
      sourceProjectName: '-',
    },
    {
      weekStart: `${initiative.year}-03-01`,
      monthLabel: formatMonthYearLabel(`${initiative.year}-03`),
      cadence: 'monthly',
      plan: milestones[1]?.title
        ? `Prepare for ${milestones[1].title.toLowerCase()} and confirm risk mitigation actions.`
        : 'Continue execution and monitor health indicators.',
      progress: 'Current month progress will be recorded after review.',
      overallStatus: 'Pending update',
      sourceProjectName: '-',
    },
  ];
}

export default function OperationalInitiativeDetailPage() {
  const { initiativeId } = useParams();
  const { token, logout } = useAuth();
  const { operationalInitiatives, currentProjects, saveOperationalInitiativeMonthlyUpdate } = usePpmProjects();
  const [activeTab, setActiveTab] = useState('key-info');
  const [initiativeRisks, setInitiativeRisks] = useState([]);
  const [initiativeRisksLoading, setInitiativeRisksLoading] = useState(true);
  const [initiativeRisksError, setInitiativeRisksError] = useState('');
  const [activeOverlay, setActiveOverlay] = useState(null);
  const initiative = operationalInitiatives.find((item) => item.id === initiativeId) ?? null;

  const relatedProjects = useMemo(
    () => currentProjects.filter(
      (project) => project.currentProjectClassification === 'Major project'
        && (
          project.operationalInitiativeId === initiativeId
          || project.operationalInitiativeTitle === initiative?.title
        ),
    ),
    [currentProjects, initiativeId, initiative?.title],
  );

  useEffect(() => {
    if (!initiative || !token) {
      setInitiativeRisks([]);
      setInitiativeRisksLoading(false);
      setInitiativeRisksError('');
      return;
    }

    async function loadInitiativeRisks() {
      try {
        setInitiativeRisksLoading(true);
        setInitiativeRisksError('');
        const response = await apiFetch('/risks', { token, onUnauthorized: logout });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const risks = await response.json();
        const projectIds = new Set(relatedProjects.map((project) => project.id));
        setInitiativeRisks(
          risks.filter((risk) => projectIds.has(risk.site_or_program)),
        );
      } catch (error) {
        setInitiativeRisksError(`Failed to load initiative risks: ${getErrorMessage(error)}`);
      } finally {
        setInitiativeRisksLoading(false);
      }
    }

    void loadInitiativeRisks();
  }, [initiative, relatedProjects, token, logout]);

  const initiativeHealth = buildInitiativeHealth(relatedProjects);
  const initiativeForForm = initiative ?? {
    monthlyProgressUpdates: [],
  };
  const overallTone = getOverallHealthTone(initiativeHealth);
  const owners = [...new Set(
    relatedProjects.map((project) => project.businessOwner?.trim()).filter(Boolean),
  )];
  const healthCards = [
    { label: 'Scope', tone: initiativeHealth.scope },
    { label: 'Schedule', tone: initiativeHealth.schedule },
    { label: 'Cost', tone: initiativeHealth.cost },
    { label: 'Risk', tone: initiativeHealth.risk },
    { label: 'Quality', tone: initiativeHealth.quality },
  ];
  const initiativeOutcomes = buildInitiativeOutcomes(initiative, relatedProjects);
  const initiativeTeam = buildInitiativeTeam(initiative, relatedProjects);
  const initiativeDocuments = buildInitiativeDocuments(initiative, relatedProjects);
  const milestoneRows = buildInitiativeMilestones(relatedProjects);
  const monthlyUpdates = buildMonthlyUpdates(initiative, relatedProjects, milestoneRows);
  const costTrackingRows = buildInitiativeCostTracking(relatedProjects);
  const costTrackingTotals = costTrackingRows.reduce(
    (totals, row) => ({
      budget: totals.budget + row.budget,
      actualToDate: totals.actualToDate + row.actualToDate,
      estimateAtCompletion: totals.estimateAtCompletion + row.estimateAtCompletion,
    }),
    { budget: 0, actualToDate: 0, estimateAtCompletion: 0 },
  );
  const sortedInitiativeRisks = [...initiativeRisks].sort(
    (left, right) => String(left.risk_id).localeCompare(String(right.risk_id)),
  );
  const [progressForm, setProgressForm] = useState(() => buildInitiativeProgressForm(
    initiativeForForm,
    initiativeHealth,
  ));

  if (!initiative) {
    return <Navigate to="/ppm/operational-initiatives" replace />;
  }

  function openProgressUpdate() {
    setProgressForm(buildInitiativeProgressForm(initiative, initiativeHealth));
    setActiveOverlay('progress-update');
  }

  function handleListFieldChange(listName, index, value) {
    setProgressForm((current) => ({
      ...current,
      [listName]: current[listName].map((item, itemIndex) => (itemIndex === index ? value : item)),
    }));
  }

  function addRiskField() {
    setProgressForm((current) => ({
      ...current,
      newRisks: [...current.newRisks, ''],
    }));
  }

  function submitProgressUpdate() {
    saveOperationalInitiativeMonthlyUpdate(initiative.id, {
      month: progressForm.month,
      scopeStatus: progressForm.scopeStatus,
      scheduleStatus: progressForm.scheduleStatus,
      costStatus: progressForm.costStatus,
      riskStatus: progressForm.riskStatus,
      qualityStatus: progressForm.qualityStatus,
      overallStatus: progressForm.overallStatus,
      statusExplanation: progressForm.statusExplanation.trim(),
      accomplishments: progressForm.accomplishments.map((value) => value.trim()).filter(Boolean).slice(0, 3),
      commitments: progressForm.commitments.map((value) => value.trim()).filter(Boolean).slice(0, 3),
      milestoneChanges: progressForm.milestoneChanges.trim(),
      newRisks: progressForm.newRisks.map((value) => value.trim()).filter(Boolean),
      decisionsNeeded: progressForm.decisionsNeeded.trim(),
      helpNeeded: progressForm.helpNeeded.trim(),
      notes: progressForm.notes.trim(),
    });
    setActiveOverlay(null);
  }

  async function exportInitiativeSlide(selectedUpdate = null) {
    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_WIDE';
    pptx.author = 'OpenAI Codex';
    pptx.company = 'Risk App';
    pptx.subject = `${initiative.id} initiative summary`;
    pptx.title = `${initiative.id} | ${initiative.title}`;

    const latestSavedUpdate = Array.isArray(initiative.monthlyProgressUpdates) && initiative.monthlyProgressUpdates.length
      ? [...initiative.monthlyProgressUpdates].sort(
        (left, right) => String(right.month ?? '').localeCompare(String(left.month ?? '')),
      )[0]
      : null;
    const exportUpdate = selectedUpdate ?? latestSavedUpdate;
    const slide = pptx.addSlide();
    const commitmentsSlide = pptx.addSlide();
    const panelFill = 'FFFFFF';
    const panelBorder = 'D9E2EC';
    const ownersText = owners.length ? owners.join(', ') : '-';
    const exportOverallTone = exportUpdate?.overallStatus ?? overallTone;
    const exportHealth = {
      scope: exportUpdate?.scopeStatus ?? initiativeHealth.scope,
      schedule: exportUpdate?.scheduleStatus ?? initiativeHealth.schedule,
      cost: exportUpdate?.costStatus ?? initiativeHealth.cost,
      risk: exportUpdate?.riskStatus ?? initiativeHealth.risk,
      quality: exportUpdate?.qualityStatus ?? initiativeHealth.quality,
    };
    const statusDimensions = [
      { label: 'Scope', tone: exportHealth.scope },
      { label: 'Schedule', tone: exportHealth.schedule },
      { label: 'Cost', tone: exportHealth.cost },
      { label: 'Risk', tone: exportHealth.risk },
      { label: 'Quality', tone: exportHealth.quality },
    ];
    const progressPeriodLabel = exportUpdate?.month
      ? formatMonthYearLabel(exportUpdate.month)
      : (monthlyUpdates[0]?.monthLabel || 'Current Month');
    const overallStatusSummary = exportUpdate?.statusExplanation
      || monthlyUpdates[0]?.progress
      || 'No monthly status summary has been recorded yet.';
    const progressBullets = exportUpdate?.accomplishments?.length
      ? exportUpdate.accomplishments.slice(0, 4)
      : (monthlyUpdates[0]?.progress ? [monthlyUpdates[0].progress] : ['No progress updates recorded this month.']);
    const commitmentBullets = exportUpdate?.commitments?.length
      ? exportUpdate.commitments.slice(0, 3)
      : (monthlyUpdates[0]?.plan ? [monthlyUpdates[0].plan] : ['No commitments recorded for next month.']);
    const riskLines = sortedInitiativeRisks.length > 0
      ? sortedInitiativeRisks.slice(0, 2).map((risk) => {
        const band = getRiskBand((risk.severity_score ?? 0) * (risk.probability_score ?? 0));
        const mitigation = risk.latest_mitigation || risk.response_plan || risk.mitigation_plan;
        const bandLabel = band === 'high' ? 'High' : band === 'medium' ? 'Moderate' : 'Low';
        return `${risk.risk_id}: ${risk.title} (${bandLabel}). ${mitigation || 'Mitigation plan to be confirmed.'}`;
      })
      : (exportUpdate?.newRisks?.length ? exportUpdate.newRisks.slice(0, 2) : ['None.']);
    const decisionsNeededText = exportUpdate?.decisionsNeeded || 'None.';
    const helpNeededText = exportUpdate?.helpNeeded || 'None.';
    const additionalNotesText = exportUpdate?.notes || exportUpdate?.helpNeeded || 'None.';
    const projectByName = new Map(relatedProjects.map((project) => [project.name, project]));
    const milestonePreviewRows = milestoneRows.slice(0, 4).map((milestone) => {
      const sourceProject = projectByName.get(milestone.projectName);
      return {
        ...milestone,
        tone: sourceProject ? getOverallHealthTone(getProjectHealth(sourceProject)) : exportOverallTone,
      };
    });
    const statusBadgeColors = {
      green: { fill: 'E3F9E5', line: '1F9D55', text: '137333' },
      yellow: { fill: 'FFF7D6', line: 'D4A728', text: '8D6E00' },
      red: { fill: 'FDE8EC', line: 'C74A5F', text: '8C1D2C' },
      grey: { fill: 'EFF2F7', line: '9AA5B1', text: '52606D' },
    };
    const renderBullets = (items) => items.map((item) => ({
      text: item,
      options: { bullet: { indent: 14 } },
    }));
    const drawPanel = ({ x, y, w, h, title }) => {
      slide.addShape(pptx.ShapeType.roundRect, {
        x,
        y,
        w,
        h,
        rectRadius: 0.04,
        line: { color: panelBorder, pt: 1 },
        fill: { color: panelFill },
      });
      slide.addText(title, {
        x: x + 0.18,
        y: y + 0.12,
        w: w - 0.36,
        h: 0.2,
        fontFace: 'Aptos',
        fontSize: 11,
        bold: true,
        color: '163A5F',
      });
    };
    const drawPanelOnSlide = (targetSlide, { x, y, w, h, title }) => {
      targetSlide.addShape(pptx.ShapeType.roundRect, {
        x,
        y,
        w,
        h,
        rectRadius: 0.04,
        line: { color: panelBorder, pt: 1 },
        fill: { color: panelFill },
      });
      targetSlide.addText(title, {
        x: x + 0.18,
        y: y + 0.12,
        w: w - 0.36,
        h: 0.2,
        fontFace: 'Aptos',
        fontSize: 11,
        bold: true,
        color: '163A5F',
      });
    };
    const drawStatusBadge = ({ tone, label, x, y, w = 1.12, h = 0.32, fontSize = 10.5 }) => {
      const colors = statusBadgeColors[tone] ?? statusBadgeColors.grey;
      slide.addShape(pptx.ShapeType.roundRect, {
        x,
        y,
        w,
        h,
        rectRadius: 0.08,
        line: { color: colors.line, pt: 1 },
        fill: { color: colors.fill },
      });
      slide.addText(label, {
        x,
        y: y + 0.04,
        w,
        h: h - 0.04,
        fontFace: 'Aptos',
        fontSize,
        bold: true,
        color: colors.text,
        align: 'center',
        valign: 'mid',
        margin: 0.01,
        fit: 'shrink',
      });
    };
    const drawStatusBadgeOnSlide = (targetSlide, { tone, label, x, y, w = 1.12, h = 0.32, fontSize = 10.5 }) => {
      const colors = statusBadgeColors[tone] ?? statusBadgeColors.grey;
      targetSlide.addShape(pptx.ShapeType.roundRect, {
        x,
        y,
        w,
        h,
        rectRadius: 0.08,
        line: { color: colors.line, pt: 1 },
        fill: { color: colors.fill },
      });
      targetSlide.addText(label, {
        x,
        y: y + 0.04,
        w,
        h: h - 0.04,
        fontFace: 'Aptos',
        fontSize,
        bold: true,
        color: colors.text,
        align: 'center',
        valign: 'mid',
        margin: 0.01,
        fit: 'shrink',
      });
    };
    const drawStatusDot = ({ tone, x, y, size = 0.14 }) => {
      const color = getHealthColor(tone);
      slide.addShape(pptx.ShapeType.ellipse, {
        x,
        y,
        w: size,
        h: size,
        line: { color, pt: 1 },
        fill: { color },
      });
    };
    slide.addShape(pptx.ShapeType.ellipse, {
      x: 0.62,
      y: 0.49,
      w: 0.17,
      h: 0.17,
      line: { color: getHealthColor(exportOverallTone), pt: 1 },
      fill: { color: getHealthColor(exportOverallTone) },
    });
    slide.addText(`${initiative.id} | ${initiative.title}`, {
      x: 0.86,
      y: 0.36,
      w: 8.2,
      h: 0.34,
      fontFace: 'Aptos',
      fontSize: 20,
      bold: true,
      color: '102A43',
    });
    slide.addText(progressPeriodLabel, {
      x: 10.1,
      y: 0.38,
      w: 2.6,
      h: 0.2,
      fontFace: 'Aptos',
      fontSize: 12,
      bold: true,
      color: '486581',
      align: 'right',
    });
    slide.addText(`Owner: ${ownersText}`, {
      x: 9.45,
      y: 0.7,
      w: 3.25,
      h: 0.2,
      fontFace: 'Aptos',
      fontSize: 10.5,
      color: '627D98',
      align: 'right',
    });

    drawPanel({ x: 0.6, y: 1.08, w: 12.1, h: 1.32, title: 'STATUS SUMMARY' });
    statusDimensions.forEach((dimension, index) => {
      const startX = 0.82 + (index * 2.32);
      slide.addText(`${dimension.label}`, {
        x: startX,
        y: 1.5,
        w: 0.72,
        h: 0.18,
        fontFace: 'Aptos',
        fontSize: 10,
        bold: true,
        color: '486581',
      });
      drawStatusDot({
        tone: dimension.tone,
        x: startX + 0.82,
        y: 1.52,
        size: 0.12,
      });
    });
    slide.addText(overallStatusSummary, {
      x: 0.82,
      y: 1.8,
      w: 11.55,
      h: 0.18,
      fontFace: 'Aptos',
      fontSize: 11.5,
      color: '243B53',
      margin: 0.01,
      fit: 'shrink',
    });

    drawPanel({ x: 0.6, y: 2.62, w: 5.85, h: 2.18, title: 'PROGRESS THIS MONTH' });
    slide.addText(renderBullets(progressBullets), {
      x: 0.84,
      y: 3.02,
      w: 5.34,
      h: 1.5,
      fontFace: 'Aptos',
      fontSize: 11.5,
      color: '243B53',
      breakLine: true,
      margin: 0.02,
      fit: 'shrink',
      valign: 'top',
    });

    drawPanel({ x: 6.85, y: 2.62, w: 5.85, h: 2.18, title: 'MILESTONE SNAPSHOT' });
    slide.addText('Milestone', {
      x: 7.08,
      y: 2.96,
      w: 2.1,
      h: 0.18,
      fontFace: 'Aptos',
      fontSize: 9,
      bold: true,
      color: '486581',
    });
    slide.addText('Due', {
      x: 9.52,
      y: 2.96,
      w: 0.5,
      h: 0.18,
      fontFace: 'Aptos',
      fontSize: 9,
      bold: true,
      color: '486581',
      align: 'center',
    });
    slide.addText('Actual', {
      x: 10.12,
      y: 2.96,
      w: 0.6,
      h: 0.18,
      fontFace: 'Aptos',
      fontSize: 9,
      bold: true,
      color: '486581',
      align: 'center',
    });
    slide.addText('Status', {
      x: 11.08,
      y: 2.96,
      w: 1.15,
      h: 0.18,
      fontFace: 'Aptos',
      fontSize: 9,
      bold: true,
      color: '486581',
      align: 'center',
    });
    milestonePreviewRows.forEach((milestone, index) => {
      const rowY = 3.21 + (index * 0.3);
      slide.addText(milestone.title, {
        x: 7.08,
        y: rowY,
        w: 2.1,
        h: 0.2,
        fontFace: 'Aptos',
        fontSize: 8.8,
        color: '243B53',
        margin: 0.01,
        fit: 'shrink',
      });
      slide.addText(milestone.plannedDate || '-', {
        x: 9.52,
        y: rowY,
        w: 0.5,
        h: 0.2,
        fontFace: 'Aptos',
        fontSize: 8.8,
        color: '243B53',
        align: 'center',
        margin: 0.01,
      });
      slide.addText(milestone.actualDate || '-', {
        x: 10.12,
        y: rowY,
        w: 0.6,
        h: 0.2,
        fontFace: 'Aptos',
        fontSize: 8.8,
        color: '243B53',
        align: 'center',
        margin: 0.01,
      });
      drawStatusDot({
        tone: milestone.tone,
        x: 11.52,
        y: rowY + 0.03,
        size: 0.12,
      });
    });

    drawPanel({ x: 0.6, y: 5.04, w: 5.85, h: 1.28, title: 'DECISIONS NEEDED FROM LEADERSHIP' });
    slide.addText(decisionsNeededText, {
      x: 0.84,
      y: 5.45,
      w: 5.34,
      h: 0.56,
      fontFace: 'Aptos',
      fontSize: 10.8,
      color: '243B53',
      margin: 0.01,
      fit: 'shrink',
    });

    drawPanel({ x: 6.85, y: 5.04, w: 5.85, h: 1.28, title: 'ADDITIONAL NOTES' });
    slide.addText(additionalNotesText, {
      x: 7.08,
      y: 5.45,
      w: 5.34,
      h: 0.56,
      fontFace: 'Aptos',
      fontSize: 10.7,
      color: '243B53',
      margin: 0.01,
      fit: 'shrink',
    });

    drawPanelOnSlide(commitmentsSlide, { x: 0.6, y: 1.08, w: 12.1, h: 3.15, title: 'NEXT MONTH\'S COMMITMENTS' });
    commitmentsSlide.addShape(pptx.ShapeType.ellipse, {
      x: 0.62,
      y: 0.49,
      w: 0.17,
      h: 0.17,
      line: { color: getHealthColor(exportOverallTone), pt: 1 },
      fill: { color: getHealthColor(exportOverallTone) },
    });
    commitmentsSlide.addText(`${initiative.id} | ${initiative.title}`, {
      x: 0.86,
      y: 0.36,
      w: 8.2,
      h: 0.34,
      fontFace: 'Aptos',
      fontSize: 20,
      bold: true,
      color: '102A43',
    });
    commitmentsSlide.addText(progressPeriodLabel, {
      x: 10.1,
      y: 0.38,
      w: 2.6,
      h: 0.2,
      fontFace: 'Aptos',
      fontSize: 12,
      bold: true,
      color: '486581',
      align: 'right',
    });
    commitmentsSlide.addText(`Owner: ${ownersText}`, {
      x: 9.45,
      y: 0.7,
      w: 3.25,
      h: 0.2,
      fontFace: 'Aptos',
      fontSize: 10.5,
      color: '627D98',
      align: 'right',
    });
    commitmentsSlide.addText(renderBullets(commitmentBullets), {
      x: 0.9,
      y: 1.52,
      w: 11.2,
      h: 2.35,
      fontFace: 'Aptos',
      fontSize: 14,
      color: '243B53',
      breakLine: true,
      margin: 0.02,
      fit: 'shrink',
      valign: 'top',
    });
    drawPanelOnSlide(commitmentsSlide, { x: 0.6, y: 4.45, w: 12.1, h: 1.45, title: 'HELP NEEDED' });
    commitmentsSlide.addText(helpNeededText, {
      x: 0.9,
      y: 4.88,
      w: 11.2,
      h: 0.72,
      fontFace: 'Aptos',
      fontSize: 12,
      color: '243B53',
      margin: 0.01,
      fit: 'shrink',
      valign: 'top',
    });

    const safePeriod = String(exportUpdate?.month || 'latest').replace(/[^0-9A-Za-z-]/g, '-');
    try {
      await pptx.writeFile({ fileName: `${initiative.id}-initiative-summary-${safePeriod}.pptx` });
    } catch (error) {
      console.error('Initiative slide export failed', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      window.alert(`Unable to export initiative slide deck: ${message}`);
    }
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
                <h2>Progress Update</h2>
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
                  <div className="form-grid single-column">
                    <label>
                      Reporting Month
                      <input
                        type="month"
                        value={progressForm.month}
                        onChange={(event) => setProgressForm((current) => ({
                          ...current,
                          month: event.target.value,
                        }))}
                      />
                    </label>

                    <label className="ppm-status-featured-field">
                      Overall Project Status
                      <select
                        className={`${getStatusSelectClass(progressForm.overallStatus)} ppm-status-featured-select`}
                        value={progressForm.overallStatus}
                        onChange={(event) => setProgressForm((current) => ({
                          ...current,
                          overallStatus: event.target.value,
                        }))}
                      >
                        {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </label>

                    <div className="two-col-row">
                      <label>
                        Scope
                        <select
                          className={getStatusSelectClass(progressForm.scopeStatus)}
                          value={progressForm.scopeStatus}
                          onChange={(event) => setProgressForm((current) => ({
                            ...current,
                            scopeStatus: event.target.value,
                          }))}
                        >
                          {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                        </select>
                      </label>
                      <label>
                        Schedule
                        <select
                          className={getStatusSelectClass(progressForm.scheduleStatus)}
                          value={progressForm.scheduleStatus}
                          onChange={(event) => setProgressForm((current) => ({
                            ...current,
                            scheduleStatus: event.target.value,
                          }))}
                        >
                          {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                        </select>
                      </label>
                    </div>

                    <div className="two-col-row">
                      <label>
                        Cost
                        <select
                          className={getStatusSelectClass(progressForm.costStatus)}
                          value={progressForm.costStatus}
                          onChange={(event) => setProgressForm((current) => ({
                            ...current,
                            costStatus: event.target.value,
                          }))}
                        >
                          {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                        </select>
                      </label>
                      <label>
                        Risk
                        <select
                          className={getStatusSelectClass(progressForm.riskStatus)}
                          value={progressForm.riskStatus}
                          onChange={(event) => setProgressForm((current) => ({
                            ...current,
                            riskStatus: event.target.value,
                          }))}
                        >
                          {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                        </select>
                      </label>
                    </div>

                    <div className="two-col-row">
                      <label>
                        Quality
                        <select
                          className={getStatusSelectClass(progressForm.qualityStatus)}
                          value={progressForm.qualityStatus}
                          onChange={(event) => setProgressForm((current) => ({
                            ...current,
                            qualityStatus: event.target.value,
                          }))}
                        >
                          {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                        </select>
                      </label>
                    </div>

                    <label>
                      Status Explanation
                      <textarea
                        rows={4}
                        value={progressForm.statusExplanation}
                        onChange={(event) => setProgressForm((current) => ({
                          ...current,
                          statusExplanation: event.target.value,
                        }))}
                      />
                    </label>

                    <div className="detail-block">
                      <h3>Top 3 Accomplishments This Month</h3>
                      {progressForm.accomplishments.map((value, index) => (
                        <label key={`accomplishment-${index}`}>
                          <textarea
                            rows={2}
                            value={value}
                            onChange={(event) => handleListFieldChange('accomplishments', index, event.target.value)}
                          />
                        </label>
                      ))}
                    </div>

                    <div className="detail-block">
                      <h3>Top 3 Commitments For Next Month</h3>
                      {progressForm.commitments.map((value, index) => (
                        <label key={`commitment-${index}`}>
                          <textarea
                            rows={2}
                            value={value}
                            onChange={(event) => handleListFieldChange('commitments', index, event.target.value)}
                          />
                        </label>
                      ))}
                    </div>

                    <label>
                      Narrative Explanation On Any Changes To Milestones
                      <textarea
                        rows={3}
                        value={progressForm.milestoneChanges}
                        onChange={(event) => setProgressForm((current) => ({
                          ...current,
                          milestoneChanges: event.target.value,
                        }))}
                      />
                    </label>

                    <div className="detail-block">
                      <div className="panel-header-row">
                        <h3>New Risks</h3>
                        <button type="button" className="secondary-btn" onClick={addRiskField}>Add New Risk</button>
                      </div>
                      {progressForm.newRisks.map((value, index) => (
                        <label key={`risk-${index}`}>
                          <textarea
                            rows={2}
                            value={value}
                            onChange={(event) => handleListFieldChange('newRisks', index, event.target.value)}
                          />
                        </label>
                      ))}
                    </div>

                    <label>
                      Decisions Needed
                      <textarea
                        rows={3}
                        value={progressForm.decisionsNeeded}
                        onChange={(event) => setProgressForm((current) => ({
                          ...current,
                          decisionsNeeded: event.target.value,
                        }))}
                      />
                    </label>

                    <label>
                      Help Needed
                      <textarea
                        rows={3}
                        value={progressForm.helpNeeded}
                        onChange={(event) => setProgressForm((current) => ({
                          ...current,
                          helpNeeded: event.target.value,
                        }))}
                      />
                    </label>

                    <label>
                      Notes
                      <textarea
                        rows={4}
                        value={progressForm.notes}
                        onChange={(event) => setProgressForm((current) => ({
                          ...current,
                          notes: event.target.value,
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
            </aside>
          </div>,
          document.body,
        )
      : null;

  return (
    <AppFrame
      title={initiative.title}
      description={initiative.description || 'Operational initiative detail and linked major project rollup.'}
      detailLabel={(
        <span className="project-title-with-status">
          <span className={`status-indicator-dot ${overallTone}`} aria-hidden="true" />
          <span>{initiative.id}</span>
        </span>
      )}
      topNavActions={(
        <div className="project-header-meta">
          <div className="project-header-meta-item">
            <div className="project-header-meta-label">Year</div>
            <div className="project-header-meta-value">{initiative.year || '-'}</div>
          </div>
          <div className="project-header-meta-item">
            <div className="project-header-meta-label">Owners</div>
            <div className="project-header-meta-value">{owners.length ? owners.join(', ') : '-'}</div>
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
        <div className="project-tab-row" role="tablist" aria-label="Initiative detail tabs">
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
              <div className="muted">Core initiative details, alignment, ownership, and rolled-up budget</div>
            </div>
            <div className="project-info-card-row">
              <article className="card project-info-card">
                <div className="label">Initiative Overview</div>
                <div className="value">{initiative.description || '-'}</div>
              </article>
              <article className="card project-info-card">
                <div className="label">Strategic Priority</div>
                <div className="value">{initiative.strategicPriorityTitle || '-'}</div>
              </article>
              <article className="card project-info-card">
                <div className="label">Priority Period</div>
                <div className="value">{initiative.strategicPriorityPeriodLabel || '-'}</div>
              </article>
              <article className="card project-info-card">
                <div className="label">Year</div>
                <div className="value">{initiative.year || '-'}</div>
              </article>
              <article className="card project-info-card">
                <div className="label">Rolled-Up Budget</div>
                <div className="value">{formatMillions(costTrackingTotals.budget)}</div>
              </article>
              <article className="card project-info-card">
                <div className="label">Linked Major Projects</div>
                <div className="value">{relatedProjects.length}</div>
              </article>
            </div>
          </>
        ) : null}

        {activeTab === 'outcomes' ? (
          <>
            <div className="panel-header-row">
              <div className="muted">Expected delivery and business results for this initiative</div>
            </div>
            <div className="detail-block">
              <ul className="ppm-inline-list">
                {initiativeOutcomes.map((outcome) => (
                  <li key={outcome}>{outcome}</li>
                ))}
              </ul>
            </div>
          </>
        ) : null}

        {activeTab === 'team' ? (
          <>
            <div className="panel-header-row">
              <div className="muted">Initiative participants and major project contacts</div>
            </div>
            <div className="detail-block">
              <ul className="ppm-inline-list">
                {initiativeTeam.map((member) => (
                  <li key={member}>{member}</li>
                ))}
              </ul>
            </div>
          </>
        ) : null}

        {activeTab === 'documents' ? (
          <>
            <div className="panel-header-row">
              <div className="muted">Initiative and linked major-project documentation</div>
            </div>
            <div className="table-wrap">
              <table className="simple-table">
                <thead>
                  <tr>
                    <th>Document Type</th>
                    <th>File Name</th>
                    <th>Comments</th>
                    <th>Version</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {initiativeDocuments.map((document) => (
                    <tr key={`${document.id}-${document.fileName}`}>
                      <td>{document.category}</td>
                      <td>{document.fileName}</td>
                      <td>{document.comments || '-'}</td>
                      <td>v{document.versionNumber}</td>
                      <td>{document.sourceProjectName || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </section>

      <section className="panel">
        <div className="panel-header-row">
          <h2><Icon name="review" />Monthly Updates</h2>
          <div className="muted">Monthly planning and execution snapshot for the initiative</div>
          <button type="button" className="secondary-btn" onClick={openProgressUpdate}>
            Progress Update
          </button>
        </div>

        <div className="table-wrap">
          <table className="simple-table weekly-update-table">
            <thead>
              <tr>
                <th>Month Of</th>
                <th>Plan</th>
                <th>Progress</th>
                <th>Overall Status</th>
                <th>Source</th>
                <th>Export</th>
              </tr>
            </thead>
            <tbody>
              {monthlyUpdates.map((update) => (
                <tr key={`${update.weekStart}-${update.sourceProjectName}`}>
                  <td className="weekly-update-week-cell">{update.monthLabel || formatMonthYearLabel(String(update.weekStart).slice(0, 7))}</td>
                  <td>{update.plan || 'No monthly plan defined yet.'}</td>
                  <td>{update.progress || 'Monthly progress has not been recorded yet.'}</td>
                  <td>{update.overallStatus || 'Overall status has not been recorded yet.'}</td>
                  <td>{update.sourceProjectName || '-'}</td>
                  <td>
                    <button
                      type="button"
                      className="primary-btn primary-btn-compact"
                      onClick={() => void exportInitiativeSlide(update.sourceUpdate ?? null)}
                    >
                      Export Slide
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {overlay}

      <section className="panel">
        <div className="panel-header-row">
          <h2><Icon name="dashboard" />Milestones</h2>
          <div className="muted">{milestoneRows.length} milestone(s)</div>
        </div>

        <div className="table-wrap">
          <table className="simple-table">
            <thead>
              <tr>
                <th>Milestone title</th>
                <th>Description</th>
                <th>Planned Date</th>
                <th>Actual Date</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {milestoneRows.map((milestone) => (
                <tr key={milestone.id}>
                  <td>{milestone.title}</td>
                  <td>{milestone.description}</td>
                  <td>{milestone.plannedDate}</td>
                  <td>{milestone.actualDate}</td>
                  <td>{milestone.projectName || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header-row">
          <h2><Icon name="risk" />ERM Risks</h2>
          <div className="muted">{sortedInitiativeRisks.length} linked risk(s)</div>
        </div>

        {initiativeRisksLoading ? <p>Loading initiative risks...</p> : null}
        {initiativeRisksError ? <p className="error">{initiativeRisksError}</p> : null}

        {!initiativeRisksLoading && !initiativeRisksError ? (
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
                {sortedInitiativeRisks.map((risk) => (
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
                {sortedInitiativeRisks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="muted">No ERM risks are linked to this initiative yet.</td>
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
                <th>Breakdown of Initiative Cost Items</th>
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
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header-row">
          <h2><Icon name="portfolio" />Linked Major Projects</h2>
          <div className="muted">{relatedProjects.length} project(s)</div>
        </div>

        <div className="table-wrap">
          <table className="simple-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Scope</th>
                <th>Schedule</th>
                <th>Cost</th>
                <th>Quality</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {relatedProjects.map((project) => {
                const health = getProjectHealth(project);
                const overallProjectTone = getOverallHealthTone(health);

                return (
                  <tr key={project.id}>
                    <td>
                      <Link className="table-link" to={`/ppm/projects/${project.id}`}>
                        {project.name}
                      </Link>
                    </td>
                    <td>{project.businessOwner || '-'}</td>
                    <td>{renderHealthCell(overallProjectTone)}</td>
                    <td>{renderHealthCell(health.scope)}</td>
                    <td>{renderHealthCell(health.schedule)}</td>
                    <td>{renderHealthCell(health.cost)}</td>
                    <td>{renderHealthCell(health.quality)}</td>
                    <td>{renderHealthCell(health.risk)}</td>
                  </tr>
                );
              })}
              {!relatedProjects.length ? (
                <tr>
                  <td colSpan={8} className="muted">No major projects are linked to this initiative yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </AppFrame>
  );
}
