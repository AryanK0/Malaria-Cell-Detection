import MetricCard from '../components/MetricCard'

const datasetStats = [
  ['27,558', 'Total Images', 'Balanced NIH/Kaggle cell image dataset.'],
  ['13,779', 'Parasitized', 'Images labeled as malaria-infected cells.'],
  ['13,779', 'Uninfected', 'Images labeled as healthy cells.'],
]

const finalMetrics = [
  { name: 'Accuracy', value: 94.95, bar: 94.95, display: (n) => `${n.toFixed(2)}%` },
  { name: 'AUC', value: 0.9853, bar: 98.53, display: (n) => n.toFixed(4) },
  { name: 'Precision', value: 0.9317, bar: 93.17, display: (n) => n.toFixed(4) },
  { name: 'Recall', value: 0.9702, bar: 97.02, display: (n) => n.toFixed(4) },
  { name: 'F1-Score', value: 0.9506, bar: 95.06, display: (n) => n.toFixed(4) },
  { name: 'Val Loss', value: 0.1529, bar: 15.29, display: (n) => n.toFixed(4) },
]

const classRows = [
  ['Parasitized', '0.97', '0.93', '0.95', '2,755'],
  ['Uninfected', '0.93', '0.97', '0.95', '2,755'],
  ['Macro Avg', '0.95', '0.95', '0.95', '5,510'],
  ['Weighted Avg', '0.95', '0.95', '0.95', '5,510'],
]

const configRows = [
  ['Input size', '128 x 128 RGB'],
  ['Architecture', 'Conv2D blocks: 16, 32, 64, 128 filters'],
  ['Regularization', 'Batch normalization, max pooling, dropout'],
  ['Optimizer', 'Adam, learning rate 5e-4'],
  ['Loss', 'Binary crossentropy'],
  ['Training', '16 epochs with early stopping patience 5'],
  ['Augmentation', 'Rotation, flip, zoom, shift, shear on training data only'],
  ['Class weights', '{0: 1.0, 1: 1.0}'],
]

export default function Results() {
  return (
    <section className="px-5 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan-400">Final notebook output</p>
        <h1 className="mt-5 text-4xl font-black text-slate-100 md:text-6xl">Training Results</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">
          The values below are taken from the final executed cells in `final.ipynb`, evaluated on 5,510 validation images.
        </p>

        <Section title="Dataset">
          <div className="grid gap-5 md:grid-cols-3">
            {datasetStats.map(([value, label, caption]) => (
              <MetricCard key={label} name={label} value={Number(value.replace(',', ''))} display={() => value} caption={caption} />
            ))}
          </div>
        </Section>

        <Section title="Model Configuration">
          <div className="glass-card overflow-hidden rounded-2xl">
            <table className="w-full min-w-[680px] text-left">
              <tbody>
                {configRows.map(([label, value], index) => (
                  <tr key={label} className={index % 2 ? 'bg-navy-800/50' : 'bg-navy-900'}>
                    <th className="w-56 p-4 text-cyan-400">{label}</th>
                    <td className="p-4 text-slate-400">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Validation Metrics">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {finalMetrics.map((metric) => (
              <MetricCard key={metric.name} {...metric} />
            ))}
          </div>
        </Section>

        <Section title="Classification Report">
          <div className="glass-card overflow-hidden rounded-2xl">
            <table className="w-full min-w-[680px] text-left">
              <thead className="bg-navy-800 text-cyan-400">
                <tr>
                  <th className="p-4">Class</th>
                  <th className="p-4">Precision</th>
                  <th className="p-4">Recall</th>
                  <th className="p-4">F1-Score</th>
                  <th className="p-4">Support</th>
                </tr>
              </thead>
              <tbody>
                {classRows.map((row, index) => (
                  <tr key={row[0]} className={index % 2 ? 'bg-navy-800/50' : 'bg-navy-900'}>
                    {row.map((cell) => <td key={cell} className="p-4 text-slate-400">{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Confusion Matrix">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="glass-card rounded-2xl p-6">
              <div className="grid grid-cols-[120px_repeat(2,minmax(0,1fr))] gap-3 text-center text-sm">
                <div />
                <Axis label="Predicted Parasitized" />
                <Axis label="Predicted Uninfected" />
                <Axis label="Actual Parasitized" />
                <MatrixCell value="2,559" label="Correct parasitized" tone="good" />
                <MatrixCell value="196" label="Missed as uninfected" tone="risk" />
                <Axis label="Actual Uninfected" />
                <MatrixCell value="82" label="Flagged as parasitized" tone="warn" />
                <MatrixCell value="2,673" label="Correct uninfected" tone="good" />
              </div>
            </div>
            <div className="glass-card rounded-2xl p-6 text-slate-400">
              <h3 className="text-2xl font-black text-slate-100">Error Reading</h3>
              <p className="mt-4 leading-7">
                The notebook class order is `Parasitized: 0` and `Uninfected: 1`. The backend now uses that mapping, so sigmoid values above 0.5 are treated as uninfected probability.
              </p>
              <p className="mt-4 leading-7">
                The validation set had 278 total mistakes: 196 parasitized cells predicted as uninfected and 82 uninfected cells predicted as parasitized.
              </p>
            </div>
          </div>
        </Section>

        <Section title="Limitations">
          <div className="grid gap-6 lg:grid-cols-3">
            <InfoCard title="Dataset Scope" items={['Trained on the NIH malaria cell image dataset only.', 'Stain, scanner, and lab differences can affect generalization.']} />
            <InfoCard title="Prediction Scope" items={['Binary classification only: parasitized vs uninfected.', 'Species identification and parasite stage detection are not included.']} />
            <InfoCard title="Use Boundary" items={['Educational AI project, not a clinical diagnostic device.', 'Low confidence or unclear images should be reviewed manually.']} />
          </div>
        </Section>
      </div>
    </section>
  )
}

function Section({ title, children }) {
  return (
    <section className="py-20">
      <h2 className="text-3xl font-black text-slate-100 md:text-4xl">{title}</h2>
      <div className="mt-8">{children}</div>
    </section>
  )
}

function Axis({ label }) {
  return <div className="flex min-h-[72px] items-center justify-center rounded-xl border border-cyan-900/30 bg-navy-950 p-3 font-bold text-cyan-400">{label}</div>
}

function MatrixCell({ value, label, tone }) {
  const tones = {
    good: 'border-healthy/50 text-healthy',
    warn: 'border-cyan-400/50 text-cyan-400',
    risk: 'border-infected/50 text-infected',
  }

  return (
    <div className={`min-h-[120px] rounded-xl border bg-navy-950 p-4 ${tones[tone]}`}>
      <div className="text-3xl font-black">{value}</div>
      <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
    </div>
  )
}

function InfoCard({ title, items }) {
  return (
    <article className="glass-card rounded-2xl p-6">
      <h3 className="text-2xl font-black text-cyan-400">{title}</h3>
      <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-400">
        {items.map((item) => <li key={item}>- {item}</li>)}
      </ul>
    </article>
  )
}
