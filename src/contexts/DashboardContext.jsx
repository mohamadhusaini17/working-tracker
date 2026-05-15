import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const DashCtx = createContext(null);

export function DashboardProvider({ children }) {
  const [teams, setTeams] = useState([]);
  const [activeTeam, setActiveTeam] = useState(null);
  const [selDate, setSelDate] = useState(new Date().toISOString().split('T')[0]);
  const [selPIC, setSelPIC] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA DARI SUPABASE ---
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

  // ─── FUNGSI SELEKTOR & GETTER UTAMA YANG DICARI APP.JSX ───

  const selectDate = (d) => { setSelDate(d); setSelPIC(null); };
  const selectTeam = (id) => { setActiveTeam(id); setSelDate(null); setSelPIC(null); };

  // 1. Ambil data tim aktif saat ini
  const getTeam = () => {
    return teams.find(t => t.id === activeTeam) || null;
  };

  // 2. Ambil aktivitas berdasarkan tanggal spesifik
  const getActsByDate = (teamId, date) => {
    const target = teams.find(t => t.id === teamId);
    if (!target || !Array.isArray(target.activities)) return [];
    return target.activities.filter(a => a && a.date === date);
  };

  // 3. Ambil rangkuman performa PIC pada tanggal spesifik
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
      avgProgress: Math.round(p.progressSum / p.total)
    }));
  };

  // 4. Kalkulator Rangkuman Statistik untuk Komponen Card & Chart
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

  // ─── FUNGSI AKSI MUTASI DATA (PENGAMAN AMAN) ───
  const addAct = async (teamId, newAct) => {
    try {
      const targetTeam = teams.find(t => t.id === teamId);
      if (!targetTeam) return;
      const currentActs = Array.isArray(targetTeam.activities) ? targetTeam.activities : [];
      const updatedActs = [...currentActs, { id: `act-${Date.now()}`, ...newAct }];

      const { error } = await supabase.from('teams').update({ activities: updatedActs }).eq('id', teamId);
      if (error) throw error;
      setTeams(prev => prev.map(t => t.id === teamId ? { ...t, activities: updatedActs } : t));
    } catch (err) { console.error(err.message); }
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
    } catch (err) { console.error(err.message); }
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
    } catch (err) { console.error(err.message); }
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
    } catch (err) { console.error(err.message); }
  };

  // --- LOGIKA PIC LIST ---
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
    getTeam, getActsByDate, getPICs, getStats, // SINKRONISASI COCOK 100% DENGAN APP.JSX
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