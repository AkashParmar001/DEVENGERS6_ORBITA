-- ORBITA AI Runs Migration
-- Tracks all AI provider interactions for audit and cost monitoring

CREATE TABLE IF NOT EXISTS ai_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_id UUID REFERENCES missions(id) ON DELETE SET NULL,
    provider VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    task_type VARCHAR(50) NOT NULL CHECK (task_type IN ('mission_planning', 'anomaly_analysis', 'risk_analysis', 'report_generation', 'custom')),
    input_hash VARCHAR(64) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'error', 'timeout', 'validation_failed')),
    latency_ms INTEGER NOT NULL,
    tokens_in INTEGER,
    tokens_out INTEGER,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ai_runs_mission_id ON ai_runs(mission_id);
CREATE INDEX IF NOT EXISTS idx_ai_runs_provider ON ai_runs(provider);
CREATE INDEX IF NOT EXISTS idx_ai_runs_task_type ON ai_runs(task_type);
CREATE INDEX IF NOT EXISTS idx_ai_runs_status ON ai_runs(status);
CREATE INDEX IF NOT EXISTS idx_ai_runs_created_at ON ai_runs(created_at DESC);

-- RLS
ALTER TABLE ai_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON ai_runs FOR ALL USING (true);
