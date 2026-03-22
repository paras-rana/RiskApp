export const EXECUTIVE_SPONSOR_OPTIONS = [
  'Sarah Chen',
  'Michael Torres',
  'Danielle Brooks',
];

export const TARGET_START_QUARTER_OPTIONS = [
  'Q2 2026',
  'Q3 2026',
  'Q4 2026',
  'Q1 2027',
];

export const PROJECT_CATEGORY_OPTIONS = [
  'Safety',
  'Growth',
  'Efficiency',
  'Compliance',
];

export const CURRENT_PROJECT_CLASSIFICATION_OPTIONS = [
  'Major project',
  'Operations Initiative',
];

export const SEEDED_STRATEGIC_PRIORITY_PERIODS = [
  {
    id: 'SPP-2025',
    label: 'FY2025 Strategic Priorities',
    cadenceLabel: 'Annual cycle',
    effectiveStart: '2025-01-01',
    status: 'archived',
    priorities: [
      {
        id: 'SP-101',
        name: 'Expand ambulatory access',
        description: 'Increase visit capacity and improve referral-to-appointment conversion.',
      },
      {
        id: 'SP-102',
        name: 'Stabilize labor productivity',
        description: 'Improve staffing efficiency and reduce contract labor dependence.',
      },
      {
        id: 'SP-103',
        name: 'Improve cybersecurity posture',
        description: 'Strengthen access controls, resilience testing, and incident preparedness.',
      },
    ],
  },
  {
    id: 'SPP-2026',
    label: 'FY2026 Strategic Priorities',
    cadenceLabel: 'Annual cycle',
    effectiveStart: '2026-01-01',
    status: 'active',
    priorities: [
      {
        id: 'SP-201',
        name: 'Improve patient access',
        description: 'Reduce scheduling friction, speed intake, and improve self-service access to care.',
      },
      {
        id: 'SP-202',
        name: 'Strengthen operating margin',
        description: 'Target cost discipline, productivity gains, and measurable financial improvement.',
      },
      {
        id: 'SP-203',
        name: 'Modernize core platforms',
        description: 'Upgrade foundational technology, resilience, and enterprise data capabilities.',
      },
      {
        id: 'SP-204',
        name: 'Reduce regulatory risk',
        description: 'Advance compliance readiness, auditability, and policy adherence across operations.',
      },
    ],
  },
];
