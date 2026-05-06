import { Link } from 'react-router-dom'
import HeroParticles from '../components/HeroParticles'
import MetricCard from '../components/MetricCard'
import PipelineStep from '../components/PipelineStep'
import GradCamViewer from '../components/GradCamViewer'

const metrics = [
  { name: 'Accuracy', value: 95.2, bar: 95.2, display: (n) => `${n.toFixed(1)}%` },
  { name: 'AUC', value: 0.987, bar: 98.7, display: (n) => n.toFixed(3) },
  { name: 'Precision', value: 96.1, bar: 96.1, display: (n) => `${n.toFixed(1)}%` },
  { name: 'Recall', value: 94.8, bar: 94.8, display: (n) => `${n.toFixed(1)}%` },
  { name: 'F1-Score', value: 95.4, bar: 95.4, display: (n) => `${n.toFixed(1)}%` },
  { name: 'Val Loss', value: 0.142, display: (n) => n.toFixed(3), caption: 'Lower validation loss means fewer confident wrong predictions.' },
]

const layers = [
  ['Input', '128×128×3', 'Raw RGB cell crop', 'h-24'],
  ['Conv16 + BN + Pool', '63×63×16', '16 filters, 3×3 kernel, ReLU activation', 'h-32'],
  ['Conv32 + BN + Pool', '30×30×32', '32 filters learn richer cell textures', 'h-40'],
  ['Conv64 + BN + Pool', '14×14×64', '64 filters capture parasite-like structures', 'h-48'],
  ['Flatten', '12544', 'Feature maps become one vector', 'h-28'],
  ['Dense 64', '64 units', 'Compact decision layer with dropout', 'h-24'],
  ['Sigmoid Output', '1 probability', 'Binary output for Parasitized vs Uninfected', 'h-20'],
]

export default function Home() {
  return (
    <>
      <section className="min-h-screen overflow-hidden px-5 py-24 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan-400">AI-Powered Diagnostics</p>
            <h1 className="mt-6 text-5xl font-black leading-[0.95] text-slate-100 md:text-7xl">
              Detecting Malaria<br />with Deep Learning
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400">
              A CNN model trained on 27,558 NIH blood cell images to classify Parasitized vs Uninfected cells with high accuracy — designed to assist medical professionals in rapid diagnosis.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link to="/demo" className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-7 py-3.5 text-center font-black text-slate-100 transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                Try Live Demo →
              </Link>
              <Link to="/results" className="rounded-full border border-cyan-400 px-7 py-3.5 text-center font-black text-cyan-400 transition hover:bg-cyan-400/10 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                View Results
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-4 text-sm font-bold text-slate-400">
              <span>27,558 Images</span><span className="text-cyan-400">|</span>
              <span>2 Classes</span><span className="text-cyan-400">|</span><span>NIH Dataset</span>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <HeroParticles />
          </div>
        </div>
      </section>

      <section className="px-5 py-24 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="text-4xl font-black text-slate-100 md:text-5xl">Why This Matters</h2>
            <p className="mt-6 text-lg leading-9 text-slate-400">
              Malaria kills over 600,000 people each year. Manual microscopy diagnosis is slow, error-prone, and requires trained specialists often unavailable in endemic regions. AI-assisted diagnosis can reduce detection time from hours to seconds and work at scale without expert bottlenecks.
            </p>
          </div>
          <div className="grid gap-5">
            {[
              ['249M', 'Malaria cases worldwide in 2023'],
              ['600K+', 'Deaths annually, mostly children under 5'],
              ['95%+', 'Accuracy of our CNN model on test data'],
            ].map(([number, label]) => (
              <div key={number} className="rounded-2xl border border-cyan-900/40 bg-navy-900/60 p-6 backdrop-blur transition hover:border-cyan-400/70">
                <div className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-5xl font-black text-transparent">{number}</div>
                <p className="mt-2 text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-4xl font-black text-slate-100 md:text-5xl">The Detection Pipeline</h2>
          <div className="relative mt-14 grid gap-6 md:grid-cols-4">
            <svg className="absolute left-[12%] right-[12%] top-16 hidden h-4 w-3/4 md:block" viewBox="0 0 900 20" aria-hidden="true">
              <path className="flow-line" d="M0 10H900" stroke="currentColor" strokeWidth="2" />
            </svg>
            <PipelineStep number="1" icon="🔬" title="Cell Image Input" description="Upload a blood smear microscopy image from the NIH malaria dataset or your own prepared sample." />
            <PipelineStep number="2" icon="⚙️" title="Preprocessing" description="Resize to 128×128 and normalize every pixel into the [0,1] range for stable CNN input." />
            <PipelineStep number="3" icon="🧠" title="CNN Analysis" description="Three Conv blocks extract edges, stain textures, and parasite-shaped spatial patterns." />
            <PipelineStep number="4" icon="✅" title="Classification" description="A sigmoid output returns the probability for Parasitized or Uninfected classification." />
          </div>
        </div>
      </section>

      <section className="px-5 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-4xl font-black text-slate-100 md:text-5xl">Model Performance</h2>
          <p className="mx-auto mt-5 max-w-2xl text-center text-slate-400">Evaluated on held-out validation set using 5 metrics</p>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {metrics.map((metric) => <MetricCard key={metric.name} {...metric} />)}
          </div>
        </div>
      </section>

      <section className="px-5 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-4xl font-black text-slate-100 md:text-5xl">Neural Network Architecture</h2>
          <div className="mt-12 overflow-x-auto rounded-2xl border border-cyan-900/30 bg-navy-900 p-6 backdrop-blur">
            <div className="flex min-w-[980px] items-end gap-4">
              {layers.map(([name, shape, tip, height], index) => (
                <div key={name} className="group flex flex-1 items-center gap-4">
                  <div className="relative flex flex-1 flex-col items-center">
                    <div title={tip} className={`${height} w-full rounded-xl bg-gradient-to-t from-blue-600 to-cyan-400 shadow-lg shadow-cyan-400/10 transition group-hover:scale-105`} />
                    <p className="mt-4 text-center text-sm font-black text-slate-100">{name}</p>
                    <p className="text-center text-xs text-slate-400">{shape}</p>
                    <div className="pointer-events-none absolute -top-12 hidden rounded-lg border border-cyan-900/30 bg-navy-950 px-3 py-2 text-xs text-slate-400 shadow-xl group-hover:block">{tip}</div>
                  </div>
                  {index < layers.length - 1 && <span className="mb-20 text-2xl text-cyan-400">→</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-4xl font-black text-slate-100 md:text-5xl">Model Interpretability</h2>
          <p className="mx-auto mt-5 max-w-2xl text-center text-slate-400">Grad-CAM++ shows which cell regions influence the model's decision</p>
          <div className="mt-12"><GradCamViewer /></div>
        </div>
      </section>

      <section className="px-5 py-24 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-2xl border border-cyan-900/30 bg-navy-900 p-10 text-center backdrop-blur">
          <h2 className="text-4xl font-black text-slate-100 md:text-5xl">Ready to test the model?</h2>
          <p className="mx-auto mt-5 max-w-2xl text-slate-400">Upload your own blood cell image and get an instant prediction with Grad-CAM interpretability.</p>
          <Link to="/demo" className="mt-8 inline-flex rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-4 font-black text-slate-100 transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400">
            Launch Demo →
          </Link>
        </div>
      </section>
    </>
  )
}
