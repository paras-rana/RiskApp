import { createContext, useContext, useMemo, useState } from 'react';
import {
  CURRENT_PROJECT_CLASSIFICATION_OPTIONS,
  PROJECT_CATEGORY_OPTIONS,
  SEEDED_STRATEGIC_PRIORITY_PERIODS,
} from './ppmConfig';

const PROJECTS_STORAGE_KEY = 'riskapp.ppm.projects';
const PRIORITIES_STORAGE_KEY = 'riskapp.ppm.priorities';

const DOCUMENT_CATEGORY_CONFIG = [
  {
    key: 'costEstimateBreakdownFiles',
    category: 'Cost Estimate Breakdown',
  },
  {
    key: 'scopeStatementFiles',
    category: 'Scope Statement',
  },
];

const SEEDED_PROJECTS = [
  {
    id: 'PRJ-201',
    name: 'Digital Front Door Refresh',
    executiveSponsor: 'Sarah Chen',
    businessOwner: 'Alicia Gomez',
    estimatedCost: '$4.8M',
    targetStartQuarter: 'Q2 2026',
    category: 'Growth',
    currentProjectClassification: 'Major project',
    strategicAlignment: 'Improve patient access',
    strategicPriorityPeriodId: 'SPP-2026',
    strategicPriorityPeriodLabel: 'FY2026 Strategic Priorities',
    summary: 'Modernize patient scheduling, intake, and app engagement.',
    costEstimateBreakdownFiles: ['digital-front-door-cost-estimate.xlsx'],
    scopeStatementFiles: ['digital-front-door-scope.pdf'],
    teamMembers: ['Alicia Gomez', 'R. Chen', 'M. Brooks'],
    expectedOutcomes: [
      'Improve self-service scheduling adoption',
      'Reduce call center handoffs',
      'Increase digital intake completion rate',
    ],
    milestones: [
      { id: 'MS-201-1', name: 'Discovery and requirements', quarter: 'Q2 2026' },
      { id: 'MS-201-2', name: 'Build and integration', quarter: 'Q3 2026' },
      { id: 'MS-201-3', name: 'Pilot launch', quarter: 'Q4 2026' },
    ],
    stage: 'current',
    status: 'active',
    submittedAt: '2026-02-02',
    reviewNotes: 'Execution approved with milestone tracking every two weeks.',
  },
  {
    id: 'PRJ-214',
    name: 'Clinical Workforce Optimization',
    executiveSponsor: 'Michael Torres',
    businessOwner: 'M. Patel',
    estimatedCost: '$3.2M',
    targetStartQuarter: 'Q3 2026',
    category: 'Efficiency',
    currentProjectClassification: 'Operations Initiative',
    strategicAlignment: 'Strengthen operating margin',
    strategicPriorityPeriodId: 'SPP-2026',
    strategicPriorityPeriodLabel: 'FY2026 Strategic Priorities',
    summary: 'Deploy staffing analytics and schedule redesign across ambulatory sites.',
    costEstimateBreakdownFiles: ['workforce-optimization-estimate.xlsx'],
    scopeStatementFiles: ['workforce-optimization-scope.pdf'],
    teamMembers: ['M. Patel', 'S. Alvarez', 'K. Jordan'],
    expectedOutcomes: [
      'Reduce premium labor utilization',
      'Improve staffing forecast accuracy',
    ],
    milestones: [
      { id: 'MS-214-1', name: 'Baseline current staffing model', quarter: 'Q2 2026' },
      { id: 'MS-214-2', name: 'Analytics rollout', quarter: 'Q3 2026' },
      { id: 'MS-214-3', name: 'Site-by-site adoption', quarter: 'Q4 2026' },
    ],
    stage: 'current',
    status: 'active',
    submittedAt: '2026-02-14',
    reviewNotes: 'Active rollout across priority ambulatory sites with weekly staffing reviews.',
  },
  {
    id: 'PRJ-223',
    name: 'Revenue Cycle AI Triage',
    executiveSponsor: 'Danielle Brooks',
    businessOwner: 'Jordan Lee',
    estimatedCost: '$2.1M',
    targetStartQuarter: 'Q4 2026',
    category: 'Growth',
    currentProjectClassification: 'Major project',
    strategicAlignment: 'Strengthen operating margin',
    strategicPriorityPeriodId: 'SPP-2026',
    strategicPriorityPeriodLabel: 'FY2026 Strategic Priorities',
    summary: 'Automate claim exception routing and denial-prevention workflows.',
    costEstimateBreakdownFiles: ['rev-cycle-ai-estimate.xlsx'],
    scopeStatementFiles: ['rev-cycle-ai-scope.pdf'],
    teamMembers: ['Jordan Lee', 'T. Morgan', 'N. Davis'],
    expectedOutcomes: [
      'Lower denial volume',
      'Accelerate exception triage',
      'Improve collector productivity',
    ],
    milestones: [
      { id: 'MS-223-1', name: 'Vendor selection', quarter: 'Q2 2026' },
      { id: 'MS-223-2', name: 'Workflow configuration', quarter: 'Q3 2026' },
      { id: 'MS-223-3', name: 'Production deployment', quarter: 'Q4 2026' },
    ],
    stage: 'current',
    status: 'active',
    submittedAt: '2026-03-01',
    reviewNotes: 'Execution underway with phased automation and denial workqueue cutover.',
  },
  {
    id: 'PRJ-230',
    name: 'Supply Chain Visibility Hub',
    executiveSponsor: 'Michael Torres',
    businessOwner: 'Rina Shah',
    estimatedCost: '$1.6M',
    targetStartQuarter: 'Q1 2027',
    category: 'Efficiency',
    currentProjectClassification: '',
    strategicAlignment: 'Strengthen operating margin',
    strategicPriorityPeriodId: 'SPP-2026',
    strategicPriorityPeriodLabel: 'FY2026 Strategic Priorities',
    summary: 'Unify sourcing, inventory, and shortage alerting into one operating view.',
    costEstimateBreakdownFiles: ['supply-chain-hub-estimate.xlsx'],
    scopeStatementFiles: ['supply-chain-hub-scope.pdf'],
    teamMembers: ['Rina Shah', 'P. Wallace', 'E. Rivera'],
    expectedOutcomes: [
      'Improve shortage visibility',
      'Shorten sourcing response times',
    ],
    milestones: [
      { id: 'MS-230-1', name: 'Source system mapping', quarter: 'Q2 2026' },
      { id: 'MS-230-2', name: 'Dashboard prototype', quarter: 'Q3 2026' },
      { id: 'MS-230-3', name: 'Operating launch', quarter: 'Q4 2026' },
    ],
    stage: 'submitted',
    status: 'pending_review',
    submittedAt: '2026-03-12',
    reviewNotes: '',
  },
  {
    id: 'PRJ-233',
    name: 'Cyber Resilience Uplift',
    executiveSponsor: 'Sarah Chen',
    businessOwner: 'Chris Nolan',
    estimatedCost: '$5.4M',
    targetStartQuarter: 'Q4 2026',
    category: 'Compliance',
    currentProjectClassification: '',
    strategicAlignment: 'Modernize core platforms',
    strategicPriorityPeriodId: 'SPP-2026',
    strategicPriorityPeriodLabel: 'FY2026 Strategic Priorities',
    summary: 'Expand privileged identity controls and recovery testing across core systems.',
    costEstimateBreakdownFiles: ['cyber-resilience-estimate.xlsx'],
    scopeStatementFiles: ['cyber-resilience-scope.pdf'],
    teamMembers: ['Chris Nolan', 'L. Turner', 'A. Kim'],
    expectedOutcomes: [
      'Improve recovery readiness',
      'Tighten privileged access governance',
      'Reduce control gaps',
    ],
    milestones: [
      { id: 'MS-233-1', name: 'Control design', quarter: 'Q2 2026' },
      { id: 'MS-233-2', name: 'Platform rollout', quarter: 'Q3 2026' },
      { id: 'MS-233-3', name: 'Recovery exercise', quarter: 'Q4 2026' },
    ],
    stage: 'submitted',
    status: 'pending_review',
    submittedAt: '2026-03-15',
    reviewNotes: '',
  },
];

