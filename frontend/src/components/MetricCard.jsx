import { useEffect, useRef, useState } from 'react'

export default function MetricCard({ name, value, display, bar, caption }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShown(true)
      },
      { threshold: 0.35 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!shown) return
    const target = Number(value)
    const steps = 34
    let frame = 0
    const timer = setInterval(() => {
      frame += 1
      setCount(target * Math.min(frame / steps, 1))
      if (frame >= steps) clearInterval(timer)
    }, 24)
    return () => clearInterval(timer)
  }, [shown, value])

  const rendered = display ? display(count) : count.toFixed(1)

  return (
    <article
      ref={ref}
      className="rounded-2xl border border-cyan-900/30 bg-navy-900/70 p-6 backdrop-blur transition hover:-translate-y-1 hover:border-cyan-400/70 hover:shadow-xl hover:shadow-cyan-400/10"
    >
      <p className="text-sm font-bold uppercase tracking-widest text-slate-400">{name}</p>
      <div className="mt-4 text-4xl font-black text-cyan-400 animate-count-up">{rendered}</div>
      {typeof bar === 'number' && (
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-navy-800">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-700" style={{ width: shown ? `${bar}%` : '0%' }} />
        </div>
      )}
      {caption && <p className="mt-4 text-sm leading-6 text-slate-400">{caption}</p>}
    </article>
  )
}
