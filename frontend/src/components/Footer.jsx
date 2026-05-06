import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-cyan-900/30 bg-navy-950 py-14">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 md:grid-cols-3 lg:px-8">
        <div>
          <h3 className="text-lg font-black text-cyan-400">Navigation</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">
            <Link className="transition hover:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400" to="/">Home</Link>
            <Link className="transition hover:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400" to="/demo">Live Demo</Link>
            <Link className="transition hover:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400" to="/results">Training Results</Link>
            <Link className="transition hover:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400" to="/about">About Project</Link>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-100">MalariaAI</h3>
          <p className="mt-4 text-sm leading-7 text-slate-400">
            A medical image analysis application that uses a 3-block convolutional neural network to classify red blood cells as Parasitized or Uninfected, with Grad-CAM visual explanations for model attention.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-100">Course Context</h3>
          <p className="mt-4 text-sm leading-7 text-slate-400">
            Developed for UCS321: AI for Engineers. The project combines TensorFlow/Keras training, Flask inference, React interface design, and interpretability for responsible educational AI.
          </p>
        </div>
      </div>
    </footer>
  )
}
