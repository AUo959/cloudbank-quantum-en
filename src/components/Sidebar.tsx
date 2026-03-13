import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Activity,
  TrendingUp,
  BookOpen,
  Network,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { AuroraLogo } from './AuroraLogo';
import type { ViewId } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeView: ViewId;
  onViewChange: (view: ViewId) => void;
}

const NAV_ITEMS: { id: ViewId; label: string; icon: typeof MessageSquare }[] = [
  { id: 'chat', label: 'Aurora', icon: MessageSquare },
  { id: 'simulation', label: 'Simulation', icon: Activity },
  { id: 'forecast', label: 'Forecast', icon: TrendingUp },
  { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
  { id: 'network', label: 'Network', icon: Network },
];

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      className={cn(
        'flex flex-col h-full bg-space-surface border-r border-space-border relative z-20',
        'transition-[width] duration-300 ease-in-out'
      )}
      style={{ width: collapsed ? 64 : 220 }}
    >
      {/* Logo area */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-space-border shrink-0">
        <AuroraLogo size={28} className="text-teal shrink-0" />
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <span className="text-sm font-semibold tracking-wide text-space-text">
                AURORA
              </span>
              <span className="text-[10px] font-mono text-space-text-muted ml-1.5">
                CB
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto overscroll-contain">
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              data-testid={`nav-${item.id}`}
              className={cn(
                'w-full flex items-center gap-3 rounded-lg transition-all duration-200',
                collapsed ? 'px-3 py-2.5 justify-center' : 'px-3 py-2.5',
                isActive
                  ? 'bg-plasma/15 text-teal glow-teal'
                  : 'text-space-text-secondary hover:text-space-text hover:bg-space-surface-2'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                size={18}
                className={cn(
                  'shrink-0 transition-colors',
                  isActive ? 'text-teal' : ''
                )}
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-[13px] font-medium overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-space-border px-3 py-3 shrink-0">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-2"
            >
              <div className="flex items-center gap-2 px-1">
                <div className="w-1.5 h-1.5 rounded-full bg-status-active animate-pulse" />
                <span className="text-[10px] font-mono text-space-text-muted tracking-wider">
                  CONSTELLATION v2.4
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed(!collapsed)}
          data-testid="sidebar-toggle"
          className="w-full flex items-center justify-center p-1.5 rounded-md text-space-text-muted hover:text-space-text hover:bg-space-surface-2 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </motion.aside>
  );
}
