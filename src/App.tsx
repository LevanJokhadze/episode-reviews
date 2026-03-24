import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, Route, Routes } from 'react-router-dom'
import logo from './assets/logo.png'

const GOOGLE_REVIEW_URL =
  'https://search.google.com/local/writereview?placeid=ChIJ3xtZWjRzREARXoBIQsqPe1k'
const API_BASE_URL = 'http://127.0.0.1:5000'

type Review = {
  id: number
  rating: number
  feedback: string
  created_at: string
}

function StarIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={[
        'h-14 w-14 md:h-16 md:w-16 transition-all duration-200',
        active
          ? 'text-[#efd3ac] fill-[#efd3ac] drop-shadow-[0_0_15px_rgba(239,211,172,0.6)] scale-110'
          : 'text-white/20 fill-transparent scale-100',
      ].join(' ')}
    >
      <path
        stroke="currentColor"
        strokeWidth="1.6"
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
  const showFeedback = rating > 0 && rating <= 3

  const helperText = useMemo(() => {
    if (!rating) return 'Tap a star to begin'
    if (rating >= 4) return "We're honored you loved it."
    return "We're listening and ready to improve."
  }, [rating])

  const submitFeedback = async () => {
    if (isSubmitting || !showFeedback) return
    setSubmitError('')
    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, feedback }),
      })
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to save feedback.')
      }
      setSubmitted(true)
      setFeedback('')
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to save feedback.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRatingSelect = (value: number) => {
    setRating(value)
    if (value >= 4) {
      window.open(GOOGLE_REVIEW_URL, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#101c1d] text-white antialiased">
      <div className="pointer-events-none absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2000')] bg-cover bg-center opacity-30 mix-blend-overlay blur-2xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,211,172,0.18),transparent_52%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27160%27 height=%27160%27 viewBox=%270 0 160 160%27%3E%3Cfilter id=%27n%27 x=%270%27 y=%270%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.95%27 numOctaves=%272%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27160%27 height=%27160%27 filter=%27url(%23n)%27 opacity=%271%27/%3E%3C/svg%3E")',
        }}
      />

      <section className="relative z-10 flex min-h-screen items-center justify-center">
        <div className="mx-4 flex w-full max-w-md flex-col items-center rounded-[32px] border border-white/10 bg-white/5 p-10 shadow-2xl backdrop-blur-3xl">
          <img
            src={logo}
            alt="Episode Hotels"
            className="mb-8 mt-2 w-44 max-w-full object-contain opacity-95"
          />
          <h1 className="mb-10 text-center text-3xl font-medium tracking-tight text-white">
            How was your experience at Episode Bar?
          </h1>

          <AnimatePresence mode="wait" initial={false}>
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="w-full text-center"
              >
                <div className="mb-3 text-5xl">✓</div>
                <h2 className="mb-2 text-2xl font-semibold text-[#efd3ac]">
                  Feedback Sent
                </h2>
                <p className="mb-6 text-sm text-white/80">
                  Thank you. Your message helps us improve your next visit.
                </p>
                <Link
                  to="/reviews"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/16"
                >
                  View All Reviews
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <div className="mb-5 flex items-center justify-center gap-2 md:gap-3">
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
                      className="cursor-pointer rounded-full p-1 outline-none transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#efd3ac]/80"
                    >
                      <StarIcon active={value <= displayRating} />
                    </button>
                  ))}
                </div>

                <p className="mb-6 text-center text-sm tracking-wide text-white/70">
                  {helperText}
                </p>

                <div className="w-full">
                  <AnimatePresence mode="wait" initial={false}>
                    {showFeedback && (
                      <motion.div
                        key="feedback"
                        initial={{ opacity: 0, y: 16, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="mb-3 text-sm text-white/80">
                          We apologize we didn&apos;t meet your expectations. How can
                          we improve?
                        </p>
                        <textarea
                          value={feedback}
                          onChange={(event) => setFeedback(event.target.value)}
                          rows={4}
                          placeholder="Share your feedback..."
                          className="mb-4 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/40 outline-none transition-colors duration-200 focus:border-white/35"
                        />
                        <button
                          type="button"
                          onClick={submitFeedback}
                          disabled={isSubmitting}
                          className="w-full rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/16 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                        {submitError && (
                          <p className="mt-3 text-sm text-red-300">{submitError}</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  )
}

function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_BASE_URL}/api/reviews`)
        if (!response.ok) {
          throw new Error('Failed to fetch reviews.')
        }
        const payload = (await response.json()) as Review[]
        setReviews(payload)
      } catch (fetchError) {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : 'Failed to fetch reviews.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadReviews()
  }, [])

  return (
    <main className="min-h-screen bg-[#101c1d] p-5 text-white md:p-8">
      <div className="mx-auto w-full max-w-3xl rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-3xl md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#efd3ac]">All Reviews</h1>
          <Link
            to="/"
            className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs transition-all hover:-translate-y-0.5"
          >
            Back
          </Link>
        </div>

        {loading && <p className="text-white/70">Loading reviews...</p>}
        {error && <p className="text-red-300">{error}</p>}
        {!loading && !error && reviews.length === 0 && (
          <p className="text-white/70">No reviews yet.</p>
        )}

        <div className="space-y-3">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-xl border border-white/10 bg-black/20 p-4"
            >
              <div className="mb-2 flex items-center justify-between text-xs text-white/60">
                <span>#{review.id}</span>
                <span>{new Date(review.created_at).toLocaleString()}</span>
              </div>
              <p className="mb-1 text-sm text-[#efd3ac]">
                {'★'.repeat(review.rating)}
                <span className="text-white/25">{'★'.repeat(5 - review.rating)}</span>
              </p>
              <p className="text-sm text-white/85">
                {review.feedback || 'Positive review routed to Google.'}
              </p>
            </article>
          ))}
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
