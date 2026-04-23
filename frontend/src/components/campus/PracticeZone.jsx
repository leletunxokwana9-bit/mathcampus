import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSubmitQuiz } from '../../api/hooks'
import { ProgressBar, Badge, Spinner } from '../common/UI'
import api from '../../api/client'

export default function PracticeZone({ campus: c }) {
  const [started, setStarted]   = useState(false)
  const [quizId, setQuizId]     = useState(null)
  const [state, setState]       = useState({ q: 0, answers: {}, submitted: false, result: null })
  const submitMutation          = useSubmitQuiz()

  const { data: quizData, isLoading } = useQuery({
    queryKey: ['quizzes', 'campus', c.id],
    queryFn: () => api.get(`/campuses/${c.id}/quiz`).then(r => r.data),
    enabled: started,
  })

  const quiz      = quizData?.quiz
  const questions = quiz?.questions || []

  const selectAnswer = (optionIndex) => {
    if (state.answers[state.q] !== undefined) return
    setState(prev => ({ ...prev, answers: { ...prev.answers, [prev.q]: optionIndex } }))
  }

  const handleSubmit = async () => {
    const result = await submitMutation.mutateAsync({ quizId: quiz.id, answers: state.answers })
    setState(prev => ({ ...prev, submitted: true, result }))
  }

  // ── Not started ─────────────────────────────────────────────
  if (!started) return (
    <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', paddingTop: 20 }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>⚡</div>
      <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Practice Zone</h2>
      <p style={{ color: '#6B7E99', fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
        Test your knowledge of <strong style={{ color: '#E8EDF5' }}>{c.title}</strong> with curriculum-aligned questions.
        Instant feedback after every answer with full explanations.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 36, textAlign: 'left' }}>
        {[
          { icon: '❓', label: 'Questions', val: '5–10 per session' },
          { icon: '📊', label: 'Difficulty', val: 'Mixed Levels' },
          { icon: '⏱️', label: 'Time Limit', val: 'None — take your time' },
          { icon: '✅', label: 'Feedback', val: 'After each question' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#0C1526', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 11, color: '#6B7E99' }}>{s.label}</div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{s.val}</div>
          </div>
        ))}
      </div>
      <button
        onClick={() => setStarted(true)}
        style={{
          padding: '16px 48px',
          background: `linear-gradient(135deg, ${c.color}, ${c.color}70)`,
          border: 'none', borderRadius: 12, cursor: 'pointer',
          fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18,
          color: c.color === '#FFB800' ? '#000' : '#fff',
          boxShadow: `0 0 30px ${c.color}30`,
          transition: 'all 0.2s',
        }}
      >Start Practice Quiz →</button>
    </div>
  )

  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={40} /></div>
  if (!quiz) return <div style={{ textAlign: 'center', padding: 60, color: '#6B7E99' }}>No quiz available for this campus yet.</div>

  // ── Results screen ───────────────────────────────────────────
  if (state.submitted && state.result) {
    const { score, total, percentage, passed } = state.result
    return (
      <div style={{ maxWidth: 680, margin: '0 auto' }} className="animate-fadeIn">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 64 }}>{percentage >= 80 ? '🏆' : percentage >= 60 ? '⭐' : '📚'}</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, marginTop: 12, marginBottom: 4 }}>
            {percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good Work!' : 'Keep Practising!'}
          </h2>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 56, fontWeight: 800, color: percentage >= 80 ? '#00E5A0' : percentage >= 60 ? '#FFB800' : '#FF4D6D' }}>
            {percentage}%
          </div>
          <p style={{ color: '#6B7E99', marginTop: 4 }}>{score} of {total} correct</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          {questions.map((q, i) => {
            const correct = state.answers[i] === q.correctIndex
            return (
              <div key={i} style={{
                background: correct ? '#00E5A018' : '#FF4D6D18',
                border: `1px solid ${correct ? '#00E5A030' : '#FF4D6D30'}`,
                borderRadius: 12, padding: 16,
              }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <span style={{ color: correct ? '#00E5A0' : '#FF4D6D', flexShrink: 0, fontWeight: 700 }}>{correct ? '✓' : '✗'}</span>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{q.question}</span>
                </div>
                {!correct && (
                  <div style={{ fontSize: 13, color: '#00E5A0', marginLeft: 20, marginBottom: 4 }}>
                    Correct: {q.options[q.correctIndex]}
                  </div>
                )}
                <div style={{ fontSize: 13, color: '#6B7E99', marginLeft: 20, lineHeight: 1.6 }}>
                  💡 {q.explanation}
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          <button
            onClick={() => { setStarted(false); setState({ q: 0, answers: {}, submitted: false, result: null }) }}
            style={{
              padding: '14px 36px', borderRadius: 12, cursor: 'pointer',
              background: `linear-gradient(135deg, ${c.color}, ${c.color}70)`,
              border: 'none', color: c.color === '#FFB800' ? '#000' : '#fff',
              fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16,
            }}
          >Try Again</button>
        </div>
      </div>
    )
  }

  // ── Active quiz ──────────────────────────────────────────────
  const current = questions[state.q]
  const answered = state.answers[state.q] !== undefined
  const allAnswered = Object.keys(state.answers).length === questions.length
  const isLast = state.q === questions.length - 1

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Progress header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: '#6B7E99' }}>Question {state.q + 1} of {questions.length}</span>
        <Badge color={current.difficulty === 'Hard' ? '#FF4D6D' : current.difficulty === 'Easy' ? '#00E5A0' : '#FFB800'}>
          {current.difficulty}
        </Badge>
      </div>
      <ProgressBar value={(state.q / questions.length) * 100} color={c.color} height={5} />

      <div style={{ background: '#0C1526', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 20, padding: 32, marginTop: 18 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: c.color, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Question {state.q + 1}
        </div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 28, lineHeight: 1.4 }}>
          {current.question}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {current.options.map((opt, i) => {
            const chosen = state.answers[state.q] === i
            const isCorrect = i === current.correctIndex
            const showResult = answered

            let border = 'rgba(0,212,255,0.1)', bg = '#111E35', color = '#E8EDF5'
            if (showResult) {
              if (isCorrect) { border = '#00E5A060'; bg = '#00E5A018'; color = '#00E5A0' }
              else if (chosen) { border = '#FF4D6D60'; bg = '#FF4D6D18'; color = '#FF4D6D' }
            } else if (chosen) {
              border = c.color + '60'; bg = c.color + '18'; color = c.color
            }

            return (
              <button key={i} onClick={() => selectAnswer(i)} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px', borderRadius: 12,
                border: `1px solid ${border}`, background: bg, color,
                cursor: answered ? 'default' : 'pointer',
                textAlign: 'left', fontFamily: "'DM Sans', sans-serif", fontSize: 15,
                transition: 'all 0.12s', width: '100%',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  border: `2px solid ${border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700, flexShrink: 0,
                }}>{['A','B','C','D'][i]}</div>
                <span style={{ flex: 1 }}>{opt}</span>
                {showResult && isCorrect && <span>✓</span>}
                {showResult && chosen && !isCorrect && <span>✗</span>}
              </button>
            )
          })}
        </div>

        {answered && (
          <div style={{
            background: '#111E35', border: '1px solid rgba(0,212,255,0.1)',
            borderRadius: 12, padding: 16,
            fontSize: 14, color: '#6B7E99', lineHeight: 1.7, marginBottom: 24,
          }}>
            <strong style={{ color: '#00D4FF' }}>💡 Explanation:</strong> {current.explanation}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            disabled={state.q === 0}
            onClick={() => setState(prev => ({ ...prev, q: Math.max(0, prev.q - 1) }))}
            style={{
              padding: '11px 22px', borderRadius: 10, background: '#111E35',
              border: '1px solid rgba(0,212,255,0.12)',
              color: state.q === 0 ? '#3A4E68' : '#E8EDF5',
              cursor: state.q === 0 ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14,
            }}
          >← Previous</button>

          {!isLast ? (
            <button
              disabled={!answered}
              onClick={() => setState(prev => ({ ...prev, q: prev.q + 1 }))}
              style={{
                padding: '11px 22px', borderRadius: 10,
                background: answered ? `linear-gradient(135deg, ${c.color}, ${c.color}70)` : '#111E35',
                border: `1px solid ${answered ? c.color + '40' : 'rgba(0,212,255,0.12)'}`,
                color: answered ? (c.color === '#FFB800' ? '#000' : '#fff') : '#3A4E68',
                cursor: answered ? 'pointer' : 'not-allowed',
                fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14,
              }}
            >Next →</button>
          ) : (
            <button
              disabled={!allAnswered || submitMutation.isPending}
              onClick={handleSubmit}
              style={{
                padding: '11px 22px', borderRadius: 10,
                background: allAnswered ? 'linear-gradient(135deg, #00E5A0, #00E5A070)' : '#111E35',
                border: `1px solid ${allAnswered ? '#00E5A040' : 'rgba(0,212,255,0.12)'}`,
                color: allAnswered ? '#000' : '#3A4E68',
                cursor: allAnswered ? 'pointer' : 'not-allowed',
                fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14,
              }}
            >{submitMutation.isPending ? 'Submitting...' : 'Submit Quiz ✓'}</button>
          )}
        </div>
      </div>
    </div>
  )
}
