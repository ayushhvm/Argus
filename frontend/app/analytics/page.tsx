/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
} from "recharts";
import { Loader2 } from "lucide-react";

const ENGINE_COLORS = {
  TF_IDF: "#C3AED6",
  Semantic: "#94B8E8",
  Hybrid: "#E8A8B0",
};

const METRICS = ["Precision@5", "Recall@5", "MRR", "NDCG@5"];

export default function AnalyticsPage() {
  const [evalData, setEvalData] = useState<Record<string, any> | null>(null);
  const [sysData, setSysData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const [eRes, sRes] = await Promise.all([
          fetch("http://localhost:8000/api/v1/analytics/evaluation"),
          fetch("http://localhost:8000/api/v1/analytics/system"),
        ]);
        if (eRes.ok) setEvalData(await eRes.json());
        if (sRes.ok) setSysData(await sRes.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <p className="label">Loading metrics...</p>
      </div>
    );
  }

  if (!evalData) return null;

  const agg = evalData.aggregate_metrics;

  let bestEngine = "Semantic";
  let maxNdcg = -1;
  for (const eng of ["TF-IDF", "Semantic", "Hybrid"]) {
    if (agg[eng] && agg[eng]["NDCG@5"] > maxNdcg) {
      maxNdcg = agg[eng]["NDCG@5"];
      bestEngine = eng;
    }
  }

  const radarData = METRICS.map((m) => ({
    metric: m,
    TFIDF: agg["TF-IDF"][m] * 100,
    Semantic: agg["Semantic"][m] * 100,
    Hybrid: agg["Hybrid"][m] * 100,
  }));

  const latencyData = [
    { name: "TF-IDF", latency: agg["TF-IDF"]["Latency"] },
    { name: "Semantic", latency: agg["Semantic"]["Latency"] },
    { name: "Hybrid", latency: agg["Hybrid"]["Latency"] },
  ];

  const barColors = ["#C3AED6", "#94B8E8", "#E8A8B0"];

  return (
    <main className="min-h-screen px-8 md:px-12">
      {/* Header */}
      <div className="py-12 border-b border-foreground/10">
        <p className="label mb-2 text-accent">Research Output</p>
        <h1 className="font-display font-black text-4xl md:text-5xl leading-none">
          Analytics
        </h1>
      </div>

      {/* System Overview */}
      {sysData && (
        <div className="py-12 grid grid-cols-3 divide-x divide-foreground/10 border-b border-foreground/10">
          {[
            { label: "Films Indexed", value: sysData.total_movies.toLocaleString() },
            { label: "Database Size", value: `${sysData.db_size_mb} MB` },
            { label: "Engines Loaded", value: "3" },
          ].map((stat) => (
            <div key={stat.label} className="px-8 first:pl-0 last:pr-0 space-y-2">
              <p className="label">{stat.label}</p>
              <p className="font-mono font-bold text-4xl md:text-5xl text-foreground">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Evaluation */}
      {evalData && (
        <div className="py-12 space-y-12">
          <div className="flex items-end gap-4 justify-between">
            <h2 className="font-display font-bold text-2xl">Retrieval Evaluation</h2>
            <p className="label text-accent">
              Best overall → {bestEngine}
            </p>
          </div>

          {/* Metric score table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-foreground/10">
                  <th className="text-left label pb-4 pr-8">Engine</th>
                  {METRICS.map((m) => (
                    <th key={m} className="text-right label pb-4 px-4">
                      {m}
                    </th>
                  ))}
                  <th className="text-right label pb-4 pl-4">Latency</th>
                </tr>
              </thead>
              <tbody>
                {(["TF-IDF", "Semantic", "Hybrid"] as const).map((eng, i) => {
                  const row = evalData.aggregate_metrics[eng];
                  const isBest = eng === bestEngine;
                  return (
                    <tr
                      key={eng}
                      className={`border-b border-foreground/5 ${isBest ? "bg-semantic/5" : ""}`}
                    >
                      <td className="py-5 pr-8">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: [ENGINE_COLORS.TF_IDF, ENGINE_COLORS.Semantic, ENGINE_COLORS.Hybrid][i] }}
                          />
                          <span className="font-display font-bold text-lg">{eng}</span>
                          {isBest && (
                            <span className="label text-accent">Best</span>
                          )}
                        </div>
                      </td>
                      {METRICS.map((m) => (
                        <td key={m} className="text-right py-5 px-4">
                          <span className="font-mono text-base font-bold">
                            {(row[m] * 100).toFixed(1)}
                            <span className="text-muted text-xs">%</span>
                          </span>
                        </td>
                      ))}
                      <td className="text-right py-5 pl-4">
                        <span className="font-mono text-base font-bold text-muted">
                          {row["Latency"].toFixed(1)}ms
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Radar */}
            <div className="space-y-4">
              <p className="label">Score Comparison (%)</p>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="rgba(0,0,0,0.06)" />
                    <PolarAngleAxis
                      dataKey="metric"
                      tick={{ fill: "#888", fontSize: 11, fontFamily: "var(--font-space-mono)" }}
                    />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Semantic" dataKey="Semantic" stroke={ENGINE_COLORS.Semantic} fill={ENGINE_COLORS.Semantic} fillOpacity={0.4} />
                    <Radar name="Hybrid" dataKey="Hybrid" stroke={ENGINE_COLORS.Hybrid} fill={ENGINE_COLORS.Hybrid} fillOpacity={0.35} />
                    <Radar name="TF-IDF" dataKey="TFIDF" stroke={ENGINE_COLORS.TF_IDF} fill={ENGINE_COLORS.TF_IDF} fillOpacity={0.35} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid rgba(0,0,0,0.08)",
                        fontFamily: "var(--font-space-mono)",
                        fontSize: 11,
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar - latency */}
            <div className="space-y-4">
              <p className="label">Average Latency (ms)</p>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={latencyData} barSize={40}>
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#888", fontSize: 11, fontFamily: "var(--font-space-mono)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#888", fontSize: 11, fontFamily: "var(--font-space-mono)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(0,0,0,0.03)" }}
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid rgba(0,0,0,0.08)",
                        fontFamily: "var(--font-space-mono)",
                        fontSize: 11,
                      }}
                    />
                    <Bar dataKey="latency" radius={[3, 3, 0, 0]}>
                      {latencyData.map((_, i) => (
                        <Cell key={i} fill={barColors[i]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
