import { motion } from 'framer-motion';
import {
  Activity,
  Cpu,
  FileText,
  Clock,
  Zap,
  AlertCircle,
  RefreshCw,
  Search,
  Server,
} from 'lucide-react';
import { CONSTELLATION_NODES, CONSTELLATION_EVENTS } from '@/lib/constellation';
import { cn, formatTimestamp } from '@/lib/utils';
import type { ConstellationNode, ConstellationEvent } from '@/lib/types';

const KPI_DATA = [
  {
    label: 'Constellation Health',
    value: '99.7%',
    delta: '+0.2%',
    trend: 'up' as const,
    icon: Activity,
    color: 'text-status-active',
  },
  {
    label: 'Active Nodes',
    value: '6 / 6',
    delta: 'All reporting',
    trend: 'stable' as const,
    icon: Cpu,
    color: 'text-teal',
  },
  {
    label: 'Knowledge Documents',
    value: '14',
    delta: '2 indexes',
    trend: 'stable' as const,
    icon: FileText,
    color: 'text-plasma',
  },
];

function KPICard({
  label,
  value,
  delta,
  icon: Icon,
  color,
  index,
}: {
  label: string;
  value: string;
  delta: string;
  trend: string;
  icon: typeof Activity;
  color: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
      className="bg-space-surface border border-space-border rounded-xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-medium text-space-text-secondary uppercase tracking-wider">
          {label}
        </span>
        <Icon size={16} className={color} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums text-space-text">{value}</span>
        <span className="text-[11px] font-mono text-status-active">{delta}</span>
      </div>
    </motion.div>
  );
}

function NodeStatusCard({ node, index }: { node: ConstellationNode; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.06, duration: 0.35 }}
      data-testid={`node-card-${node.designation}`}
      className="bg-space-surface border border-space-border rounded-xl p-4 hover:border-space-border-bright transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div
              className={cn(
                'w-2 h-2 rounded-full',
                node.status === 'active'
                  ? 'bg-status-active'
                  : node.status === 'degraded'
                  ? 'bg-status-warning'
                  : 'bg-status-error'
              )}
            />
            <span className="text-xs font-mono font-semibold text-space-text">
              {node.designation}
            </span>
          </div>
          <span className="text-[10px] font-mono text-space-text-muted">{node.repo}</span>
        </div>
        <span
          className={cn(
            'text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border',
            node.role === 'hub'
              ? 'text-gold border-gold/30 bg-gold/5'
              : 'text-space-text-secondary border-space-border bg-space-surface-2'
          )}
        >
          {node.role}
        </span>
      </div>

      <p className="text-[12px] leading-relaxed text-space-text-secondary mb-3">
        {node.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {node.stack.map((tech) => (
            <span
              key={tech}
              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-plasma/10 text-plasma-bright border border-plasma/15"
            >
              {tech}
            </span>
          ))}
        </div>
        <span className="text-[10px] font-mono text-space-text-muted flex items-center gap-1">
          <Clock size={10} />
          {formatTimestamp(node.lastSync)}
        </span>
      </div>
    </motion.div>
  );
}

function EventItem({ event }: { event: ConstellationEvent }) {
  const iconMap = {
    sync: RefreshCw,
    alert: AlertCircle,
    update: Zap,
    query: Search,
  };
  const Icon = iconMap[event.type];
  const colorMap = {
    sync: 'text-teal',
    alert: 'text-gold',
    update: 'text-plasma',
    query: 'text-space-text-secondary',
  };

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-space-border/50 last:border-0">
      <Icon size={13} className={cn('shrink-0 mt-0.5', colorMap[event.type])} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-teal">{event.node}</span>
          <span className="text-[10px] font-mono text-space-text-muted">
            {formatTimestamp(event.timestamp)}
          </span>
        </div>
        <p className="text-[12px] text-space-text-secondary mt-0.5 truncate">{event.message}</p>
      </div>
    </div>
  );
}

export function SimulationView() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 h-14 border-b border-space-border shrink-0">
        <div className="flex items-center gap-3">
          <Server size={18} className="text-plasma" />
          <h1 className="text-sm font-semibold text-space-text">Simulation Dashboard</h1>
          <span className="text-[10px] font-mono text-space-text-muted px-2 py-0.5 rounded-full bg-space-surface-2 border border-space-border">
            MULTI-LAYER · L1+L2+L3
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5 space-y-5">
        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-4">
          {KPI_DATA.map((kpi, i) => (
            <KPICard key={kpi.label} {...kpi} index={i} />
          ))}
        </div>

        {/* Node Grid */}
        <div>
          <h2 className="text-xs font-semibold text-space-text-secondary uppercase tracking-wider mb-3">
            Constellation Nodes
          </h2>
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
            {CONSTELLATION_NODES.map((node, i) => (
              <NodeStatusCard key={node.designation} node={node} index={i} />
            ))}
          </div>
        </div>

        {/* Event Log */}
        <div>
          <h2 className="text-xs font-semibold text-space-text-secondary uppercase tracking-wider mb-3">
            Event Log
          </h2>
          <div className="bg-space-surface border border-space-border rounded-xl px-4 py-2">
            {CONSTELLATION_EVENTS.map((event) => (
              <EventItem key={event.id} event={event} />
            ))}
          </div>
        </div>

        {/* Spacer for bottom padding */}
        <div className="h-4" />
      </div>
    </div>
  );
}
