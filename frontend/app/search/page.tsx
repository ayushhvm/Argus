"use client";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import MovieCard, { Movie } from '@/components/MovieCard';
import { Loader2 } from 'lucide-react';

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

import { Suspense } from 'react';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const engine = searchParams.get('engine') || 'semantic';

  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) return;
    
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/v1/search?q=${encodeURIComponent(q)}&engine=${engine}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [q, engine]);

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Discover Movies</h1>
          <SearchBar initialQuery={q} />
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-accent">
            <Loader2 className="w-10 h-10 animate-spin" />
            <p className="mt-4 text-sm text-gray-400">Querying semantic latent space...</p>
          </div>
        )}

        {!loading && data && data.results.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h2 className="text-xl text-white font-medium">Results for &quot;{data.query}&quot;</h2>
                {data.expanded_query && data.expanded_query !== data.query && (
                  <p className="text-sm text-gray-500 mt-1">
                    Expanded: <span className="text-accent">{data.expanded_query}</span>
                  </p>
                )}
              </div>
              <div className="text-sm font-mono text-gray-500 bg-white/5 px-3 py-1.5 rounded-md">
                Latency: <span className="text-white">{data.latency_ms.toFixed(2)}ms</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {data.results.map((item, idx) => (
                <MovieCard 
                  key={item.movie.id} 
                  movie={item.movie} 
                  score={item.score}
                  rank={idx + 1}
                  explanation={item.explanation || undefined}
                  showExplanation={true}
                />
              ))}
            </div>
          </div>
        )}

        {!loading && data && data.results.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No movies found for this query. Try a different concept.
          </div>
        )}
      </div>
    </main>
  );
}
