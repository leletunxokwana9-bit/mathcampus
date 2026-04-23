// ─────────────────────────────────────────────────────────────
// Shared UI primitives for MathCampus
// ─────────────────────────────────────────────────────────────

// ── Badge ──────────────────────────────────────────────────────
export function Badge({ children, color = '#00D4FF', variant = 'filled' }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 20,
      background: variant === 'outline' ? 'transparent' : `${color}18`,
      border: `1px solid ${color}30`,
      color,
      fontSize: 11, fontWeight: 600,
      fontFamily: "'JetBrains Mono', monospace",
      letterSpacing: '0.05em', textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>{children}</span>
  )
}

// ── ProgressBar ────────────────────────────────────────────────
export function ProgressBar({ value = 0, color = '#00D4FF', height = 6 }) {
  return (
    <div style={{ background: '#172545', borderRadius: 999, height, overflow: 'hidden' }}>
      <div style={{
        height: '100%', borderRadius: 999,
        background: `linear-gradient(90deg, ${color}, ${color}CC)`,
        width: `${Math.min(100, Math.max(0, value))}%`,
        boxShadow: `0 0 8px ${color}60`,
        transition: 'width 0.8s ease',
      }} />
    </div>
  )
}

// ── Spinner ────────────────────────────────────────────────────
export function Spinner({ size = 24, color = '#00D4FF' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `2px solid ${color}30`,
      borderTopColor: color,
      animation: 'spin 0.8s linear infinite',
      flexShrink: 0,
    }} />
  )
}

// ── StatCard ───────────────────────────────────────────────────
export function StatCard({ icon, label, value, sub, color = '#00D4FF' }) {
  return (
    <div style={{
      background: '#0C1526', border: '1px solid rgba(0,212,255,0.12)',
      borderRadius: 16, padding: '20px 22px',
      display: 'flex', alignItems: 'center', gap: 16,
      transition: 'all 0.2s',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
        background: `${color}18`, border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22,
      }}>{icon}</div>
      <div>
        <div style={{
          fontSize: 26, fontWeight: 800, fontFamily: "'Syne', sans-serif",
          color, lineHeight: 1.1,
        }}>{value}</div>
        <div style={{ fontSize: 13, color: '#6B7E99', marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: '#3A4E68', marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  )
}

// ── EmptyState ─────────────────────────────────────────────────
export function EmptyState({ icon = '📭', title, message, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>{icon}</div>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{title}</div>
      {message && <div style={{ color: '#6B7E99', fontSize: 14, marginBottom: 24 }}>{message}</div>}
      {action}
    </div>
  )
}

// ── Divider ────────────────────────────────────────────────────
export function Divider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(0,212,255,0.1)' }} />
      {label && <span style={{ fontSize: 12, color: '#3A4E68', whiteSpace: 'nowrap' }}>{label}</span>}
      <div style={{ flex: 1, height: 1, background: 'rgba(0,212,255,0.1)' }} />
    </div>
  )
}

// ── Avatar ─────────────────────────────────────────────────────
export function Avatar({ name = '?', size = 36, color = '#00D4FF' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `${color}20`, border: `2px solid ${color}40`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: 700,
      color, fontFamily: "'JetBrains Mono', monospace",
      flexShrink: 0,
    }}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  )
}

// ── Tab bar ────────────────────────────────────────────────────
export function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            padding: '14px 20px', background: 'none', border: 'none',
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
            fontSize: 14,
            color: active === t.id ? '#00D4FF' : '#6B7E99',
            borderBottom: active === t.id ? '2px solid #00D4FF' : '2px solid transparent',
            marginBottom: -1, transition: 'color 0.2s',
            whiteSpace: 'nowrap',
          }}
        >{t.label}</button>
      ))}
    </div>
  )
}