function normalizeProject(project) {
  const category = PROJECT_CATEGORY_OPTIONS.includes(project.category)
    ? project.category
    : PROJECT_CATEGORY_OPTIONS[0];
  const currentProjectClassification =
    CURRENT_PROJECT_CLASSIFICATION_OPTIONS.includes(project.currentProjectClassification)
      ? project.currentProjectClassification
      : '';

  const documentVersions = Array.isArray(project.documentVersions)
    ? project.documentVersions.map((document, index) => ({
        id: document.id ?? `DOC-${project.id ?? 'NEW'}-${index + 1}`,
        category: document.category ?? 'Project Document',
        versionNumber: Number(document.versionNumber) || 1,
        fileName: document.fileName ?? '',
        comments: document.comments ?? '',
        uploadedAt: document.uploadedAt ?? project.submittedAt ?? '',
        isCurrent: document.isCurrent !== false,
      }))
    : DOCUMENT_CATEGORY_CONFIG.flatMap(({ key, category }) =>
        (Array.isArray(project[key]) ? project[key] : []).map((fileName, index) => ({
          id: `DOC-${project.id ?? 'NEW'}-${key}-${index + 1}`,
          category,
          versionNumber: 1,
          fileName,
          comments: 'Initial version',
          uploadedAt: project.submittedAt ?? '',
          isCurrent: true,
        })),
      );

  return {
    ...project,
    proposalId: project.proposalId ?? project.id ?? '',
    executiveSponsor: project.executiveSponsor ?? project.sponsor ?? '',
    businessOwner: project.businessOwner ?? project.owner ?? '',
    estimatedCost: project.estimatedCost ?? project.budget ?? '',
    targetStartQuarter: project.targetStartQuarter ?? project.targetQuarter ?? '',
    category,
    currentProjectClassification,
    strategicAlignment: project.strategicAlignment ?? '',
    projectPurpose: project.projectPurpose ?? project.summary ?? '',
    scopeStatement: project.scopeStatement ?? '',
    expectedStartMonth: project.expectedStartMonth ?? '',
    durationMonths: project.durationMonths ?? '',
    strategicPriorityPeriodId: project.strategicPriorityPeriodId ?? '',
    strategicPriorityPeriodLabel: project.strategicPriorityPeriodLabel ?? '',
    costEstimateBreakdownFiles: project.costEstimateBreakdownFiles ?? [],
    scopeStatementFiles: project.scopeStatementFiles ?? [],
    documentVersions,
    teamMembers: Array.isArray(project.teamMembers)
      ? project.teamMembers
      : String(project.teamMembers ?? '')
        .split('\n')
        .map((value) => value.trim())
        .filter(Boolean),
    expectedOutcomes: Array.isArray(project.expectedOutcomes)
      ? project.expectedOutcomes
      : String(project.expectedOutcomes ?? '')
        .split('\n')
        .map((value) => value.trim())
        .filter(Boolean),
    potentialRisks: Array.isArray(project.potentialRisks)
      ? project.potentialRisks
      : String(project.potentialRisks ?? '')
        .split('\n')
        .map((value) => value.trim())
        .filter(Boolean),
    assumptions: Array.isArray(project.assumptions)
      ? project.assumptions
      : String(project.assumptions ?? '')
        .split('\n')
        .map((value) => value.trim())
        .filter(Boolean),
    milestones: Array.isArray(project.milestones)
      ? project.milestones.map((milestone, index) => ({
          id: milestone.id ?? `MS-${project.id ?? 'NEW'}-${index + 1}`,
          name: milestone.name ?? '',
          quarter: milestone.quarter ?? '',
        }))
      : [],
    proposalStatus: project.stage === 'submitted'
      ? (project.proposalStatus ?? (project.status === 'wip' ? 'wip' : 'new_submission'))
      : '',
    weeklyUpdates: Array.isArray(project.weeklyUpdates)
      ? project.weeklyUpdates.map((entry) => ({
          weekStart: entry.weekStart ?? '',
          cadence: entry.cadence === 'monthly' ? 'monthly' : 'weekly',
          plan: entry.plan ?? '',
          progress: entry.progress ?? '',
          overallStatus: entry.overallStatus ?? '',
        }))
      : [],
  };
}

