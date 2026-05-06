export default function PipelineStep({ number, icon, title, description }) {
  return (
    <article className="relative rounded-2xl border border-cyan-900/30 bg-navy-900/70 p-6 text-center backdrop-blur transition hover:-translate-y-1 hover:border-cyan-400/70">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-cyan-400 text-lg font-black text-navy-950 shadow-lg shadow-cyan-400/20">
        {number}
      </div>
      <div className="mt-5 text-4xl" aria-hidden="true">{icon}</div>
      <h3 className="mt-4 text-xl font-black text-slate-100">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
    </article>
  )
}
