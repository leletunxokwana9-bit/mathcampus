import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../../context/authStore'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { to: '/campuses',  label: 'Campuses',  icon: '🏫' },
  { to: '/progress',  label: 'Progress',  icon: '📊' },
  { to: '/profile',   label: 'Profile',   icon: '👤' },
]

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const user    = useAuthStore((s) => s.user)
  const logout  = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('See you later! 👋')
    navigate('/')
  }

  return (
    <div className="min-h-screen" style={{ background: '#03070F' }}>
      {/* ── TOP NAV ─────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 60, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 8,
        background: 'rgba(7,13,26,0.92)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,212,255,0.1)',
      }}>
        {/* Logo */}
        <NavLink to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginRight: 16 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #00D4FF, #A855F7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 800, color: '#fff',
          }}>∑</div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 17, color: '#E8EDF5' }}>
            Math<span style={{ color: '#00D4FF' }}>Campus</span>
          </span>
        </NavLink>

        {/* Nav links — desktop */}
        <div style={{ display: 'flex', gap: 4, flex: 1 }}>
          {NAV.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 8, textDecoration: 'none',
              fontSize: 14, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
              color: isActive ? '#00D4FF' : '#6B7E99',
              background: isActive ? 'rgba(0,212,255,0.1)' : 'transparent',
              borderBottom: isActive ? '2px solid #00D4FF' : '2px solid transparent',
              transition: 'all 0.2s',
            })}>
              <span style={{ fontSize: 15 }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* XP */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.2)',
            borderRadius: 20, padding: '4px 12px',
            fontSize: 12, color: '#FFB800', fontFamily: "'JetBrains Mono', monospace",
          }}>
            🔥 {user?.xp?.toLocaleString() || 0} XP
          </div>

          {/* Notification bell */}
          <button style={{
            background: 'none', border: 'none', cursor: 'pointer', color: '#6B7E99',
            position: 'relative', fontSize: 18,
          }} title="Notifications">
            🔔
            <div style={{
              position: 'absolute', top: 0, right: 0, width: 7, height: 7,
              borderRadius: '50%', background: '#FF4D6D',
            }} />
          </button>

          {/* Avatar & logout */}
          <div
            onClick={handleLogout}
            title="Logout"
            style={{
              width: 34, height: 34, borderRadius: '50%', cursor: 'pointer',
              background: 'linear-gradient(135deg, #00D4FF, #A855F7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: '#fff',
            }}
          >
            {user?.name?.charAt(0) || 'S'}
          </div>
        </div>
      </nav>

      {/* ── PAGE CONTENT ─────────────────────────────────────── */}
      <main style={{ paddingTop: 60 }} className="page-enter">
        <Outlet />
      </main>
    </div>
  )
}
