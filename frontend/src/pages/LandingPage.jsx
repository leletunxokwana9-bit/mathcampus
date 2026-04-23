import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const CAMPUSES = [
  { title: 'Functions & Graphs',      icon: '📈', color: '#00D4FF', tag: 'Core',       lessons: 14, rating: 4.8, students: 3842 },
  { title: 'Sequences & Series',      icon: '🔢', color: '#FFB800', tag: 'Core',       lessons: 11, rating: 4.7, students: 3210 },
  { title: 'Differential Calculus',   icon: '∂',  color: '#A855F7', tag: 'Advanced',   lessons: 16, rating: 4.9, students: 2987 },
  { title: 'Finance, Growth & Decay', icon: '💰', color: '#00E5A0', tag: 'Core',       lessons: 10, rating: 4.6, students: 2654 },
  { title: 'Algebra & Equations',     icon: '✕',  color: '#FF4D6D', tag: 'Foundation', lessons: 12, rating: 4.5, students: 4102 },
  { title: 'Probability',             icon: '🎲', color: '#F97316', tag: 'Core',       lessons: 9,  rating: 4.4, students: 2341 },
  { title: 'Euclidean Geometry',      icon: '△',  color: '#06B6D4', tag: 'Core',       lessons: 13, rating: 4.6, students: 2876 },
  { title: 'Trigonometry',            icon: 'sin','color': '#EC4899', tag: 'Core',     lessons: 15, rating: 4.7, students: 3564 },
  { title: 'Analytical Geometry',     icon: '⊕',  color: '#84CC16', tag: 'Core',       lessons: 10, rating: 4.5, students: 2190 },
  { title: 'Statistics',              icon: '📊', color: '#F59E0B', tag: 'Core',       lessons: 8,  rating: 4.3, students: 1987 },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#03070F', overflowX: 'hidden' }}>
      {/* Background grid */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)',
        backgroundSize: '60px 60px' }} />

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 64,
        display: 'flex', alignItems: 'center', padding: '0 40px', justifyContent: 'space-between',
        background: scrolled ? 'rgba(7,13,26,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,212,255,0.1)' : 'none',
        transition: 'all 0.3s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #00D4FF, #A855F7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800 }}>∑</div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20 }}>
            Math<span style={{ color: '#00D4FF' }}>Campus</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/login')} style={{
            background: 'none', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8,
            padding: '8px 18px', color: '#E8EDF5', cursor: 'pointer', fontSize: 14 }}>Sign In</button>
          <button onClick={() => navigate('/register')} className="btn-primary" style={{ fontSize: 14, padding: '8px 20px' }}>
            Get Started Free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ paddingTop: 160, paddingBottom: 80, textAlign: 'center', padding: '160px 24px 80px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.25)',
          borderRadius: 20, padding: '5px 14px', fontSize: 12, color: '#00E5A0',
          fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.06em',
          marginBottom: 28 }}>
          🇿🇦 Aligned to CAPS Grade 12 Curriculum
        </div>

        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(40px, 7vw, 84px)',
          fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 24 }}>
          Master Grade 12<br />
          <span style={{ background: 'linear-gradient(135deg, #00D4FF 0%, #A855F7 50%, #FFB800 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Mathematics
          </span>
        </h1>

        <p style={{ fontSize: 18, color: '#6B7E99', maxWidth: 540, margin: '0 auto 40px', lineHeight: 1.7 }}>
          Structured topic campuses, expert video lessons, instant-feedback quizzes, and peer discussion — built for the NSC exam.
        </p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/register')} className="btn-primary" style={{ fontSize: 16, padding: '15px 36px' }}>
            Start Learning Free →
          </button>
          <button onClick={() => navigate('/login')} style={{
            background: '#0C1526', border: '1px solid rgba(0,212,255,0.15)',
            borderRadius: 12, padding: '15px 36px', color: '#E8EDF5',
            cursor: 'pointer', fontSize: 16 }}>
            Sign In
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 48, justifyContent: 'center', marginTop: 64, flexWrap: 'wrap' }}>
          {[['50 000+','Students'],['10','Campuses'],['120+','Video Lessons'],['4.8 ★','Rating']].map(([v,l],i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: '#00D4FF' }}>{v}</div>
              <div style={{ fontSize: 13, color: '#6B7E99', marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Campus grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px 80px', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 34, fontWeight: 800,
          textAlign: 'center', marginBottom: 48, letterSpacing: '-0.02em' }}>
          All 10 Topic <span style={{ color: '#00D4FF' }}>Campuses</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
          {CAMPUSES.map((c, i) => (
            <div key={i} onClick={() => navigate('/register')} style={{
              background: '#0C1526', border: '1px solid rgba(0,212,255,0.12)',
              borderRadius: 18, padding: 22, cursor: 'pointer',
              position: 'relative', overflow: 'hidden', transition: 'all 0.2s',
              animation: 'fadeUp 0.5s ease forwards', animationDelay: `${i*0.05}s`, opacity: 0 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(0,212,255,0.3)'; e.currentTarget.style.transform='translateY(-3px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(0,212,255,0.12)'; e.currentTarget.style.transform='translateY(0)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: `linear-gradient(90deg, ${c.color}, ${c.color}40)` }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: 11,
                  background: `${c.color}18`, border: `1px solid ${c.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{c.icon}</div>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, height: 'fit-content',
                  background: `${c.color}18`, color: c.color, fontFamily: "'JetBrains Mono', monospace",
                  textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.tag}</span>
              </div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 12 }}>{c.title}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#3A4E68' }}>
                <span>📺 {c.lessons} lessons</span>
                <span>⭐ {c.rating}</span>
                <span>{(c.students/1000).toFixed(1)}k students</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div style={{ background: '#070D1A', padding: '80px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 34, fontWeight: 800,
            textAlign: 'center', marginBottom: 56, letterSpacing: '-0.02em' }}>
            Simple <span style={{ color: '#00D4FF' }}>Pricing</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 }}>
            {[
              { name: 'Free',    price: 'R0',   period: 'forever',     color: '#6B7E99', features: ['3 Campus Enrollments','Basic Video Lessons','Simple Quizzes','Community Forum'], cta: 'Get Started' },
              { name: 'Premium', price: 'R149', period: 'per month',   color: '#00D4FF', features: ['All 10 Campuses','All Video Lessons','Full Practice Zone','Past Papers','Priority Support','Ad-Free'], cta: 'Start Free Trial', popular: true },
              { name: 'School',  price: 'Custom',period: 'institutional',color: '#FFB800',features: ['Unlimited Students','Teacher Dashboard','Progress Reports','Custom Branding','Bulk Pricing'], cta: 'Contact Us' },
            ].map((p, i) => (
              <div key={i} onClick={() => navigate('/register')} style={{
                background: p.popular ? '#111E35' : '#0C1526',
                border: `1px solid ${p.popular ? '#00D4FF40' : 'rgba(0,212,255,0.12)'}`,
                borderRadius: 20, padding: 28, cursor: 'pointer', position: 'relative',
                boxShadow: p.popular ? '0 0 40px rgba(0,212,255,0.1)' : 'none',
                transform: p.popular ? 'scale(1.03)' : 'none' }}>
                {p.popular && <div style={{ position: 'absolute', top: 14, right: 14, background: '#00D4FF',
                  color: '#000', fontSize: 9, fontWeight: 700, padding: '3px 10px',
                  borderRadius: 20, fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>Most Popular</div>}
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: p.color, marginBottom: 6 }}>{p.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 800 }}>{p.price}</span>
                  <span style={{ color: '#6B7E99', fontSize: 12 }}>/ {p.period}</span>
                </div>
                {p.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#6B7E99', marginBottom: 10 }}>
                    <span style={{ color: '#00E5A0' }}>✓</span>{f}
                  </div>
                ))}
                <button style={{ marginTop: 16, width: '100%', padding: '12px', borderRadius: 10,
                  background: p.popular ? 'linear-gradient(135deg, #00D4FF, #A855F7)' : 'transparent',
                  border: `1px solid ${p.color}40`, color: p.popular ? '#fff' : p.color,
                  cursor: 'pointer', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13 }}>{p.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(0,212,255,0.08)', padding: '24px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12, position: 'relative', zIndex: 1 }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15 }}>
          Math<span style={{ color: '#00D4FF' }}>Campus</span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, color: '#3A4E68', fontSize: 12, marginLeft: 10 }}>© 2025 · Built for South African learners</span>
        </span>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Privacy','Terms','Contact','Schools'].map(l => (
            <span key={l} style={{ fontSize: 13, color: '#6B7E99', cursor: 'pointer' }}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
