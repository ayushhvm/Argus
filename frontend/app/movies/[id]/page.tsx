"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MovieCard, { Movie } from '@/components/MovieCard';
import { Loader2, Star, Calendar } from 'lucide-react';

interface SimilarMovie {
  movie: Movie;
  score: number;
}

export default function MovieDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [movie, setMovie] = useState<Movie | null>(null);
  const [similar, setSimilar] = useState<SimilarMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchMovie = async () => {
      setLoading(true);
      try {
        const [movieRes, similarRes] = await Promise.all([
          fetch(`http://localhost:8000/api/v1/movies/${id}`),
          fetch(`http://localhost:8000/api/v1/movies/${id}/similar`)
        ]);
        
        if (movieRes.ok) setMovie(await movieRes.json());
        if (similarRes.ok) setSimilar(await similarRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-accent animate-spin" />
      </div>
    );
  }

  if (!movie) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-gray-500">Movie not found.</div>;
  }

  const posterUrl = movie.poster_url || `https://via.placeholder.com/500x750/111827/ffffff?text=${encodeURIComponent(movie.title)}`;
  const backdropUrl = movie.poster_url || `https://via.placeholder.com/1920x1080/09090b/09090b`;

  return (
    <main className="min-h-screen pb-20">
      {/* Cinematic Backdrop */}
      <div className="relative w-full h-[60vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent z-10" />
        <img 
          src={backdropUrl} 
          alt={movie.title} 
          className="w-full h-full object-cover blur-sm scale-105 opacity-50"
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-20 -mt-[40vh]">
        <div className="flex flex-col md:flex-row gap-10">
          
          {/* Poster */}
          <div className="w-64 md:w-80 flex-shrink-0">
            <img 
              src={posterUrl} 
              alt={movie.title}
              className="w-full rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10"
            />
          </div>

          {/* Details */}
          <div className="flex-1 space-y-6 pt-10">
            <h1 className="text-5xl md:text-6xl font-black drop-shadow-lg leading-tight">
              {movie.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-gray-300 text-sm font-medium">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" />
                {movie.release_year}
              </span>
              <span className="flex items-center gap-2 text-yellow-400">
                <Star className="w-4 h-4 fill-current" />
                {movie.average_rating ? movie.average_rating.toFixed(1) : "N/A"}
              </span>
              <div className="flex items-center gap-2">
                {movie.genres?.split(',').map(g => (
                  <span key={g} className="px-3 py-1 rounded-full bg-white/10 border border-white/10">
                    {g.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <h3 className="text-lg font-semibold text-white/90">Overview</h3>
              <p className="text-gray-400 text-lg leading-relaxed max-w-3xl">
                {movie.overview}
              </p>
            </div>
            
            {/* You can add cast and director here if available in the model */}
          </div>
        </div>

        {/* Similar Movies via Semantic FAISS */}
        <div className="mt-32 space-y-6">
          <div className="flex flex-col space-y-2">
            <h2 className="text-2xl font-bold border-b border-white/10 pb-4">
              Similar Movies
            </h2>
            <p className="text-sm text-gray-500">
              Discovered using <span className="text-accent font-mono">Semantic FAISS Embeddings</span> via Content Similarity.
            </p>
          </div>
          
          {similar.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {similar.slice(0, 5).map((item) => (
                <MovieCard 
                  key={item.movie.id} 
                  movie={item.movie} 
                  score={item.score} 
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No similar movies found.</p>
          )}
        </div>
      </div>
    </main>
  );
}
