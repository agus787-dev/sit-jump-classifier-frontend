import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowDown, ArrowRight, LoaderCircle, Sparkles } from 'lucide-react'
import { useCallback, useState } from 'react'
import { ApiError } from './api/client'
import { ErrorBanner } from './components/ErrorBanner'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { HowItWorks } from './components/HowItWorks'
import { ResultCard } from './components/ResultCard'
import { UploadZone } from './components/UploadZone'
import { usePredict } from './hooks/usePredict'
import { useServerStatus } from './hooks/useServerStatus'
import { useTheme } from './hooks/useTheme'

function App() {
  const { status, retry, configurationError } = useServerStatus()
  const { theme, toggleTheme } = useTheme()
  const { isLoading, elapsedSeconds, result, error, analyze, cancel, clear } = usePredict()
  const [file, setFile] = useState<File | null>(null)
  const reducedMotion = useReducedMotion()

  const selectFile = useCallback((selectedFile: File) => {
    setFile(selectedFile)
    clear()
  }, [clear])

  const removeFile = useCallback(() => {
    setFile(null)
    clear()
  }, [clear])

  const retryAnalysis = () => {
    if (file) void analyze(file)
  }

  const progress = Math.min(92, 9 + elapsedSeconds * 1.2)

  return (
    <div className="app-shell" id="top">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <div className="page-container mx-auto w-full max-w-3xl">
        <Header status={status} onRetry={retry} theme={theme} onToggleTheme={toggleTheme} />

        <main>
          {configurationError && (
            <div className="configuration-banner" role="alert">
              <strong>API configuration needed</strong>
              <span>{configurationError.message}</span>
              <code>VITE_API_URL=https://your-api.example.com</code>
            </div>
          )}

          <section className="hero-section">
            <div className="hero-kicker"><span className="kicker-dot" /> A little movement, decoded</div>
            <h1>Is it a <span className="text-gradient">sit</span><br className="mobile-break" /> or a <span className="text-gradient">jump?</span></h1>
            <p className="hero-description">Drop in a short clip. We’ll spot the movement and show you what we see.</p>
            <a className="scroll-link" href="#analyzer">
              Give it a try <ArrowDown size={14} aria-hidden="true" />
            </a>
          </section>

          <section className="analyzer-card glass-card" id="analyzer" aria-labelledby="analyzer-title">
            <div className="analyzer-heading">
              <div>
                <span className="eyebrow">MOVEMENT DETECTOR</span>
                <h2 id="analyzer-title">Let’s find out</h2>
              </div>
              <span className="model-pill"><Sparkles size={13} aria-hidden="true" /> AI powered</span>
            </div>
            <p className="analyzer-description">For the clearest read, use a 2–5 second clip with one person in frame.</p>

            <UploadZone file={file} onSelect={selectFile} onRemove={removeFile} disabled={isLoading} />

            {isLoading && (
              <div className="loading-panel" role="status" aria-live="polite">
                <div className="loading-header">
                  <span><LoaderCircle className="spin" size={17} aria-hidden="true" /> Looking for movement...</span>
                  <span>{elapsedSeconds}s</span>
                </div>
                <div className="loading-track"><motion.div
                  className="loading-fill"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: reducedMotion ? 0 : 0.35, ease: 'easeOut' }}
                /></div>
                {elapsedSeconds >= 8 && <p className="waking-message">The server is waking up, this can take up to a minute.</p>}
                <button className="cancel-button" type="button" onClick={cancel}>Cancel analysis</button>
              </div>
            )}

            {!isLoading && (
              <button
                className="analyze-button"
                type="button"
                onClick={retryAnalysis}
                disabled={!file}
              >
                <span>Analyze video</span>
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            )}
            <p className="privacy-note"><span className="privacy-dot" /> Your video is only used for this analysis.</p>
          </section>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
              >
                <ErrorBanner message={friendlyError(error)} onRetry={retryAnalysis} />
              </motion.div>
            )}
            {result && <ResultCard key="result" result={result} />}
          </AnimatePresence>

          <HowItWorks />
        </main>

        <Footer />
      </div>
    </div>
  )
}

function friendlyError(error: { kind: string; message: string }): string {
  if (error.kind === 'bad-request') return 'We couldn’t read that video. Try another clip, ideally 2–5 seconds long.'
  if (error.kind === 'too-large') return 'This video is too large. Choose a file no bigger than 20 MB.'
  if (error.kind === 'unsupported-type') return 'That file type isn’t supported. Choose an MP4, MOV, AVI, MKV, or WEBM video.'
  if (error.kind === 'timeout') return 'The request took too long. The server may be waking up; please try again.'
  if (error.kind === 'network') return 'We couldn’t connect to the server. Check your connection and try again.'
  if (error.kind === 'server') return error.message || 'Something went wrong on the server. Please try again.'
  if (error instanceof ApiError) return error.message
  return error.message
}

export default App
