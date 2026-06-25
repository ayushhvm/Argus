"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import MovieCard, { Movie } from "@/components/MovieCard";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  movie: Movie;
  score: number;
  explanation: string | null;
}

interface SearchResponse {
  query: string;
  expanded_query: string;
  engine: string;
  latency_ms: number;
  results: SearchResult[];
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const engine = searchParams.get("engine") || "semantic";

  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) return;
    const fetch_ = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:8000/api/v1/search?q=${encodeURIComponent(q)}&engine=${engine}`
        );
        setData(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [q, engine]);

  return (
    <main className="min-h-screen px-8 md:px-12">
      {/* Header */}
      <div className="py-12 border-b border-foreground/10 space-y-8">
        <div className="flex items-end justify-between gap-4">
          <h1 className="font-display font-black text-4xl md:text-5xl leading-none">
            Discover
          </h1>
          <p className="label hidden md:block">Semantic Retrieval · FAISS</p>
        </div>
        <SearchBar initialQuery={q} />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="label text-muted">Querying semantic space...</p>
        </div>
      )}

      {/* Results */}
      {!loading && data && data.results.length > 0 && (
        <div className="py-8">
          {/* Meta row */}
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <p className="font-display font-bold text-xl">
                &ldquo;{data.query}&rdquo;
              </p>
              {data.expanded_query && data.expanded_query !== data.query && (
                <p className="label">
                  Intent →{" "}
                  <span className="text-accent">{data.expanded_query}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="font-mono text-2xl font-bold">{data.results.length}</p>
                <p className="label">Results</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-2xl font-bold">
                  {data.latency_ms.toFixed(0)}
                  <span className="text-xs text-muted ml-1">ms</span>
                </p>
                <p className="label">Latency</p>
              </div>
            </div>
          </div>

          <motion.div layout>
            <AnimatePresence>
              {data.results.map((item, idx) => (
                <MovieCard
                  key={item.movie.id}
                  movie={item.movie}
                  score={item.score}
                  rank={idx + 1}
                  explanation={item.explanation || undefined}
                  showExplanation
                  variant="row"
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {/* Empty */}
      {!loading && q && data?.results.length === 0 && (
        <div className="py-32 text-center space-y-3">
          <p className="font-display font-bold text-3xl">Nothing found.</p>
          <p className="label">Try a different theme or concept.</p>
        </div>
      )}

      {/* No query */}
      {!q && (
        <div className="py-32 text-center space-y-3">
          <p className="font-display font-bold text-3xl">What are you looking for?</p>
          <p className="label">Type something above to start discovering.</p>
        </div>
      )}
    </main>
  );
}
