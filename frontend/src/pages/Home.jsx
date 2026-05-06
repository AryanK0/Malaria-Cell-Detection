import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MetricCard from '../components/MetricCard'
import PipelineStep from '../components/PipelineStep'
import GradCamViewer from '../components/GradCamViewer'
import { fallbackSamples, getRandomSamples, shuffleSamples } from '../lib/samples'

const metrics = [
  { name: 'Validation Accuracy', value: 94.95, bar: 94.95, display: (n) => `${n.toFixed(2)}%` },
  { name: 'AUC', value: 0.9853, bar: 98.53, display: (n) => n.toFixed(4) },
  { name: 'Recall', value: 0.9702, bar: 97.02, display: (n) => n.toFixed(4), caption: 'Prioritized because missed infections are the risky error case.' },
]

export default function Home() {
  const [sampleCells, setSampleCells] = useState(() => shuffleSamples(fallbackSamples, 4))

  useEffect(() => {
    let active = true
    getRandomSamples(4).then((nextSamples) => {
      if (active) setSampleCells(nextSamples)
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <>
      <section className="px-5 py-24 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan-400">CNN microscopy classifier</p>
            <h1 className="mt-6 text-5xl font-black leading-tight text-slate-100 md:text-7xl">
              Malaria Cell Detection
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              A practical deep learning project that classifies thin blood smear cell images as parasitized or uninfected, then explains the prediction with model probabilities, Grad-CAM, and optional Gemini image reasoning.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/demo" className="rounded-full bg-cyan-400 px-7 py-3 font-black text-navy-950 transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                Try Demo
              </Link>
              <Link to="/results" className="rounded-full border border-cyan-900/60 px-7 py-3 font-black text-slate-300 transition hover:border-cyan-400 hover:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                View Results
              </Link>
            </div>
          </div>

          <div className="sample-showcase glass-card rounded-2xl p-4">
            <div className="grid grid-cols-2 gap-3">
              {sampleCells.map((cell) => (
                <figure key={`${cell.src}-${cell.name}`} className="sample-tile rounded-xl border border-cyan-900/30 p-2">
                  <img src={cell.src} alt={`${cell.expected} dataset sample`} className="aspect-square w-full rounded-lg object-contain" loading="lazy" decoding="async" />
                  <figcaption className="mt-3 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
                    {cell.expected}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-cyan-900/30 bg-black/20 px-5 py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan-400">Notebook verified</p>
            <h2 className="mt-4 text-4xl font-black text-slate-100 md:text-5xl">Final Model Scores</h2>
            <p className="mt-5 text-lg leading-8 text-slate-400">
              These values come from the final summary cell in `final.ipynb`, evaluated on the 5,510-image validation split.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {metrics.map((metric) => (
              <MetricCard key={metric.name} {...metric} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-24 lg:px-8" id="pipeline">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan-400">Complete pipeline</p>
            <h2 className="mt-4 text-4xl font-black text-slate-100 md:text-5xl">From Dataset Image to Interpretable Result</h2>
            <p className="mt-5 text-lg leading-8 text-slate-400">
              The app follows the same flow as the notebook: balanced NIH images, Keras preprocessing, a trained CNN, confidence scoring, Grad-CAM, and a concise post-prediction explanation.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-5">
            <PipelineStep number="1" icon="DATA" title="Dataset" description="27,558 NIH thin-smear cell images split into parasitized and uninfected classes." />
            <PipelineStep number="2" icon="PREP" title="Preprocess" description="Resize to 128 x 128, rescale pixels, and apply augmentation only to training images." />
            <PipelineStep number="3" icon="CNN" title="Model" description="Four convolution blocks with batch normalization, pooling, dropout, and sigmoid output." />
            <PipelineStep number="4" icon="PRED" title="Prediction" description="Map sigmoid output to class probabilities using the notebook class index order." />
            <PipelineStep number="5" icon="EXPL" title="Explanation" description="Return Grad-CAM heatmap plus optional Gemini interpretation for the uploaded cell." />
          </div>
        </div>
      </section>

      <section className="border-t border-cyan-900/30 bg-black/25 px-5 py-24 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan-400">Interpretability</p>
            <h2 className="mt-4 text-4xl font-black text-slate-100 md:text-5xl">Prediction Evidence, Not Just a Label</h2>
            <p className="mt-5 text-lg leading-8 text-slate-400">
              Each live prediction returns the original resized cell, class probabilities, and a Grad-CAM overlay so the result is easier to inspect and explain.
            </p>
          </div>
          <GradCamViewer />
        </div>
      </section>
    </>
  )
}
