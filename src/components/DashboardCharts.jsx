import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { useDash } from '../contexts/DashboardContext';

const DashboardCharts = ({ stats, viewType }) => {
  const { teams, getStats } = useDash();

  // 1. Data untuk Performance Analytics (Bar Chart)
  // Kita hitung stats untuk SETIAP tim agar Bar Chart muncul datanya
  const barData = useMemo(() => {
    if (!teams || teams.length === 0) return [];
    
    return teams.map(t => {
      // Mengambil stats per tim tanpa filter tanggal agar semua data muncul
      const s = getStats(t.id); 
      return {
        name: t.name,
        Selesai: s.done || 0,
        Proses: s.inProg || 0, // Sesuai nama di Context: inProg
        P0: s.p0 || 0
      };
    });
  }, [teams, getStats]);

  // 2. Data untuk Activity Composition (Donut Chart)
  const pieData = useMemo(() => {
    return [
      { name: 'Selesai', value: stats?.done || 0, color: '#14b8a6' },
      { name: 'Dalam Proses', value: stats?.inProg || 0, color: '#3b82f6' }, // inProg
      { name: 'Prioritas P0', value: stats?.p0 || 0, color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [stats]);

  if (viewType === 'pie') {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%" cy="50%"
              innerRadius={60} outerRadius={85}
              paddingAngle={5} dataKey="value" stroke="none"
              label={({name, value}) => `${value}`}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
            <Legend verticalAlign="bottom" align="center" iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 10 }}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <Tooltip 
            cursor={{ fill: '#334155', opacity: 0.4 }}
            contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
          />
          <Legend iconType="circle" />
          <Bar dataKey="Selesai" fill="#14b8a6" radius={[4, 4, 0, 0]} barSize={25} />
          <Bar dataKey="Proses" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={25} />
          <Bar dataKey="P0" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={25} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DashboardCharts;