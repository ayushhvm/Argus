"use client";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { useState } from "react";

const TICKER_ITEMS = [
  "Semantic Retrieval",
  "TF-IDF",
  "FAISS Embeddings",
  "Hybrid RRF",
  "Cosine Similarity",
  "10,000 Films",
  "Precision@5",
  "NDCG@5",
  "MRR",
];

const EMOTIONS = [
  { label: "🤩 Uplifting", query: "A heartwarming, joyful, and uplifting movie that makes you feel happy and inspired" },
  { label: "😭 Tearjerker", query: "A highly emotional and devastating tearjerker movie that will make you cry" },
  { label: "😱 Thrilling", query: "A fast-paced, edge-of-your-seat action thriller with high stakes and suspense" },
  { label: "😌 Relaxing", query: "A calm, peaceful, and visually beautiful movie to relax to" },
  { label: "🤯 Mind-Bending", query: "A complex, psychological, mind-bending movie with plot twists and surreal concepts" },
];

export default function LandingPage() {
  const [activeEmotion, setActiveEmotion] = useState(EMOTIONS[0].label);
  const [emotionResults, setEmotionResults] = useState<any[]>([]);
  const [isFetchingEmotion, setIsFetchingEmotion] = useState(false);

  // Fetch emotions on first load or when changed
  const fetchEmotion = async (emotion: typeof EMOTIONS[0]) => {
    setActiveEmotion(emotion.label);
    setIsFetchingEmotion(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/search?q=${encodeURIComponent(emotion.query)}&engine=hybrid`);
      const data = await res.json();
      setEmotionResults(data.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingEmotion(false);
    }
  };

  // initial load
  useEffect(() => {
    fetchEmotion(EMOTIONS[0]);
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      {/* ── HERO ── */}
      <section className="flex-1 flex flex-col justify-center min-h-[calc(100svh-3.5rem)] pt-16">
        <div className="px-8 md:px-12 grid md:grid-cols-[1fr_auto] gap-16 items-end pb-16">
          {/* Left: Big Type */}
          <div className="space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <p className="label mb-6 text-accent">Information Retrieval Platform</p>
              <h1 className="font-display font-black leading-[0.9] tracking-tight text-[clamp(4rem,12vw,10rem)] text-foreground">
                Find films<br />
                that<br />
                <span className="text-accent italic">matter.</span>
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="max-w-xl relative z-40"
            >
              <SearchBar large autoFocus />
            </motion.div>
          </div>

          {/* Right: Info column */}
          <motion.aside
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="hidden md:flex flex-col gap-6 text-right min-w-[180px] pb-2 relative z-10"
          >
            <div>
              <p className="label">Default Engine</p>
              <p className="font-display font-bold text-lg mt-1">Hybrid · RRF</p>
            </div>
            <div className="rule" />
            <div>
              <p className="label">Indexed</p>
              <p className="font-mono font-bold text-3xl mt-1">10,000</p>
              <p className="label">Films</p>
            </div>
            <div className="rule" />
            <Link
              href="/search/playground"
              className="flex items-center justify-end gap-2 label text-accent hover:gap-3 transition-all duration-200"
            >
              Try Playground
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </motion.aside>
        </div>

        {/* ── Ticker ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="border-t border-foreground/10 py-4 overflow-hidden relative z-10"
        >
          <div className="ticker-track flex items-center">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="flex items-center gap-8 pr-8">
                <span className="label whitespace-nowrap">{item}</span>
                <span className="text-accent text-xs">·</span>
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Discover By Mood ── */}
      <section className="border-t border-foreground/10 px-8 md:px-12 py-24 relative z-10 bg-background">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="label text-accent mb-2">Semantic Discovery</p>
              <h2 className="font-display font-black text-4xl">Discover by Mood</h2>
              <p className="text-muted mt-2 font-sans max-w-md text-sm leading-relaxed">
                We translate your emotional intent into high-dimensional vectors to find the perfect film.
              </p>
            </div>

            {/* Mood pill buttons */}
            <div className="flex flex-wrap gap-2">
              {EMOTIONS.map((emotion) => {
                const isActive = activeEmotion === emotion.label;
                return (
                  <button
                    key={emotion.label}
                    onClick={() => fetchEmotion(emotion)}
                    className={`px-4 py-2 rounded-full font-sans text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "bg-accent text-white shadow-[0_0_20px_rgba(255,59,47,0.35)] scale-105"
                        : "bg-foreground/6 border border-foreground/10 hover:bg-foreground/10 hover:border-foreground/20 text-foreground"
                    }`}
                  >
                    {emotion.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Poster grid */}
          <div className="relative min-h-[280px]">
            {isFetchingEmotion ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeEmotion}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {emotionResults.slice(0, 10).map((item, i) => {
                    const year = item.movie.release_year ?? item.movie.year;
                    return (
                      <motion.div
                        key={item.movie.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.04 }}
                        className="flex-shrink-0 snap-start"
                        style={{ width: "clamp(120px, 13vw, 165px)" }}
                      >
                        <Link href={`/movies/${item.movie.id}`} className="group block">
                          {/* Poster */}
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
                                sizes="165px"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center p-3">
                                <span className="font-display font-bold text-xs text-muted text-center leading-tight">
                                  {item.movie.title}
                                </span>
                              </div>
                            )}

                            {/* Hover gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Rank */}
                            <div className="absolute top-2 left-2">
                              <span className="text-[9px] font-mono text-white/50 bg-black/50 px-1.5 py-0.5 rounded-full">
                                #{i + 1}
                              </span>
                            </div>

                            {/* Hover title */}
                            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                              <p className="font-display font-bold text-white text-xs leading-tight line-clamp-2">
                                {item.movie.title}
                              </p>
                            </div>
                          </div>

                          {/* Below poster */}
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
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </section>

      {/* ── Feature strip ── */}
      <section className="border-t border-foreground/10 px-8 md:px-12 py-16 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 bg-background">
        {[
          {
            num: "01",
            title: "Lexical",
            desc: "TF-IDF retrieval over vocabulary matches. Fast, exact, and great for named titles.",
          },
          {
            num: "02",
            title: "Semantic",
            desc: "FAISS vector search over sentence embeddings. Understands meaning, not just words.",
          },
          {
            num: "03",
            title: "Hybrid",
            desc: "Reciprocal Rank Fusion combines both signals for balanced, high-quality results.",
          },
        ].map((f) => (
          <div key={f.num} className="group space-y-4 p-8 rounded-2xl border border-transparent hover:border-foreground/10 hover:bg-foreground/[0.02] hover:-translate-y-2 transition-all duration-300 cursor-default">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-muted group-hover:text-accent transition-colors">{f.num}</span>
              <span className="h-px flex-1 bg-foreground/10 group-hover:bg-accent/20 transition-colors" />
            </div>
            <h3 className="font-display font-bold text-2xl group-hover:text-accent transition-colors">{f.title}</h3>
            <p className="text-sm text-muted leading-relaxed font-sans">{f.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
