import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Route, Routes } from 'react-router-dom'
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
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#1a2e28]">
      <video
        className="absolute left-1/2 top-1/2 h-full w-full min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover opacity-90"
        autoPlay
        muted
        loop
        playsInline
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
      className={[
        'h-12 w-12 transition-transform duration-200',
        active ? 'scale-105' : 'scale-100',
      ].join(' ')}
    >
      <path
        fill={active ? '#FACC15' : '#D4D4D4'}
        stroke={active ? '#CA8A04' : '#A3A3A3'}
        strokeWidth="1"
        d="M12 2.75l2.62 5.31 5.86.85-4.24 4.14 1 5.84L12 16.13 6.76 18.9l1-5.84L3.52 8.9l5.86-.85L12 2.75z"
      />
    </svg>
  )
}

function ReviewFlowPage() {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const displayRating = hoverRating || rating
  const showFeedback = rating > 0 && rating <= 4

  const submitFeedback = async () => {
    appendMockReview({ rating, feedback })
    setSubmitted(true)
  }

  const openGoogleReviewPopup = () => {
    window.open(GOOGLE_REVIEW_URL, '_blank')
  }

  const handleRatingSelect = (value: number) => {
    setRating(value)
    if (value === 5) openGoogleReviewPopup()
  }

  return (
    <main className="relative min-h-screen">
      <VideoBackdrop />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
          <p className="text-center text-xs uppercase text-neutral-500">
            Give feedback
          </p>

          <h1 className="text-center text-lg font-bold mb-6">
            How did we do?
          </h1>

          <div className="flex justify-center gap-2 mb-6">
            {Array.from({ length: 5 }, (_, i) => i + 1).map((value) => (
              <button
                key={value}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => handleRatingSelect(value)}
              >
                <StarIcon active={value <= displayRating} />
              </button>
            ))}
          </div>

          {showFeedback && (
            <>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full border p-3 rounded mb-4"
              />

              <button
                onClick={submitFeedback}
                className="w-full bg-green-300 py-3 rounded font-bold"
              >
                Submit
              </button>
            </>
          )}

          {submitted && (
            <div className="mt-4 text-center font-bold">
              Thank you!
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    setReviews(readMockReviews())
  }, [])

  return (
    <div className="p-6">
      {reviews.map((r) => (
        <div key={r.id} className="border p-3 mb-2">
          ⭐ {r.rating} — {r.feedback}
        </div>
      ))}
    </div>
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
