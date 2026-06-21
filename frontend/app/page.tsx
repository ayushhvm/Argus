import SearchBar from '@/components/SearchBar';
import { Play } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] overflow-hidden">
      
      {/* Background Graphic */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[120px] opacity-50 pointer-events-none" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center flex flex-col items-center gap-8">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-gray-300 border-white/10 mb-4">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Semantic Engine Active
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white drop-shadow-2xl">
          Discover Movies <br />
          <span className="bg-gradient-to-r from-accent to-blue-500 bg-clip-text text-transparent">
            Intelligently.
          </span>
        </h1>
        
        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Powered by state-of-the-art Information Retrieval. Search for themes, concepts, or exact matches and let the semantic engine find the perfect film.
        </p>

        <div className="w-full mt-8">
          <SearchBar large autoFocus />
        </div>

        <div className="flex gap-4 mt-8">
          <Link 
            href="/search/playground"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-medium transition-colors border border-white/10"
          >
            <Play className="w-4 h-4 text-accent" />
            Try Retrieval Playground
          </Link>
        </div>
        
      </div>
    </main>
  );
}
