import { Info } from 'lucide-react';

interface ExplanationBadgeProps {
  explanation?: string;
  tfidfRank?: number;
  semanticRank?: number;
}

export default function ExplanationBadge({ explanation, tfidfRank, semanticRank }: ExplanationBadgeProps) {
  if (!explanation) return null;

  return (
    <div className="mt-4 p-3 rounded-lg bg-accent/10 border border-accent/20 group-hover:bg-accent/20 transition-colors">
      <div className="flex items-start gap-2">
        <Info className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
        <div className="text-xs text-gray-300 leading-relaxed">
          {explanation}
        </div>
      </div>
      {(tfidfRank || semanticRank) && (
        <div className="mt-2 flex gap-2">
          {tfidfRank && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
              TF-IDF: #{tfidfRank}
            </span>
          )}
          {semanticRank && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Semantic: #{semanticRank}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
