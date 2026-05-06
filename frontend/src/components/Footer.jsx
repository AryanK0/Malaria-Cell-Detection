export default function Footer() {
  return (
    <footer className="border-t border-cyan-900/40 bg-navy-950 px-5 py-10 lg:px-8">
      <div className="mx-auto max-w-7xl text-sm text-slate-400">
        <div>
          <p className="font-black text-slate-100">Malaria Cell Detection</p>
          <p className="mt-2 max-w-2xl">
            Academic CNN inference app for malaria cell image classification. Not for clinical diagnosis.
          </p>
        </div>
      </div>
    </footer>
  )
}
