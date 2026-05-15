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
          // PENGAMAN UTAMA: Menggunakan ?.id agar jika data[0] tidak terbaca, aplikasi tidak crash
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

  // --- LOGIKA PIC DENGAN PENGAMAN DOUBLE VALIDASI ---
  const allPICs = useMemo(() => {
    const s = new Set();
    // Memastikan teams benar-benar sebuah array sebelum melakukan looping
    if (Array.isArray(teams)) {
      teams.forEach(t => {
        // Mengamankan jika kolom 'activities' di Supabase bernilai null atau bukan array
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