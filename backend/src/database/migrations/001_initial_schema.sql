-- ORBITA Database Foundation Migration
-- Enables PostGIS and creates core tables

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable uuid-ossp extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Users table
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'operator' CHECK (role IN ('admin', 'operator', 'viewer')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Space Objects table (base for satellites, robots, debris, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS space_objects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    object_type VARCHAR(50) NOT NULL CHECK (object_type IN ('satellite', 'robot', 'debris', 'station', 'probe')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'decommissioned', 'lost')),
    mass_kg DECIMAL(12, 3),
    dimensions_m JSONB,
    launch_date DATE,
    operator VARCHAR(255),
    country VARCHAR(100),
    orbit_type VARCHAR(50) CHECK (orbit_type IN ('LEO', 'MEO', 'GEO', 'HEO', 'cislunar', 'interplanetary')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Satellites table (extends space_objects)
-- ============================================================
CREATE TABLE IF NOT EXISTS satellites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    space_object_id UUID NOT NULL REFERENCES space_objects(id) ON DELETE CASCADE,
    norad_id INTEGER UNIQUE,
    intl_code VARCHAR(10),
    satellite_type VARCHAR(50) CHECK (satellite_type IN ('communication', 'navigation', 'observation', 'science', 'military', 'commercial')),
    power_watts DECIMAL(10, 2),
    design_life_years INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Robots table (extends space_objects)
-- ============================================================
CREATE TABLE IF NOT EXISTS robots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    space_object_id UUID NOT NULL REFERENCES space_objects(id) ON DELETE CASCADE,
    robot_type VARCHAR(50) CHECK (robot_type IN ('rover', 'arm', 'drone', 'assembly', 'repair')),
    manufacturer VARCHAR(255),
    autonomy_level INTEGER CHECK (autonomy_level >= 0 AND autonomy_level <= 5),
    payload_capacity_kg DECIMAL(10, 3),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Orbital States table
-- ============================================================
CREATE TABLE IF NOT EXISTS orbital_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    space_object_id UUID NOT NULL REFERENCES space_objects(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    position GEOGRAPHY(POINT, 4326),
    velocity_ms DECIMAL(12, 3),
    altitude_km DECIMAL(10, 3),
    inclination_deg DECIMAL(8, 4),
    eccentricity DECIMAL(10, 8),
    raan_deg DECIMAL(8, 4),
    arg_perigee_deg DECIMAL(8, 4),
    mean_anomaly_deg DECIMAL(8, 4),
    period_minutes DECIMAL(10, 4),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create spatial index for orbital states
CREATE INDEX IF NOT EXISTS idx_orbital_states_position 
    ON orbital_states USING GIST (position);

-- ============================================================
-- Missions table
-- ============================================================
CREATE TABLE IF NOT EXISTS missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    mission_type VARCHAR(50) CHECK (mission_type IN ('observation', 'communication', 'exploration', 'maintenance', 'assembly', 'rescue')),
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'paused', 'completed', 'aborted')),
    priority INTEGER DEFAULT 0 CHECK (priority >= 0 AND priority <= 10),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Telemetry table
-- ============================================================
CREATE TABLE IF NOT EXISTS telemetry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    space_object_id UUID NOT NULL REFERENCES space_objects(id) ON DELETE CASCADE,
    mission_id UUID REFERENCES missions(id) ON DELETE SET NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metric_type VARCHAR(100) NOT NULL,
    value DECIMAL(20, 8),
    unit VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for telemetry queries
CREATE INDEX IF NOT EXISTS idx_telemetry_object_timestamp 
    ON telemetry(space_object_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_telemetry_mission_timestamp 
    ON telemetry(mission_id, timestamp DESC);

-- ============================================================
-- Mission Events table
-- ============================================================
CREATE TABLE IF NOT EXISTS mission_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical', 'success')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location GEOGRAPHY(POINT, 4326),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create spatial index for mission events
CREATE INDEX IF NOT EXISTS idx_mission_events_location 
    ON mission_events USING GIST (location);

-- ============================================================
-- Reports table
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_id UUID REFERENCES missions(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) CHECK (report_type IN ('daily', 'weekly', 'incident', 'status', 'analysis')),
    content JSONB,
    generated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_space_objects_updated_at BEFORE UPDATE ON space_objects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_satellites_updated_at BEFORE UPDATE ON satellites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_robots_updated_at BEFORE UPDATE ON robots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON missions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Row Level Security (RLS) - Basic policies
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE space_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE satellites ENABLE ROW LEVEL SECURITY;
ALTER TABLE robots ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orbital_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Service role can access everything
CREATE POLICY "Service role full access" ON users FOR ALL USING (true);
CREATE POLICY "Service role full access" ON space_objects FOR ALL USING (true);
CREATE POLICY "Service role full access" ON satellites FOR ALL USING (true);
CREATE POLICY "Service role full access" ON robots FOR ALL USING (true);
CREATE POLICY "Service role full access" ON missions FOR ALL USING (true);
CREATE POLICY "Service role full access" ON orbital_states FOR ALL USING (true);
CREATE POLICY "Service role full access" ON telemetry FOR ALL USING (true);
CREATE POLICY "Service role full access" ON mission_events FOR ALL USING (true);
CREATE POLICY "Service role full access" ON reports FOR ALL USING (true);
