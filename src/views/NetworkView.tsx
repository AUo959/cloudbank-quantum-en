import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Network as NetworkIcon, Maximize2, RotateCcw } from 'lucide-react';
import { CONSTELLATION_NODES } from '@/lib/constellation';
import { cn } from '@/lib/utils';

interface NodeViz {
  x: number;
  y: number;
  vx: number;
  vy: number;
  designation: string;
  role: 'hub' | 'spoke';
  status: string;
  radius: number;
  pulsePhase: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

// oklch approximations for canvas rendering
const COLORS = {
  bg: '#0a0e1a',
  surface: '#141929',
  teal: '#3d9b8f',
  tealBright: '#5bc4b5',
  plasma: '#7b6be8',
  plasmaBright: '#9d8ff0',
  gold: '#c9a84c',
  text: '#e8eaf0',
  textMuted: '#5a6080',
  statusActive: '#3db87a',
  connectionDim: 'rgba(61, 155, 143, 0.12)',
  connectionBright: 'rgba(61, 155, 143, 0.35)',
};

export function NetworkView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const nodesRef = useRef<NodeViz[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ w: 800, h: 600 });

  const initNodes = useCallback(
    (w: number, h: number) => {
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.3;

      nodesRef.current = CONSTELLATION_NODES.map((node, i) => {
        const angle = (i / CONSTELLATION_NODES.length) * Math.PI * 2 - Math.PI / 2;
        const isHub = node.role === 'hub';
        const dist = isHub ? 0 : radius;
        return {
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          vx: 0,
          vy: 0,
          designation: node.designation,
          role: node.role,
          status: node.status,
          radius: isHub ? 18 : 12,
          pulsePhase: Math.random() * Math.PI * 2,
        };
      });

      // Initialize particles
      particlesRef.current = Array.from({ length: 60 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        life: Math.random() * 200,
        maxLife: 200 + Math.random() * 200,
        size: 0.5 + Math.random() * 1.5,
      }));
    },
    []
  );

  const resetView = useCallback(() => {
    initNodes(dimensions.w, dimensions.h);
  }, [dimensions, initNodes]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ w: width, h: height });
        initNodes(width, height);
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [initNodes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.w * dpr;
    canvas.height = dimensions.h * dpr;
    ctx.scale(dpr, dpr);

    let time = 0;

    const draw = () => {
      time++;
      const { w, h } = dimensions;
      const nodes = nodesRef.current;
      const particles = particlesRef.current;

      // Clear
      ctx.fillStyle = COLORS.bg;
      ctx.fillRect(0, 0, w, h);

      // Draw subtle grid
      ctx.strokeStyle = 'rgba(90, 96, 128, 0.04)';
      ctx.lineWidth = 0.5;
      const gridSize = 40;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Update & draw particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        if (p.life > p.maxLife || p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
          p.x = Math.random() * w;
          p.y = Math.random() * h;
          p.life = 0;
          p.maxLife = 200 + Math.random() * 200;
        }
        const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.4;
        ctx.fillStyle = `rgba(61, 155, 143, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw connections between all nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const isHubConnection = a.role === 'hub' || b.role === 'hub';

          ctx.strokeStyle = isHubConnection ? COLORS.connectionBright : COLORS.connectionDim;
          ctx.lineWidth = isHubConnection ? 1.2 : 0.5;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();

          // Animated data pulse along hub connections
          if (isHubConnection) {
            const t = ((time * 0.005 + i * 0.3) % 1);
            const px = a.x + (b.x - a.x) * t;
            const py = a.y + (b.y - a.y) * t;
            ctx.fillStyle = `rgba(91, 196, 181, ${0.6 - t * 0.5})`;
            ctx.beginPath();
            ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Draw nodes
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      let newHovered: string | null = null;

      for (const node of nodes) {
        const pulse = Math.sin(time * 0.03 + node.pulsePhase) * 0.3 + 0.7;
        const dist = Math.hypot(mx - node.x, my - node.y);
        const isHovered = dist < node.radius + 20;
        if (isHovered) newHovered = node.designation;

        const r = node.radius * (isHovered ? 1.2 : 1);

        // Glow
        const glowColor = node.role === 'hub' ? COLORS.teal : COLORS.plasma;
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 3);
        gradient.addColorStop(0, `${glowColor}${Math.round(pulse * 25).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, r * 3, 0, Math.PI * 2);
        ctx.fill();

        // Node circle
        ctx.fillStyle = node.role === 'hub' ? COLORS.teal : COLORS.plasma;
        ctx.globalAlpha = 0.15;
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.strokeStyle = node.role === 'hub' ? COLORS.tealBright : COLORS.plasmaBright;
        ctx.lineWidth = isHovered ? 2 : 1.2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.stroke();

        // Inner dot
        ctx.fillStyle = COLORS.statusActive;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = isHovered ? COLORS.text : COLORS.textMuted;
        ctx.font = `${isHovered ? '11px' : '10px'} 'JetBrains Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(node.designation, node.x, node.y + r + 16);

        // Role badge on hover
        if (isHovered) {
          ctx.fillStyle = node.role === 'hub' ? COLORS.gold : COLORS.teal;
          ctx.font = "9px 'JetBrains Mono', monospace";
          ctx.fillText(node.role.toUpperCase(), node.x, node.y + r + 28);
        }
      }

      setHoveredNode(newHovered);
      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [dimensions]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
  };

  const handleMouseLeave = () => {
    mouseRef.current = { x: -1000, y: -1000 };
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 h-14 border-b border-space-border shrink-0">
        <div className="flex items-center gap-3">
          <NetworkIcon size={18} className="text-teal" />
          <h1 className="text-sm font-semibold text-space-text">Constellation Network</h1>
          <span className="text-[10px] font-mono text-space-text-muted px-2 py-0.5 rounded-full bg-space-surface-2 border border-space-border">
            6 NODES · LIVE
          </span>
        </div>
        <div className="flex items-center gap-2">
          {hoveredNode && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[11px] font-mono text-teal mr-3"
            >
              {hoveredNode}
            </motion.span>
          )}
          <button
            onClick={resetView}
            data-testid="network-reset"
            className="p-1.5 rounded-md text-space-text-muted hover:text-space-text hover:bg-space-surface-2 transition-colors"
            title="Reset view"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          data-testid="network-canvas"
          className="absolute inset-0"
          style={{ width: dimensions.w, height: dimensions.h, cursor: hoveredNode ? 'pointer' : 'default' }}
        />
        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-space-surface/90 border border-space-border rounded-lg px-3 py-2 backdrop-blur-sm">
          <div className="flex items-center gap-4 text-[10px] font-mono">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full border border-teal-bright bg-teal/15" />
              <span className="text-space-text-muted">Hub</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full border border-plasma-bright bg-plasma/15" />
              <span className="text-space-text-muted">Spoke</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-status-active" />
              <span className="text-space-text-muted">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
