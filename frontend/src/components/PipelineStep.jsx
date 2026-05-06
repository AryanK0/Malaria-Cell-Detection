export default function PipelineStep({ number, icon, title, description }) {
  return (
    <article className="relative rounded-2xl border border-cyan-900/30 bg-navy-900/70 p-5 backdrop-blur transition hover:-translate-y-1 hover:border-cyan-400/70">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400 text-base font-black text-navy-950 shadow-lg shadow-cyan-400/20">
          {number}
        </div>
        <span className="rounded-full border border-cyan-900/50 px-3 py-1 text-xs font-black tracking-widest text-cyan-400">
          {icon}
        </span>
      </div>
      <h3 className="mt-5 text-xl font-black text-slate-100">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
    </article>
  )
}
