const milestones = [
  ['Week 1', 'Dataset Exploration & EDA', 'Counted both classes, visualized infected and healthy cells, and checked image quality.'],
  ['Week 2', 'Model Architecture Design', 'Built a 3-block CNN with BatchNorm, pooling, dropout, Dense(64), and sigmoid output.'],
  ['Week 3', 'Training, Augmentation & Class Weights', 'Added rotation, shift, zoom, flip augmentation and balanced class weighting.'],
  ['Week 4', 'Evaluation, Grad-CAM & Interpretability', 'Measured accuracy, AUC, precision, recall, F1, ROC, confusion matrix, and Grad-CAM++.'],
  ['Week 5', 'Frontend & Backend Integration', 'Connected Flask inference with a responsive React interface for live prediction.'],
]

const stack = ['TensorFlow', 'Keras', 'Python', 'Flask', 'React', 'Tailwind', 'scikit-learn', 'OpenCV']

export default function About() {
  return (
    <section className="px-5 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-black text-slate-100 md:text-6xl">About This Project</h1>

        <section className="py-24">
          <div className="rounded-2xl border border-cyan-900/30 bg-navy-900 p-6 backdrop-blur">
            <h2 className="text-4xl font-black text-slate-100">Project Info</h2>
            <dl className="mt-8 grid gap-5 md:grid-cols-2">
              <Info label="Course" value="UCS321 — AI for Engineers" />
              <Info label="University" value="[Your University Name — leave as placeholder]" />
              <Info label="Domain" value="Medical Image Analysis / Deep Learning" />
              <Info label="Tech Stack" value="Python, TensorFlow/Keras, Flask, React, Tailwind CSS" />
              <Info label="Dataset" value="NIH Malaria Cell Images (Kaggle — iarunava)" />
            </dl>
          </div>
        </section>

        <section className="py-24">
          <h2 className="text-4xl font-black text-slate-100">Timeline</h2>
          <div className="mt-10 space-y-8">
            {milestones.map(([week, title, description]) => (
              <div key={week} className="grid gap-5 md:grid-cols-[120px_32px_1fr]">
                <div className="font-black text-cyan-400">{week}</div>
                <div className="flex flex-col items-center">
                  <span className="h-4 w-4 rounded-full bg-cyan-400" />
                  <span className="mt-2 h-full w-px bg-cyan-900/50" />
                </div>
                <div className="rounded-2xl border border-cyan-900/30 bg-navy-900 p-6 backdrop-blur">
                  <h3 className="text-2xl font-black text-slate-100">{title}</h3>
                  <p className="mt-3 text-slate-400">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-24">
          <h2 className="text-4xl font-black text-slate-100">Tech Stack</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {stack.map((item) => (
              <div key={item} className="rounded-full border border-cyan-900/30 bg-navy-900 px-5 py-3 font-bold text-slate-400 transition hover:border-cyan-400 hover:text-cyan-400">
                <span className="mr-2 text-cyan-400">{item[0]}</span>{item}
              </div>
            ))}
          </div>
        </section>

        <section className="py-24">
          <h2 className="text-4xl font-black text-slate-100">References</h2>
          <ol className="mt-8 space-y-4 text-slate-400">
            <li>1. WHO World Malaria Report 2023</li>
            <li>2. Rajaraman et al. — Pre-trained convolutional neural networks for malaria cell detection</li>
            <li>3. Dataset: P.K. Das et al., NIH/NIAID</li>
            <li>4. Selvaraju et al. — Grad-CAM: Visual Explanations from Deep Networks</li>
          </ol>
        </section>

        <div className="rounded-2xl border border-cyan-900/30 bg-navy-900 p-6 text-slate-400 backdrop-blur">
          This project was developed for academic purposes under UCS321. Model predictions should not be used for actual medical diagnosis.
        </div>
      </div>
    </section>
  )
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl border border-cyan-900/30 bg-navy-800 p-5">
      <dt className="text-sm font-bold uppercase tracking-widest text-cyan-400">{label}</dt>
      <dd className="mt-2 text-slate-100">{value}</dd>
    </div>
  )
}
