import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Route, Routes, useNavigate } from 'react-router-dom'
import backgroundVideoUrl from './assets/video.mp4'

const GOOGLE_REVIEW_URL =
  'https://search.google.com/local/writereview?placeid=ChIJ3xtZWjRzREARXoBIQsqPe1k'

const MOCK_REVIEWS_KEY = 'episode-review-mock-reviews'

type Review = {
  id: number
  rating: number
  feedback: string
  created_at: string
}

function readMockReviews(): Review[] {
  try {
    const raw = localStorage.getItem(MOCK_REVIEWS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed as Review[]
  } catch {
    return []
  }
}

function appendMockReview(entry: Omit<Review, 'id' | 'created_at'>): Review {
  const list = readMockReviews()
  const nextId = list.reduce((m, r) => Math.max(m, r.id), 0) + 1
  const created_at = new Date().toISOString()
  const row: Review = { id: nextId, created_at, ...entry }
  localStorage.setItem(MOCK_REVIEWS_KEY, JSON.stringify([row, ...list]))
  return row
}

function VideoBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#1a2e28]"
      aria-hidden
    >
      <video
        className="absolute left-1/2 top-1/2 h-full w-full min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover opacity-90"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
      >
        <source src={backgroundVideoUrl} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/40" />
      <div className="absolute inset-0 bg-[#C1E1C1]/25" />
    </div>
  )
}

function StarIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={[
        'h-12 w-12 transition-transform duration-200 sm:h-[3.25rem] sm:w-[3.25rem]',
        active
          ? 'scale-105 drop-shadow-[0_1px_6px_rgba(234,179,8,0.35)]'
          : 'scale-100',
      ].join(' ')}
    >
      <path
        fill={active ? '#FACC15' : '#D4D4D4'}
        stroke={active ? '#CA8A04' : '#A3A3A3'}
        strokeWidth="1"
        strokeLinejoin="round"
        d="M12 2.75l2.62 5.31 5.86.85-4.24 4.14 1 5.84L12 16.13 6.76 18.9l1-5.84L3.52 8.9l5.86-.85L12 2.75z"
      />
    </svg>
  )
}

function ReviewFlowPage() {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const displayRating = hoverRating || rating
  const showFeedback = rating > 0 && rating <= 4

  const submitFeedback = async () => {
    if (isSubmitting || !showFeedback) return

    setSubmitError('')
    setIsSubmitting(true)

    try {
      await new Promise((r) => setTimeout(r, 450))
      appendMockReview({ rating, feedback: feedback.trim() })
      setSubmitted(true)
      setFeedback('')
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Something went wrong.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const openGoogleReviewPage = () => {
    window.location.assign(GOOGLE_REVIEW_URL)
  }

  const handleRatingSelect = (value: number) => {
    setRating(value)
    setSubmitted(false)
    setSubmitError('')

    if (value === 5) {
      openGoogleReviewPage()
      return
    }
  }

  return (
    <main className="relative min-h-screen font-sans text-neutral-900 antialiased">
      <VideoBackdrop />
      <section className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <div className="relative w-full max-w-md rounded-[2rem] bg-white px-6 pb-8 pt-5 shadow-[0_8px_40px_rgba(0,0,0,0.12)] sm:px-8 sm:pb-10 sm:pt-6">
          <p className="mb-1 text-center text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Give feedback
          </p>
          <h1 className="mb-6 text-center text-lg font-bold tracking-tight text-neutral-900 sm:text-xl">
            How did we do?
          </h1>

          <div className="mb-6">
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5">
              {Array.from({ length: 5 }, (_, idx) => idx + 1).map((value) => (
                <button
                  key={value}
                  type="button"
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  onFocus={() => setHoverRating(value)}
                  onBlur={() => setHoverRating(0)}
                  onClick={() => handleRatingSelect(value)}
                  aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                  className="rounded-lg p-1 outline-none transition-transform hover:scale-[1.04] active:scale-95 focus-visible:ring-2 focus-visible:ring-[#2D5A27]/35 focus-visible:ring-offset-1"
                >
                  <StarIcon active={value <= displayRating} />
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {showFeedback && (
              <motion.div
                key="feedback-block"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <p className="mb-3 text-[15px] text-neutral-800">
                  Care to share more about it?
                </p>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={5}
                  placeholder=""
                  className="mb-5 w-full resize-none rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-[15px] text-neutral-900 outline-none ring-0 transition-shadow placeholder:text-neutral-400 focus:border-neutral-300 focus:shadow-[0_0_0_3px_rgba(45,90,39,0.12)]"
                />
                <button
                  type="button"
                  onClick={submitFeedback}
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-[#A8E6CF] py-4 text-center text-sm font-bold uppercase tracking-[0.08em] text-[#2D5A27] shadow-sm transition-all hover:brightness-[1.02] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-65"
                >
                  {isSubmitting ? 'Publishing…' : 'PUBLISH FEEDBACK'}
                </button>
                <p className="mt-4 text-center text-xs leading-relaxed text-neutral-600">
                  Your message is sent to our team in confidence. We use it to improve the
                  experience for every guest.
                </p>
                {submitError && (
                  <p className="mt-3 text-center text-sm text-red-600">{submitError}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {submitted && (
              <motion.div
                key="overlay"
                role="dialog"
                aria-modal="true"
                aria-labelledby="success-title"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 z-20 flex items-center justify-center rounded-[2rem] bg-black/45 p-4 backdrop-blur-[2px]"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full max-w-[min(100%,320px)] overflow-hidden rounded-3xl bg-white shadow-xl"
                >
                  <div className="px-6 pb-8 pt-6 text-center">
                    <h2
                      id="success-title"
                      className="mb-2 text-xl font-bold tracking-tight text-black"
                    >
                      Thank you!
                    </h2>
                    <p className="text-sm leading-relaxed text-neutral-600">
                      We read every message and use it to raise our standards for every guest.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  )
}

function ReviewsPage() {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    setReviews(readMockReviews())
  }, [])

  return (
    <main className="relative min-h-screen font-sans text-neutral-900 antialiased">
      <VideoBackdrop />
      <div className="relative z-10 mx-auto max-w-3xl p-5 md:p-8">
        <div className="rounded-[2rem] bg-white px-6 py-6 shadow-[0_8px_40px_rgba(0,0,0,0.12)] md:px-8 md:py-8">
          <div className="mb-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#1a5c52] hover:bg-black/5"
              aria-label="Back"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-black">All reviews</h1>
          </div>

          {reviews.length === 0 && <p className="text-neutral-600">No reviews yet.</p>}

          <div className="space-y-3">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4"
              >
                <div className="mb-2 flex items-center justify-between text-xs text-neutral-500">
                  <span>#{review.id}</span>
                  <span>{new Date(review.created_at).toLocaleString()}</span>
                </div>
                <p className="mb-1 text-sm text-[#B8860B]">
                  {'★'.repeat(review.rating)}
                  <span className="text-neutral-300">{'★'.repeat(5 - review.rating)}</span>
                </p>
                <p className="text-sm text-neutral-800">
                  {review.feedback || 'Positive review routed to Google.'}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ReviewFlowPage />} />
      <Route path="/reviews" element={<ReviewsPage />} />
    </Routes>
  )
}
