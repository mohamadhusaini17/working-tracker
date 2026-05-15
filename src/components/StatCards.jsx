/**
 * StatCards.jsx — Production Secure Version
 */
import React from 'react'
import * as Icons from 'lucide-react'

function StatCard({ title, value, sub, iconName, color }) {
  // Amankan resolusi ikon dari pemecahan akibat uglify/minifier
  const targetIcon = Icons[iconName] || Icons.HelpCircle

  return (
    <div style={{ background: '#111827', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '9px',
        background: `${color}15`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: color, flexShrink: 0
      }}>
        {React.createElement(targetIcon, { size: 18 })}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ margin: 0, fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
        <h3 style={{ margin: '2px 0 0', fontSize: '20px', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>{value}</h3>
        {sub && <p style={{ margin: '2px 0 0', fontSize: '10px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</p>}
      </div>
    </div>
  )
}

export default function StatCards({ activities = [] }) {
  const safeActs = Array.isArray(activities) ? activities : []
  
  const total = safeActs.length
  const done = safeActs.filter(a => a?.status === 'Done').length
  const wip = safeActs.filter(a => a?.status === 'In Progress').length
  const p0 = safeActs.filter(a => a?.priority === 'P0').length

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '16px' }}>
      <StatCard title="Total Tugas" value={total} sub="Semua riwayat terdaftar" iconName="Folder" color="#3b82f6" />
      <StatCard title="Selesai (Done)" value={done} sub={`${total > 0 ? Math.round((done/total)*100) : 0}% rasio penyelesaian`} iconName="CheckCircle2" color="#10b981" />
      <StatCard title="Dalam Proses" value={wip} sub="Sedang dikerjakan PIC" iconName="Clock" color="#f59e0b" />
      <StatCard title="Urgensi P0" value={p0} sub="Butuh tindakan segera" iconName="AlertTriangle" color="#ef4444" />
    </div>
  )
}