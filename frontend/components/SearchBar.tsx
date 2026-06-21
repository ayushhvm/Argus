"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

interface SearchBarProps {
  initialQuery?: string;
  autoFocus?: boolean;
  large?: boolean;
  targetPath?: string;
}

export default function SearchBar({ initialQuery = "", autoFocus = false, large = false, targetPath = "/search" }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`${targetPath}?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-3xl mx-auto group">
      <div className={`absolute inset-0 bg-accent/20 blur-xl rounded-full transition-opacity opacity-0 group-focus-within:opacity-100`} />
      <div className={`relative flex items-center glass rounded-full overflow-hidden transition-all border ${large ? 'h-16' : 'h-12'} focus-within:border-accent/50 focus-within:shadow-[0_0_15px_rgba(139,92,246,0.3)]`}>
        <div className="pl-6 text-gray-400">
          <Search className={large ? "w-6 h-6" : "w-5 h-5"} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for movies, themes, or concepts..."
          autoFocus={autoFocus}
          className={`w-full bg-transparent border-none outline-none text-white placeholder:text-gray-500 px-4 ${large ? 'text-lg' : 'text-base'}`}
        />
        <button 
          type="submit"
          className="h-full px-8 bg-accent/10 hover:bg-accent/20 text-accent font-medium transition-colors border-l border-white/5"
        >
          Search
        </button>
      </div>
    </form>
  );
}
