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
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (data) {
          setTeams(data);
          // Set team pertama jadi aktif jika belum ada yang terpilih
          if (data.length > 0 && !activeTeam) {
            setActiveTeam(data[0].id);
          }
        }
      } catch (err) {
        console.error('Error loading teams:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const selectDate = (d) => { setSelDate(d); setSelPIC(null); };
  const selectTeam = (id) => { setActiveTeam(id); setSelDate(null); setSelPIC(null); };

  // Logika memproses PIC agar Dashboard tidak pecah saat data kosong
  const allPICs = useMemo(() => {
    const s = new Set();
    teams.forEach(t => {
      if (t.activities && Array.isArray(t.activities)) {
        t.activities.forEach(a => { if (a.pic) s.add(a.pic); });
      }
    });
    return [...s].sort();
  }, [teams]);

  // Ekspor fungsi dan state
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
    loading
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