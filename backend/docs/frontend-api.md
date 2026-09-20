# ORBITA Frontend API Documentation

> **Base URL:** `http://localhost:4000/api`
> **Swagger UI:** `http://localhost:4000/api/docs`
> **Version:** 0.1.0

---

## Table of Contents

1. [Authentication](#authentication)
2. [Response Format](#response-format)
3. [Error Handling](#error-handling)
4. [Request IDs](#request-ids)
5. [CORS](#cors)
6. [Pagination](#pagination)
7. [Realtime (Supabase)](#realtime)
8. [Endpoints](#endpoints)
   - [Health](#health)
   - [Missions](#missions)
   - [Space Objects](#space-objects)
   - [Satellites](#satellites)
   - [Robots](#robots)
   - [Telemetry](#telemetry)
   - [Orbital States](#orbital-states)
   - [Mission Events](#mission-events)
   - [Reports](#reports)
   - [Realtime Info](#realtime-info)
9. [Enums Reference](#enums-reference)

---

## Authentication

This API uses an API key passed via the `X-Api-Key` header.

```
X-Api-Key: your-api-key-here
```

If no `API_KEY` environment variable is configured on the server, all requests are allowed without authentication.

For Supabase Realtime subscriptions, use the Supabase anon key directly from the JS client (no API key needed for realtime).

---

## Response Format

All responses follow a consistent envelope format.

### Single Object

```json
{
  "data": {
    "id": "a0000001-0000-0000-0000-000000000001",
    "name": "ISS-ZARYA",
    "object_type": "SATELLITE",
    "status": "active"
  }
}
```

### List (Paginated)

```json
{
  "data": [
    { "id": "...", "name": "..." },
    { "id": "...", "name": "..." }
  ],
  "meta": {
    "total": 125,
    "page": 1,
    "limit": 20,
    "totalPages": 7
  }
}
```

### Deleted

```json
{
  "data": null
}
```

---

## Error Handling

All errors return a consistent format:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Mission with ID xyz not found",
    "details": null,
    "requestId": "a1b2c3d4-...",
    "timestamp": "2026-09-19T13:00:00.000Z",
    "path": "/api/missions/xyz"
  }
}
```

### Error Codes

| HTTP Status | Code | Description |
|---|---|---|
| 400 | `BAD_REQUEST` | Invalid request body or parameters |
| 401 | `UNAUTHORIZED` | Invalid or missing API key |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | State conflict (e.g., invalid state transition) |
| 422 | `UNPROCESSABLE_ENTITY` | Validation error |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_SERVER_ERROR` | Server error |

### Validation Errors

When request validation fails, the `message` field contains an array of error messages:

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": ["name should not be empty", "object_type must be one of the following values: SATELLITE, DEBRIS"],
    "details": {
      "validationErrors": ["name should not be empty", "object_type must be one of the following values: SATELLITE, DEBRIS"]
    },
    "requestId": "...",
    "timestamp": "...",
    "path": "..."
  }
}
```

---

## Request IDs

Every request automatically receives a unique UUID in the `X-Request-Id` response header. You can also send your own `X-Request-Id` header and it will be echoed back.

```bash
# Client sends
curl -H "X-Request-Id: my-custom-id-123" http://localhost:4000/api/health

# Response header
X-Request-Id: my-custom-id-123
```

Request IDs are included in all error responses and structured log output.

---

## CORS

CORS is configured for the frontend origin(s). Default: `http://localhost:3000`.

**Allowed headers:** `Content-Type`, `Authorization`, `X-Request-Id`
**Exposed headers:** `X-Request-Id`
**Credentials:** Enabled

To configure additional origins, set the `CORS_ORIGIN` environment variable as a comma-separated list:

```
CORS_ORIGIN=http://localhost:3000,https://orbita.example.com
```

---

## Pagination

All list endpoints support pagination via query parameters:

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | integer | `1` | Page number (min: 1) |
| `limit` | integer | `20` | Items per page (min: 1, max: 100) |
| `sortBy` | string | `created_at` | Sort field |
| `sortOrder` | string | `desc` | Sort direction (`asc` or `desc`) |

**Example:**
```
GET /api/missions?page=2&limit=10&sortBy=priority&sortOrder=desc
```

---

## Realtime

ORBITA uses **Supabase Realtime** for live updates. The frontend should subscribe using the Supabase JS client.

### Setup

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://tofrqxksxfwxabugjnot.supabase.co',
  'your-anon-key'
);
```

### Subscribe to Mission Changes

```typescript
const channel = supabase
  .channel('missions')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'missions' },
    (payload) => {
      console.log('Mission change:', payload.eventType, payload.new);
      // payload.eventType: 'INSERT' | 'UPDATE' | 'DELETE'
      // payload.new: the new row data
      // payload.old: the old row data (for UPDATE/DELETE)
    }
  )
  .subscribe();
```

### Subscribe to Telemetry Updates

```typescript
supabase
  .channel('telemetry')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'telemetry' },
    (payload) => {
      console.log('New telemetry:', payload.new);
    }
  )
  .subscribe();
```

### Subscribe to Orbital State Updates

```typescript
supabase
  .channel('orbital-states')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'orbital_states' },
    (payload) => {
      console.log('Position update:', payload.new);
    }
  )
  .subscribe();
```

### Available Realtime Channels

| Channel | Table | Event | Description |
|---|---|---|---|
| `mission.created` | `missions` | `INSERT` | New mission created |
| `mission.updated` | `missions` | `UPDATE` | Mission updated |
| `mission.started` | `missions` | `UPDATE` | Mission entered SIMULATING state |
| `mission.paused` | `missions` | `UPDATE` | Mission paused |
| `mission.completed` | `missions` | `UPDATE` | Mission completed successfully |
| `mission.failed` | `missions` | `UPDATE` | Mission failed or aborted |
| `robot.telemetry.updated` | `telemetry` | `INSERT` | New telemetry data recorded |
| `object.position.updated` | `orbital_states` | `INSERT` | Orbital state vectors updated |
| `risk.updated` | `mission_events` | `INSERT` | Risk assessment changed |
| `anomaly.detected` | `mission_events` | `INSERT` | Anomaly detected during simulation |

### Cleanup

```typescript
supabase.removeChannel(channel);
```

---

## Endpoints

### Health

#### `GET /api/health`
Check application health.

**Response:**
```json
{ "data": { "status": "ok", "timestamp": "...", "uptime": 123.456 } }
```

#### `GET /api/ready`
Check application readiness (Supabase connection).

**Response (200):**
```json
{ "data": { "status": "ok", "timestamp": "...", "services": { "supabase": "ok" } } }
```

**Response (503):**
```json
{ "data": { "status": "not_ready", "timestamp": "...", "services": { "supabase": "not_ready" } } }
```

---

### Missions

#### `GET /api/missions`
List all missions with pagination and filtering.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `name` | string | Filter by name (partial match) |
| `status` | enum | Filter by status |
| `target_id` | uuid | Filter by target ID |
| `robot_id` | uuid | Filter by robot ID |
| `created_by` | uuid | Filter by creator |
| `page` | integer | Page number |
| `limit` | integer | Items per page |
| `sortBy` | string | Sort field |
| `sortOrder` | string | `asc` or `desc` |

**Example:**
```
GET /api/missions?status=SIMULATING&limit=5
```

**Response:**
```json
{
  "data": [
    {
      "id": "d0000001-...",
      "name": "SAT-102 INSPECTION",
      "objective": "Inspect SAT-102",
      "target_id": "a0000001-...",
      "robot_id": "c0000001-...",
      "status": "SIMULATING",
      "priority": 8,
      "created_by": null,
      "created_at": "2026-09-19T...",
      "updated_at": "2026-09-19T...",
      "started_at": "2026-09-19T...",
      "completed_at": null
    }
  ],
  "meta": { "total": 3, "page": 1, "limit": 20, "totalPages": 1 }
}
```

---

#### `GET /api/missions/:id`
Get a single mission by ID.

**Response:**
```json
{
  "data": {
    "id": "d0000001-...",
    "name": "SAT-102 INSPECTION",
    "objective": "Inspect SAT-102 for structural damage",
    "status": "COMPLETED",
    "priority": 8,
    "started_at": "2026-09-19T11:00:00Z",
    "completed_at": "2026-09-19T12:30:00Z"
  }
}
```

---

#### `POST /api/missions`
Create a new mission. Starts in `DRAFT` status.

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | **Yes** | Mission name |
| `objective` | string | **Yes** | Mission objective |
| `target_id` | uuid | No | Target space object ID |
| `robot_id` | uuid | No | Robot space object ID |
| `priority` | integer | No | Priority (0-10, default: 0) |
| `created_by` | uuid | No | User ID |

**Example:**
```json
{
  "name": "DEBRIS-042 TRACKING",
  "objective": "Track debris field for collision risk",
  "target_id": "b0000001-...",
  "robot_id": "c0000001-...",
  "priority": 7
}
```

**Response:** `201 Created` with the created mission object.

---

#### `PATCH /api/missions/:id`
Update a mission. Status changes are validated against the state machine.

**Request Body:** Same as create, all fields optional.

**Example:**
```json
{ "priority": 9, "objective": "Updated objective" }
```

**Response:** `200 OK` with the updated mission object.

**Error (invalid transition):** `409 Conflict`
```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Cannot transition from DRAFT to SIMULATING. Allowed: PLANNING"
  }
}
```

---

#### `DELETE /api/missions/:id`
Delete a mission and all associated events/reports.

**Response:** `204 No Content`

---

### Mission State Transitions

The mission state machine enforces strict transitions:

```
DRAFT → PLANNING → VALIDATING → READY → SIMULATING → COMPLETED
                                              ↓
                                         PAUSED → SIMULATING (resume)
                                              ↓
                                         ABORTING → ABORTED
                                              ↓
                                         FAILED
```

#### `POST /api/missions/:id/plan`
Transition `DRAFT → PLANNING`.

#### `POST /api/missions/:id/validate`
Transition `PLANNING → VALIDATING`.

#### `POST /api/missions/:id/ready`
Transition `VALIDATING → READY`.

#### `POST /api/missions/:id/simulate`
Transition `READY → SIMULATING`. Sets `started_at` if not already set.

#### `POST /api/missions/:id/pause`
Transition `SIMULATING → PAUSED`.

#### `POST /api/missions/:id/resume`
Transition `PAUSED → SIMULATING`.

#### `POST /api/missions/:id/abort`
- From `SIMULATING` → `ABORTING`
- From `ABORTING` → `ABORTED`

**All transition endpoints return:** The updated mission object.

**All transition endpoints can return:** `409 Conflict` if the transition is invalid.

Each state transition automatically creates a `mission_events` record.

---

#### `GET /api/missions/:id/events`
Get all events for a mission, ordered by timestamp.

**Response:**
```json
{
  "data": [
    {
      "id": "...",
      "mission_id": "d0000001-...",
      "event_type": "MISSION_CREATED",
      "severity": "info",
      "title": "Mission \"SAT-102\" created",
      "description": null,
      "timestamp": "2026-09-19T11:00:00Z",
      "metadata": { "objective": "..." },
      "created_at": "2026-09-19T11:00:00Z"
    }
  ]
}
```

---

#### `GET /api/missions/:id/report`
Get the latest report for a mission.

**Response:** Single report object, or `null` if no report exists.

---

### Space Objects

#### `GET /api/space-objects`
List all space objects with pagination and filtering.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `name` | string | Filter by name (partial match) |
| `object_type` | enum | `SATELLITE`, `DEBRIS`, `ROCKET_BODY`, `ROBOT`, `SPACECRAFT` |
| `status` | enum | `active`, `inactive`, `decommissioned`, `lost` |
| `orbit_type` | enum | `LEO`, `MEO`, `GEO`, `HEO`, `cislunar`, `interplanetary` |
| `country` | string | Filter by country (partial match) |
| `operator` | string | Filter by operator (partial match) |

**Response:**
```json
{
  "data": [
    {
      "id": "a0000001-...",
      "name": "SYNTH-SAT-001",
      "object_type": "SATELLITE",
      "status": "active",
      "mass_kg": 500,
      "dimensions_m": { "length": 3.2, "width": 1.8, "height": 2.1 },
      "launch_date": "2020-01-15",
      "operator": "SynthSpace Corp",
      "country": "USA",
      "orbit_type": "LEO",
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "meta": { "total": 125, "page": 1, "limit": 20, "totalPages": 7 }
}
```

---

#### `GET /api/space-objects/:id`
Get a single space object by ID.

---

#### `POST /api/space-objects`
Create a new space object.

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | **Yes** | Object name |
| `object_type` | enum | **Yes** | Object type |
| `status` | enum | No | Status (default: `active`) |
| `mass_kg` | number | No | Mass in kg |
| `dimensions_m` | object | No | `{ "length": 109, "width": 73, "height": 45 }` |
| `launch_date` | string | No | ISO 8601 date |
| `operator` | string | No | Operator name |
| `country` | string | No | Country |
| `orbit_type` | enum | No | Orbit type |

**Response:** `201 Created`

---

#### `PATCH /api/space-objects/:id`
Update a space object. All fields optional.

**Response:** `200 OK`

---

### Satellites

#### `GET /api/satellites`
List all satellites with pagination and filtering.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `norad_id` | integer | Filter by NORAD ID |
| `satellite_type` | enum | `communication`, `navigation`, `observation`, `science`, `military`, `commercial` |
| `intl_code` | string | Filter by international code |
| `space_object_id` | uuid | Filter by space object ID |

**Response:** Includes joined `space_objects` data.

---

#### `GET /api/satellites/:id`
Get a single satellite by ID (includes joined space object).

---

#### `POST /api/satellites`
Create a new satellite.

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `space_object_id` | uuid | **Yes** | Parent space object ID |
| `norad_id` | integer | No | NORAD catalog ID |
| `intl_code` | string | No | International designator |
| `satellite_type` | enum | No | Satellite type |
| `power_watts` | number | No | Power in watts |
| `design_life_years` | integer | No | Design life (1-50 years) |

**Response:** `201 Created`

---

#### `PATCH /api/satellites/:id`
Update a satellite. All fields optional.

**Response:** `200 OK`

---

### Robots

#### `GET /api/robots`
List all robots with pagination and filtering.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `robot_type` | enum | `rover`, `arm`, `drone`, `assembly`, `repair` |
| `manufacturer` | string | Filter by manufacturer |
| `space_object_id` | uuid | Filter by space object ID |
| `min_autonomy_level` | integer | Minimum autonomy level (0-5) |

**Response:** Includes joined `space_objects` data.

---

#### `GET /api/robots/:id`
Get a single robot by ID (includes joined space object).

---

#### `POST /api/robots`
Create a new robot.

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `space_object_id` | uuid | **Yes** | Parent space object ID |
| `robot_type` | enum | No | Robot type |
| `manufacturer` | string | No | Manufacturer |
| `autonomy_level` | integer | No | Autonomy level (0-5) |
| `payload_capacity_kg` | number | No | Payload capacity in kg |

**Response:** `201 Created`

---

#### `PATCH /api/robots/:id`
Update a robot. All fields optional.

**Response:** `200 OK`

---

### Telemetry

#### `GET /api/telemetry/:id`
Get telemetry data for a space object. The `:id` is the **space object ID**.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `metric_type` | string | Filter by metric type |
| `after` | ISO 8601 | Filter after timestamp |
| `before` | ISO 8601 | Filter before timestamp |

**Response:**
```json
{
  "data": [
    {
      "id": "...",
      "space_object_id": "a0000001-...",
      "timestamp": "2026-09-19T12:00:00Z",
      "metric_type": "battery_level",
      "value": 87.3,
      "unit": "percent",
      "metadata": { "battery": "primary" }
    }
  ],
  "meta": { "total": 7, "page": 1, "limit": 20, "totalPages": 1 }
}
```

---

### Orbital States

#### `GET /api/orbital-states/:id`
Get orbital state vectors for a space object. The `:id` is the **space object ID**.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `after` | ISO 8601 | Filter after timestamp |
| `before` | ISO 8601 | Filter before timestamp |

**Response:**
```json
{
  "data": [
    {
      "id": "...",
      "space_object_id": "a0000001-...",
      "timestamp": "2026-09-19T12:00:00Z",
      "position_x_km": 6771,
      "position_y_km": 0,
      "position_z_km": 0,
      "velocity_x_kms": 0,
      "velocity_y_kms": 7.66,
      "velocity_z_kms": 0,
      "altitude_km": 408,
      "inclination_deg": 51.6,
      "eccentricity": 0.0002,
      "period_minutes": 92.68
    }
  ],
  "meta": { "total": 2, "page": 1, "limit": 20, "totalPages": 1 }
}
```

---

### Mission Events

#### `GET /api/mission-events/:missionId`
Get events for a specific mission.

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | integer | `1` | Page number |
| `limit` | integer | `50` | Items per page |

**Response:**
```json
{
  "data": [
    {
      "id": "...",
      "mission_id": "d0000001-...",
      "event_type": "SIMULATION_STARTED",
      "severity": "info",
      "title": "Simulation started",
      "description": "Autonomous inspection commenced",
      "timestamp": "2026-09-19T11:30:00Z",
      "metadata": { "simulation_mode": "autonomous" }
    }
  ],
  "meta": { "total": 9, "page": 1, "limit": 50, "totalPages": 1 }
}
```

---

#### `GET /api/mission-events/single/:id`
Get a single mission event by ID.

---

### Reports

#### `GET /api/reports`
List all reports.

**Response:**
```json
{
  "data": [
    {
      "id": "...",
      "mission_id": "d0000001-...",
      "title": "SAT-102 Inspection Report",
      "report_type": "analysis",
      "content": { "summary": "...", "findings": [...] },
      "generated_by": null,
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 20, "totalPages": 1 }
}
```

---

#### `GET /api/reports/:id`
Get a single report by ID.

---

### Realtime Info

#### `GET /api/realtime/channels`
List all available Realtime channels with descriptions.

**Response:**
```json
{
  "data": {
    "channels": [
      { "name": "mission.created", "description": "...", "table": "missions", "event": "INSERT" },
      { "name": "mission.updated", "description": "...", "table": "missions", "event": "UPDATE" }
    ],
    "instructions": "Use the Supabase JS client to subscribe..."
  }
}
```

---

#### `GET /api/realtime/status`
Get Realtime connection status.

**Response:**
```json
{
  "data": {
    "status": "active",
    "transport": "websocket",
    "provider": "supabase",
    "subscribedTables": ["missions", "mission_events", "telemetry", "orbital_states"]
  }
}
```

---

## Enums Reference

### MissionStatus
`DRAFT` | `PLANNING` | `VALIDATING` | `READY` | `SIMULATING` | `PAUSED` | `COMPLETED` | `FAILED` | `ABORTING` | `ABORTED`

### SpaceObjectType
`SATELLITE` | `DEBRIS` | `ROCKET_BODY` | `ROBOT` | `SPACECRAFT`

### SpaceObjectStatus
`active` | `inactive` | `decommissioned` | `lost`

### OrbitType
`LEO` | `MEO` | `GEO` | `HEO` | `cislunar` | `interplanetary`

### SatelliteType
`communication` | `navigation` | `observation` | `science` | `military` | `commercial`

### RobotType
`rover` | `arm` | `drone` | `assembly` | `repair`

### MissionEventType
`MISSION_CREATED` | `TARGET_IDENTIFIED` | `PLANNING_STARTED` | `PLAN_GENERATED` | `VALIDATION_STARTED` | `VALIDATION_COMPLETED` | `SIMULATION_STARTED` | `SIMULATION_PAUSED` | `ANOMALY_DETECTED` | `MISSION_COMPLETED` | `MISSION_FAILED` | `MISSION_ABORTED`

### EventSeverity
`info` | `warning` | `critical` | `success`

### ReportType
`daily` | `weekly` | `incident` | `status` | `analysis`
