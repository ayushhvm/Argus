"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface GalaxyNode {
  id: number;
  title: string;
  genres: string;
  poster_url: string;
  average_rating: number;
  release_year: number | null;
  score: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GalaxyEdge {
  source: number;
  target: number;
  weight: number;
}

interface GalaxyData {
  center_id: number;
  nodes: GalaxyNode[];
  edges: GalaxyEdge[];
}

interface VibeGalaxyProps {
  movieId: number;
  movieTitle: string;
  onClose: () => void;
  onNodeClick: (movieId: number) => void;
}

const GENRE_COLORS: Record<string, string> = {
  "Action": "#ff6b35",
  "Adventure": "#f7c59f",
  "Animation": "#ffe66d",
  "Comedy": "#4ecdc4",
  "Crime": "#a8dadc",
  "Documentary": "#6bcb77",
  "Drama": "#c77dff",
  "Fantasy": "#e63946",
  "Horror": "#9d0208",
  "Music": "#ff85a1",
  "Mystery": "#457b9d",
  "Romance": "#ff6b9d",
  "Science Fiction": "#00b4d8",
  "Thriller": "#e76f51",
  "War": "#6c757d",
  "Western": "#b5835a",
};

function getGenreColor(genres: string): string {
  if (!genres) return "#888888";
  const g = genres.split(",")[0].trim();
  return GENRE_COLORS[g] || "#888888";
}

class ForceSimulation {
  nodes: GalaxyNode[];
  edges: GalaxyEdge[];
  width: number;
  height: number;
  centerId: number;
  alpha: number = 1;
  alphaDecay: number = 0.018;

  constructor(nodes: GalaxyNode[], edges: GalaxyEdge[], width: number, height: number, centerId: number) {
    this.nodes = nodes;
    this.edges = edges;
    this.width = width;
    this.height = height;
    this.centerId = centerId;
    this.initPositions();
  }

  initPositions() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    this.nodes.forEach((node, i) => {
      if (node.id === this.centerId) {
        node.x = cx; node.y = cy;
        node.fx = cx; node.fy = cy;
      } else {
        const angle = (i / (this.nodes.length - 1)) * Math.PI * 2;
        const r = Math.min(this.width, this.height) * 0.3;
        node.x = cx + Math.cos(angle) * r * (0.8 + Math.random() * 0.5);
        node.y = cy + Math.sin(angle) * r * (0.8 + Math.random() * 0.5);
      }
      node.vx = 0; node.vy = 0;
    });
  }

  tick() {
    if (this.alpha < 0.001) return; // Simulation has converged
    const cx = this.width / 2, cy = this.height / 2;
    const nodeMap: Record<number, GalaxyNode> = {};
    this.nodes.forEach(n => { nodeMap[n.id] = n; });

    // Gravity toward center
    this.nodes.forEach(node => {
      if (node.fx != null) return;
      const dx = cx - (node.x ?? cx), dy = cy - (node.y ?? cy);
      node.vx = (node.vx ?? 0) + dx * 0.002 * this.alpha;
      node.vy = (node.vy ?? 0) + dy * 0.002 * this.alpha;
    });

    // Link forces
    this.edges.forEach(edge => {
      const src = nodeMap[edge.source], tgt = nodeMap[edge.target];
      if (!src || !tgt) return;
      const dx = (tgt.x ?? 0) - (src.x ?? 0), dy = (tgt.y ?? 0) - (src.y ?? 0);
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const targetDist = 170 + (1 - edge.weight) * 100;
      const force = (dist - targetDist) / dist * 0.1 * this.alpha;
      if (src.fx == null) { src.vx = (src.vx ?? 0) + dx * force; src.vy = (src.vy ?? 0) + dy * force; }
      if (tgt.fx == null) { tgt.vx = (tgt.vx ?? 0) - dx * force; tgt.vy = (tgt.vy ?? 0) - dy * force; }
    });

    // Repulsion (only run while warm — skipped automatically when alpha decays)
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const a = this.nodes[i], b = this.nodes[j];
        const dx = (a.x ?? 0) - (b.x ?? 0), dy = (a.y ?? 0) - (b.y ?? 0);
        const dist2 = dx * dx + dy * dy || 1, dist = Math.sqrt(dist2);
        if (dist < 220) {
          const force = (4000 / dist2) * this.alpha;
          const fx = dx / dist * force, fy = dy / dist * force;
          if (a.fx == null) { a.vx = (a.vx ?? 0) + fx; a.vy = (a.vy ?? 0) + fy; }
          if (b.fx == null) { b.vx = (b.vx ?? 0) - fx; b.vy = (b.vy ?? 0) - fy; }
        }
      }
    }

    this.nodes.forEach(node => {
      if (node.fx != null) { node.x = node.fx; node.y = node.fy ?? node.y; return; }
      node.vx = (node.vx ?? 0) * 0.87;
      node.vy = (node.vy ?? 0) * 0.87;
      node.x = (node.x ?? 0) + (node.vx ?? 0);
      node.y = (node.y ?? 0) + (node.vy ?? 0);
    });

    this.alpha *= (1 - this.alphaDecay);
  }

  get isSettled() { return this.alpha < 0.001; }
}

