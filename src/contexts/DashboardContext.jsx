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

  const selectDate = (d) => { setSelDate(d); setSelPIC(null); };
  const selectTeam = (id) => { setActiveTeam(id); setSelDate(null); setSelPIC(null); };

  // ─── FUNGSI AKSI MUTASI DATA (PENGAMAN AMAN AGAR TIDAK UNDEFINED) ───
  
  // 1. Tambah Aktivitas
  const addAct = async (teamId, newAct) => {
    try {
      const targetTeam = teams.find(t => t.id === teamId);
      if (!targetTeam) return;
      const currentActs = Array.isArray(targetTeam.activities) ? targetTeam.activities : [];
      const updatedActs = [...currentActs, { id: `act-${Date.now()}`, ...newAct }];

      const { error } = await supabase
        .from('teams')
        .update({ activities: updatedActs })
        .eq('id', teamId);

      if (error) throw error;
      setTeams(prev => prev.map(t => t.id === teamId ? { ...t, activities: updatedActs } : t));
    } catch (err) {
      console.error('Error adding activity:', err.message);
    }
  };

  // 2. Edit Aktivitas
  const editAct = async (teamId, actId, updatedData) => {
    try {
      const targetTeam = teams.find(t => t.id === teamId);
      if (!targetTeam) return;
      const currentActs = Array.isArray(targetTeam.activities) ? targetTeam.activities : [];
      const updatedActs = currentActs.map(a => a.id === actId ? { ...a, ...updatedData } : a);

      const { error } = await supabase
        .from('teams')
        .update({ activities: updatedActs })
        .eq('id', teamId);

      if (error) throw error;
      setTeams(prev => prev.map(t => t.id === teamId ? { ...t, activities: updatedActs } : t));
    } catch (err) {
      console.error('Error editing activity:', err.message);
    }
  };

  // 3. Hapus Aktivitas
  const deleteAct = async (teamId, actId) => {
    try {
      const targetTeam = teams.find(t => t.id === teamId);
      if (!targetTeam) return;
      const currentActs = Array.isArray(targetTeam.activities) ? targetTeam.activities : [];
      const updatedActs = currentActs.filter(a => a.id !== actId);

      const { error } = await supabase
        .from('teams')
        .update({ activities: updatedActs })
        .eq('id', teamId);

      if (error) throw error;
      setTeams(prev => prev.map(t => t.id === teamId ? { ...t, activities: updatedActs } : t));
    } catch (err) {
      console.error('Error deleting activity:', err.message);
    }
  };

  // 4. Update Dokumen Aktivitas (Fungsi Vital Penyebab Utama o is not a function)
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
            documents: {
              ...currentDocs,
              [docType]: { uploaded: true, name: docData.name, url: docData.url || '' }
            }
          };
        }
        return a;
      });

      const { error } = await supabase
        .from('teams')
        .update({ activities: updatedActs })
        .eq('id', teamId);

      if (error) throw error;
      setTeams(prev => prev.map(t => t.id === teamId ? { ...t, activities: updatedActs } : t));
    } catch (err) {
      console.error('Error updating document:', err.message);
    }
  };

  // --- LOGIKA PIC DENGAN PENGAMAN DOUBLE VALIDASI ---
  const allPICs = useMemo(() => {
    const s = new Set();
    if (Array.isArray(teams)) {
      teams.forEach(t => {
        if (t && Array.isArray(t.activities)) {
          t.activities.forEach(a => {
            if (a && a.pic) s.add(a.pic);
          });
        }
      });
    }
    return [...s].sort();
  }, [teams]);

  const value = {
    teams,
    setTeams,
    activeTeam,
    setActiveTeam,
    selDate,
    setSelDate,
    selPIC,
    setSelPIC,
    selectDate,
    selectTeam,
    allPICs,
    loading,
    addAct,      // Diekspor dengan aman
    editAct,     // Diekspor dengan aman
    deleteAct,   // Diekspor dengan aman
    updateDoc    // Diekspor dengan aman
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