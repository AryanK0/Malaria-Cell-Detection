import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const links = [
  { label: 'Home', path: '/' },
  { label: 'Demo', path: '/demo' },
  { label: 'Results', path: '/results' },
  { label: 'About', path: '/about' },
]

function DnaIcon() {
  return (
    <svg className="h-9 w-9 text-cyan-400" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M14 7c13 5 27 14 20 34M34 7C21 12 7 21 14 41" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M17 13h15M13 23h22M17 34h15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
      <circle cx="14" cy="7" r="3" fill="currentColor" />
      <circle cx="34" cy="41" r="3" fill="currentColor" />
    </svg>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(() => {
        const next = window.scrollY > 50
        setScrolled((current) => (current === next ? current : next))
        ticking = false
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navClass = scrolled
    ? 'bg-navy-950/80 border-b border-cyan-900/30 backdrop-blur-md'
    : 'bg-transparent border-b border-transparent'

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${navClass}`}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link to="/" className="flex items-center gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400">
          <DnaIcon />
          <span className="text-2xl font-black tracking-tight text-slate-100">Malaria Cell Detection</span>
        </Link>

        <div className="hidden items-center gap-9 md:flex">
          {links.map((link) => {
            const active = pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`border-b-2 pb-1 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                  active ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-cyan-400'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        <Link
          to="/demo"
          className="hidden rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-black text-navy-950 shadow-lg shadow-cyan-400/20 transition hover:scale-105 hover:bg-blue-600 hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 md:inline-flex"
        >
          Try Demo
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="relative h-11 w-11 rounded-xl border border-cyan-900/30 transition hover:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 md:hidden"
          aria-label="Toggle navigation"
        >
          <span className={`absolute left-3 top-4 h-0.5 w-5 bg-cyan-400 transition ${menuOpen ? 'translate-y-1.5 rotate-45' : ''}`} />
          <span className={`absolute left-3 top-[22px] h-0.5 w-5 bg-cyan-400 transition ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`absolute left-3 top-7 h-0.5 w-5 bg-cyan-400 transition ${menuOpen ? '-translate-y-1.5 -rotate-45' : ''}`} />
        </button>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 top-[73px] z-40 bg-navy-950/95 backdrop-blur-xl md:hidden">
          <div className="flex h-full flex-col items-center justify-center gap-8 px-8">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-2 text-3xl font-black text-slate-100 transition hover:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
