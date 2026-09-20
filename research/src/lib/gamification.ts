// ORBITA Gamification Engine & Progression System

export interface BadgeDefinition {
  id: string;
  name: string;
  category: 'mission' | 'safety' | 'autonomy' | 'research';
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt?: string;
}

export interface SkillNode {
  id: string;
  title: string;
  category: 'orbital' | 'guidance' | 'risk' | 'swarm';
  description: string;
  cost: number;
  unlocked: boolean;
  requires?: string[];
  perk: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  xpReward: number;
  completed: boolean;
}

export interface CareerProfile {
  xp: number;
  level: number;
  rankTitle: string;
  streakDays: number;
  missionsCompleted: number;
  simulationsRun: number;
  conjunctionsMitigated: number;
  experimentsBenchmarked: number;
  unlockedBadges: string[];
  unlockedSkills: string[];
  challenges: DailyChallenge[];
}

export const RANKS = [
  { level: 1, title: 'Cadet Researcher', minXp: 0 },
  { level: 2, title: 'Orbital Specialist', minXp: 250 },
  { level: 3, title: 'Guidance & Navigation Engineer', minXp: 600 },
  { level: 4, title: 'Autonomous Mission Planner', minXp: 1200 },
  { level: 5, title: 'Flight Director', minXp: 2000 },
  { level: 6, title: 'Chief Astrodynamics Officer', minXp: 3500 },
];

export const INITIAL_BADGES: BadgeDefinition[] = [
  {
    id: 'badge-first-inspection',
    name: 'First Light Inspection',
    category: 'mission',
    description: 'Execute your first autonomous proximity inspection on an active satellite asset.',
    icon: '🛰️',
    xpReward: 100,
  },
  {
    id: 'badge-zero-risk',
    name: 'Zero-Collision Guardian',
    category: 'safety',
    description: 'Mitigate a critical orbital conjunction with residual risk under 0.01%.',
    icon: '🛡️',
    xpReward: 150,
  },
  {
    id: 'badge-fuel-conservation',
    name: 'Delta-V Economist',
    category: 'autonomy',
    description: 'Complete a non-cooperative rendezvous while conserving >40% allocated propulsive mass.',
    icon: '⚡',
    xpReward: 120,
  },
  {
    id: 'badge-swarm-coordinator',
    name: 'Swarm Conductor',
    category: 'research',
    description: 'Benchmark a multi-agent reinforcement learning policy across 500+ Monte Carlo runs.',
    icon: '🌌',
    xpReward: 200,
  },
  {
    id: 'badge-deep-space',
    name: 'Orbital Pioneer',
    category: 'mission',
    description: 'Complete 10 autonomous mission phases across LEO, MEO, and GEO regimes.',
    icon: '🚀',
    xpReward: 300,
  },
];

export const INITIAL_SKILLS: SkillNode[] = [
  // Orbital Mechanics
  {
    id: 'skill-astrodynamics',
    title: 'Keplerian Ephemeris Engine',
    category: 'orbital',
    description: 'Enables high-precision J2 perturbation modeling and atmospheric drag compensation.',
    cost: 150,
    unlocked: true,
    perk: '+15% trajectory accuracy in LEO',
  },
  {
    id: 'skill-lambert-targeting',
    title: 'Lambert Orbital Targeting',
    category: 'orbital',
    description: 'Automates multi-impulse orbital transfers for minimum-time rendezvous.',
    cost: 300,
    unlocked: false,
    requires: ['skill-astrodynamics'],
    perk: '-20% fuel required for phased rendezvous',
  },
  // Guidance & Navigation
  {
    id: 'skill-rpo-guidance',
    title: 'Autonomous RPO Glideslope',
    category: 'guidance',
    description: 'Directs non-line-of-sight visual navigation during close-proximity inspection.',
    cost: 200,
    unlocked: true,
    perk: 'Unlocks CW-Hill state-space targeting',
  },
  {
    id: 'skill-debris-grapple',
    title: 'Uncooperative Grapple Dynamics',
    category: 'guidance',
    description: 'Robotic end-effector contact dynamics for tumbling space debris capture.',
    cost: 450,
    unlocked: false,
    requires: ['skill-rpo-guidance'],
    perk: '+35% capture stabilization speed',
  },
  // Risk & Safety
  {
    id: 'skill-covariance-analysis',
    title: 'Covariance Ellipsoid Slicing',
    category: 'risk',
    description: 'Calculates real-time 3D collision probability volumes for rapid risk screening.',
    cost: 250,
    unlocked: true,
    perk: 'Real-time Monte Carlo risk calculations',
  },
  {
    id: 'skill-emergency-caging',
    title: 'Failsafe Autonomous Safe-Mode',
    category: 'risk',
    description: 'Instant passive drift injection if guidance confidence falls below 95%.',
    cost: 400,
    unlocked: false,
    requires: ['skill-covariance-analysis'],
    perk: 'Automatic abort prevents vehicle loss',
  },
  // Swarm & AI
  {
    id: 'skill-marl-coordination',
    title: 'Distributed Consensus Protocol',
    category: 'swarm',
    description: 'Enables decentralized task allocation across multi-satellite servicing swarms.',
    cost: 500,
    unlocked: false,
    requires: ['skill-lambert-targeting', 'skill-debris-grapple'],
    perk: 'Enables 3+ autonomous agents in batch runs',
  },
];

export const INITIAL_CHALLENGES: DailyChallenge[] = [
  {
    id: 'ch-1',
    title: 'Zero-Collision Sweep',
    description: 'Mitigate 2 high-risk orbital conjunctions in the Risk Engine.',
    target: 2,
    progress: 1,
    xpReward: 80,
    completed: false,
  },
  {
    id: 'ch-2',
    title: 'Monte Carlo Benchmark',
    description: 'Run a 500-episode batch benchmark with PPO or NMPC policy.',
    target: 1,
    progress: 0,
    xpReward: 100,
    completed: false,
  },
  {
    id: 'ch-3',
    title: 'Telemetry Inspection',
    description: 'Inspect SAT-102 and evaluate solar array degradation telemetry.',
    target: 1,
    progress: 1,
    xpReward: 60,
    completed: true,
  },
];

export function getRankForXp(xp: number) {
  let currentRank = RANKS[0];
  let nextRank = RANKS[1];

  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].minXp) {
      currentRank = RANKS[i];
      nextRank = RANKS[i + 1] || { level: currentRank.level + 1, title: 'Master Flight Director', minXp: currentRank.minXp * 1.5 };
    }
  }

  const xpIntoLevel = xp - currentRank.minXp;
  const xpNeeded = nextRank.minXp - currentRank.minXp;
  const progressPercent = Math.min(100, Math.max(0, (xpIntoLevel / xpNeeded) * 100));

  return { currentRank, nextRank, progressPercent, xpIntoLevel, xpNeeded };
}