function mergeSeededProjectDefaults(project) {
  const seededProject = SEEDED_PROJECTS.find((candidate) => candidate.id === project.id);
  if (!seededProject) return normalizeProject(project);

  const nextProject = { ...project };

  if (seededProject.stage === 'current' && project.stage !== 'current') {
    nextProject.stage = seededProject.stage;
    nextProject.status = seededProject.status;
  }

  if (!project.currentProjectClassification && seededProject.currentProjectClassification) {
    nextProject.currentProjectClassification = seededProject.currentProjectClassification;
  }

  if (seededProject.executiveSponsor && project.executiveSponsor !== seededProject.executiveSponsor) {
    nextProject.executiveSponsor = seededProject.executiveSponsor;
  }

  if (!project.reviewNotes && seededProject.reviewNotes) {
    nextProject.reviewNotes = seededProject.reviewNotes;
  }

  return normalizeProject(nextProject);
}

function sortPriorityPeriods(periods) {
  return [...periods].sort((left, right) => {
    if (left.status === 'active' && right.status !== 'active') return -1;
    if (left.status !== 'active' && right.status === 'active') return 1;

    return String(right.effectiveStart ?? '').localeCompare(String(left.effectiveStart ?? ''));
  });
}

function normalizePriorityPeriod(period, index = 0) {
  return {
    id: period.id ?? `SPP-${Date.now()}-${index + 1}`,
    label: period.label ?? `Priority Period ${index + 1}`,
    cadenceLabel: period.cadenceLabel ?? 'Periodic review',
    effectiveStart: period.effectiveStart ?? '',
    status: period.status === 'active' ? 'active' : 'archived',
    priorities: Array.isArray(period.priorities)
      ? period.priorities.map((priority, priorityIndex) => ({
          id: priority.id ?? `SP-${Date.now()}-${index + 1}-${priorityIndex + 1}`,
          name: priority.name ?? '',
          description: priority.description ?? '',
        }))
      : [],
  };
}

