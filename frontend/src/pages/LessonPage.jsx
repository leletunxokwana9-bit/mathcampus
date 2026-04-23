import { useParams, useNavigate } from 'react-router-dom'
export default function LessonPage() {
  const { campusId, lessonId } = useParams()
  const navigate = useNavigate()
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <button onClick={() => navigate(`/campuses/${campusId}`)} style={{ background: 'none', border: 'none', color: '#00D4FF', cursor: 'pointer', marginBottom: 24, fontSize: 14 }}>
        ← Back to Campus
      </button>
      <div style={{ background: '#0C1526', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ background: '#070D1A', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
          <span style={{ fontSize: 64 }}>🎬</span>
          <p style={{ color: '#6B7E99', fontSize: 14 }}>Video player — embed YouTube, Vimeo, or AWS S3 URL here</p>
        </div>
        <div style={{ padding: 28 }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Lesson Player</h2>
          <p style={{ color: '#6B7E99', lineHeight: 1.7 }}>Connect a video URL from YouTube, Vimeo, or AWS S3 to display video content here. The backend <code>lessons</code> table has a <code>video_url</code> and <code>video_provider</code> column for this.</p>
        </div>
      </div>
    </div>
  )
}
