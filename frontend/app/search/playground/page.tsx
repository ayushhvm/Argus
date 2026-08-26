"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import MovieCard, { Movie } from "@/components/MovieCard";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ResultItem {
  movie: Movie;
  score: number;
  explanation: string | null;
  tfidf_rank: number | null;
  semantic_rank: number | null;
  rrf_score: number | null;
}

interface PlaygroundResponse {
  query: string;
  expanded_query: string;
  tfidf_results: ResultItem[];
  semantic_results: ResultItem[];
  hybrid_results: ResultItem[];
  tfidf_latency_ms: number;
  semantic_latency_ms: number;
  hybrid_latency_ms: number;
}

const ENGINES = [
  {
    key: "tfidf_results" as const,
    latencyKey: "tfidf_latency_ms" as const,
    label: "Lexical",
    sub: "TF-IDF",
    color: "text-tfidf",
    dot: "bg-tfidf",
    border: "border-tfidf/30",
  },
  {
    key: "semantic_results" as const,
    latencyKey: "semantic_latency_ms" as const,
    label: "Semantic",
    sub: "FAISS",
    color: "text-semantic",
    dot: "bg-semantic",
    border: "border-semantic/30",
  },
  {
    key: "hybrid_results" as const,
    latencyKey: "hybrid_latency_ms" as const,
    label: "Hybrid",
    sub: "RRF Fusion",
    color: "text-hybrid",
    dot: "bg-hybrid",
    border: "border-hybrid/30",
  },
];

export default function PlaygroundPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      }
    >
      <PlaygroundContent />
    </Suspense>
  );
}

function PlaygroundContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [data, setData] = useState<PlaygroundResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) return;
    const fetch_ = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:8000/api/v1/search/playground?q=${encodeURIComponent(q)}`
        );
        setData(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [q]);

  return (
    <main className="min-h-screen px-8 md:px-12">
      {/* Header */}
      <div className="py-12 border-b border-foreground/10 space-y-8">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="label mb-2 text-accent">IR Comparison</p>
            <h1 className="font-display font-black text-4xl md:text-5xl leading-none">
              Retrieval Playground
            </h1>
          </div>
          {data && (
            <p className="label text-muted">
              Query expanded →{" "}
              <span className="text-foreground">{data.expanded_query}</span>
            </p>
          )}
        </div>
        <SearchBar
          initialQuery={q}
          targetPath="/search/playground"
          placeholder="Compare how each engine handles your query..."
          disableDropdown
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="label">Running 3 retrieval engines in parallel...</p>
        </div>
      )}

      {/* Columns */}
      {!loading && data && (
        <div className="py-10 flex md:grid md:grid-cols-3 gap-6 md:gap-0 md:divide-x divide-foreground/10 overflow-x-auto snap-x snap-mandatory hide-scrollbar">
          {ENGINES.map((eng) => {
            const results = data[eng.key];
            const latency = data[eng.latencyKey];
            const isFastest = latency === Math.min(data.tfidf_latency_ms, data.semantic_latency_ms, data.hybrid_latency_ms);
            
            return (
              <div key={eng.key} className="w-[85vw] md:w-auto flex-shrink-0 snap-center md:px-8 first:pl-0 last:pr-0 py-8 md:py-0">
                {/* Column header */}
                <div className={`flex items-center justify-between pb-6 border-b ${eng.border}`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${eng.dot} flex-shrink-0`} />
                    <div>
                      <p className={`font-display font-bold text-lg leading-none ${eng.color}`}>
                        {eng.label}
                      </p>
                      <p className="label mt-1">{eng.sub}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isFastest && (
                      <span className="font-mono text-xs text-background bg-foreground px-2 py-1 rounded animate-pulse">
                        Fastest ⚡
                      </span>
                    )}
                    <span className="font-mono text-xs text-muted bg-foreground/5 px-2 py-1 rounded">
                      {latency.toFixed(1)}ms
                    </span>
                  </div>
                </div>

                {/* Results */}
                <motion.div layout>
                  <AnimatePresence>
                    {results.map((item, idx) => (
                      <MovieCard
                        key={`${eng.key}-${item.movie.id}`}
                        movie={item.movie}
                        score={item.rrf_score ?? item.score}
                        rank={idx + 1}
                        variant="card"
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!q && (
        <div className="py-32 text-center space-y-3">
          <p className="font-display font-bold text-3xl">Enter a query above.</p>
          <p className="label">
            See how TF-IDF, Semantic, and Hybrid each interpret it differently.
          </p>
        </div>
      )}
    </main>
  );
}
