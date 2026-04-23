import { useProgress, useCampuses } from '../api/hooks'
import { StatCard, ProgressBar, Spinner } from '../components/common/UI'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export default function ProgressPage() {
  const { data: progress, isLoading } = useProgress()
  const { data: campusData } = useCampuses()
  const campuses = campusData?.campuses || []

  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={40} /></div>

  const p = progress || {}
  const studyData   = p.weeklyStudyHours || []
  const quizHistory = p.quizHistory || []

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 60px' }} className="page-enter">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>
          My <span style={{ color: '#00D4FF' }}>Progress</span>
        </h1>
        <p style={{ color: '#6B7E99' }}>Track your learning journey and NSC exam readiness.</p>
      </div>

      {/* Stat grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard icon="📚" label="Lessons Completed" value={p.lessonsCompleted ?? 0} sub={`of ${p.totalLessons ?? 0} total`} color="#00D4FF" />
        <StatCard icon="⚡" label="Avg Quiz Score"    value={`${p.avgScore ?? 0}%`}   sub="last 10 quizzes"              color="#FFB800" />
        <StatCard icon="⏱️" label="Total Study Time"  value={`${p.totalHours ?? 0}h`}  sub="all time"                    color="#00E5A0" />
        <StatCard icon="📊" label="NSC Readiness"     value={`${p.readiness ?? 0}%`}   sub="estimated"                   color="#A855F7" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>

        {/* Study hours chart */}
        <div style={{ background: '#0C1526', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 20, padding: 24 }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Weekly Study Hours</h3>
          <p style={{ fontSize: 12, color: '#6B7E99', marginBottom: 20 }}>Hours studied per week</p>
          {studyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={studyData}>
                <defs>
                  <linearGradient id="cyan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00D4FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00D4FF" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" stroke="#3A4E68" tick={{ fontSize: 11, fill: '#3A4E68' }} />
                <YAxis stroke="#3A4E68" tick={{ fontSize: 11, fill: '#3A4E68' }} />
                <Tooltip
                  contentStyle={{ background: '#111E35', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#E8EDF5' }}
                />
                <Area type="monotone" dataKey="hours" stroke="#00D4FF" strokeWidth={2} fill="url(#cyan)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3A4E68', fontSize: 14 }}>
              No study data yet. Start learning! 📚
            </div>
          )}
        </div>

        {/* Quiz scores chart */}
        <div style={{ background: '#0C1526', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 20, padding: 24 }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Quiz Scores</h3>
          <p style={{ fontSize: 12, color: '#6B7E99', marginBottom: 20 }}>Recent quiz performance</p>
          {quizHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={quizHistory.slice(-8)}>
                <XAxis dataKey="label" stroke="#3A4E68" tick={{ fontSize: 10, fill: '#3A4E68' }} />
                <YAxis domain={[0, 100]} stroke="#3A4E68" tick={{ fontSize: 11, fill: '#3A4E68' }} />
                <Tooltip
                  contentStyle={{ background: '#111E35', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}
                  fill="#FFB800"
                  label={false}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3A4E68', fontSize: 14 }}>
              Complete some quizzes to see scores! ⚡
            </div>
          )}
        </div>
      </div>

      {/* Campus progress & readiness */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>

        {/* Campus breakdown */}
        <div style={{ background: '#0C1526', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 20, padding: 24 }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Campus Progress</h3>
          {campuses.filter(c => c.enrolled).map(c => (
            <div key={c.id} style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{c.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{c.title}</span>
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: c.color }}>{c.userProgress}%</span>
              </div>
              <ProgressBar value={c.userProgress} color={c.color} height={7} />
            </div>
          ))}
          {campuses.filter(c => c.enrolled).length === 0 && (
            <div style={{ textAlign: 'center', padding: 32, color: '#3A4E68', fontSize: 14 }}>
              Enroll in campuses to track progress.
            </div>
          )}
        </div>

        {/* Quiz history */}
        <div style={{ background: '#0C1526', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 20, padding: 24 }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Quiz History</h3>
          {quizHistory.slice(-6).map((q, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                background: q.score >= 80 ? '#00E5A018' : q.score >= 60 ? 'rgba(255,184,0,0.1)' : '#FF4D6D18',
                border: `1px solid ${q.score >= 80 ? '#00E5A030' : q.score >= 60 ? 'rgba(255,184,0,0.3)' : '#FF4D6D30'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700,
                color: q.score >= 80 ? '#00E5A0' : q.score >= 60 ? '#FFB800' : '#FF4D6D',
              }}>{q.score}%</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{q.quizTitle}</div>
                <ProgressBar value={q.score} color={q.score >= 80 ? '#00E5A0' : q.score >= 60 ? '#FFB800' : '#FF4D6D'} height={4} />
              </div>
              <div style={{ fontSize: 11, color: '#3A4E68', flexShrink: 0 }}>{q.date}</div>
            </div>
          ))}
          {quizHistory.length === 0 && (
            <div style={{ textAlign: 'center', padding: 32, color: '#3A4E68', fontSize: 14 }}>
              No quizzes yet. Head to a campus Practice Zone!
            </div>
          )}
        </div>
      </div>

      {/* NSC Readiness grid */}
      <div style={{ background: '#0C1526', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 20, padding: 24 }}>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 20 }}>
          📝 NSC Exam Readiness — All Topics
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14 }}>
          {campuses.map(c => (
            <div key={c.id} style={{ background: '#070D1A', border: '1px solid rgba(0,212,255,0.08)', borderRadius: 12, padding: 14 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>{c.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>{c.title}</span>
              </div>
              <ProgressBar value={c.enrolled ? c.userProgress : 0} color={c.color} height={5} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11 }}>
                <span style={{ color: '#3A4E68' }}>{c.enrolled ? 'Enrolled' : 'Not started'}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: c.color }}>
                  {c.enrolled ? `${c.userProgress}%` : '0%'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
