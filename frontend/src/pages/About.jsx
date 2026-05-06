const stack = ['TensorFlow', 'Keras', 'Python', 'FastAPI', 'React', 'Tailwind CSS', 'OpenCV', 'scikit-learn']

export default function About() {
  return (
    <section className="px-5 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan-400">Project scope</p>
        <h1 className="mt-5 text-4xl font-black text-slate-100 md:text-6xl">About This AI Project</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">
          This is a focused medical image classification project: train a CNN on labeled blood smear cells, serve the trained model through a backend API, and provide a clean interface for live inference and interpretation.
        </p>

        <section className="py-20">
          <div className="grid gap-6 lg:grid-cols-3">
            <InfoCard title="Problem" text="Manual smear review is time-consuming. This project explores how a CNN can quickly screen single-cell images into parasitized or uninfected classes." />
            <InfoCard title="Model Output" text="The backend returns class label, confidence, both class probabilities, original resized image, Grad-CAM overlay, and an optional Gemini explanation." />
            <InfoCard title="Boundary" text="The app is built for academic demonstration and model inspection. It is not a replacement for clinical microscopy or laboratory confirmation." />
          </div>
        </section>

        <section className="py-20">
          <h2 className="text-3xl font-black text-slate-100 md:text-4xl">Tech Stack</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {stack.map((item) => (
              <div key={item} className="glass-card rounded-xl px-5 py-4 font-bold text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="py-20">
          <h2 className="text-3xl font-black text-slate-100 md:text-4xl">References</h2>
          <ol className="mt-8 space-y-4 text-slate-400">
            <li>1. NIH/NIAID malaria cell image dataset by P. K. Das et al.</li>
            <li>2. Rajaraman et al., pre-trained convolutional neural networks for malaria cell detection.</li>
            <li>3. Selvaraju et al., Grad-CAM visual explanations from deep networks.</li>
          </ol>
        </section>

        <div className="glass-card rounded-2xl p-6 text-sm leading-7 text-slate-400">
          Educational use only. Predictions should be interpreted as model outputs from a limited dataset, not as medical diagnosis.
        </div>
      </div>
    </section>
  )
}

function InfoCard({ title, text }) {
  return (
    <article className="glass-card rounded-2xl p-6">
      <h2 className="text-2xl font-black text-cyan-400">{title}</h2>
      <p className="mt-4 leading-7 text-slate-400">{text}</p>
    </article>
  )
}
