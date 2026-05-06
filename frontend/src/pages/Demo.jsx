import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname || '127.0.0.1'}:5000`

const samples = [
  { name: 'Parasitized 1', src: '/samples/para_1.png', expected: 'Parasitized' },
  { name: 'Parasitized 2', src: '/samples/para_2.png', expected: 'Parasitized' },
  { name: 'Uninfected 1', src: '/samples/uninf_1.png', expected: 'Uninfected' },
  { name: 'Uninfected 2', src: '/samples/uninf_2.png', expected: 'Uninfected' },
]

export default function Demo() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [backend, setBackend] = useState({ status: 'checking', modelLoaded: false, geminiEnabled: false })

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((res) => res.ok ? res.json() : Promise.reject(new Error('Backend unavailable')))
      .then((data) => {
        setBackend({
          status: data.model_loaded ? 'ready' : 'missing-model',
          modelLoaded: Boolean(data.model_loaded),
          geminiEnabled: Boolean(data.gemini_enabled),
        })
      })
      .catch(() => setBackend({ status: 'offline', modelLoaded: false, geminiEnabled: false }))
  }, [])

  const fileInfo = useMemo(() => {
    if (!file) return ''
    return `${file.name} | ${(file.size / 1024).toFixed(1)} KB`
  }, [file])

  const statusText = useMemo(() => {
    if (backend.status === 'checking') return 'checking backend'
    if (backend.status === 'offline') return 'backend offline'
    if (backend.status === 'missing-model') return 'backend online, model missing'
    return backend.geminiEnabled ? 'model ready, Gemini enabled' : 'model ready, Gemini not configured'
  }, [backend])

  const setImageFile = (nextFile) => {
    setError('')
    setResult(null)
    setAiLoading(false)
    if (!nextFile) return
    if (!['image/png', 'image/jpeg'].includes(nextFile.type)) {
      setError('File must be PNG or JPG.')
      return
    }
    if (preview) URL.revokeObjectURL(preview)
    setFile(nextFile)
    setPreview(URL.createObjectURL(nextFile))
  }

  const loadSample = async (sample) => {
    setError('')
    try {
      const res = await fetch(sample.src)
      if (!res.ok) throw new Error('Sample image could not be loaded.')
      const blob = await res.blob()
      setImageFile(new File([blob], `${sample.name}.png`, { type: blob.type || 'image/png' }))
    } catch (err) {
      setError(err.message)
    }
  }

  const analyze = async () => {
    if (!file) return
    setIsLoading(true)
    setError('')
    setResult(null)
    const data = new FormData()
    data.append('image', file)

    try {
      const res = await fetch(`${API_BASE}/predict`, { method: 'POST', body: data })
      const body = await res.json()
      if (!res.ok) throw new Error(body.detail || body.error || 'Prediction failed.')
      setResult(body)
      if (backend.geminiEnabled || body.gemini_available) {
        loadGeminiInsight(file, body)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const loadGeminiInsight = async (imageFile, prediction) => {
    setAiLoading(true)
    const data = new FormData()
    data.append('image', imageFile)
    data.append('label', prediction.label)
    data.append('confidence', prediction.confidence)
    data.append('probability_parasitized', prediction.probability_parasitized)
    data.append('probability_uninfected', prediction.probability_uninfected)

    try {
      const res = await fetch(`${API_BASE}/interpret`, { method: 'POST', body: data })
      const body = await res.json()
      if (!res.ok) throw new Error(body.detail || body.error || 'Gemini interpretation failed.')
      setResult((current) => current ? { ...current, ai_insight: body.ai_insight } : current)
    } catch (err) {
      setResult((current) => current ? {
        ...current,
        ai_insight: {
          ...current.ai_insight,
          message: err.message,
        },
      } : current)
    } finally {
      setAiLoading(false)
    }
  }

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview('')
    setResult(null)
    setError('')
    setAiLoading(false)
  }

  return (
    <section className="px-5 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan-400">Live inference</p>
        <h1 className="mt-5 text-4xl font-black text-slate-100 md:text-6xl">Analyze a Cell Image</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">
          Upload a single-cell microscopy image or use a real sample from the local dataset. The backend returns the CNN prediction, probability split, Grad-CAM evidence, and optional Gemini interpretation.
        </p>

        <div className="glass-card mt-6 flex flex-wrap items-center gap-3 rounded-2xl px-5 py-4 text-sm text-slate-400">
          <span className={`status-dot ${backend.modelLoaded ? 'status-dot-ready' : backend.status === 'checking' ? 'status-dot-checking' : 'status-dot-error'}`} />
          <span>Backend status:</span>
          <span className="font-black text-cyan-400">{statusText}</span>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="glass-card rounded-2xl p-6">
            <label
              onDrop={(event) => { event.preventDefault(); setImageFile(event.dataTransfer.files[0]) }}
              onDragOver={(event) => event.preventDefault()}
              className="upload-zone flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition"
            >
              <input type="file" accept="image/png,image/jpeg" className="sr-only" onChange={(event) => setImageFile(event.target.files[0])} />
              {preview ? (
                <img src={preview} alt="Uploaded blood cell preview" className="max-h-[300px] rounded-xl object-contain" decoding="async" />
              ) : (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400 text-3xl font-black text-cyan-400">+</div>
                  <p className="mt-4 text-lg font-black text-slate-100">Drag and drop or click to upload</p>
                  <p className="mt-2 text-sm text-slate-400">PNG and JPG cell microscopy images are supported.</p>
                </>
              )}
            </label>

            {fileInfo && <p className="mt-4 text-sm text-slate-400">{fileInfo}</p>}

            <button
              onClick={analyze}
              disabled={!file || isLoading || !backend.modelLoaded}
              className="mt-6 w-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4 font-black text-slate-100 transition hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {isLoading ? 'Analyzing...' : 'Analyze Cell'}
            </button>

            <div className="mt-8">
              <p className="text-sm font-bold uppercase tracking-widest text-cyan-400">Real Dataset Samples</p>
              <div className="mt-4 grid grid-cols-4 gap-3">
                {samples.map((sample) => (
                  <button
                    key={sample.name}
                    type="button"
                    onClick={() => loadSample(sample)}
                    className="sample-thumb rounded-xl border border-cyan-900/30 p-2 transition hover:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    title={sample.expected}
                  >
                    <img src={sample.src} alt={`${sample.expected} sample`} className="aspect-square w-full rounded-lg object-contain" loading="lazy" decoding="async" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            {error && <div className="rounded-2xl border border-infected/60 bg-navy-800 p-5 text-infected">{error}</div>}
            {isLoading && (
              <div className="space-y-4">
                <div className="h-28 animate-pulse rounded-2xl bg-white/5" />
                <div className="h-48 animate-pulse rounded-2xl bg-white/5" />
                <div className="h-28 animate-pulse rounded-2xl bg-white/5" />
              </div>
            )}
            {!isLoading && !result && !error && (
              <div className="flex min-h-[500px] items-center justify-center text-center text-slate-400">
                Prediction details, evidence images, and AI interpretation will appear here.
              </div>
            )}
            {result && <ResultPanel result={result} reset={reset} aiLoading={aiLoading} />}
          </div>
        </div>
      </div>
    </section>
  )
}

function ResultPanel({ result, reset, aiLoading }) {
  const infected = result.label === 'Parasitized'
  const confidence = (result.confidence * 100).toFixed(1)
  const parasitized = (result.probability_parasitized * 100).toFixed(1)
  const uninfected = (result.probability_uninfected * 100).toFixed(1)
  const insight = result.ai_insight
  const insightLines = insight?.text?.split('\n').map((line) => line.trim()).filter(Boolean) || []
  const latency = typeof result.latency_ms === 'number' ? `${(result.latency_ms / 1000).toFixed(2)}s` : 'fast pass'

  return (
    <div>
      <div className={`result-summary rounded-2xl border p-6 ${infected ? 'result-infected' : 'result-healthy'}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">CNN prediction</p>
            <div className={`mt-2 text-3xl font-black ${infected ? 'text-infected' : 'text-healthy'}`}>
              {infected ? 'Parasitized' : 'Uninfected'}
            </div>
          </div>
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-black uppercase tracking-widest text-slate-300">
            {latency}
          </span>
        </div>
        <p className="mt-5 font-bold text-slate-100">Model confidence: {confidence}%</p>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-navy-950">
          <div className={`h-full ${infected ? 'bg-infected' : 'bg-healthy'}`} style={{ width: `${confidence}%` }} />
        </div>
        <div className="mt-6 space-y-4">
          <Probability label="Possibility of parasitized cell" value={parasitized} color="bg-infected" />
          <Probability label="Possibility of uninfected cell" value={uninfected} color="bg-healthy" />
        </div>
      </div>

      {insight && (
        <div className="ai-advice mt-6 rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-2xl font-black text-slate-100">AI Advice</h3>
              <p className="mt-1 text-xs uppercase tracking-widest text-slate-400">
                {aiLoading ? 'Gemini is checking the image' : 'Short reading of the evidence'}
              </p>
            </div>
            <span className="rounded-full border border-cyan-900/50 px-3 py-1 text-xs font-black uppercase tracking-widest text-cyan-400">
              {aiLoading ? 'Reviewing' : insight.source === 'gemini' ? 'Gemini' : 'Local'}
            </span>
          </div>
          <div className="mt-4 grid gap-3">
            {insightLines.map((line) => (
              <p key={line} className="advice-line text-sm leading-6 text-slate-300">{line}</p>
            ))}
          </div>
          {aiLoading && (
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-black/40">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-cyan-400" />
            </div>
          )}
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-2xl font-black text-slate-100">Model Evidence</h3>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <ImageCard label="Original" src={`data:image/png;base64,${result.original_b64}`} />
          <ImageCard label="Grad-CAM Heatmap" src={`data:image/png;base64,${result.gradcam_b64}`} />
        </div>
        <div className="mt-4 rounded-2xl border border-cyan-900/30 bg-black/20 p-4 text-sm leading-6 text-slate-400">
          Heatmap color shows the strongest CNN response areas. Treat it as model evidence, not diagnosis.
        </div>
        <button onClick={reset} className="mt-6 rounded-full border border-cyan-400 px-6 py-3 font-black text-cyan-400 transition hover:bg-cyan-400/10 focus:outline-none focus:ring-2 focus:ring-cyan-400">
          Analyze Another
        </button>
      </div>
    </div>
  )
}

function Probability({ label, value, color }) {
  return (
    <div>
      <div className="flex justify-between gap-4 text-sm text-slate-400"><span>{label}</span><span>{value}%</span></div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-navy-950"><div className={`h-full ${color}`} style={{ width: `${value}%` }} /></div>
    </div>
  )
}

function ImageCard({ label, src }) {
  return (
    <div className="rounded-xl border border-cyan-900/30 bg-black/30 p-3">
      <p className="mb-3 text-sm font-bold text-cyan-400">{label}</p>
      <img src={src} alt={`${label} cell analysis`} className="aspect-square w-full rounded-lg object-contain" decoding="async" />
    </div>
  )
}
