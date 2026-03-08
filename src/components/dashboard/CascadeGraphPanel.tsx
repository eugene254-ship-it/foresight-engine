import { useState } from 'react';
import { mockCascadeNodes, mockCascadeEdges, type CascadeNode } from '@/data/mockRiskData';
import { cn } from '@/lib/utils';

const sectorColor: Record<string, string> = {
  Environment: 'hsl(190, 80%, 50%)',
  Infrastructure: 'hsl(25, 95%, 55%)',
  Logistics: 'hsl(45, 95%, 55%)',
  Health: 'hsl(0, 85%, 55%)',
  Food: 'hsl(160, 60%, 45%)',
  Energy: 'hsl(270, 60%, 60%)',
  Finance: 'hsl(35, 80%, 50%)',
};

export const CascadeGraphPanel = () => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const isHighlighted = (nodeId: string) => {
    if (!selectedNode) return true;
    if (nodeId === selectedNode) return true;
    return mockCascadeEdges.some(e =>
      (e.source === selectedNode && e.target === nodeId) ||
      (e.target === selectedNode && e.source === nodeId)
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-mono text-muted-foreground tracking-widest uppercase">Cascading Failure Graph</h3>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(sectorColor).slice(0, 5).map(([sector, color]) => (
            <span key={sector} className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              {sector}
            </span>
          ))}
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <svg width="800" height="360" viewBox="0 0 800 360" className="w-full h-auto">
          {/* Edges */}
          {mockCascadeEdges.map((edge, i) => {
            const source = mockCascadeNodes.find(n => n.id === edge.source)!;
            const target = mockCascadeNodes.find(n => n.id === edge.target)!;
            const highlighted = isHighlighted(edge.source) && isHighlighted(edge.target);

            return (
              <line key={i}
                x1={source.x} y1={source.y}
                x2={target.x} y2={target.y}
                stroke={highlighted ? 'hsl(0, 85%, 55%)' : 'hsl(220, 15%, 18%)'}
                strokeWidth={edge.strength * 3}
                strokeOpacity={highlighted ? 0.6 : 0.15}
                markerEnd="url(#arrowhead)"
              />
            );
          })}

          {/* Arrowhead */}
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="hsl(0, 85%, 55%)" opacity="0.5" />
            </marker>
          </defs>

          {/* Nodes */}
          {mockCascadeNodes.map(node => {
            const highlighted = isHighlighted(node.id);
            const radius = 14 + node.importance * 12;
            const color = sectorColor[node.sector] || 'hsl(190, 80%, 50%)';

            return (
              <g key={node.id}
                onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                className="cursor-pointer"
                opacity={highlighted ? 1 : 0.2}
              >
                <circle cx={node.x} cy={node.y} r={radius + 4} fill={color} opacity={node.stress * 0.15} />
                <circle cx={node.x} cy={node.y} r={radius} fill="hsl(220, 18%, 10%)" stroke={color} strokeWidth={2} />
                <circle cx={node.x} cy={node.y} r={radius * node.stress} fill={color} opacity={0.3} />
                <text x={node.x} y={node.y - radius - 8} textAnchor="middle"
                  className="text-[10px] font-mono fill-foreground" fontSize="10">
                  {node.label}
                </text>
                <text x={node.x} y={node.y + 4} textAnchor="middle"
                  className="font-mono fill-foreground font-bold" fontSize="11">
                  {(node.stress * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {selectedNode && (
        <div className="mt-2 text-[10px] font-mono text-muted-foreground">
          Click node to isolate dependencies · Click again to reset
        </div>
      )}
    </div>
  );
};
