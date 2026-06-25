"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export interface Movie {
  id: string;
  title: string;
  year: number | null;
  overview: string;
  genres: string;
  poster_url: string;
  backdrop_url?: string;
  release_year?: number;
  average_rating?: number;
  director?: string;
  cast?: string;
}

interface MovieCardProps {
  movie: Movie;
  score?: number;
  rank?: number;
  explanation?: string;
  tfidfRank?: number;
  semanticRank?: number;
  showExplanation?: boolean;
  /** "row" = editorial horizontal list. "card" = compact vertical for playground. */
  variant?: "row" | "card";
}

/* ── Proximity helpers ── */
function getProximity(rank?: number) {
  if (!rank) return { scale: 1, opacity: 1, glow: false };
  if (rank === 1) return { scale: 1, opacity: 1, glow: true };
  if (rank <= 3) return { scale: 0.97, opacity: 0.85, glow: false };
  return { scale: 0.94, opacity: 0.65, glow: false };
}

/* ── ROW variant (search results) ── */
function RowCard({ movie, score, rank, explanation, showExplanation }: MovieCardProps) {
  const { opacity, glow } = getProximity(rank);
  const year = movie.release_year ?? movie.year;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ opacity: 1 }}
      className={`group border-b border-foreground/8 ${glow ? "border-accent/20" : ""}`}
    >
      <Link
        href={`/movies/${movie.id}`}
        className="flex items-stretch gap-6 py-6 hover:gap-8 transition-all duration-300"
      >
        {/* Rank */}
        <div className="flex-shrink-0 w-8 pt-1">
          <span className="font-mono text-xs text-muted">{String(rank ?? "—").padStart(2, "0")}</span>
        </div>

        {/* Poster */}
        <div className="flex-shrink-0 relative w-16 h-24 rounded-md overflow-hidden bg-foreground/5">
          {movie.poster_url ? (
            <Image
              src={movie.poster_url}
              alt={movie.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="64px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[8px] text-muted font-mono text-center px-1">
              {movie.title}
            </div>
          )}
          {glow && (
            <div className="absolute inset-0 ring-1 ring-accent/50 rounded-md" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <h3 className={`font-display font-bold leading-tight transition-colors group-hover:text-accent ${rank === 1 ? "text-2xl" : "text-xl"}`}>
              {movie.title}
            </h3>
            {score !== undefined && (
              <span className="flex-shrink-0 font-mono text-xs text-accent bg-accent/8 px-2 py-1 rounded">
                {score.toFixed(4)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 mt-1 mb-3">
            <span className="label">{year ?? "—"}</span>
            {movie.genres?.split(",").slice(0, 3).map((g) => (
              <span key={g} className="label">
                {g.trim()}
              </span>
            ))}
          </div>

          <p className="text-sm text-muted leading-relaxed line-clamp-2 font-sans">
            {movie.overview}
          </p>

          {showExplanation && explanation && (
            <p className="mt-3 text-xs text-foreground/60 font-sans leading-relaxed border-l-2 border-accent/30 pl-3">
              {explanation}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

/* ── CARD variant (playground / similar) ── */
function CompactCard({ movie, score, rank }: MovieCardProps) {
  const { opacity } = getProximity(rank);
  const year = movie.release_year ?? movie.year;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ opacity: 1 }}
      className="group"
    >
      <Link href={`/movies/${movie.id}`} className="flex items-center gap-4 py-4 border-b border-foreground/8 hover:border-foreground/20 transition-colors">
        {/* Rank */}
        <span className="font-mono text-xs text-muted w-5 flex-shrink-0">
          {String(rank ?? "—").padStart(2, "0")}
        </span>

        {/* Poster */}
        <div className="flex-shrink-0 relative w-10 h-14 rounded overflow-hidden bg-foreground/5">
          {movie.poster_url ? (
            <Image src={movie.poster_url} alt={movie.title} fill className="object-cover" sizes="40px" />
          ) : null}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-sm leading-tight truncate group-hover:text-accent transition-colors">
            {movie.title}
          </p>
          <p className="label mt-0.5">{year ?? "—"}</p>
        </div>

        {/* Score */}
        {score !== undefined && (
          <span className="flex-shrink-0 font-mono text-[10px] text-muted">
            {score.toFixed(3)}
          </span>
        )}
      </Link>
    </motion.div>
  );
}

/* ── Export ── */
export default function MovieCard(props: MovieCardProps) {
  return props.variant === "card" ? (
    <CompactCard {...props} />
  ) : (
    <RowCard {...props} />
  );
}
