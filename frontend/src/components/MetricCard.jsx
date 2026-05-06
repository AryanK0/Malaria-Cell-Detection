export default function MetricCard({ name, value, display, bar, caption }) {
  const rendered = display ? display(Number(value)) : Number(value).toFixed(1)

  return (
    <article
      className="glass-card rounded-2xl p-6 transition hover:-translate-y-1 hover:border-cyan-400/70"
    >
      <p className="text-sm font-bold uppercase tracking-widest text-slate-400">{name}</p>
      <div className="mt-4 text-4xl font-black text-cyan-400 animate-count-up">{rendered}</div>
      {typeof bar === 'number' && (
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-navy-800">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" style={{ width: `${bar}%` }} />
        </div>
      )}
      {caption && <p className="mt-4 text-sm leading-6 text-slate-400">{caption}</p>}
    </article>
  )
}
