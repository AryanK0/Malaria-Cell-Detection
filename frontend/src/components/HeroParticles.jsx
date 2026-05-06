export default function HeroParticles() {
  return (
    <div className="pointer-events-none relative h-[420px] w-full max-w-[520px]">
      <div className="cell-blob absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 animate-float md:h-96 md:w-96" />
      <div className="cell-blob absolute left-4 top-10 h-20 w-20 animate-float-slow opacity-75" />
      <div className="cell-blob absolute bottom-12 left-16 h-16 w-16 animate-float opacity-70 [animation-delay:1.4s]" />
      <div className="cell-blob absolute right-6 top-20 h-24 w-24 animate-float-slow opacity-80 [animation-delay:2.2s]" />
      <div className="absolute inset-x-12 bottom-4 h-px bg-cyan-400/30 blur-sm" />
    </div>
  )
}
