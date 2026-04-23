// ── LoginPage ────────────────────────────────────────────────────────────────
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../context/authStore'

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const login = useAuthStore(s => s.login)
  const isLoading = useAuthStore(s => s.isLoading)
  const error = useAuthStore(s => s.error)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { success } = await login(form)
    if (success) navigate('/dashboard')
  }

  return <AuthPage title="Welcome back" sub="Sign in to continue learning" onSubmit={handleSubmit} isLoading={isLoading} error={error} submitLabel="Sign In →" footer={<>Don't have an account? <Link to="/register" style={{ color: '#00D4FF' }}>Register free</Link></>}>
    <Field label="Email" type="email" value={form.email} onChange={v => setForm({ ...form, email: v })} placeholder="you@school.co.za" />
    <Field label="Password" type="password" value={form.password} onChange={v => setForm({ ...form, password: v })} placeholder="••••••••" />
  </AuthPage>
}

export function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' })
  const register = useAuthStore(s => s.register)
  const isLoading = useAuthStore(s => s.isLoading)
  const error = useAuthStore(s => s.error)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { success } = await register(form)
    if (success) navigate('/dashboard')
  }

  return <AuthPage title="Create your account" sub="Join 50 000+ Grade 12 students" onSubmit={handleSubmit} isLoading={isLoading} error={error} submitLabel="Create Account →" footer={<>Already have an account? <Link to="/login" style={{ color: '#00D4FF' }}>Sign in</Link></>}>
    <Field label="Full Name" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="e.g. Sipho Khumalo" />
    <Field label="Email" type="email" value={form.email} onChange={v => setForm({ ...form, email: v })} placeholder="you@school.co.za" />
    <Field label="Password" type="password" value={form.password} onChange={v => setForm({ ...form, password: v })} placeholder="Min 8 characters" />
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 13, color: '#6B7E99', display: 'block', marginBottom: 8 }}>I am a...</label>
      <div style={{ display: 'flex', gap: 10 }}>
        {['student', 'tutor'].map(r => (
          <button key={r} type="button" onClick={() => setForm({ ...form, role: r })} style={{
            flex: 1, padding: '10px', borderRadius: 10,
            border: `1px solid ${form.role === r ? '#00D4FF60' : 'rgba(0,212,255,0.12)'}`,
            background: form.role === r ? 'rgba(0,212,255,0.1)' : '#111E35',
            color: form.role === r ? '#00D4FF' : '#6B7E99',
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14,
            textTransform: 'capitalize',
          }}>{r === 'student' ? '📚 Student' : '👨‍🏫 Tutor'}</button>
        ))}
      </div>
    </div>
  </AuthPage>
}

function AuthPage({ title, sub, onSubmit, isLoading, error, submitLabel, footer, children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#03070F', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      <div className="animate-fadeUp" style={{ width: '100%', maxWidth: 420, background: '#0C1526', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 24, padding: 40, boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(0,212,255,0.08)', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #00D4FF, #A855F7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 14px' }}>∑</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: '#E8EDF5' }}>Math<span style={{ color: '#00D4FF' }}>Campus</span></div>
          </Link>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Syne', sans-serif", marginTop: 20 }}>{title}</div>
          <div style={{ fontSize: 13, color: '#6B7E99', marginTop: 4 }}>{sub}</div>
        </div>
        {error && <div style={{ background: '#FF4D6D18', border: '1px solid #FF4D6D30', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#FF4D6D', marginBottom: 20 }}>{error}</div>}
        <form onSubmit={onSubmit}>
          {children}
          <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '14px', background: isLoading ? '#111E35' : 'linear-gradient(135deg, #00D4FF, #A855F7)', border: 'none', borderRadius: 12, color: '#fff', cursor: isLoading ? 'not-allowed' : 'pointer', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, boxShadow: isLoading ? 'none' : '0 0 30px rgba(0,212,255,0.3)', marginTop: 8 }}>
            {isLoading ? 'Please wait...' : submitLabel}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#6B7E99' }}>{footer}</div>
      </div>
    </div>
  )
}

function Field({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 13, color: '#6B7E99', display: 'block', marginBottom: 6 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required style={{ width: '100%', padding: '12px 16px', borderRadius: 10, background: '#111E35', border: '1px solid rgba(0,212,255,0.12)', color: '#E8EDF5', fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: 'none', transition: 'border-color 0.15s' }} onFocus={e => e.target.style.borderColor = '#00D4FF'} onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.12)'} />
    </div>
  )
}

// ── LessonPage ───────────────────────────────────────────────────────────────
export function LessonPage() {
  const { useParams, useNavigate } = require('react-router-dom')
  return <div style={{ padding: '40px 24px', textAlign: 'center', color: '#6B7E99' }}>Lesson player — connects to video hosting (YouTube embed / AWS S3)</div>
}

// ── ProfilePage ──────────────────────────────────────────────────────────────
export function ProfilePage() {
  const user = useAuthStore(s => s.user)
  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }} className="page-enter">
      <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 30, fontWeight: 800, marginBottom: 24 }}>
        My <span style={{ color: '#00D4FF' }}>Profile</span>
      </h1>
      <div style={{ background: '#0C1526', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 20, padding: 28 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 28 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #00D4FF, #A855F7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 700 }}>
            {user?.name?.charAt(0) || 'S'}
          </div>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800 }}>{user?.name}</div>
            <div style={{ color: '#6B7E99', fontSize: 14 }}>{user?.email}</div>
            <div style={{ fontSize: 12, color: '#00D4FF', marginTop: 4, textTransform: 'capitalize' }}>🎓 {user?.role}</div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: '#3A4E68', textAlign: 'center', padding: '12px 0' }}>Profile editing, avatar upload, and settings coming in the next sprint.</div>
      </div>
    </div>
  )
}

// ── NotFoundPage ─────────────────────────────────────────────────────────────
export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
      <div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 96, fontWeight: 800, color: 'rgba(0,212,255,0.2)' }}>404</div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Page Not Found</div>
        <div style={{ color: '#6B7E99', marginBottom: 32 }}>This page doesn't exist or was moved.</div>
        <button onClick={() => navigate('/')} className="btn-primary">← Back to Home</button>
      </div>
    </div>
  )
}

export { LoginPage as default }
