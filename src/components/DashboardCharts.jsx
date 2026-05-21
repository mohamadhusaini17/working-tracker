/**
 * DashboardCharts.jsx — FIXED & SYNCED (Auto-reads Context & Fixes onProg variable)
 */
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { useDash } from '../contexts/DashboardContext.jsx';

export default function DashboardCharts() {
  const { teams, getStats, activeTeam, selDate, selPIC } = useDash();

  // Sinkronisasi data utama chart global berdasarkan repositori tim
  const barData = useMemo(() => {
    if (!teams || teams.length === 0) return [];
    return teams.map(t => {
      const s = getStats(t.id); 
      return {
        name: t.name.length > 12 ? t.name.slice(0, 10) + '…' : t.name,
        Selesai: s.done || 0,
        Proses: s.onProg || 0, // Menggunakan properti onProg terpadu
        P0: s.p0 || 0
      };
    });
  }, [teams, getStats]);

  // Membaca status terpadu aktif
  const currentStats = getStats(activeTeam, selDate || undefined, selPIC || undefined);

  const pieData = useMemo(() => {
    return [
      { name: 'Selesai', value: currentStats?.done || 0, color: '#14b8a6' },
      { name: 'Dalam Proses', value: currentStats?.onProg || 0, color: '#3b82f6' }, // Menggunakan properti onProg terpadu
      { name: 'Prioritas P0', value: currentStats?.p0 || 0, color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [currentStats]);

  // Jika tidak ada aktivitas sama sekali, jangan render chart agar bersih
  if (!teams || teams.length === 0) return null;

  // VIEW MODE SWITCHER INTERNALLY
  const isPieView = !!selDate && !selPIC;

  return (
    <div className="rounded-2xl p-5 bg-[#0f1629] border border-[#1e2d4a]">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-5 rounded-full bg-blue-500" />
        <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider">
          {isPieView ? 'Activity Composition (Donut View)' : 'Performance Analytics (Global Tim)'}
        </h3>
      </div>

      {isPieView ? (
        <div className="h-[250px] w-full flex items-center justify-center">
          {pieData.length === 0 ? (
            <p className="text-xs text-slate-500 italic">Belum ada aktivitas terdata di tanggal ini.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={85}
                  paddingAngle={5} dataKey="value" stroke="none"
                  label={({name, value}) => `${name}: ${value}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff', fontSize: '12px' }} />
                <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      ) : (
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0f1629', border: '1px solid #1e2d4a', color: '#fff', fontSize: '12px' }} />
              <Legend verticalAlign="top" align="right" iconType="rect" wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }} />
              <Bar dataKey="Selesai" fill="#14b8a6" radius={[4, 4, 0, 0]} maxBarSize={24} />
              <Bar dataKey="Proses" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={24} />
              <Bar dataKey="P0" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}