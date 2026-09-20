'use client'

import { useState } from 'react'
import { OrbitaShell } from '../../components/layout/orbita-shell'
import { MOCK_AGENTS, AGENT_GRAPH } from '../../lib/mock/data'
import { motion } from 'motion/react'

const statusColor: Record<string, string> = {
  active: 'bg-success',
  idle: 'bg-border',
  waiting: 'bg-warning',
  failed: 'bg-danger',
}

const nodePositions: Record<string, { x: number; y: number }> = {
  'OBJECTIVE': { x: 50, y: 10 },
  'MISSION PLANNER': { x: 50, y: 25 },
  'TRAJECTORY AGENT': { x: 30, y: 42 },
  'RISK AGENT': { x: 70, y: 42 },
  'SIMULATION': { x: 50, y: 58 },
  'RECOVERY AGENT': { x: 30, y: 75 },
  'REPORT AGENT': { x: 70, y: 75 },
}

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const selectedData = selectedAgent ? MOCK_AGENTS.find((a) => a.name === selectedAgent) : null
  return (
    <OrbitaShell>
      <div className="space-y-4">
        <div>
          <h1 className="text-[16px] font-semibold text-navy">AI Agents</h1>
          <p className="text-[11px] text-steel font-mono mt-0.5">Multi-agent mission intelligence network</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Agent graph */}
          <div className="panel p-5">
            <div className="label-mono text-accent mb-4">AGENT GRAPH</div>
            <div className="relative h-[340px]">
              {/* Edges */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {AGENT_GRAPH.edges.map(([from, to], i) => {
                  const fromNode = AGENT_GRAPH.nodes[from]
                  const toNode = AGENT_GRAPH.nodes[to]
                  const fromPos = nodePositions[fromNode]
                  const toPos = nodePositions[toNode]
                  if (!fromPos || !toPos) return null
                  return (
                    <line
                      key={i}
                      x1={fromPos.x} y1={fromPos.y + 3}
                      x2={toPos.x} y2={toPos.y - 1}
                      stroke="#D8E1E8"
                      strokeWidth="0.3"
                    />
                  )
                })}
              </svg>
              {/* Nodes */}
              {AGENT_GRAPH.nodes.map((node) => {
                const pos = nodePositions[node]
                if (!pos) return null
                const agent = MOCK_AGENTS.find((a) => a.name.toLowerCase().includes(node.toLowerCase().split(' ')[0]))
                const status = agent?.status || 'idle'
                return (
                  <div
                    key={node}
                    className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  >
                    <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${statusColor[status]}`} />
                    <div className="text-[9px] font-mono font-medium text-frost whitespace-nowrap">{node}</div>
                    {agent && (
                      <div className="text-[8px] font-mono text-steel mt-0.5 whitespace-nowrap">{agent.role}</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Agent list */}
          <div className="space-y-2">
            {MOCK_AGENTS.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedAgent(selectedAgent === a.name ? null : a.name)}
                className={`w-full text-left panel p-4 flex items-center gap-3 transition-all ${
                  selectedAgent === a.name
                    ? 'border-accent/30 bg-accent/5 shadow-card-hover'
                    : 'hover:border-accent/15 hover:bg-surface-hover'
                }`}
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColor[a.status]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-medium text-frost">{a.name}</span>
                    <span className={`text-[9px] font-mono ${a.status === 'active' ? 'text-success' : a.status === 'waiting' ? 'text-warning' : a.status === 'failed' ? 'text-danger' : 'text-steel'}`}>{a.status.toUpperCase()}</span>
                  </div>
                  <div className="text-[10px] text-steel mt-0.5">{a.role}</div>
                  {a.lastAction && <div className="text-[9px] text-steel font-mono mt-1">{a.lastAction}</div>}
                </div>
                {selectedAgent === a.name && <span className="text-[9px] font-mono text-accent">SELECTED</span>}
              </button>
            ))}

            {selectedData && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="panel p-4 border-accent/20">
                <div className="label-mono text-accent mb-2">AGENT DETAIL</div>
                <div className="space-y-1.5 text-[10px]">
                  <div className="flex justify-between"><span className="text-steel">ID</span><span className="font-mono text-frost">{selectedData.id}</span></div>
                  <div className="flex justify-between"><span className="text-steel">NAME</span><span className="font-mono text-frost">{selectedData.name}</span></div>
                  <div className="flex justify-between"><span className="text-steel">ROLE</span><span className="font-mono text-frost">{selectedData.role}</span></div>
                  <div className="flex justify-between"><span className="text-steel">STATUS</span><span className={`font-mono ${selectedData.status === 'active' ? 'text-success' : 'text-steel'}`}>{selectedData.status.toUpperCase()}</span></div>
                  {selectedData.lastAction && <div className="flex justify-between"><span className="text-steel">LAST ACTION</span><span className="font-mono text-frost text-right max-w-[200px] truncate">{selectedData.lastAction}</span></div>}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </OrbitaShell>
  )
}
