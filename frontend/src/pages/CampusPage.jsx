import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCampus, useLessons, usePosts, useCreatePost, useEnrollCampus } from '../api/hooks'
import { Badge, ProgressBar, Spinner, TabBar, Avatar } from '../components/common/UI'
import PracticeZone from '../components/campus/PracticeZone'

const TABS = [
  { id: 'overview',    label: 'Overview' },
  { id: 'lessons',    label: 'Lessons' },
  { id: 'practice',   label: 'Practice Zone' },
  { id: 'resources',  label: 'Resources' },
  { id: 'discussion', label: 'Discussion' },
]

export default function CampusPage() {
  const { campusId } = useParams()
  const navigate     = useNavigate()
  const [tab, setTab] = useState('overview')

  const { data: campusData, isLoading } = useCampus(campusId)
  const enrollMutation = useEnrollCampus()

  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={40} /></div>

  const c = campusData?.campus
  if (!c) return <div style={{ textAlign: 'center', padding: 60, color: '#6B7E99' }}>Campus not found.</div>

  return (
    <div style={{ minHeight: '100vh', background: '#03070F' }} className="page-enter">

      {/* ── HERO BANNER ───────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, #070D1A 0%, ${c.color}0D 100%)`,
        borderBottom: '1px solid rgba(0,212,255,0.1)',
        padding: '28px 24px 24px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: 13, color: '#6B7E99', marginBottom: 14 }}>
            <span onClick={() => navigate('/campuses')} style={{ color: '#00D4FF', cursor: 'pointer' }}>Campuses</span>
            {' / '}{c.title}
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{
              width: 72, height: 72, borderRadius: 18, flexShrink: 0,
              background: `${c.color}20`, border: `2px solid ${c.color}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, boxShadow: `0 0 30px ${c.color}25`,
            }}>{c.icon}</div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                <Badge color={c.tagColor}>{c.tag}</Badge>
                <Badge color={c.difficulty === 'Hard' ? '#FF4D6D' : c.difficulty === 'Easy' ? '#00E5A0' : '#FFB800'}>
                  {c.difficulty}
                </Badge>
                {c.enrolled && <Badge color="#00E5A0">✓ Enrolled</Badge>}
              </div>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>
                {c.title}
              </h1>
              <p style={{ color: '#6B7E99', fontSize: 14, maxWidth: 600, lineHeight: 1.7, marginBottom: 14 }}>{c.description}</p>
              <div style={{ display: 'flex', gap: 20, fontSize: 13, color: '#6B7E99', flexWrap: 'wrap' }}>
                <span>📺 {c.lessonsCount} lessons</span>
                <span>⏱️ ~{c.estimatedHours}h</span>
                <span>👥 {c.studentCount?.toLocaleString()} students</span>
                <span>⭐ {c.rating}</span>
              </div>
            </div>

            <div style={{
              background: '#0C1526', border: '1px solid rgba(0,212,255,0.12)',
              borderRadius: 16, padding: 20, minWidth: 190,
            }}>
              {c.enrolled ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: '#6B7E99' }}>Progress</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: c.color, fontSize: 13 }}>{c.userProgress}%</span>
                  </div>
                  <ProgressBar value={c.userProgress} color={c.color} height={8} />
                  <div style={{ fontSize: 12, color: '#3A4E68', marginTop: 8 }}>
                    {Math.round(c.userProgress / 100 * c.lessonsCount)} / {c.lessonsCount} lessons
                  </div>
                </>
              ) : (
                <button
                  onClick={() => enrollMutation.mutate(c.id)}
                  disabled={enrollMutation.isPending}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {enrollMutation.isPending ? 'Enrolling...' : 'Enroll Free →'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── TAB BAR ───────────────────────────────────────────── */}
      <div style={{
        background: 'rgba(7,13,26,0.92)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,212,255,0.1)',
        position: 'sticky', top: 60, zIndex: 50,
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <TabBar tabs={TABS} active={tab} onChange={setTab} />
        </div>
      </div>

      {/* ── TAB CONTENT ────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 60px' }}>
        {tab === 'overview'    && <OverviewTab campus={c} />}
        {tab === 'lessons'     && <LessonsTab campus={c} />}
        {tab === 'practice'    && <PracticeZone campus={c} />}
        {tab === 'resources'   && <ResourcesTab campus={c} />}
        {tab === 'discussion'  && <DiscussionTab campus={c} />}
      </div>
    </div>
  )
}

// ── OVERVIEW TAB ─────────────────────────────────────────────────────────────
function OverviewTab({ campus: c }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 16 }}>What You'll Learn</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(c.topics || []).map((t, i) => (
            <div key={i} style={{
              display: 'flex', gap: 12, alignItems: 'center',
              background: '#0C1526', border: '1px solid rgba(0,212,255,0.1)',
              borderRadius: 10, padding: '12px 16px', fontSize: 14,
            }}>
              <span style={{ color: '#00E5A0' }}>✓</span>
              {t}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: '#0C1526', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Campus Details</h3>
          {[
            ['📺', 'Total Lessons', `${c.lessonsCount} videos + quizzes`],
            ['⏱️', 'Estimated Time', `~${c.estimatedHours} hours`],
            ['👥', 'Students', c.studentCount?.toLocaleString()],
            ['⭐', 'Rating', `${c.rating} / 5.0`],
            ['📊', 'Difficulty', c.difficulty],
            ['📝', 'NSC Relevance', 'Paper 1 & Paper 2'],
          ].map(([icon, label, val], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 10 }}>
              <span style={{ color: '#6B7E99' }}>{icon} {label}</span>
              <span style={{ fontWeight: 600 }}>{val}</span>
            </div>
          ))}
        </div>
        <div style={{
          background: `${c.color}0D`, border: `1px solid ${c.color}25`,
          borderRadius: 16, padding: 22,
        }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 10, color: c.color }}>📌 Exam Tip</div>
          <p style={{ fontSize: 14, color: '#6B7E99', lineHeight: 1.7 }}>
            In the NSC exam, <strong style={{ color: '#E8EDF5' }}>{c.title}</strong> typically accounts for
            {' '}<strong style={{ color: c.color }}>±25–30 marks</strong> across Paper 1 and 2.
            Always label axes, mark intercepts/asymptotes, and show all working for full method marks.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── LESSONS TAB ──────────────────────────────────────────────────────────────
function LessonsTab({ campus: c }) {
  const navigate = useNavigate()
  const { data, isLoading } = useLessons(c.id)
  const lessons = data?.lessons || []

  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
      <div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 18 }}>
          Lesson Plan — {lessons.length} Lessons
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {lessons.map((lesson, i) => (
            <div
              key={lesson.id}
              onClick={() => !lesson.locked && navigate(`/campuses/${c.id}/lessons/${lesson.id}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: lesson.locked ? '#070D1A' : '#0C1526',
                border: `1px solid ${lesson.completed ? c.color + '30' : 'rgba(0,212,255,0.1)'}`,
                borderRadius: 12, padding: '14px 18px',
                opacity: lesson.locked ? 0.5 : 1,
                cursor: lesson.locked ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {/* Step indicator */}
              <div style={{ width: 32, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                {lesson.locked ? (
                  <span style={{ color: '#3A4E68', fontSize: 16 }}>🔒</span>
                ) : lesson.completed ? (
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', background: c.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: '#000',
                  }}>✓</div>
                ) : (
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    border: '2px solid rgba(0,212,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, color: '#3A4E68', fontFamily: "'JetBrains Mono', monospace",
                  }}>{i + 1}</div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{lesson.title}</div>
                <div style={{ fontSize: 12, color: '#6B7E99' }}>{lesson.duration}</div>
              </div>
              <div style={{
                padding: '3px 10px', borderRadius: 20, fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase',
                background: lesson.type === 'video' ? 'rgba(0,212,255,0.1)' : lesson.type === 'quiz' ? 'rgba(255,184,0,0.1)' : '#111E35',
                color: lesson.type === 'video' ? '#00D4FF' : lesson.type === 'quiz' ? '#FFB800' : '#6B7E99',
              }}>
                {lesson.type === 'video' ? '▶ Video' : lesson.type === 'quiz' ? '⚡ Quiz' : '📄 Notes'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video sidebar */}
      <div style={{ position: 'sticky', top: 120 }}>
        <div style={{ background: '#0C1526', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{
            background: `${c.color}18`, aspectRatio: '16/9',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderBottom: '1px solid rgba(0,212,255,0.1)',
          }}>
            <span style={{ fontSize: 48 }}>🎬</span>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 12, color: '#00D4FF', fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>NEXT UP</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
              {lessons.find(l => !l.completed && !l.locked)?.title || 'All lessons complete!'}
            </div>
            <button
              onClick={() => {
                const next = lessons.find(l => !l.completed && !l.locked)
                if (next) navigate(`/campuses/${c.id}/lessons/${next.id}`)
              }}
              style={{
                marginTop: 14, width: '100%', padding: '12px',
                background: `linear-gradient(135deg, ${c.color}, ${c.color}70)`,
                border: 'none', borderRadius: 10, color: '#000',
                cursor: 'pointer', fontFamily: "'Syne', sans-serif",
                fontWeight: 700, fontSize: 14,
              }}
            >▶ Continue Studying</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── RESOURCES TAB ────────────────────────────────────────────────────────────
function ResourcesTab({ campus: c }) {
  const resources = c.resources || []
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700 }}>Study Resources</h3>
        <Badge color="#00E5A0">{resources.filter(r => !r.premium).length} Free Downloads</Badge>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {resources.map((r, i) => (
          <div key={i} style={{
            background: '#0C1526', border: '1px solid rgba(0,212,255,0.12)',
            borderRadius: 12, padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.12)'}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 10, flexShrink: 0,
              background: r.type === 'PDF' ? '#FF4D6D18' : 'rgba(0,212,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            }}>{r.type === 'PDF' ? '📄' : '📝'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, display: 'flex', gap: 8, alignItems: 'center' }}>
                {r.title}
                {r.premium && <span style={{ color: '#FFB800', fontSize: 13 }}>🔒</span>}
              </div>
              <div style={{ fontSize: 12, color: '#6B7E99' }}>{r.type} · {r.size} · {r.downloads?.toLocaleString()} downloads</div>
            </div>
            <button style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 13,
              background: r.premium ? 'rgba(255,184,0,0.1)' : 'rgba(0,212,255,0.1)',
              border: `1px solid ${r.premium ? 'rgba(255,184,0,0.3)' : 'rgba(0,212,255,0.3)'}`,
              color: r.premium ? '#FFB800' : '#00D4FF',
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}>
              {r.premium ? '🔒 Premium' : '⬇ Download'}
            </button>
          </div>
        ))}
        {resources.length === 0 && (
          <div style={{ textAlign: 'center', padding: 48, color: '#3A4E68' }}>
            Resources coming soon for this campus.
          </div>
        )}
      </div>
    </div>
  )
}

// ── DISCUSSION TAB ────────────────────────────────────────────────────────────
function DiscussionTab({ campus: c }) {
  const [content, setContent] = useState('')
  const { data, isLoading }  = usePosts(c.id)
  const createPost            = useCreatePost()
  const posts = data?.posts || []

  const handlePost = () => {
    if (!content.trim()) return
    createPost.mutate({ campusId: c.id, content }, {
      onSuccess: () => setContent(''),
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700 }}>Campus Discussion</h3>
        <span style={{ fontSize: 13, color: '#6B7E99' }}>💬 {posts.length} posts</span>
      </div>

      {/* New post */}
      <div style={{ background: '#0C1526', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 16, padding: 20, marginBottom: 24 }}>
        <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 15 }}>Ask a Question or Share a Tip</div>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Type your question or insight..."
          rows={3}
          style={{
            width: '100%', padding: '12px', borderRadius: 10,
            background: '#111E35', border: '1px solid rgba(0,212,255,0.12)',
            color: '#E8EDF5', fontSize: 14, fontFamily: "'DM Sans', sans-serif",
            resize: 'vertical',
          }}
          onFocus={e => e.target.style.borderColor = '#00D4FF'}
          onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.12)'}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
          <button
            onClick={handlePost}
            disabled={createPost.isPending || !content.trim()}
            style={{
              padding: '10px 24px', borderRadius: 10,
              background: content.trim() ? `linear-gradient(135deg, ${c.color}, ${c.color}70)` : '#111E35',
              border: 'none', cursor: content.trim() ? 'pointer' : 'not-allowed',
              color: content.trim() ? '#000' : '#3A4E68',
              fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14,
            }}
          >{createPost.isPending ? 'Posting...' : 'Post'}</button>
        </div>
      </div>

      {/* Posts */}
      {isLoading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div>
        : posts.map(post => (
          <div key={post.id} style={{
            background: '#0C1526', border: '1px solid rgba(0,212,255,0.12)',
            borderRadius: 16, padding: 20, marginBottom: 12,
          }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <Avatar name={post.user?.name || 'U'} color={post.avatarColor || '#00D4FF'} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{post.user?.name}</span>
                  <span style={{ fontSize: 12, color: '#3A4E68' }}>{post.timeAgo}</span>
                  {post.solved && <Badge color="#00E5A0">✓ Solved</Badge>}
                </div>
                <p style={{ fontSize: 14, color: '#E8EDF5', lineHeight: 1.7, marginBottom: 12 }}>{post.content}</p>
                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#6B7E99' }}>
                  <span style={{ cursor: 'pointer' }}>♥ {post.likesCount}</span>
                  <span style={{ cursor: 'pointer', color: '#00D4FF' }}>💬 {post.repliesCount} replies</span>
                </div>
              </div>
            </div>
          </div>
        ))
      }
      {!isLoading && posts.length === 0 && (
        <div style={{ textAlign: 'center', padding: 48, color: '#3A4E68' }}>
          Be the first to post in this campus! 🚀
        </div>
      )}
    </div>
  )
}
