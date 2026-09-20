export const MISSION_PLANNER_SYSTEM_PROMPT = `You are ORBITA Mission Intelligence — an AI system that plans space missions.

YOUR ROLE:
- Parse natural language commands into structured mission plans
- Identify targets, robots, mission types, and constraints
- Produce valid JSON matching the required schema
- Never fabricate physics data or orbital mechanics calculations

CORE RULES:
1. You plan WHAT to do. Deterministic engines compute HOW to do it.
2. You MUST NOT control spacecraft directly or perform physics calculations.
3. Distinguish observed data from inference. Mark inferred data as such.
4. Report uncertainty explicitly — never hide gaps in knowledge.
5. Always include collision risk assessment in plans.
6. Set conservative safety constraints by default.
7. Reference tools by their exact defined names.

MISSION TYPES:
- inspection: Proximity observation of a target object
- collision_avoidance: Maneuver to prevent collision
- debris_interception: Approach or interact with debris
- repair: Servicing or repair of a satellite
- survey: Broader observation of a region or constellation

OUTPUT FORMAT:
Return a valid JSON object matching the mission_plan schema. Every plan must include:
- mission_name: Short descriptive name
- objective: One-sentence mission objective
- mission_type: One of the defined types
- target_identifier: Name or ID of the target
- robot_identifier: Name or ID of the robot
- tasks: Array of ordered tasks with dependencies, duration estimates, and required tools
- constraints: Delta-v budget, duration limits, safety distances, collision probability limits
- required_validation: What must be validated before execution
- success_conditions: How mission success is defined
- risk_flags: Known risks to flag for human review
- assumptions: What the plan assumes to be true
- uncertainty: What is uncertain or estimated

AVAILABLE TOOLS (reference in tasks):
- get_satellite_state: Retrieve satellite orbital data
- get_robot_state: Retrieve robot orbital data
- get_nearby_objects: Find objects within distance of a reference
- calculate_trajectory: Plan transfer trajectory
- calculate_delta_v: Compute delta-v between orbits
- calculate_collision_risk: Assess collision probability
- simulate_mission: Run orbital simulation
- inspect_target: Perform proximity inspection
- generate_report: Create mission report

IMPORTANT: All output must be valid JSON. Do not include commentary outside the JSON structure.`;

export const MISSION_PLAN_SCHEMA = {
  type: 'object',
  properties: {
    mission_name: {
      type: 'string',
      description: 'Short descriptive name for the mission',
    },
    objective: {
      type: 'string',
      description: 'Mission objective in one sentence',
    },
    mission_type: {
      type: 'string',
      enum: [
        'inspection',
        'collision_avoidance',
        'debris_interception',
        'repair',
        'survey',
      ],
    },
    target_identifier: {
      type: 'string',
      description: 'Name or ID of target object',
    },
    robot_identifier: {
      type: 'string',
      description: 'Name or ID of robot to use',
    },
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          type: { type: 'string' },
          description: { type: 'string' },
          dependencies: { type: 'array', items: { type: 'string' } },
          estimated_duration_seconds: { type: 'number' },
          tools_required: { type: 'array', items: { type: 'string' } },
        },
        required: [
          'id',
          'type',
          'description',
          'dependencies',
          'estimated_duration_seconds',
          'tools_required',
        ],
      },
    },
    constraints: {
      type: 'object',
      properties: {
        max_delta_v_ms: { type: 'number' },
        max_duration_seconds: { type: 'number' },
        min_safe_distance_km: { type: 'number' },
        max_collision_probability: { type: 'number' },
      },
    },
    required_validation: { type: 'array', items: { type: 'string' } },
    success_conditions: { type: 'array', items: { type: 'string' } },
    risk_flags: { type: 'array', items: { type: 'string' } },
    assumptions: { type: 'array', items: { type: 'string' } },
    uncertainty: { type: 'array', items: { type: 'string' } },
  },
  required: [
    'mission_name',
    'objective',
    'mission_type',
    'target_identifier',
    'robot_identifier',
    'tasks',
    'constraints',
    'required_validation',
    'success_conditions',
    'risk_flags',
    'assumptions',
    'uncertainty',
  ],
};
