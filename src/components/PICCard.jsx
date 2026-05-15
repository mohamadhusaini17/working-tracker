/**
 * PICCard.jsx — Production Secure Version
 */
import React from 'react'
import { CheckCircle2, AlertCircle, Clock, TrendingUp } from 'lucide-react'
import { picHue, picInit } from '../constants/colors.js'

export default function PICCard({ picName, activities = [], onSelect }) {
  const safeActs = Array.isArray(activities) ? activities : []
  
  const total = safeActs.length
  const done = safeActs.filter(a => a?.status === 'Done').length
  const progress = safeActs.filter(a => a?.status === 'In Progress').length
  const pending = safeActs.filter(a => a?.status === 'Not Progress').length

  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const displayName = picName ? picName.split('@')[0] : 'Unknown'

  return (
    <div 
      onClick={onSelect}
      style={{
        background: '#111827', border: '1px solid #1e2d4a', borderRadius: '12px',
        padding: '12px', cursor: 'pointer', transition: 'all .2s ease'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#3b82f6'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#1e2d4a'
        e.currentTarget.style.transform = 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: picHue(picName), display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '12px'
        }}>
          {picInit(picName)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {displayName}
          </h4>
          <p style={{ margin: 0, fontSize: '10px', color: '#64748b' }}>{total} Tugas</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '14px', fontWeight: 800, color: pct === 100 ? '#10b981' : '#3b82f6' }}>
            {pct}%
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', background: '#0b0f19', padding: '6px', borderRadius: '8px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', color: '#10b981' }}>
            <CheckCircle2 size={10} />
            <span style={{ fontSize: '11px', fontWeight: 700 }}>{done}</span>
          </div>
          <span style={{ fontSize: '8px', color: '#475569', textTransform: 'uppercase' }}>Done</span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', color: '#3b82f6' }}>
            <Clock size={10} />
            <span style={{ fontSize: '11px', fontWeight: 700 }}>{progress}</span>
          </div>
          <span style={{ fontSize: '8px', color: '#475569', textTransform: 'uppercase' }}>WIP</span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', color: '#ef4444' }}>
            <AlertCircle size={10} />
            <span style={{ fontSize: '11px', fontWeight: 700 }}>{pending}</span>
          </div>
          <span style={{ fontSize: '8px', color: '#475569', textTransform: 'uppercase' }}>Stuck</span>
        </div>
      </div>
    </div>
  )
}