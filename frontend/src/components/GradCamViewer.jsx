import { Link } from 'react-router-dom'

const evidence = [
  ['Focus', 'Heat color should land on the cell, not the black background.'],
  ['Signal', 'Bright areas can point to stained inclusions that influence the CNN.'],
  ['Review', 'Blur, debris, or clipped cells still need manual checking.'],
]

export default function GradCamViewer() {
  return (
    <div className="grid gap-6 md:grid-cols-[0.82fr_1.18fr]">
      <div className="compact-sample-card glass-card rounded-2xl p-5">
        <p className="text-sm font-bold uppercase tracking-widest text-cyan-400">Dataset Sample</p>
        <div className="mt-4 rounded-xl border border-cyan-900/30 bg-black/35 p-3">
          <img src="/samples/para_1.png" alt="Parasitized cell sample" className="aspect-square w-full rounded-lg object-contain" loading="lazy" decoding="async" />
        </div>
        <Link to="/demo" className="mt-5 inline-flex rounded-full border border-cyan-400 px-5 py-2.5 text-sm font-black text-cyan-400 transition hover:bg-cyan-400/10 focus:outline-none focus:ring-2 focus:ring-cyan-400">
          Upload in Demo
        </Link>
      </div>

      <div className="live-evidence-panel rounded-2xl p-6">
        <p className="text-sm font-bold uppercase tracking-widest text-cyan-400">Live Evidence</p>
        <div className="mt-5 grid gap-5">
          <div className="evidence-frame">
            <img src="/samples/para_2.png" alt="Example cell evidence preview" loading="lazy" decoding="async" />
            <div className="heat-wash" aria-hidden="true" />
            <div className="evidence-badge">Grad-CAM focus</div>
          </div>
          <div className="grid gap-3">
            {evidence.map(([label, text]) => (
              <div key={label} className="evidence-note">
                <span>{label}</span>
                <p>{text}</p>
              </div>
            ))}
          </div>
          <p className="text-sm leading-6 text-slate-400">
            Every uploaded image returns its own original cell and heatmap overlay, so the label has visible evidence beside it.
          </p>
        </div>
      </div>
    </div>
  )
}
