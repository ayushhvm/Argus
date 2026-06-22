/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Loader2 } from 'lucide-react';

export default function AnalyticsPage() {
  const [evalData, setEvalData] = useState<Record<string, any> | null>(null);
  const [sysData, setSysData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [evalRes, sysRes] = await Promise.all([
          fetch('http://localhost:8000/api/v1/analytics/evaluation'),
          fetch('http://localhost:8000/api/v1/analytics/system')
        ]);
        if (evalRes.ok) setEvalData(await evalRes.json());
        if (sysRes.ok) setSysData(await sysRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
        <p className="text-gray-400">Loading System & Evaluation Metrics...</p>
      </div>
    );
  }

  // Format data for Recharts
  const formatRadarData = () => {
    if (!evalData) return [];
    const metrics = ["Precision@5", "Recall@5", "MRR", "NDCG@5"];
    return metrics.map(metric => ({
      metric,
      TFIDF: evalData.aggregate_metrics["TF-IDF"][metric] * 100,
      Semantic: evalData.aggregate_metrics["Semantic"][metric] * 100,
      Hybrid: evalData.aggregate_metrics["Hybrid"][metric] * 100,
    }));
  };

  const radarData = formatRadarData();

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-400">System health and Information Retrieval Evaluation Metrics</p>
        </div>

        {/* System Overview Cards */}
        {sysData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass p-6 rounded-2xl border border-white/5">
              <div className="text-gray-400 text-sm font-medium">Total Movies Indexed</div>
              <div className="text-4xl font-black mt-2">{sysData.total_movies.toLocaleString()}</div>
            </div>
            <div className="glass p-6 rounded-2xl border border-white/5">
              <div className="text-gray-400 text-sm font-medium">Database Size</div>
              <div className="text-4xl font-black mt-2">{sysData.db_size_mb} MB</div>
            </div>
            <div className="glass p-6 rounded-2xl border border-white/5">
              <div className="text-gray-400 text-sm font-medium">Retrieval Engines</div>
              <div className="text-4xl font-black mt-2 text-green-400">Loaded</div>
            </div>
          </div>
        )}

        {/* Evaluation Metrics */}
        {evalData && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold border-b border-white/10 pb-4">Retrieval Evaluation</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Radar Chart */}
              <div className="glass p-6 rounded-2xl border border-white/5 h-[400px] flex flex-col">
                <h3 className="font-semibold mb-6">Engine Comparison (Scores %)</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280' }} />
                    <Radar name="Semantic" dataKey="Semantic" stroke="#a855f7" fill="#a855f7" fillOpacity={0.4} />
                    <Radar name="Hybrid" dataKey="Hybrid" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                    <Radar name="TF-IDF" dataKey="TFIDF" stroke="#eab308" fill="#eab308" fillOpacity={0.4} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937' }} />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-4 text-xs">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-purple-500"></span>Semantic</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span>Hybrid</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500"></span>TF-IDF</div>
                </div>
              </div>

              {/* Top Query Latencies */}
              <div className="glass p-6 rounded-2xl border border-white/5 h-[400px] flex flex-col">
                <h3 className="font-semibold mb-6">Average Query Latency (ms)</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'TF-IDF', latency: evalData.aggregate_metrics["TF-IDF"]["Latency"] },
                    { name: 'Semantic', latency: evalData.aggregate_metrics["Semantic"]["Latency"] },
                    { name: 'Hybrid', latency: evalData.aggregate_metrics["Hybrid"]["Latency"] },
                  ]}>
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937' }} />
                    <Bar dataKey="latency" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
          </div>
        )}
      </div>
    </main>
  );
}