function readStoredProjects() {
  const raw = window.localStorage.getItem(PROJECTS_STORAGE_KEY);
  if (!raw) return SEEDED_PROJECTS;

  try {
    return JSON.parse(raw).map(mergeSeededProjectDefaults);
  } catch {
    window.localStorage.removeItem(PROJECTS_STORAGE_KEY);
    return SEEDED_PROJECTS;
  }
}

function readStoredPriorities() {
  const raw = window.localStorage.getItem(PRIORITIES_STORAGE_KEY);
  if (!raw) return sortPriorityPeriods(SEEDED_STRATEGIC_PRIORITY_PERIODS);

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((item) => Array.isArray(item.priorities))) {
      return sortPriorityPeriods(parsed.map(normalizePriorityPeriod));
    }

    if (Array.isArray(parsed)) {
      return [
        {
          id: 'SPP-LEGACY',
          label: 'Imported Strategic Priorities',
          cadenceLabel: 'Legacy set',
          effectiveStart: '2026-01-01',
          status: 'active',
          priorities: parsed.map((priority, index) => ({
            id: priority.id ?? `SP-LEGACY-${index + 1}`,
            name: priority.name ?? '',
            description: priority.description ?? '',
          })),
        },
      ];
    }

    return SEEDED_STRATEGIC_PRIORITY_PERIODS;
  } catch {
    window.localStorage.removeItem(PRIORITIES_STORAGE_KEY);
    return SEEDED_STRATEGIC_PRIORITY_PERIODS;
  }
}

const PpmProjectsContext = createContext(null);

