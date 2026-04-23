import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCampuses, useEnrollCampus } from '../api/hooks'
import { Badge, ProgressBar, Spinner } from '../components/common/UI'

const TAGS = ['All', 'Core', 'Advanced', 'Foundation', 'Enrolled']

export default function CampusesPage() {
  const navigate = useNavigate()
  const [filter, setFilter]   = useState('All')
  const [search, setSearch]   = useState('')
  const { data, isLoading }   = useCampuses()
  const enrollMutation        = useEnrollCampus()

  const campuses = data?.campuses || []
  const filtered = campuses
    .filter(c => {
      if (filter === 'Enrolled') return c.enrolled
      if (filter !== 'All') return c.tag === filter
      return true
    })
    .filter(c => c.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 60px' }} className="page-enter">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>
          Topic <span style={{ color: '#00D4FF' }}>Campuses</span>
        </h1>
        <p style={{ color: '#6B7E99' }}>10 CAPS-aligned Grade 12 Mathematics campuses. Enroll and start learning.</p>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{
          flex: 1, minWidth: 240,
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#0C1526', border: '1px solid rgba(0,212,255,0.12)',
          borderRadius: 10, padding: '0 14px',
        }}>
          <span style={{ color: '#3A4E68' }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search campuses..."
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: '#E8EDF5', fontSize: 14, fontFamily: "'DM Sans', sans-serif",
              padding: '12px 0',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {TAGS.map(tag => (
            <button key={tag} onClick={() => setFilter(tag)} style={{
              padding: '8px 16px', borderRadius: 8,
              border: `1px solid ${filter === tag ? '#00D4FF50' : 'rgba(0,212,255,0.12)'}`,
              background: filter === tag ? 'rgba(0,212,255,0.1)' : '#0C1526',
              color: filter === tag ? '#00D4FF' : '#6B7E99',
              cursor: 'pointer', fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
            }}>{tag}</button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={40} /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {filtered.map((c, i) => (
            <CampusCard
              key={c.id}
              campus={c}
              index={i}
              onOpen={() => navigate(`/campuses/${c.id}`)}
              onEnroll={(e) => {
                e.stopPropagation()
                enrollMutation.mutate(c.id)
              }}
              enrollLoading={enrollMutation.isPending}
            />
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: '#3A4E68' }}>
              No campuses match your search.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CampusCard({ campus: c, index, onOpen, onEnroll, enrollLoading }) {
  return (
    <div
      onClick={onOpen}
      style={{
        background: '#0C1526',
        border: '1px solid rgba(0,212,255,0.12)',
        borderRadius: 20, padding: 24, cursor: 'pointer',
        position: 'relative', overflow: 'hidden',
        transition: 'all 0.2s',
        animation: 'fadeUp 0.4s ease forwards',
        animationDelay: `${index * 0.04}s`,
        opacity: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)'
        e.currentTarget.style.transform = 'translateY(-3px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(0,212,255,0.12)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${c.color}, ${c.color}40)`,
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{
          width: 50, height: 50, borderRadius: 12, flexShrink: 0,
          background: `${c.color}18`, border: `1px solid ${c.color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
        }}>{c.icon}</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Badge color={c.tagColor}>{c.tag}</Badge>
          {c.enrolled && <Badge color="#00E5A0">✓ Enrolled</Badge>}
        </div>
      </div>

      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{c.title}</div>
      <div style={{ fontSize: 13, color: '#6B7E99', lineHeight: 1.6, marginBottom: 14 }}>
        {c.description?.slice(0, 90)}...
      </div>

      {/* Topic chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 16 }}>
        {(c.topics || []).slice(0, 3).map((t, j) => (
          <span key={j} style={{
            fontSize: 11, padding: '3px 8px', borderRadius: 6,
            background: '#111E35', color: '#6B7E99', border: '1px solid rgba(0,212,255,0.1)',
          }}>{t}</span>
        ))}
        {c.topics?.length > 3 && (
          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: '#111E35', color: '#3A4E68' }}>
            +{c.topics.length - 3}
          </span>
        )}
      </div>

      <div style={{ height: 1, background: 'rgba(0,212,255,0.08)', marginBottom: 14 }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6B7E99', marginBottom: c.userProgress > 0 ? 12 : 0 }}>
        <span>📺 {c.lessonsCount} lessons</span>
        <span>⏱️ ~{c.estimatedHours}h</span>
        <span>⭐ {c.rating}</span>
      </div>

      {c.userProgress > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6B7E99', marginBottom: 6 }}>
            <span>Progress</span>
            <span style={{ color: c.color, fontFamily: "'JetBrains Mono', monospace" }}>{c.userProgress}%</span>
          </div>
          <ProgressBar value={c.userProgress} color={c.color} />
        </>
      )}

      {!c.enrolled && (
        <button
          onClick={onEnroll}
          disabled={enrollLoading}
          style={{
            marginTop: 14, width: '100%', padding: '10px',
            borderRadius: 10, border: `1px solid ${c.color}40`,
            background: `${c.color}12`, color: c.color,
            cursor: enrollLoading ? 'not-allowed' : 'pointer',
            fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13,
            transition: 'all 0.2s',
          }}
        >
          {enrollLoading ? 'Enrolling...' : 'Enroll Now →'}
        </button>
      )}
    </div>
  )
}
