import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const DashCtx = createContext(null);

export function DashboardProvider({ children }) {
  const [teams, setTeams] = useState([]);
  const [activeTeam, setActiveTeam] = useState(null);
  const [selDate, setSelDate] = useState(new Date().toISOString().split('T')[0]);
  const [selPIC, setSelPIC] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- 1. AMBIL DATA REAL-TIME DARI SUPABASE ---
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
          setTeams(data);
          // Set team pertama secara otomatis sebagai default aktif jika belum ada
          if (!activeTeam) {
            setActiveTeam(data[0]?.id || null);
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
  }, []);

  const selectDate = (d) => { setSelDate(d); setSelPIC(null); };
  const selectTeam = (id) => { setActiveTeam(id); setSelDate(null); setSelPIC(null); };

  // ─── 2. FUNGSI GETTER DATA DENGAN PENGAMAN ANTI-CRASH ───

  // Mengambil data tim aktif saat ini
  const getTeam = () => {
    return teams.find(t => t.id === activeTeam) || null;
  };

  // Mengambil aktivitas berdasarkan tanggal (Aman dari data null/undefined)
  const getActsByDate = (teamId, date) => {
    const target = teams.find(t => t.id === teamId);
    if (!target || !Array.isArray(target.activities)) return [];
    return target.activities.filter(a => a && a.date === date);
  };

  // Mengambil rangkuman performa PIC pada tanggal spesifik
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

  // Kalkulator Rangkuman Statistik untuk Card & Chart (Aman 100%)
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

  // ─── 3. FUNGSI MUTASI DATA KE SUPABASE ───
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

  // --- 4. LOGIKA PENCARIAN PIC LIST VIA MEMO ---
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