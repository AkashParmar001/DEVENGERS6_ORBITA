// src/lib/prisma.ts
// Mock Prisma client with sample data for development
export const prisma = {
  mission: {
    findMany: async () => [
      {
        id: 'msn-001',
        name: 'SAT-102 Solar Panel Inspection',
        description: 'Inspect solar panel degradation on SAT-102',
        status: 'completed',
        progress: 100,
        risk: 0.02,
        fuel: 78,
        eta: '00:00',
        xp: 245,
        steps: ['Approach', 'Orbit Insertion', 'Visual Scan', 'Data Collection', 'Return'],
        currentStep: 5,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        updatedAt: new Date(),
      },
      {
        id: 'msn-002',
        name: 'Debris Avoidance CR-7',
        description: 'Capture and dispose of debris cluster CR-7',
        status: 'active',
        progress: 68,
        risk: 0.15,
        fuel: 54,
        eta: '02:34',
        xp: 120,
        steps: ['Locate', 'Approach', 'Capture', 'Deorbit', 'Dispose'],
        currentStep: 3,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        updatedAt: new Date(),
      },
      {
        id: 'msn-003',
        name: 'LEO Constellation Mapping',
        description: 'Map and catalog active satellites in LEO',
        status: 'planned',
        progress: 0,
        risk: 0.08,
        fuel: 100,
        eta: '--:--',
        xp: 0,
        steps: ['Initialize', 'Scan', 'Catalog', 'Verify', 'Report'],
        currentStep: 0,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        updatedAt: new Date(),
      },
    ],
    create: async (data) => {
      // Simulate creating a new mission
      const newMission = {
        id: `msn-${Date.now()}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return newMission;
    },
  },
  scenario: {
    findMany: async () => [
      {
        id: 'scn-001',
        name: 'LEO Baseline',
        seed: 42,
        spaceObjects: [
          { id: 'sat-102', name: 'SAT-102', type: 'satellite', orbitalElements: { /* ... */ } },
          { id: 'deb-001', name: 'DEB-001', type: 'debris', orbitalElements: { /* ... */ } },
        ],
        robotAgents: [
          { id: 'orb-003', name: 'ORBITAL-03', capabilities: ['inspection', 'manipulation'] },
        ],
        environmentConfig: { spaceWeather: { /* ... */ } },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    create: async (data) => {
      const newScenario = {
        id: `scn-${Date.now()}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return newScenario;
    },
  },
} as any;