export function PpmProjectsProvider({ children }) {
  const [projects, setProjects] = useState(() => readStoredProjects());
  const [strategicPriorityPeriods, setStrategicPriorityPeriods] = useState(() => readStoredPriorities());

  function persist(nextProjects) {
    setProjects(nextProjects);
    window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(nextProjects));
  }

  function persistPriorities(nextPriorities) {
    const normalized = sortPriorityPeriods(nextPriorities.map(normalizePriorityPeriod));
    setStrategicPriorityPeriods(normalized);
    window.localStorage.setItem(PRIORITIES_STORAGE_KEY, JSON.stringify(normalized));
  }

  function submitProject(project) {
    const proposalId = `PRJ-${Math.floor(Date.now() / 1000)}`;
    const nextProject = {
      ...project,
      proposalId,
      currentProjectClassification: '',
      strategicPriorityPeriodId:
        project.strategicPriorityPeriodId ?? activeStrategicPriorityPeriod?.id ?? '',
      strategicPriorityPeriodLabel:
        project.strategicPriorityPeriodLabel ?? activeStrategicPriorityPeriod?.label ?? '',
      id: proposalId,
      stage: 'submitted',
      status: 'pending_review',
      proposalStatus: 'new_submission',
      submittedAt: new Date().toISOString().slice(0, 10),
      reviewNotes: '',
    };

    persist([nextProject, ...projects]);
    return nextProject;
  }

  function addStrategicPriorityPeriod(period) {
    const nextPeriods = strategicPriorityPeriods.map((existingPeriod) => ({
      ...existingPeriod,
      status: 'archived',
    }));

    const nextPeriod = {
      id: `SPP-${Math.floor(Date.now() / 1000)}`,
      ...period,
      status: 'active',
      priorities: [],
    };

    persistPriorities([nextPeriod, ...nextPeriods]);
    return nextPeriod;
  }

  function addStrategicPriority(periodId, priority) {
    const nextPriority = {
      id: `SP-${Math.floor(Date.now() / 1000)}`,
      ...priority,
    };

    persistPriorities(
      strategicPriorityPeriods.map((period) =>
        period.id === periodId
          ? {
              ...period,
              priorities: [nextPriority, ...period.priorities],
            }
          : period,
      ),
    );
    return nextPriority;
  }

  function activateStrategicPriorityPeriod(periodId) {
    persistPriorities(
      strategicPriorityPeriods.map((period) => ({
        ...period,
        status: period.id === periodId ? 'active' : 'archived',
      })),
    );
  }

  function reviewProjectProposal(
    projectId,
    decision,
    reviewNotes = '',
    currentProjectClassification = '',
  ) {
    const normalizedClassification =
      CURRENT_PROJECT_CLASSIFICATION_OPTIONS.includes(currentProjectClassification)
        ? currentProjectClassification
        : '';

    persist(
      projects.map((project) => {
        if (project.id !== projectId) return project;

        if (decision === 'approve') {
          return {
            ...project,
            stage: 'current',
            status: 'active',
            proposalStatus: '',
            currentProjectClassification:
              normalizedClassification || project.currentProjectClassification || '',
            reviewNotes: reviewNotes || project.reviewNotes,
          };
        }

        if (decision === 'deny') {
          return {
            ...project,
            stage: 'archived',
            status: 'denied',
            proposalStatus: '',
            reviewNotes: reviewNotes || project.reviewNotes,
          };
        }

        if (decision === 'hold') {
          return {
            ...project,
            stage: 'future',
            status: 'planned',
            proposalStatus: '',
            reviewNotes: reviewNotes || project.reviewNotes,
          };
        }

        return {
          ...project,
          stage: 'submitted',
          status: 'wip',
          proposalStatus: 'wip',
          reviewNotes: reviewNotes || project.reviewNotes,
        };
      }),
    );
  }

  function updateFutureStatus(projectId, nextStatus, reviewNotes = '', currentProjectClassification = '') {
    const normalizedClassification =
      CURRENT_PROJECT_CLASSIFICATION_OPTIONS.includes(currentProjectClassification)
        ? currentProjectClassification
        : '';

    persist(
      projects.map((project) => {
        if (project.id !== projectId) return project;

        if (nextStatus === 'approved') {
          return {
            ...project,
            stage: 'current',
            status: 'active',
            currentProjectClassification:
              normalizedClassification || project.currentProjectClassification || '',
            reviewNotes: reviewNotes || project.reviewNotes,
          };
        }

        if (nextStatus === 'denied') {
          return {
            ...project,
            stage: 'archived',
            status: 'denied',
            reviewNotes: reviewNotes || project.reviewNotes,
          };
        }

        return {
          ...project,
          stage: 'future',
          status: 'hold',
          reviewNotes: reviewNotes || project.reviewNotes,
        };
      }),
    );
  }

  function saveWeeklyUpdate(projectId, weeklyUpdate) {
    persist(
      projects.map((project) => {
        if (project.id !== projectId) return project;

        const existingEntries = Array.isArray(project.weeklyUpdates) ? project.weeklyUpdates : [];
        const nextEntries = existingEntries.some((entry) => entry.weekStart === weeklyUpdate.weekStart)
          ? existingEntries.map((entry) => (
              entry.weekStart === weeklyUpdate.weekStart ? { ...entry, ...weeklyUpdate } : entry
            ))
          : [...existingEntries, weeklyUpdate];

        return {
          ...project,
          weeklyUpdates: nextEntries.sort((left, right) => left.weekStart.localeCompare(right.weekStart)),
        };
      }),
    );
  }

  function saveTeamMembers(projectId, teamMembers) {
    persist(
      projects.map((project) => (
        project.id === projectId
          ? {
              ...project,
              teamMembers: Array.isArray(teamMembers)
                ? teamMembers.map((member) => String(member).trim()).filter(Boolean)
                : [],
            }
          : project
      )),
    );
  }

  function saveDocumentVersion(projectId, documentInput) {
    persist(
      projects.map((project) => {
        if (project.id !== projectId) return project;

        const existingDocuments = Array.isArray(project.documentVersions) ? project.documentVersions : [];
        const currentDocuments = existingDocuments.map((document) => (
          document.category === documentInput.category
            ? { ...document, isCurrent: false }
            : document
        ));
        const highestVersion = currentDocuments
          .filter((document) => document.category === documentInput.category)
          .reduce((max, document) => Math.max(max, Number(document.versionNumber) || 0), 0);

        const nextDocument = {
          id: `DOC-${projectId}-${Date.now()}`,
          category: documentInput.category,
          versionNumber: highestVersion + 1,
          fileName: documentInput.fileName,
          comments: documentInput.comments ?? '',
          uploadedAt: new Date().toISOString().slice(0, 10),
          isCurrent: true,
        };

        const nextDocuments = [...currentDocuments, nextDocument];

        return {
          ...project,
          documentVersions: nextDocuments,
          costEstimateBreakdownFiles: nextDocuments
            .filter((document) => document.category === 'Cost Estimate Breakdown' && document.isCurrent)
            .map((document) => document.fileName),
          scopeStatementFiles: nextDocuments
            .filter((document) => document.category === 'Scope Statement' && document.isCurrent)
            .map((document) => document.fileName),
        };
      }),
    );
  }

  const activeStrategicPriorityPeriod = useMemo(
    () => strategicPriorityPeriods.find((period) => period.status === 'active')
      ?? strategicPriorityPeriods[0]
      ?? null,
    [strategicPriorityPeriods],
  );

  const value = useMemo(
    () => ({
      projects,
      getProjectById: (projectId) => projects.find((project) => project.id === projectId) ?? null,
      submittedProjects: projects.filter((project) => project.stage === 'submitted'),
      futureProjects: projects.filter(
        (project) => project.stage === 'future' && project.status !== 'denied',
      ),
      archivedProposals: projects.filter(
        (project) => project.stage === 'archived' || project.status === 'denied',
      ),
      currentProjects: projects.filter((project) => project.stage === 'current'),
      strategicPriorityPeriods,
      activeStrategicPriorityPeriod,
      strategicPriorities: activeStrategicPriorityPeriod?.priorities ?? [],
      submitProject,
      reviewProjectProposal,
      updateFutureStatus,
      saveWeeklyUpdate,
      saveTeamMembers,
      saveDocumentVersion,
      addStrategicPriorityPeriod,
      addStrategicPriority,
      activateStrategicPriorityPeriod,
    }),
    [projects, strategicPriorityPeriods, activeStrategicPriorityPeriod],
  );

  return (
    <PpmProjectsContext.Provider value={value}>{children}</PpmProjectsContext.Provider>
  );
}

export function usePpmProjects() {
  const context = useContext(PpmProjectsContext);
  if (!context) {
    throw new Error('usePpmProjects must be used within PpmProjectsProvider');
  }

  return context;
}
