"use client";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import MovieCard, { Movie } from '@/components/MovieCard';
import { Loader2, Zap, BrainCircuit, Combine } from 'lucide-react';

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

import { Suspense } from 'react';

export default function PlaygroundPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>}>
      <PlaygroundContent />
    </Suspense>
  );
}

function PlaygroundContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';

  const [data, setData] = useState<PlaygroundResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) return;
    
    const fetchPlayground = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/v1/search/playground?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayground();
  }, [q]);

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-accent to-blue-500 bg-clip-text text-transparent">
            Retrieval Playground
          </h1>
          <p className="text-gray-400">
            Compare lexical, semantic, and hybrid Information Retrieval strategies side-by-side.
          </p>
          <SearchBar initialQuery={q} targetPath="/search/playground" />
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-32 text-accent">
            <Loader2 className="w-12 h-12 animate-spin" />
            <p className="mt-4 text-gray-400 animate-pulse">Running all retrieval engines in parallel...</p>
          </div>
        )}

        {!loading && data && (
          <div className="space-y-8">
            <div className="glass p-6 rounded-2xl border border-white/5 flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-semibold">Query Analysis</div>
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-gray-400 text-sm">Original: </span>
                    <span className="text-white font-medium">&quot;{data.query}&quot;</span>
                  </div>
                  {data.expanded_query && data.expanded_query !== data.query && (
                    <div>
                      <span className="text-gray-400 text-sm">Expanded Intent: </span>
                      <span className="text-accent font-medium">{data.expanded_query}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* TF-IDF Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Lexical (TF-IDF)
                  </h2>
                  <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-gray-400">
                    {data.tfidf_latency_ms.toFixed(2)}ms
                  </span>
                </div>
                <div className="space-y-4">
                  {data.tfidf_results.map((item, idx) => (
                    <MovieCard key={`tfidf-${item.movie.id}`} movie={item.movie} score={item.score} rank={idx + 1} />
                  ))}
                </div>
              </div>

              {/* Semantic Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-purple-500/30 pb-3">
                  <h2 className="text-xl font-semibold flex items-center gap-2 text-purple-100">
                    <BrainCircuit className="w-5 h-5 text-purple-400" />
                    Semantic (FAISS)
                  </h2>
                  <span className="text-xs font-mono bg-purple-500/10 px-2 py-1 rounded text-purple-300">
                    {data.semantic_latency_ms.toFixed(2)}ms
                  </span>
                </div>
                <div className="space-y-4">
                  {data.semantic_results.map((item, idx) => (
                    <MovieCard key={`semantic-${item.movie.id}`} movie={item.movie} score={item.score} rank={idx + 1} />
                  ))}
                </div>
              </div>

              {/* Hybrid Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-blue-500/30 pb-3">
                  <h2 className="text-xl font-semibold flex items-center gap-2 text-blue-100">
                    <Combine className="w-5 h-5 text-blue-400" />
                    Hybrid (RRF Fusion)
                  </h2>
                  <span className="text-xs font-mono bg-blue-500/10 px-2 py-1 rounded text-blue-300">
                    {data.hybrid_latency_ms.toFixed(2)}ms
                  </span>
                </div>
                <div className="space-y-4">
                  {data.hybrid_results.map((item, idx) => (
                    <MovieCard 
                      key={`hybrid-${item.movie.id}`} 
                      movie={item.movie} 
                      score={item.rrf_score || item.score} 
                      rank={idx + 1}
                      explanation={item.explanation || undefined}
                      tfidfRank={item.tfidf_rank || undefined}
                      semanticRank={item.semantic_rank || undefined}
                      showExplanation={true}
                    />
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}
