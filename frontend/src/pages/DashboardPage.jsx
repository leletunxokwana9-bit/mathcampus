import { useNavigate } from 'react-router-dom'
import useAuthStore from '../context/authStore'
import { useProgress, useCampuses } from '../api/hooks'
import { StatCard, ProgressBar, Spinner } from '../components/common/UI'
import dayjs from 'dayjs'

const NSC_DATE = dayjs('2025-11-04')
const daysLeft = NSC_DATE.diff(dayjs(), 'day')

export default function DashboardPage() {
  const user    = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const { data: progress, isLoading: progLoading } = useProgress()
  const { data: campusesData } = useCampuses()

  const enrolled = campusesData?.campuses?.filter(c => c.enrolled) || []

  const hour = dayjs().hour()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 60px' }} className="page-enter">

      {/* ── Welcome ──────────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 13, color: '#6B7E99', marginBottom: 6 }}>
          {dayjs().format('dddd, D MMMM YYYY')} · <span style={{ color: '#FFB800' }}>{daysLeft} days until NSC exams</span>
        </div>
        <h1 style={{
          fontFamily: "'Syne', sans-serif", fontSize: 'clamp(24px, 4vw, 36px)',
          fontWeight: 800, letterSpacing: '-0.02em',
        }}>
          {greeting}, <span style={{ color: '#00D4FF' }}>{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p style={{ color: '#6B7E99', marginTop: 4, fontSize: 15 }}>
          {daysLeft > 60 ? "You have time — build strong foundations now." :
           daysLeft > 30 ? "Exam season is approaching. Focus on weak areas." :
           "Final stretch! Revise and practice daily."}
        </p>
      </div>

      {/* ── Stats ────────────────────────────────────────────── */}
      {progLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16, marginBottom: 32 }}>
          <StatCard icon="🏫" label="Campuses Enrolled" value={progress?.totalEnrolled ?? 0} sub={`of 10 available`} color="#00D4FF" />
          <StatCard icon="⏱️" label="Hours Studied" value={`${progress?.totalHours ?? 0}h`} sub="all time" color="#FFB800" />
          <StatCard icon="⚡" label="Quizzes Completed" value={progress?.quizzesCompleted ?? 0} sub={`avg ${progress?.avgScore ?? 0}%`} color="#00E5A0" />
          <StatCard icon="🔥" label="Day Streak" value={`${progress?.streak ?? 0} days`} sub={`best: ${progress?.bestStreak ?? 0}`} color="#FF4D6D" />
        </div>
      )}

      {/* ── Main Grid ────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>

        {/* Enrolled campuses */}
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 16 }}>My Campuses</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {enrolled.length === 0 ? (
              <div style={{
                background: '#0C1526', border: '1px dashed rgba(0,212,255,0.2)',
                borderRadius: 16, padding: 32, textAlign: 'center',
              }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📚</div>
                <div style={{ color: '#6B7E99', marginBottom: 16 }}>You haven't enrolled in any campuses yet.</div>
                <button onClick={() => navigate('/campuses')} className="btn-primary" style={{ fontSize: 13 }}>
                  Browse Campuses →
                </button>
              </div>
            ) : enrolled.map(c => (
              <div
                key={c.id}
                onClick={() => navigate(`/campuses/${c.id}`)}
                style={{
                  background: '#0C1526', border: '1px solid rgba(0,212,255,0.12)',
                  borderRadius: 16, padding: '18px 20px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 16,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(0,212,255,0.12)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{
                  width: 50, height: 50, borderRadius: 12, flexShrink: 0,
                  background: `${c.color}18`, border: `1px solid ${c.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                }}>{c.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{c.title}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: c.color }}>{c.userProgress}%</span>
                  </div>
                  <ProgressBar value={c.userProgress} color={c.color} />
                  <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 12, color: '#3A4E68' }}>
                    <span>{c.lessonsCount} lessons</span>
                    <span>★ {c.rating}</span>
                    <span style={{ color: c.color }}>Continue →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {enrolled.length > 0 && (
            <button
              onClick={() => navigate('/campuses')}
              style={{
                marginTop: 12, width: '100%', padding: '12px',
                background: 'transparent', border: '1px dashed rgba(0,212,255,0.2)',
                borderRadius: 12, color: '#6B7E99', cursor: 'pointer', fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >+ Browse More Campuses</button>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Exam countdown */}
          <div style={{
            background: 'linear-gradient(135deg, #111E35, #172545)',
            border: '1px solid rgba(255,184,0,0.2)', borderRadius: 16, padding: 20,
            boxShadow: '0 0 30px rgba(255,184,0,0.08)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span>⏰</span>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#FFB800' }}>NSC Exam Countdown</span>
            </div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 52, fontWeight: 800, color: '#FFB800', lineHeight: 1 }}>{daysLeft}</div>
            <div style={{ color: '#6B7E99', fontSize: 13, marginTop: 4 }}>days remaining</div>
            <div style={{ height: 1, background: 'rgba(0,212,255,0.1)', margin: '14px 0' }} />
            <div style={{ fontSize: 12, color: '#6B7E99' }}>📝 Paper 1 — 4 November 2025</div>
            <div style={{ fontSize: 12, color: '#6B7E99', marginTop: 4 }}>📝 Paper 2 — 7 November 2025</div>
          </div>

          {/* Recent activity */}
          <div style={{ background: '#0C1526', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 16, padding: 20 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 14, fontSize: 15 }}>Recent Activity</div>
            {(progress?.recentActivity || []).slice(0, 4).map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: `${a.color || '#00D4FF'}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                }}>{a.icon}</div>
                <div>
                  <div style={{ fontSize: 12, color: '#E8EDF5' }}>{a.text}</div>
                  <div style={{ fontSize: 11, color: '#3A4E68' }}>{a.time}</div>
                </div>
              </div>
            ))}
            {(!progress?.recentActivity?.length) && (
              <div style={{ fontSize: 13, color: '#3A4E68', textAlign: 'center', padding: '12px 0' }}>
                No activity yet. Start studying! 🚀
              </div>
            )}
          </div>

          {/* Badges */}
          <div style={{ background: '#0C1526', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 16, padding: 20 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 14, fontSize: 15 }}>Achievements</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(progress?.badges || []).map((b, i) => (
                <div key={i} style={{
                  padding: '5px 10px', borderRadius: 20,
                  background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.2)',
                  fontSize: 11, color: '#FFB800', fontWeight: 600,
                }}>{b}</div>
              ))}
              {(!progress?.badges?.length) && (
                <div style={{ fontSize: 13, color: '#3A4E68' }}>Complete lessons to earn badges!</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
