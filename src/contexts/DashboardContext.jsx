import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const DashCtx = createContext(null);

export function DashboardProvider({ children }) {
  const [teams, setTeams] = useState([]);
  const [activeTeam, setActiveTeam] = useState(null);
  const [selDate, setSelDate] = useState(new Date().toISOString().split('T')[0]);
  const [selPIC, setSelPIC] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA AMAN DENGAN AUTO-TRANSFORMER FIELD JALUR REAL-TIME ---
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .order('id', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          // Proses pembersihan data agar kebal dari missing fields / data null
          const sanitizedData = data.map(team => {
            let acts = team.activities;
            
            // 1. Jika bertipe string text, paksa parse ke Array objek
            if (typeof acts === 'string') {
              try { acts = JSON.parse(acts); } catch { acts = []; }
            }
            
            // 2. Pastikan mutlak berbentuk Array standar JavaScript
            if (!Array.isArray(acts)) {
              acts = [];
            }

            // 3. Rekonstruksi struktur aktivitas agar sesuai ekspektasi komponen visual UI
            const safeActs = acts.map(a => {
              if (!a) return null;
              return {
                id: a.id || `act-${Date.now()}`,
                pic: a.pic || '',
                status: a.status || 'In Progress',
                jamMulai: a.jamMulai || '08:00',
                jamSelesai: a.jamSelesai || '17:00',
                kegiatan: a.kegiatan || '',
                priority: a.priority || 'P2', 
                progress: typeof a.progress === 'number' ? a.progress : Number(a.progress) || 0,
                kategoriKerja: a.kategoriKerja || 'General',
                // JIKA DI SUPABASE TIDAK ADA PROPERTI DATE, PAKSA PAKAI TANGGAL HARI INI
                date: a.date || new Date().toISOString().split('T')[0], 
                documents: a.documents || {
                  csv: { name: '', uploaded: false },
                  doc: { name: '', uploaded: false },
                  pdf: { name: '', uploaded: false },
                  excel: { name: '', uploaded: false }
                }
              };
            }).filter(Boolean); // Buang data jika ada objek ilegal atau bernilai null

            return { ...team, activities: safeActs };
          });

          setTeams(sanitizedData);
          
          // Set team pertama secara otomatis sebagai default aktif jika belum dipilih
          if (!activeTeam && sanitizedData[0]) {
            setActiveTeam(sanitizedData[0].id);
          }
        } else {
          setTeams([]);
        }
      } catch (err) {
        console.error('Error fetching teams:', err.message);
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [activeTeam]);

  const selectDate = (d) => { setSelDate(d); setSelPIC(null); };
  const selectTeam = (id) => { setActiveTeam(id); setSelDate(null); setSelPIC(null); };

  // --- FUNGSI GETTER DATA DENGAN PENGAMAN KETAT ---
  const getTeam = () => {
    return teams.find(t => t.id === activeTeam) || null;
  };

  const getActsByDate = (teamId, date) => {
    const target = teams.find(t => t.id === teamId);
    if (!target || !Array.isArray(target.activities)) return [];
    return target.activities.filter(a => a && a.date === date);
  };

  const getPICs = (teamId, date) => {
    const acts = getActsByDate(teamId, date);
    const summary = {};
    
    acts.forEach(a => {
      if (!a || !a.pic) return;
      if (!summary[a.pic]) {
        summary[a.pic] = { pic: a.pic, total: 0, done: 0, progressSum: 0 };
      }
      summary[a.pic].total += 1;
      if (a.status === 'Done') summary[a.pic].done += 1;
      summary[a.pic].progressSum += (Number(a.progress) || 0);
    });

    return Object.values(summary).map(p => ({
      pic: p.pic,
      tasks: p.total,
      done: p.done,
      avgProgress: p.total > 0 ? Math.round(p.progressSum / p.total) : 0
    }));
  };

  const getStats = (teamId, date, pic) => {
    const target = teams.find(t => t.id === teamId);
    let acts = target && Array.isArray(target.activities) ? target.activities : [];

    if (date) acts = acts.filter(a => a && a.date === date);
    if (pic) acts = acts.filter(a => a && a.pic === pic);

    const total = acts.length;
    const done = acts.filter(a => a?.status === 'Done').length;
    const onProg = acts.filter(a => a?.status === 'In Progress' || a?.status === 'On Progress').length;
    const p1 = acts.filter(a => a?.priority === 'P1').length;
    const p2 = acts.filter(a => a?.priority === 'P2').length;
    const p3 = acts.filter(a => a?.priority === 'P3').length;

    return { total, done, onProg, p1, p2, p3 };
  };

  // --- FUNGSI AKSI MUTASI DATA KE SUPABASE SERVER ---
  const addAct = async (teamId, newAct) => {
    try {
      const targetTeam = teams.find(t => t.id === teamId);
      if (!targetTeam) return;
      const currentActs = Array.isArray(targetTeam.activities) ? targetTeam.activities : [];
      const updatedActs = [...currentActs, { id: `act-${Date.now()}`, ...newAct }];

      const { error } = await supabase.from('teams').update({ activities: updatedActs }).eq('id', teamId);
      if (error) throw error;
      setTeams(prev => prev.map(t => t.id === teamId ? { ...t, activities: updatedActs } : t));
    } catch (err) { console.error('Error adding activity:', err.message); }
  };

  const editAct = async (teamId, actId, updatedData) => {
    try {
      const targetTeam = teams.find(t => t.id === teamId);
      if (!targetTeam) return;
      const currentActs = Array.isArray(targetTeam.activities) ? targetTeam.activities : [];
      const updatedActs = currentActs.map(a => a.id === actId ? { ...a, ...updatedData } : a);

      const { error } = await supabase.from('teams').update({ activities: updatedActs }).eq('id', teamId);
      if (error) throw error;
      setTeams(prev => prev.map(t => t.id === teamId ? { ...t, activities: updatedActs } : t));
    } catch (err) { console.error('Error editing activity:', err.message); }
  };

  const deleteAct = async (teamId, actId) => {
    try {
      const targetTeam = teams.find(t => t.id === teamId);
      if (!targetTeam) return;
      const currentActs = Array.isArray(targetTeam.activities) ? targetTeam.activities : [];
      const updatedActs = currentActs.filter(a => a.id !== actId);

      const { error } = await supabase.from('teams').update({ activities: updatedActs }).eq('id', teamId);
      if (error) throw error;
      setTeams(prev => prev.map(t => t.id === teamId ? { ...t, activities: updatedActs } : t));
    } catch (err) { console.error('Error deleting activity:', err.message); }
  };

  const updateDoc = async (teamId, actId, docType, docData) => {
    try {
      const targetTeam = teams.find(t => t.id === teamId);
      if (!targetTeam) return;
      const currentActs = Array.isArray(targetTeam.activities) ? targetTeam.activities : [];
      
      const updatedActs = currentActs.map(a => {
        if (a.id === actId) {
          const currentDocs = a.documents || {};
          return {
            ...a,
            documents: { ...currentDocs, [docType]: { uploaded: true, name: docData.name, url: docData.url || '' } }
          };
        }
        return a;
      });

      const { error } = await supabase.from('teams').update({ activities: updatedActs }).eq('id', teamId);
      if (error) throw error;
      setTeams(prev => prev.map(t => t.id === teamId ? { ...t, activities: updatedActs } : t));
    } catch (err) { console.error('Error updating document:', err.message); }
  };

  const allPICs = useMemo(() => {
    const s = new Set();
    if (Array.isArray(teams)) {
      teams.forEach(t => {
        if (t && Array.isArray(t.activities)) {
          t.activities.forEach(a => { if (a && a.pic) s.add(a.pic); });
        }
      });
    }
    return [...s].sort();
  }, [teams]);

  const value = {
    teams, setTeams, activeTeam, setActiveTeam,
    selDate, setSelDate, selPIC, setSelPIC,
    selectDate, selectTeam, allPICs, loading,
    getTeam, getActsByDate, getPICs, getStats, 
    addAct, editAct, deleteAct, updateDoc
  };

  return (
    <DashCtx.Provider value={value}>
      {children}
    </DashCtx.Provider>
  );
}

export const useDash = () => {
  const ctx = useContext(DashCtx);
  if (!ctx) throw new Error("useDash must be used within DashboardProvider");
  return ctx;
};