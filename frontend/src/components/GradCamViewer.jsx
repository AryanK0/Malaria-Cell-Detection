import { Link } from 'react-router-dom'

export default function GradCamViewer() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl border border-cyan-900/30 bg-navy-900 p-6 backdrop-blur">
        <p className="text-sm font-bold uppercase tracking-widest text-cyan-400">Original Cell Image</p>
        <div className="mt-5 flex aspect-square items-center justify-center rounded-xl border border-cyan-400/50 bg-navy-800">
          <div className="cell-blob h-40 w-40" />
        </div>
        <Link to="/demo" className="mt-5 inline-flex rounded-full border border-cyan-400 px-5 py-2.5 text-sm font-black text-cyan-400 transition hover:bg-cyan-400/10 focus:outline-none focus:ring-2 focus:ring-cyan-400">
          Upload in Demo →
        </Link>
      </div>
      <div className="rounded-2xl border border-cyan-900/30 bg-navy-900 p-6 backdrop-blur">
        <p className="text-sm font-bold uppercase tracking-widest text-cyan-400">Grad-CAM Heatmap</p>
        <div className="mt-5 flex aspect-square items-center justify-center rounded-xl border border-cyan-400/50 bg-navy-800">
          <div className="mock-heatmap h-44 w-44 rounded-full shadow-2xl shadow-cyan-400/20" />
        </div>
        <p className="mt-5 text-sm text-slate-400">Red = high attention | Blue = low attention</p>
      </div>
    </div>
  )
}
