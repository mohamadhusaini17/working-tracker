/**
 * PICCard.jsx — FINAL & AMAN DARI BLANK/CRASH
 */
import React from 'react'
import Card from './ui/Card.jsx'
import { picHue, picInit } from '../constants/colors.js' // Jalur path disesuaikan dengan struktur folder Anda

export default function PICCard({ picData, onClick }) {
  // 1. Ambil data email dengan fallback string kosong jika undefined/null
  const email = picData?.pic || ''

  // 2. Ambil nama tampilan sebelum karakter '@' (Jika kosong, gunakan fallback 'Unknown')
  const displayName = email ? email.split('@')[0] : 'Unknown'

  // 3. Dapatkan kode warna hex dari palet secara aman lewat colors.js
  const backgroundColor = picHue(email)

  // 4. Dapatkan inisial 2 huruf secara aman lewat colors.js (contoh: "mohamad@email.com" -> "MO")
  const initials = picInit(email)

  return (
    <Card
      onClick={onClick}
      className="p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-800/50 border border-slate-800 transition-all select-none group"
    >
      {/* Avatar Bulat/Kotak dengan Warna Dinamis */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white uppercase shadow-inner transition-transform group-hover:scale-105"
        style={{ backgroundColor }}
      >
        {initials}
      </div>

      {/* Informasi Detail Personel */}
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-bold text-slate-200 capitalize truncate group-hover:text-blue-400 transition-colors">
          {displayName}
        </span>
        <span className="text-[11px] text-slate-500 truncate mt-0.5">
          {picData?.count || 0} Aktivitas
        </span>
      </div>
    </Card>
  )
}