"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import MovieCard, { Movie } from "@/components/MovieCard";
import { Loader2, Star, Clock, Network } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import dynamic from "next/dynamic";

const VibeGalaxy = dynamic(() => import("@/components/VibeGalaxy"), { ssr: false });

interface FullMovie extends Movie {
  release_year?: number;
  average_rating?: number;
  backdrop_url?: string;
  director?: string;
  cast?: string;
  runtime?: number;
}

interface SimilarMovie {
  movie: Movie;
  score: number;
}

export default function MovieDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [movie, setMovie] = useState<FullMovie | null>(null);
  const [similar, setSimilar] = useState<SimilarMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGalaxy, setShowGalaxy] = useState(false);

  const handleGalaxyNodeClick = useCallback((movieId: number) => {
    setShowGalaxy(false);
    router.push(`/movies/${movieId}`);
  }, [router]);

  useEffect(() => {
    if (!id) return;
    const fetch_ = async () => {
      setLoading(true);
      try {
        const [mRes, sRes] = await Promise.all([
          fetch(`http://localhost:8000/api/v1/movies/${id}`),
          fetch(`http://localhost:8000/api/v1/movies/${id}/similar`),
        ]);
        if (mRes.ok) setMovie(await mRes.json());
        if (sRes.ok) setSimilar(await sRes.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <p className="font-display font-bold text-3xl">Film not found.</p>
        <p className="label">The ID you provided doesn&rsquo;t match any film in the index.</p>
      </div>
    );
  }

  const year = movie.release_year ?? movie.year;

  return (
    <main className="min-h-screen">
      {/* ── Full-bleed backdrop ── */}
      <div className="relative w-full h-[56vh] overflow-hidden">
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 to-transparent z-10" />

        {movie.backdrop_url || movie.poster_url ? (
          <Image
            src={movie.backdrop_url || movie.poster_url}
            alt={movie.title}
            fill
            className="object-cover opacity-70"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-tfidf/20 via-semantic/20 to-hybrid/20" />
        )}
      </div>

      {/* ── Content ── */}
      <div className="px-8 md:px-12 -mt-16 md:-mt-[28vh] relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="grid md:grid-cols-[auto_1fr] gap-10 items-end"
        >
          {/* Poster */}
          <div className="w-48 md:w-64 flex-shrink-0">
            {movie.poster_url ? (
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-foreground/8">
                <Image
                  src={movie.poster_url}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 192px, 256px"
                />
              </div>
            ) : (
              <div className="aspect-[2/3] rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center p-4">
                <span className="font-display font-bold text-center text-sm text-muted">
                  {movie.title}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-5 pb-2">
            <div className="flex flex-col mb-4">
              <p className="label mb-2">{year ?? "Unknown year"}</p>
              <h1 className="font-display font-black text-4xl md:text-6xl leading-[0.95] tracking-tight">
                {movie.title}
              </h1>
            </div>

            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-4">
              {movie.average_rating && (
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-accent text-accent" />
                  <span className="font-mono font-bold text-lg">
                    {movie.average_rating.toFixed(1)}
                  </span>
                </div>
              )}
              {movie.runtime && (
                <div className="flex items-center gap-1.5 text-muted">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono text-sm">{movie.runtime}m</span>
                </div>
              )}
              {movie.director && (
                <span className="label">
                  Dir. <span className="text-foreground font-sans font-medium">{movie.director}</span>
                </span>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {movie.genres?.split(",").map((g) => (
                <span
                  key={g}
                  className="label border border-foreground/15 px-3 py-1.5 rounded-full"
                >
                  {g.trim()}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center gap-4">
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${movie.title} ${year ?? ""} movie trailer`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent text-accent-foreground font-display font-bold rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(var(--accent),0.4)]"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Trailer
              </a>
              <button
                onClick={() => setShowGalaxy(true)}
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-foreground/15 text-foreground font-display font-bold rounded-full hover:bg-foreground/5 hover:border-foreground/30 transition-all"
              >
                <Network className="w-4 h-4" />
                Vibe Galaxy
              </button>
            </div>
          </div>
        </motion.div>

        {/* Overview + cast */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-12 grid md:grid-cols-[2fr_1fr] gap-12 border-t border-foreground/10 pt-12"
        >
          <div className="space-y-4">
            <p className="label">Overview</p>
            <p className="font-sans text-lg leading-relaxed text-foreground/80">
              {movie.overview}
            </p>
          </div>
          {movie.cast && (
            <div className="space-y-4">
              <p className="label">Cast</p>
              <div className="flex flex-wrap gap-2">
                {movie.cast
                  .split(",")
                  .slice(0, 8)
                  .map((c) => (
                    <span
                      key={c}
                      className="font-sans font-medium text-sm text-foreground bg-foreground/5 border border-foreground/10 px-3 py-1.5 rounded-full"
                    >
                      {c.trim()}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Similar */}
        {similar.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-16 pb-20 border-t border-foreground/10 pt-12 space-y-8"
          >
            {/* Header */}
            <div className="flex items-end justify-between">
              <div>
                <p className="label mb-1 text-semantic">AI Discovery</p>
                <h2 className="font-display font-black text-3xl">Similar Films</h2>
              </div>
              <div className="flex items-center gap-2 label text-muted">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-semantic" />
                Semantic FAISS · cosine similarity
              </div>
            </div>

            {/* Poster grid carousel */}
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 snap-x snap-mandatory"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
              {similar.slice(0, 10).map((item, idx) => {
                const year = item.movie.release_year ?? item.movie.year;
                const pct = Math.round(item.score * 100);
                return (
                  <motion.div
                    key={item.movie.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className="flex-shrink-0 snap-start"
                    style={{ width: "clamp(130px, 14vw, 180px)" }}
                  >
                    <Link href={`/movies/${item.movie.id}`} className="group block">
                      {/* Poster */}
                      <div className="relative rounded-xl overflow-hidden bg-foreground/5 shadow-lg"
                        style={{ aspectRatio: "2/3" }}>
                        {item.movie.poster_url ? (
                          <Image
                            src={item.movie.poster_url}
                            alt={item.movie.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="180px"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center p-3">
                            <span className="font-display font-bold text-xs text-muted text-center leading-tight">
                              {item.movie.title}
                            </span>
                          </div>
                        )}

                        {/* Gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Score badge */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background: "rgba(0,180,216,0.9)", color: "#fff" }}>
                            {pct}%
                          </span>
                        </div>

                        {/* Rank badge */}
                        <div className="absolute top-2 left-2">
                          <span className="text-[9px] font-mono text-white/50 bg-black/50 px-1.5 py-0.5 rounded-full">
                            #{idx + 1}
                          </span>
                        </div>

                        {/* Bottom info on hover */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                          <p className="font-display font-bold text-white text-xs leading-tight line-clamp-2">
                            {item.movie.title}
                          </p>
                        </div>
                      </div>

                      {/* Info below poster */}
                      <div className="mt-2.5 px-0.5">
                        <p className="font-display font-bold text-sm leading-tight line-clamp-1 group-hover:text-accent transition-colors">
                          {item.movie.title}
                        </p>
                        <p className="label mt-0.5 text-muted">{year ?? "—"}</p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Vibe Galaxy overlay */}
      <AnimatePresence>
        {showGalaxy && movie && (
          <VibeGalaxy
            movieId={parseInt(id)}
            movieTitle={movie.title}
            onClose={() => setShowGalaxy(false)}
            onNodeClick={handleGalaxyNodeClick}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
