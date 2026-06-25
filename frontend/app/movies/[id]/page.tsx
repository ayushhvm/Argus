"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MovieCard, { Movie } from "@/components/MovieCard";
import { Loader2, Star, Clock } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

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
  const [movie, setMovie] = useState<FullMovie | null>(null);
  const [similar, setSimilar] = useState<SimilarMovie[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="px-8 md:px-12 -mt-[28vh] relative z-20">
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
            <div>
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
                      className="font-sans text-sm text-foreground/70 border border-foreground/10 px-2 py-1 rounded"
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-16 pb-20 space-y-6 border-t border-foreground/10 pt-12"
          >
            <div className="flex items-end justify-between">
              <div>
                <p className="label mb-1">AI Discovery</p>
                <h2 className="font-display font-bold text-2xl">Similar Films</h2>
              </div>
              <p className="label text-semantic">Semantic FAISS Similarity</p>
            </div>

            <div>
              {similar.slice(0, 6).map((item, idx) => (
                <MovieCard
                  key={item.movie.id}
                  movie={item.movie}
                  score={item.score}
                  rank={idx + 1}
                  variant="row"
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
