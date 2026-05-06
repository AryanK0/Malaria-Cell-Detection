import { useEffect, useMemo, useState } from 'react'

const API_BASE = 'http://localhost:5000'

const samples = [
  { name: 'Sample A', infected: true },
  { name: 'Sample B', infected: false },
  { name: 'Sample C', infected: true },
]

function createSample(sample) {
  const styles = getComputedStyle(document.documentElement)
  const infectedRed = styles.getPropertyValue('--infected-red').trim()
  const healthyGreen = styles.getPropertyValue('--healthy-green').trim()
  const accentCyan = styles.getPropertyValue('--accent-cyan').trim()
  const accentTeal = styles.getPropertyValue('--accent-teal').trim()
  const bgPrimary = styles.getPropertyValue('--bg-primary').trim()
  const canvas = document.createElement('canvas')
  canvas.width = 160
  canvas.height = 160
  const ctx = canvas.getContext('2d')
  const bg = ctx.createRadialGradient(80, 80, 8, 80, 80, 80)
  bg.addColorStop(0, sample.infected ? infectedRed : accentCyan)
  bg.addColorStop(0.55, accentTeal)
  bg.addColorStop(1, bgPrimary)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 160, 160)
  ctx.beginPath()
  ctx.arc(80, 80, 48, 0, Math.PI * 2)
  ctx.fillStyle = sample.infected ? infectedRed : healthyGreen
  ctx.globalAlpha = 0.72
  ctx.fill()
  ctx.globalAlpha = 1
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(new File([blob], `${sample.name}.png`, { type: 'image/png' })), 'image/png'))
}

