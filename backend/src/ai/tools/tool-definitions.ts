import { AIToolDefinition } from '../providers/ai-provider';

export const ORBITA_TOOLS: AIToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'get_satellite_state',
      description:
        'Retrieve the current orbital state (position, velocity, altitude) of a satellite by name or ID from the database.',
      parameters: {
        type: 'object',
        properties: {
          identifier: {
            type: 'string',
            description: 'Satellite name (e.g. "SAT-102") or space_object UUID',
          },
        },
        required: ['identifier'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_robot_state',
      description:
        'Retrieve the current orbital state and capabilities of a robot by name or ID.',
      parameters: {
        type: 'object',
        properties: {
          identifier: {
            type: 'string',
            description: 'Robot name (e.g. "ORBITAL-03") or space_object UUID',
          },
        },
        required: ['identifier'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_nearby_objects',
      description:
        'Find space objects within a given distance of a reference object.',
      parameters: {
        type: 'object',
        properties: {
          reference_id: {
            type: 'string',
            description: 'UUID of the reference space object',
          },
          max_distance_km: {
            type: 'number',
            description: 'Maximum distance in km (default 1000)',
            default: 1000,
          },
        },
        required: ['reference_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculate_trajectory',
      description:
        'Calculate a Hohmann transfer trajectory between two orbital states. Returns waypoints, delta-v, duration, and fuel estimate.',
      parameters: {
        type: 'object',
        properties: {
          robot_state: {
            type: 'object',
            description:
              'Robot orbital state {position_km: [x,y,z], velocity_kms: [vx,vy,vz]}',
            properties: {
              position_km: {
                type: 'array',
                items: { type: 'number' },
                minItems: 3,
                maxItems: 3,
              },
              velocity_kms: {
                type: 'array',
                items: { type: 'number' },
                minItems: 3,
                maxItems: 3,
              },
            },
            required: ['position_km', 'velocity_kms'],
          },
          target_state: {
            type: 'object',
            description:
              'Target orbital state {position_km: [x,y,z], velocity_kms: [vx,vy,vz]}',
            properties: {
              position_km: {
                type: 'array',
                items: { type: 'number' },
                minItems: 3,
                maxItems: 3,
              },
              velocity_kms: {
                type: 'array',
                items: { type: 'number' },
                minItems: 3,
                maxItems: 3,
              },
            },
            required: ['position_km', 'velocity_kms'],
          },
          max_delta_v_ms: {
            type: 'number',
            description: 'Maximum delta-v budget in m/s',
            default: 500,
          },
        },
        required: ['robot_state', 'target_state'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculate_delta_v',
      description:
        'Calculate the Hohmann transfer delta-v required to move from one orbital radius to another.',
      parameters: {
        type: 'object',
        properties: {
          from_radius_km: {
            type: 'number',
            description: 'Current orbital radius in km from Earth center',
          },
          to_radius_km: {
            type: 'number',
            description: 'Target orbital radius in km from Earth center',
          },
        },
        required: ['from_radius_km', 'to_radius_km'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculate_collision_risk',
      description:
        'Assess collision risk between two orbital objects over a time horizon.',
      parameters: {
        type: 'object',
        properties: {
          object_a: {
            type: 'object',
            properties: {
              position_km: {
                type: 'array',
                items: { type: 'number' },
                minItems: 3,
                maxItems: 3,
              },
              velocity_kms: {
                type: 'array',
                items: { type: 'number' },
                minItems: 3,
                maxItems: 3,
              },
            },
            required: ['position_km', 'velocity_kms'],
          },
          object_b: {
            type: 'object',
            properties: {
              position_km: {
                type: 'array',
                items: { type: 'number' },
                minItems: 3,
                maxItems: 3,
              },
              velocity_kms: {
                type: 'array',
                items: { type: 'number' },
                minItems: 3,
                maxItems: 3,
              },
            },
            required: ['position_km', 'velocity_kms'],
          },
          time_horizon_seconds: {
            type: 'number',
            description: 'Time horizon in seconds (default 3600)',
            default: 3600,
          },
        },
        required: ['object_a', 'object_b'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'simulate_mission',
      description:
        'Run a deterministic orbital simulation for a mission. Returns telemetry, events, and final state.',
      parameters: {
        type: 'object',
        properties: {
          mission_id: {
            type: 'string',
            description: 'Mission UUID',
          },
          robot_state: {
            type: 'object',
            properties: {
              position_km: {
                type: 'array',
                items: { type: 'number' },
                minItems: 3,
                maxItems: 3,
              },
              velocity_kms: {
                type: 'array',
                items: { type: 'number' },
                minItems: 3,
                maxItems: 3,
              },
            },
            required: ['position_km', 'velocity_kms'],
          },
          target_state: {
            type: 'object',
            properties: {
              position_km: {
                type: 'array',
                items: { type: 'number' },
                minItems: 3,
                maxItems: 3,
              },
              velocity_kms: {
                type: 'array',
                items: { type: 'number' },
                minItems: 3,
                maxItems: 3,
              },
            },
            required: ['position_km', 'velocity_kms'],
          },
          duration_seconds: {
            type: 'number',
            description: 'Simulation duration in seconds',
          },
          time_scale: {
            type: 'number',
            description: 'Time acceleration factor (default 1.0)',
            default: 1.0,
          },
        },
        required: [
          'mission_id',
          'robot_state',
          'target_state',
          'duration_seconds',
        ],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'inspect_target',
      description:
        'Perform a proximity inspection of a target object. Generates inspection telemetry and observations.',
      parameters: {
        type: 'object',
        properties: {
          target_id: {
            type: 'string',
            description: 'UUID of target space object',
          },
          robot_id: {
            type: 'string',
            description: 'UUID of robot space object',
          },
          inspection_distance_km: {
            type: 'number',
            description: 'Distance to maintain during inspection (default 5)',
            default: 5,
          },
        },
        required: ['target_id', 'robot_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generate_report',
      description:
        'Generate a structured mission report with summary, findings, telemetry summary, and recommendations.',
      parameters: {
        type: 'object',
        properties: {
          mission_id: {
            type: 'string',
            description: 'Mission UUID',
          },
          mission_name: {
            type: 'string',
            description: 'Mission name',
          },
          objective: {
            type: 'string',
            description: 'Mission objective',
          },
          status: {
            type: 'string',
            description: 'Final mission status',
          },
          findings: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of key findings',
          },
          recommendations: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of recommendations',
          },
        },
        required: ['mission_id', 'mission_name', 'objective', 'status'],
      },
    },
  },
];
