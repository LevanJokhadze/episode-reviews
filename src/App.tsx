import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Route, Routes, useNavigate } from 'react-router-dom'
import backgroundImageUrl from './assets/service-living.jpg'

const GOOGLE_REVIEW_URL =
  'https://search.google.com/local/writereview?placeid=ChIJ3xtZWjRzREARXoBIQsqPe1k'

const BACKEND_BASE_URL = 'https://episode-review-backend.vercel.app'
const REVIEWS_API_URL = `${BACKEND_BASE_URL}/api/reviews`

type Review = {
  id: number
  guest_name: string
  rating: number
  feedback: string
  created_at: string
}

async function fetchReviews(): Promise<Review[]> {
  const response = await fetch(REVIEWS_API_URL, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error('Failed to load reviews.')
  }

  const payload = (await response.json()) as unknown
  if (!Array.isArray(payload)) {
    throw new Error('Invalid reviews response from backend.')
  }

  return payload as Review[]
}

async function createReview(input: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
  const response = await fetch(REVIEWS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(errorPayload?.error ?? 'Failed to submit review.')
  }

  return (await response.json()) as Review
}

function ImageBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#1a2e28]"
      aria-hidden
    >
      <img
        src={backgroundImageUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-92"
      />
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
        'h-10 w-10 transition-transform duration-200 sm:h-[3.25rem] sm:w-[3.25rem]',
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

function EpisodeLogo() {
  return (
    <div className="mb-4 flex justify-center">
      <svg
        aria-hidden="true"
        width="236"
        height="48"
        viewBox="0 0 236 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-auto text-[#22363b] sm:h-9"
      >
        <path
          fill="currentColor"
          d="M97.9691 29.4204C93.6245 29.4204 90.478 27.6751 88.082 23.9276L80.1828 30.4083C83.8757 34.5576 89.4183 37.6531 97.2582 37.6531C107.896 37.6531 112.536 33.0099 112.536 27.7673C112.536 22.5708 109.693 19.0143 96.7118 17.9671C90.2279 17.4204 88.8785 16.0768 88.8785 13.4819C88.8785 10.6894 90.8204 8.2393 95.3163 8.2393C100.207 8.2393 103.505 10.1888 105.75 14.0351L113.241 7.0933C108.995 2.64764 103.308 0 95.3689 0C85.8307 0 81.0386 4.64984 81.0386 10.2415C81.0386 15.4907 84.0337 18.5071 96.7118 19.5543C103.255 20.101 104.506 21.2272 104.506 24.0263C104.506 27.1745 102.36 29.4204 97.9691 29.4204Z"
        />
        <path fill="currentColor" d="M234.446 46.4457V0.625686H236V48H0V46.4457H234.446Z" />
        <path
          fill="currentColor"
          d="M0.0263247 37.1131V0.652031H27.8379V8.79254H9.01819V18.1581H23.9936V19.7124H9.01819V28.6696H27.8379V37.1131H0.0263247Z"
        />
        <path
          fill="currentColor"
          d="M197.314 0.652031V37.1131H225.119V28.6696H206.299V19.7124H221.275V18.1581H206.299V8.79254H225.119V0.652031H197.314Z"
        />
        <path
          fill="currentColor"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M41.5824 37.1131V25.3304H44.5775C54.662 25.3304 62.6007 20.9835 62.6007 12.3425C62.6007 5.24918 57.2622 0.652031 47.9741 0.652031H32.4984V37.1131H41.5824ZM41.5824 23.7695V8.79254H45.7228C50.9692 8.79254 54.3131 11.4402 54.3131 16.584C54.3131 21.8266 51.3707 23.7695 44.38 23.7695H41.5824Z"
        />
        <path fill="currentColor" d="M76.3518 0.652031H67.2678V37.1131H76.3518V0.652031Z" />
        <path
          fill="currentColor"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M116.4 18.8825C116.4 8.74643 123.437 0.151482 135.22 0.151482C147.648 0.151482 154.092 8.64105 154.092 18.8825C154.092 29.0187 147.2 37.6136 135.174 37.6136C121.989 37.6136 116.4 29.1701 116.4 18.8825ZM145.055 18.8825C145.055 13.0867 141.809 8.39078 135.22 8.39078C128.828 8.39078 125.484 13.1855 125.484 18.8825C125.484 24.5796 128.177 29.2689 135.167 29.2689C141.711 29.2689 145.055 24.6257 145.055 18.8825Z"
        />
        <path
          fill="currentColor"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M172.583 0.652031H158.76V37.1131H172.886C179.027 37.1131 183.668 35.4138 187.012 32.4698C190.705 29.2228 192.653 24.3754 192.653 18.6323C192.653 6.89572 185.413 0.652031 172.583 0.652031ZM167.738 28.6696V8.79254H172.478C180.12 8.79254 183.563 11.6378 183.563 18.4808C183.563 24.876 180.219 28.6696 172.781 28.6696H167.738Z"
        />
      </svg>
    </div>
  )
}

function ReviewFlowPage() {
  const [guestName, setGuestName] = useState('')
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
      await createReview({ guest_name: guestName.trim(), rating, feedback: feedback.trim() })
      setSubmitted(true)
      setGuestName('')
      setFeedback('')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong.')
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
      <ImageBackdrop />
      <section className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <div className="relative w-full max-w-md rounded-[2rem] bg-white px-6 pb-8 pt-5 shadow-[0_8px_40px_rgba(0,0,0,0.12)] sm:px-8 sm:pb-10 sm:pt-6">
          <EpisodeLogo />
          <p className="mb-1 text-center text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Give feedback
          </p>
          <h1 className="mb-6 text-center text-lg font-bold tracking-tight text-neutral-900 sm:text-xl">
            How did we do?
          </h1>

          <div className="mb-6">
            <div className="flex flex-nowrap items-center justify-center gap-1 sm:gap-2.5">
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
                  className="shrink-0 rounded-lg p-0.5 outline-none transition-transform hover:scale-[1.04] active:scale-95 focus-visible:ring-2 focus-visible:ring-[#2D5A27]/35 focus-visible:ring-offset-1 sm:p-1"
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
                <p className="mb-3 text-[15px] text-neutral-800">Care to share more about it?</p>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  maxLength={80}
                  placeholder="Your name"
                  className="mb-3 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-[15px] text-neutral-900 outline-none ring-0 transition-shadow placeholder:text-neutral-400 focus:border-neutral-300 focus:shadow-[0_0_0_3px_rgba(45,90,39,0.12)]"
                />
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
                  {isSubmitting ? 'Publishing...' : 'PUBLISH FEEDBACK'}
                </button>
                <p className="mt-4 text-center text-xs leading-relaxed text-neutral-600">
                  Your message is sent to our team in confidence. We use it to improve the
                  experience for every guest.
                </p>
                {submitError && <p className="mt-3 text-center text-sm text-red-600">{submitError}</p>}
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
                    <h2 id="success-title" className="mb-2 text-xl font-bold tracking-tight text-black">
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
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoadError('')
      setIsLoading(true)
      try {
        const list = await fetchReviews()
        if (!cancelled) {
          setReviews(list)
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : 'Failed to load reviews.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="relative min-h-screen font-sans text-neutral-900 antialiased">
      <ImageBackdrop />
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

          {isLoading && <p className="text-neutral-600">Loading reviews...</p>}
          {!isLoading && loadError && <p className="text-red-600">{loadError}</p>}
          {!isLoading && !loadError && reviews.length === 0 && (
            <p className="text-neutral-600">No reviews yet.</p>
          )}

          <div className="space-y-3">
            {reviews.map((review) => (
              <article key={review.id} className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4">
                <div className="mb-2 flex items-center justify-between text-xs text-neutral-500">
                  <span>{review.guest_name || `Review #${review.id}`}</span>
                  <span>{new Date(review.created_at).toLocaleString()}</span>
                </div>
                <p className="mb-1 text-sm text-[#B8860B]">
                  {'\u2605'.repeat(review.rating)}
                  <span className="text-neutral-300">{'\u2605'.repeat(5 - review.rating)}</span>
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