export default function Demo() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [backend, setBackend] = useState('checking')

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((res) => res.ok ? res.json() : Promise.reject(new Error('Backend unavailable')))
      .then((data) => setBackend(data.model_loaded ? 'ready' : 'missing-model'))
      .catch(() => setBackend('offline'))
  }, [])

  const fileInfo = useMemo(() => {
    if (!file) return ''
    return `${file.name} • ${(file.size / 1024).toFixed(1)} KB`
  }, [file])

  const setImageFile = (nextFile) => {
    setError('')
    setResult(null)
    if (!nextFile || !['image/png', 'image/jpeg'].includes(nextFile.type)) {
      setError('File must be PNG or JPG')
      return
    }
    setFile(nextFile)
    setPreview(URL.createObjectURL(nextFile))
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
      if (!res.ok) throw new Error(body.detail || body.error || 'Prediction failed')
      setResult(body)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const reset = () => {
    setFile(null)
    setPreview('')
    setResult(null)
    setError('')
  }

  return (
    <section className="px-5 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-black text-slate-100 md:text-6xl">Live Cell Analysis</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">
          Upload a blood cell microscopy image (.png or .jpg) and the CNN model will classify it in real-time.
        </p>
        <div className="mt-5 rounded-2xl border border-cyan-900/30 bg-navy-900 p-4 text-sm text-slate-400 backdrop-blur">
          Backend status: <span className="font-black text-cyan-400">{backend}</span> at {API_BASE}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-cyan-900/30 bg-navy-900 p-6 backdrop-blur">
            <label
              onDrop={(e) => { e.preventDefault(); setImageFile(e.dataTransfer.files[0]) }}
              onDragOver={(e) => e.preventDefault()}
              className="flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cyan-400/50 bg-navy-800 p-6 text-center transition hover:border-cyan-400 hover:bg-navy-800/80"
            >
              <input type="file" accept="image/png,image/jpeg" className="sr-only" onChange={(e) => setImageFile(e.target.files[0])} />
              {preview ? (
                <img src={preview} alt="Uploaded blood cell preview" className="max-h-[300px] rounded-xl object-contain" />
              ) : (
                <>
                  <div className="text-5xl text-cyan-400">+</div>
                  <p className="mt-4 text-lg font-black text-slate-100">Drag & drop or click to upload</p>
                  <p className="mt-2 text-sm text-slate-400">PNG and JPG cell microscopy images are supported.</p>
                </>
              )}
            </label>
            {fileInfo && <p className="mt-4 text-sm text-slate-400">{fileInfo}</p>}
            <button
              onClick={analyze}
              disabled={!file || isLoading}
              className="mt-6 w-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4 font-black text-slate-100 transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {isLoading ? 'Analyzing...' : 'Analyze Cell'}
            </button>
            <div className="mt-6">
              <p className="text-sm font-bold text-cyan-400">Use Sample Image</p>
              <div className="mt-3 flex gap-3">
                {samples.map((sample) => (
                  <button key={sample.name} onClick={async () => setImageFile(await createSample(sample))} className="h-16 w-16 rounded-xl border border-cyan-900/30 bg-navy-800 transition hover:scale-105 hover:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                    <span className={`mx-auto block h-9 w-9 rounded-full ${sample.infected ? 'bg-infected' : 'bg-healthy'}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-900/30 bg-navy-900 p-6 backdrop-blur">
            {error && <div className="rounded-2xl border border-infected/60 bg-navy-800 p-5 text-infected">{error}</div>}
            {isLoading && (
              <div className="space-y-4">
                <div className="h-28 animate-pulse rounded-2xl bg-navy-800" />
                <div className="h-48 animate-pulse rounded-2xl bg-navy-800" />
              </div>
            )}
            {!isLoading && !result && !error && (
              <div className="flex min-h-[430px] items-center justify-center text-center text-slate-400">
                Results will appear here after the image is analyzed by the Flask model server.
              </div>
            )}
            {result && <ResultPanel result={result} preview={preview} reset={reset} />}
          </div>
        </div>
      </div>
    </section>
  )
}

function ResultPanel({ result, reset }) {
  const infected = result.label === 'Parasitized'
  const border = infected ? 'border-infected shadow-infected/20' : 'border-healthy shadow-healthy/20'
  const confidence = (result.confidence * 100).toFixed(1)
  const parasitized = (result.probability_parasitized * 100).toFixed(1)
  const uninfected = (result.probability_uninfected * 100).toFixed(1)

  return (
    <div>
      <div className={`rounded-2xl border bg-navy-800 p-6 shadow-xl ${border}`}>
        <div className={`text-4xl font-black ${infected ? 'text-infected' : 'text-healthy'}`}>
          {infected ? '⚠ PARASITIZED' : '✓ UNINFECTED'}
        </div>
        <p className="mt-5 font-bold text-slate-100">Confidence: {confidence}%</p>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-navy-950">
          <div className={`h-full ${infected ? 'bg-infected' : 'bg-healthy'}`} style={{ width: `${confidence}%` }} />
        </div>
        <div className="mt-6 space-y-4">
          <Probability label="Parasitized" value={parasitized} color="bg-infected" />
          <Probability label="Uninfected" value={uninfected} color="bg-healthy" />
        </div>
        <p className="mt-6 text-xs leading-5 text-slate-400">This tool is for educational purposes only. Not a substitute for professional medical diagnosis.</p>
      </div>

      <div className="mt-8">
        <h3 className="text-2xl font-black text-slate-100">What the model focused on</h3>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <ImageCard label="Original" src={`data:image/png;base64,${result.original_b64}`} />
          <ImageCard label="Grad-CAM Heatmap" src={`data:image/png;base64,${result.gradcam_b64}`} />
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-400">Highlighted regions show where the CNN's attention was highest when making this prediction.</p>
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
      <div className="flex justify-between text-sm text-slate-400"><span>{label}</span><span>{value}%</span></div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-navy-950"><div className={`h-full ${color}`} style={{ width: `${value}%` }} /></div>
    </div>
  )
}

function ImageCard({ label, src }) {
  return (
    <div className="rounded-xl border border-cyan-900/30 bg-navy-950 p-3">
      <p className="mb-3 text-sm font-bold text-cyan-400">{label}</p>
      <img src={src} alt={`${label} cell analysis`} className="aspect-square w-full rounded-lg object-contain" />
    </div>
  )
}
