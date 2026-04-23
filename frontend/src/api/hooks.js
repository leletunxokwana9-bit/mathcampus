import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from './client'
import toast from 'react-hot-toast'

// ── Query Keys ───────────────────────────────────────────────────────────────
export const KEYS = {
  campuses:    ['campuses'],
  campus:      (id) => ['campuses', id],
  lessons:     (campusId) => ['campuses', campusId, 'lessons'],
  quiz:        (id) => ['quizzes', id],
  posts:       (campusId) => ['campuses', campusId, 'posts'],
  progress:    ['progress'],
  leaderboard: ['leaderboard'],
}

// ── Campuses ─────────────────────────────────────────────────────────────────
export const useCampuses = () =>
  useQuery({ queryKey: KEYS.campuses, queryFn: () => api.get('/campuses').then(r => r.data) })

export const useCampus = (id) =>
  useQuery({ queryKey: KEYS.campus(id), queryFn: () => api.get(`/campuses/${id}`).then(r => r.data), enabled: !!id })

export const useEnrollCampus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (campusId) => api.post(`/campuses/${campusId}/enroll`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.campuses })
      qc.invalidateQueries({ queryKey: KEYS.progress })
      toast.success('Enrolled successfully! 🎉')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Enrollment failed'),
  })
}

// ── Lessons ───────────────────────────────────────────────────────────────────
export const useLessons = (campusId) =>
  useQuery({ queryKey: KEYS.lessons(campusId), queryFn: () => api.get(`/campuses/${campusId}/lessons`).then(r => r.data), enabled: !!campusId })

export const useCompleteLesson = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ lessonId, campusId }) => api.post(`/lessons/${lessonId}/complete`, { campusId }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: KEYS.lessons(vars.campusId) })
      qc.invalidateQueries({ queryKey: KEYS.progress })
      toast.success('Lesson completed! ✅')
    },
  })
}

// ── Quizzes ───────────────────────────────────────────────────────────────────
export const useQuiz = (quizId) =>
  useQuery({ queryKey: KEYS.quiz(quizId), queryFn: () => api.get(`/quizzes/${quizId}`).then(r => r.data), enabled: !!quizId })

export const useSubmitQuiz = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ quizId, answers }) => api.post(`/quizzes/${quizId}/submit`, { answers }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.progress })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Submission failed'),
  })
}

// ── Progress ──────────────────────────────────────────────────────────────────
export const useProgress = () =>
  useQuery({ queryKey: KEYS.progress, queryFn: () => api.get('/progress/me').then(r => r.data) })

// ── Discussion ────────────────────────────────────────────────────────────────
export const usePosts = (campusId) =>
  useQuery({ queryKey: KEYS.posts(campusId), queryFn: () => api.get(`/campuses/${campusId}/posts`).then(r => r.data), enabled: !!campusId })

export const useCreatePost = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ campusId, content }) => api.post(`/campuses/${campusId}/posts`, { content }).then(r => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: KEYS.posts(vars.campusId) })
      toast.success('Posted!')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not post'),
  })
}

export const useCreateReply = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, campusId, content }) =>
      api.post(`/posts/${postId}/replies`, { content }).then(r => r.data),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: KEYS.posts(vars.campusId) }),
    onError: (err) => toast.error(err.response?.data?.message || 'Could not reply'),
  })
}

export const useLikePost = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ postId }) => api.post(`/posts/${postId}/like`),
    onSuccess: (_, vars) => {
      // Optimistic-friendly — just refetch
      qc.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

// ── Leaderboard ────────────────────────────────────────────────────────────────
export const useLeaderboard = () =>
  useQuery({ queryKey: KEYS.leaderboard, queryFn: () => api.get('/leaderboard').then(r => r.data) })
