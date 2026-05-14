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

        if (data) {
          setTeams(data);
          if (data.length > 0 && !activeTeam) {
            setActiveTeam(data[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching teams:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const selectDate = (d) => { setSelDate(d); setSelPIC(null); };
  const selectTeam = (id) => { setActiveTeam(id); setSelDate(null); setSelPIC(null); };

  // --- LOGIKA PIC DENGAN PENGAMAN (OPTIONAL CHAINING) ---
  const allPICs = useMemo(() => {
    const s = new Set();
    // Menggunakan ?. agar tidak error saat data sedang loading/kosong
    teams?.forEach(t => {
      t.activities?.forEach(a => {
        if (a.pic) s.add(a.pic);
      });
    });
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