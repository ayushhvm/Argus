"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

interface SearchBarProps {
  initialQuery?: string;
  autoFocus?: boolean;
  large?: boolean;
  targetPath?: string;
  placeholder?: string;
}

export default function SearchBar({
  initialQuery = "",
  autoFocus = false,
  large = false,
  targetPath = "/search",
  placeholder = "Search for films, themes, or moods...",
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`${targetPath}?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full group outline-none">
      <div
        className={`search-glass flex items-center rounded-none border-0 border-b-2 border-foreground/20 focus-within:border-accent transition-colors duration-300 outline-none ${
          large ? "py-4" : "py-3"
        } px-0 gap-4`}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted font-sans ${
            large ? "text-xl md:text-2xl" : "text-base"
          }`}
        />
        <button
          type="submit"
          className="flex-shrink-0 flex items-center gap-2 label text-accent hover:gap-4 transition-all duration-200"
        >
          Search
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
