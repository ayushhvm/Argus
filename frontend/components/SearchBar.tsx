"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Film, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface SearchBarProps {
  initialQuery?: string;
  autoFocus?: boolean;
  large?: boolean;
  targetPath?: string;
  disableDropdown?: boolean;
}

const SURPRISE_PROMPTS = [
  "A heartwarming family movie...",
  "Gritty cyberpunk thriller...",
  "Epic space opera with aliens...",
  "Mind-bending psychological horror...",
  "Feel-good romantic comedy...",
];

export default function SearchBar({
  initialQuery = "",
  autoFocus = false,
  large = false,
  targetPath = "/search",
  disableDropdown = false,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  
  const router = useRouter();
  const searchTimeout = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Rotate placeholder text
  useEffect(() => {
    const interval = setInterval(() => {
      setPromptIndex((prev) => (prev + 1) % SURPRISE_PROMPTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Debounced search
  useEffect(() => {
    if (disableDropdown) return;
    
    if (!query.trim()) {
      setResults([]);
      return;
    }
    
    // Only show live results if we're not on the search page
    // or if the query changed from initialQuery
    if (query === initialQuery && results.length === 0) return;

    clearTimeout(searchTimeout.current);
    setIsSearching(true);
    setShowDropdown(true);

    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/search?q=${encodeURIComponent(query.trim())}&engine=hybrid`
        );
        const data = await res.json();
        setResults(data.results?.slice(0, 4) || []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout.current);
  }, [query, initialQuery]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowDropdown(false);
      router.push(`${targetPath}?q=${encodeURIComponent(query.trim())}&engine=hybrid`);
    }
  };

  const handleSurpriseMe = () => {
    const randomPrompt = SURPRISE_PROMPTS[Math.floor(Math.random() * SURPRISE_PROMPTS.length)];
    setQuery(randomPrompt);
  };

  return (
    <div className="relative w-full z-50" ref={containerRef}>
      <form onSubmit={handleSearch} className="w-full group outline-none">
        <div
          className={`search-glass flex items-center rounded-none border-0 border-b-2 border-foreground/20 focus-within:border-accent transition-colors duration-300 outline-none ${
            large ? "py-4" : "py-3"
          } px-0 gap-4`}
        >
          <div className="relative flex-1 flex items-center">
            {!query && (
              <div className="absolute inset-0 flex items-center pointer-events-none pl-2">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={promptIndex}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.3 }}
                    className={`text-muted font-sans ${large ? "text-xl md:text-2xl" : "text-base"}`}
                  >
                    Search for {SURPRISE_PROMPTS[promptIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            )}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => { if (query) setShowDropdown(true); }}
              autoFocus={autoFocus}
              className={`relative z-10 w-full bg-transparent border-none outline-none text-foreground font-sans pl-2 pr-4 ${
                large ? "text-xl md:text-2xl" : "text-base"
              }`}
            />
          </div>
          
          <button
            type="button"
            onClick={handleSurpriseMe}
            className="flex-shrink-0 p-2 text-accent/70 hover:text-accent hover:bg-accent/10 rounded-full transition-colors"
            title="Surprise Me"
          >
            <Sparkles className="w-5 h-5" />
          </button>
          
          <button
            type="submit"
            className="flex-shrink-0 flex items-center gap-2 label text-accent hover:gap-4 transition-all duration-200"
          >
            Search
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      <AnimatePresence>
        {!disableDropdown && showDropdown && query && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-4 bg-background/80 backdrop-blur-2xl border border-foreground/10 rounded-xl overflow-hidden shadow-2xl"
          >
            {isSearching ? (
              <div className="p-8 flex justify-center items-center">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
              </div>
            ) : results.length > 0 ? (
              <div className="flex flex-col">
                {results.map((item, idx) => (
                  <button
                    key={item.movie.id}
                    onClick={() => {
                      setShowDropdown(false);
                      router.push(`/movies/${item.movie.id}`);
                    }}
                    className="flex items-center gap-4 p-4 hover:bg-foreground/5 transition-colors text-left border-b border-foreground/5 last:border-0"
                  >
                    <div className="w-10 h-14 relative rounded overflow-hidden bg-foreground/10 flex-shrink-0">
                      {item.movie.poster_url ? (
                        <Image src={item.movie.poster_url} alt={item.movie.title} fill className="object-cover" />
                      ) : (
                        <Film className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted" />
                      )}
                    </div>
                    <div>
                      <p className="font-display font-bold text-foreground line-clamp-1">{item.movie.title}</p>
                      <p className="text-xs text-muted mt-1">{item.movie.release_year} • {item.movie.genres?.split(',')[0]}</p>
                    </div>
                  </button>
                ))}
                <button 
                  onClick={handleSearch}
                  className="p-3 text-center text-xs font-mono text-accent hover:bg-accent/10 transition-colors"
                >
                  View all results →
                </button>
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-muted">
                No instant results found. Try full search.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
