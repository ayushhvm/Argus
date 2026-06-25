"use client";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const TICKER_ITEMS = [
  "Semantic Retrieval",
  "TF-IDF",
  "FAISS Embeddings",
  "Hybrid RRF",
  "Cosine Similarity",
  "4,800 Films",
  "Precision@5",
  "NDCG@5",
  "MRR",
];

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* ── HERO ── */}
      <section className="flex-1 flex flex-col justify-center min-h-[calc(100svh-3.5rem)]">
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
              className="max-w-xl"
            >
              <SearchBar large autoFocus placeholder="Try 'loneliness in space' or 'heist gone wrong'..." />
            </motion.div>
          </div>

          {/* Right: Info column */}
          <motion.aside
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="hidden md:flex flex-col gap-6 text-right min-w-[180px] pb-2"
          >
            <div>
              <p className="label">Engine</p>
              <p className="font-display font-bold text-lg mt-1">Semantic · FAISS</p>
            </div>
            <div className="rule" />
            <div>
              <p className="label">Indexed</p>
              <p className="font-mono font-bold text-3xl mt-1">4,800</p>
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
          className="border-t border-foreground/10 py-4 overflow-hidden"
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

      {/* ── Feature strip ── */}
      <section className="border-t border-foreground/10 px-8 md:px-12 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
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
          <div key={f.num} className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-muted">{f.num}</span>
              <span className="h-px flex-1 bg-foreground/10" />
            </div>
            <h3 className="font-display font-bold text-2xl">{f.title}</h3>
            <p className="text-sm text-muted leading-relaxed font-sans">{f.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
