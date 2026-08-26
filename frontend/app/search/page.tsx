"use client";
import { useEffect, useState, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import MovieCard, { Movie } from "@/components/MovieCard";
import Link from "next/link";
import Image from "next/image";
import { Loader2, LayoutGrid, List } from "lucide-react";
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

type SortOption = "relevance" | "rating" | "year";

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const engine = searchParams.get("engine") || "hybrid";

  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");

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

  // Client-side sorting
  const sortedResults = useMemo(() => {
    if (!data?.results) return [];
    const res = [...data.results];
    if (sortBy === "rating") {
      res.sort((a, b) => (b.movie.average_rating || 0) - (a.movie.average_rating || 0));
    } else if (sortBy === "year") {
      res.sort((a, b) => (b.movie.release_year || 0) - (a.movie.release_year || 0));
    }
    return res;
  }, [data, sortBy]);

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
        <SearchBar initialQuery={q} disableDropdown />
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
          {/* Meta & Filters row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
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
            
            <div className="flex items-center gap-6 flex-wrap">
              {/* Sort Pills */}
              <div className="flex gap-2">
                {(["relevance", "rating", "year"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSortBy(opt)}
                    className={`px-3 py-1.5 rounded-full label transition-colors ${
                      sortBy === opt 
                        ? "bg-foreground text-background" 
                        : "bg-foreground/5 hover:bg-foreground/10 text-foreground"
                    }`}
                  >
                    Sort: {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </button>
                ))}
              </div>

              <div className="w-px h-6 bg-foreground/10 hidden md:block" />

              {/* View Toggles */}
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-colors ${viewMode === "list" ? "bg-foreground/10 text-foreground" : "text-muted hover:text-foreground"}`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-colors ${viewMode === "grid" ? "bg-foreground/10 text-foreground" : "text-muted hover:text-foreground"}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>

              <div className="w-px h-6 bg-foreground/10 hidden md:block" />

              <div className="text-right">
                <p className="font-mono text-2xl font-bold">
                  {data.latency_ms.toFixed(0)}
                  <span className="text-xs text-muted ml-1">ms</span>
                </p>
                <p className="label">Latency</p>
              </div>
            </div>
          </div>

          {viewMode === "list" ? (
            <motion.div layout>
              <AnimatePresence>
                {sortedResults.map((item, idx) => (
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
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            >
              <AnimatePresence>
                {sortedResults.map((item, idx) => {
                  const year = item.movie.release_year ?? item.movie.year;
                  return (
                    <motion.div
                      key={item.movie.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.03 }}
                    >
                      <Link href={`/movies/${item.movie.id}`} className="group block">
                        <div
                          className="relative rounded-xl overflow-hidden bg-foreground/5 shadow-md"
                          style={{ aspectRatio: "2/3" }}
                        >
                          {item.movie.poster_url ? (
                            <Image
                              src={item.movie.poster_url}
                              alt={item.movie.title}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center p-3">
                              <span className="font-display font-bold text-xs text-muted text-center leading-tight">
                                {item.movie.title}
                              </span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute top-2 left-2">
                            <span className="text-[9px] font-mono text-white/50 bg-black/50 px-1.5 py-0.5 rounded-full">
                              #{idx + 1}
                            </span>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                            <p className="font-display font-bold text-white text-xs leading-tight line-clamp-2">
                              {item.movie.title}
                            </p>
                          </div>
                        </div>
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
              </AnimatePresence>
            </motion.div>
          )}
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
