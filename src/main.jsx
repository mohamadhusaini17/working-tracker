import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Auth from './components/Auth.jsx'
import { supabase } from './lib/supabase'
import './index.css'

function Root() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Ambil sesi login saat ini
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Dengerin kalau ada perubahan status (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Jika belum login, tampilkan halaman Auth
  if (!session) {
    return <Auth />
  }

  // Jika sudah login, tampilkan dashboard utama
  return <App />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)