const NODE_CENTER_SIZE = 64;
const NODE_NEIGHBOR_SIZE = 44;

export default function VibeGalaxy({ movieId, movieTitle, onClose, onNodeClick }: VibeGalaxyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<ForceSimulation | null>(null);
  const rafRef = useRef<number>(0);
  const imagesRef = useRef<Record<number, HTMLImageElement>>({});
  const [galaxyData, setGalaxyData] = useState<GalaxyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GalaxyNode | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const lastPan = useRef({ x: 0, y: 0 });
  const hoveredNodeRef = useRef<GalaxyNode | null>(null);

  useEffect(() => {
    setLoading(true); setError(null);
    fetch(`http://localhost:8000/api/v1/movies/${movieId}/galaxy?top_k=12`)
      .then(r => r.json())
      .then(data => { setGalaxyData(data); setLoading(false); })
      .catch(() => { setError("Failed to load. Please try again."); setLoading(false); });
  }, [movieId]);

  useEffect(() => {
    if (!galaxyData) return;
    galaxyData.nodes.forEach(node => {
      if (node.poster_url && !imagesRef.current[node.id]) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = node.poster_url;
        imagesRef.current[node.id] = img;
      }
    });
  }, [galaxyData]);

  useEffect(() => {
    if (!galaxyData || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    const logicalW = canvas.offsetWidth || window.innerWidth;
    const logicalH = canvas.offsetHeight || (window.innerHeight - 90);
    // Set physical pixel buffer at full Retina resolution
    canvas.width = logicalW * dpr;
    canvas.height = logicalH * dpr;
    // Simulation always works in logical (CSS) pixel space
    simRef.current = new ForceSimulation(galaxyData.nodes, galaxyData.edges, logicalW, logicalH, galaxyData.center_id);
  }, [galaxyData]);

  // Stable refs for scale and pan to avoid re-creating draw loop
  const scaleRef = useRef(scale);
  const panRef = useRef(pan);
  useEffect(() => { scaleRef.current = scale; }, [scale]);
  useEffect(() => { panRef.current = pan; }, [pan]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !simRef.current || !galaxyData) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    let frame = 0;
    let rafId = 0;
    let settled = false;

    const draw = () => {
      const sim = simRef.current!;
      const wasSettled = settled;
      sim.tick();
      settled = sim.isSettled;

      // Once settled and no hover, we can draw at lower rate or stop entirely
      // We always need to redraw on animation frames to handle hover glow pulse
      const { nodes, edges } = sim;
      const nodeMap: Record<number, GalaxyNode> = {};
      nodes.forEach(n => { nodeMap[n.id] = n; });
      const s = scaleRef.current, p = panRef.current;
      const hovered = hoveredNodeRef.current;

      // Clear
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      // Apply user pan/zoom
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(s, s);

      // ── Draw edges ──
      // Batch all edges in one path pass to minimize state changes
      ctx.shadowBlur = 0;
      edges.forEach(edge => {
        const src = nodeMap[edge.source], tgt = nodeMap[edge.target];
        if (!src || !tgt) return;
        const sx = src.x ?? 0, sy = src.y ?? 0, tx = tgt.x ?? 0, ty = tgt.y ?? 0;
        const color = getGenreColor(tgt.genres);
        const alpha = 0.15 + edge.weight * 0.45;

        // Single solid line with GPU shadowBlur glow (no ctx.filter)
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(tx, ty);
        ctx.strokeStyle = color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8; // GPU-accelerated glow, not CPU blur filter
        ctx.setLineDash([7, 5]);
        ctx.lineDashOffset = -frame * 0.5;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;

        // Score label
        const mx = (sx + tx) / 2, my = (sy + ty) / 2;
        ctx.globalAlpha = 0.4;
        ctx.font = "8px monospace";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.fillText(`${(edge.weight * 100).toFixed(0)}%`, mx, my - 4);
      });

      // ── Draw nodes ──
      nodes.forEach(node => {
        const isCenter = node.id === galaxyData.center_id;
        const isHovered = hovered?.id === node.id;
        const r = isCenter ? NODE_CENTER_SIZE / 2 : NODE_NEIGHBOR_SIZE / 2;
        const nx = node.x ?? 0, ny = node.y ?? 0;
        const color = isCenter ? "#FF3B2F" : getGenreColor(node.genres);

        // Glow ring via shadowBlur (GPU, free)
        const pulseR = isCenter
          ? r + 10 + Math.sin(frame * 0.05) * 4
          : isHovered ? r + 8 : r + 4;
        ctx.beginPath(); ctx.arc(nx, ny, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.globalAlpha = isCenter ? 0.7 : isHovered ? 0.85 : 0.25;
        ctx.lineWidth = isCenter ? 2 : 1.5;
        ctx.shadowColor = color;
        ctx.shadowBlur = isCenter ? 20 : isHovered ? 16 : 8;
        ctx.stroke();
        ctx.shadowBlur = 0;

        if (isCenter) {
          ctx.beginPath(); ctx.arc(nx, ny, pulseR + 12 + Math.sin(frame * 0.04 + 1) * 3, 0, Math.PI * 2);
          ctx.globalAlpha = 0.1; ctx.lineWidth = 1; ctx.stroke();
        }

        // Poster clipped to circle
        ctx.save();
        ctx.beginPath(); ctx.arc(nx, ny, r, 0, Math.PI * 2); ctx.clip();
        const img = imagesRef.current[node.id];
        if (img && img.complete && img.naturalHeight > 0) {
          ctx.globalAlpha = 1;
          ctx.drawImage(img, nx - r, ny - r, r * 2, r * 2);
          if (!isCenter) { ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.fillRect(nx - r, ny - r, r * 2, r * 2); }
        } else {
          const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, r);
          grad.addColorStop(0, color + "99"); grad.addColorStop(1, color + "11");
          ctx.fillStyle = grad; ctx.globalAlpha = 1;
          ctx.fillRect(nx - r, ny - r, r * 2, r * 2);
          ctx.font = `bold ${r * 0.55}px sans-serif`;
          ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(node.title.charAt(0), nx, ny);
        }
        ctx.restore();

        // Label
        ctx.globalAlpha = isCenter || isHovered ? 1 : 0.7;
        ctx.font = isCenter ? "bold 11px sans-serif" : "10px sans-serif";
        ctx.fillStyle = isCenter ? "#FF3B2F" : "#ffffff";
        ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.shadowColor = "rgba(0,0,0,0.99)"; ctx.shadowBlur = 6;
        const maxC = isCenter ? 22 : 15;
        const label = node.title.length > maxC ? node.title.slice(0, maxC) + "…" : node.title;
        ctx.fillText(label, nx, ny + r + 7);
        ctx.shadowBlur = 0;
      });

      ctx.restore();
      frame++;
      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [galaxyData]);

  const getNodeAt = useCallback((cx: number, cy: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !simRef.current || !galaxyData) return null;
    const rect = canvas.getBoundingClientRect();
    const mx = (cx - rect.left - panRef.current.x) / scaleRef.current;
    const my = (cy - rect.top - panRef.current.y) / scaleRef.current;
    for (const node of simRef.current.nodes) {
      const r = node.id === galaxyData.center_id ? NODE_CENTER_SIZE / 2 : NODE_NEIGHBOR_SIZE / 2;
      const dx = (node.x ?? 0) - mx, dy = (node.y ?? 0) - my;
      if (dx * dx + dy * dy <= (r + 12) * (r + 12)) return node;
    }
    return null;
  }, [galaxyData]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const node = getNodeAt(e.clientX, e.clientY);
    hoveredNodeRef.current = node;
    setHoveredNode(node);
    setTooltip(node ? { x: e.clientX, y: e.clientY } : null);
    if (isPanning.current) {
      const dx = e.clientX - lastPan.current.x, dy = e.clientY - lastPan.current.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      lastPan.current = { x: e.clientX, y: e.clientY };
    }
  }, [getNodeAt]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const node = getNodeAt(e.clientX, e.clientY);
    if (node && node.id !== galaxyData?.center_id) onNodeClick(node.id);
  }, [getNodeAt, galaxyData, onNodeClick]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!getNodeAt(e.clientX, e.clientY)) { isPanning.current = true; lastPan.current = { x: e.clientX, y: e.clientY }; }
  }, [getNodeAt]);

  const handleMouseUp = useCallback(() => { isPanning.current = false; }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setScale(prev => Math.max(0.4, Math.min(3, prev - e.deltaY * 0.001)));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ background: "rgba(4,4,4,0.98)" }}
    >
      {/* Starfield background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 80 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 0.5 + "px",
              height: Math.random() * 2 + 0.5 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              opacity: Math.random() * 0.4 + 0.05,
              animation: `pulse ${2 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: Math.random() * 4 + "s",
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/8 flex-shrink-0">
        <div>
          <p className="text-[10px] tracking-[0.15em] uppercase font-mono text-accent mb-1">✦ Vibe Galaxy</p>
          <h2 className="font-display font-black text-xl text-white">
            Semantic Universe of <span className="text-accent italic">{movieTitle}</span>
          </h2>
          <p className="text-white/25 text-[10px] font-mono mt-1">
            Click any planet to explore its galaxy · Scroll to zoom · Drag to pan
          </p>
        </div>
        <div className="flex items-center gap-2">
          {[
            { icon: ZoomIn, action: () => setScale(s => Math.min(3, s + 0.25)) },
            { icon: ZoomOut, action: () => setScale(s => Math.max(0.4, s - 0.25)) },
            { icon: RotateCcw, action: () => { setScale(1); setPan({ x: 0, y: 0 }); } },
          ].map(({ icon: Icon, action }, i) => (
            <button key={i} onClick={action}
              className="p-2 rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/25 transition-colors">
              <Icon className="w-4 h-4" />
            </button>
          ))}
          <button onClick={onClose}
            className="ml-2 p-2.5 rounded-full border border-red-500/30 text-red-400/60 hover:text-red-400 hover:border-red-500/60 hover:bg-red-500/10 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative flex-1 overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
            <div className="relative">
              <Loader2 className="w-12 h-12 animate-spin text-accent" />
              <div className="absolute inset-0 rounded-full border border-accent/20 animate-ping" />
            </div>
            <p className="text-white/30 text-xs font-mono">Mapping semantic universe…</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <p className="text-red-400/60 font-mono text-sm">{error}</p>
          </div>
        )}
        {galaxyData && (
          <>
            <canvas
              ref={canvasRef}
              width={typeof window !== "undefined" ? window.innerWidth : 1440}
              height={typeof window !== "undefined" ? window.innerHeight - 90 : 800}
              className="w-full h-full"
              style={{ cursor: hoveredNode ? "pointer" : "grab" }}
              onMouseMove={handleMouseMove}
              onClick={handleClick}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            />

            {/* Legend */}
            <div className="absolute bottom-6 left-6">
              <p className="text-[9px] tracking-widest uppercase font-mono text-white/20 mb-2">Genre</p>
              <div className="grid grid-cols-2 gap-x-5 gap-y-1">
                {Object.entries(GENRE_COLORS).slice(0, 10).map(([genre, color]) => (
                  <div key={genre} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-[9px] font-mono text-white/25">{genre}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="absolute top-4 right-6 text-right space-y-1">
              <p className="text-white/15 text-[10px] font-mono">{galaxyData.nodes.length - 1} connected films</p>
              <p className="text-white/10 text-[9px] font-mono">FAISS · all-MiniLM-L6-v2</p>
            </div>
          </>
        )}
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredNode && tooltip && hoveredNode.id !== galaxyData?.center_id && (
          <motion.div key={hoveredNode.id}
            initial={{ opacity: 0, scale: 0.9, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.12 }}
            className="fixed z-[200] pointer-events-none"
            style={{ left: tooltip.x + 18, top: tooltip.y - 90 }}
          >
            <div className="rounded-2xl px-4 py-3.5 shadow-2xl border border-white/8 max-w-[230px]"
              style={{ background: "rgba(8,8,8,0.96)", backdropFilter: "blur(24px)" }}>
              <p className="font-display font-bold text-white text-sm leading-snug line-clamp-2">{hoveredNode.title}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: getGenreColor(hoveredNode.genres) }} />
                <p className="text-[10px] font-mono text-white/35">
                  {hoveredNode.genres?.split(",")[0].trim()} · {hoveredNode.release_year ?? "—"}
                </p>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/6">
                <p className="text-[10px] font-mono text-white/25">★ {hoveredNode.average_rating?.toFixed(1)}</p>
                <p className="text-[10px] font-mono font-bold" style={{ color: getGenreColor(hoveredNode.genres) }}>
                  {(hoveredNode.score * 100).toFixed(0)}% match
                </p>
              </div>
              <p className="text-[9px] font-mono text-accent/40 mt-1.5">Click to explore →</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
