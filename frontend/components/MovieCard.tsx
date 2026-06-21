"use client";
import Link from 'next/link';
import { Star, Calendar } from 'lucide-react';
import ExplanationBadge from './ExplanationBadge';

export interface Movie {
  id: number;
  title: string;
  overview: string;
  genres: string;
  release_year: number;
  average_rating: number;
  poster_url?: string;
}

interface MovieCardProps {
  movie: Movie;
  score?: number;
  explanation?: string;
  tfidfRank?: number;
  semanticRank?: number;
  rank?: number;
  showExplanation?: boolean;
}

export default function MovieCard({ 
  movie, 
  score, 
  explanation, 
  tfidfRank, 
  semanticRank, 
  rank,
  showExplanation = false 
}: MovieCardProps) {
  // If no poster, use a sleek placeholder
  const posterUrl = movie.poster_url || `https://via.placeholder.com/500x750/111827/ffffff?text=${encodeURIComponent(movie.title)}`;

  return (
    <Link href={`/movies/${movie.id}`} className="block group">
      <div className="relative rounded-xl overflow-hidden glass transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:border-accent/50 flex flex-col h-full">
        
        {rank && (
          <div className="absolute top-3 left-3 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center font-bold text-white shadow-lg">
            {rank}
          </div>
        )}

        <div className="relative aspect-[2/3] w-full overflow-hidden">
          <img 
            src={posterUrl} 
            alt={movie.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
          
          <div className="absolute bottom-0 w-full p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <h3 className="font-bold text-lg text-white line-clamp-2 leading-tight drop-shadow-md">
              {movie.title}
            </h3>
            <div className="flex items-center gap-3 mt-2 text-xs font-medium text-gray-300">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {movie.release_year || "Unknown"}
              </span>
              <span className="flex items-center gap-1 text-yellow-400">
                <Star className="w-3 h-3 fill-current" />
                {movie.average_rating ? movie.average_rating.toFixed(1) : "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed flex-1">
            {movie.overview}
          </p>
          
          <div className="mt-4 flex flex-wrap gap-1">
            {movie.genres?.split(',').slice(0, 3).map(g => (
              <span key={g} className="px-2 py-1 rounded-md bg-white/5 text-[10px] uppercase tracking-wider text-gray-400 border border-white/5">
                {g.trim()}
              </span>
            ))}
          </div>

          {score !== undefined && (
            <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center text-xs">
              <span className="text-gray-500 font-medium tracking-wide uppercase">Relevance Score</span>
              <span className="font-mono text-accent bg-accent/10 px-2 py-1 rounded">
                {score.toFixed(4)}
              </span>
            </div>
          )}

          {showExplanation && explanation && (
            <ExplanationBadge 
              explanation={explanation} 
              tfidfRank={tfidfRank} 
              semanticRank={semanticRank} 
            />
          )}
        </div>
      </div>
    </Link>
  );
}
