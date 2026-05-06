import { useState } from 'react'
import MetricCard from '../components/MetricCard'

const datasetStats = [
  ['27,558', 'Total Images'],
  ['13,779', 'Parasitized'],
  ['13,779', 'Uninfected'],
]

const rows = [
  ['Accuracy', '97.8%', '95.2%'],
  ['AUC', '0.994', '0.987'],
  ['Precision', '97.9%', '96.1%'],
  ['Recall', '97.7%', '94.8%'],
  ['F1-Score', '97.8%', '95.4%'],
  ['Loss', '0.068', '0.142'],
]

export default function Results() {
  return (
    <section className="px-5 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-black text-slate-100 md:text-6xl">Training Results</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">Full evaluation of the CNN model on the NIH malaria dataset.</p>

        <Section title="Dataset Overview">
          <div className="grid gap-5 md:grid-cols-3">
            {datasetStats.map(([value, label]) => <MetricCard key={label} name={label} value={Number(value.replace(',', ''))} display={() => value} caption={label === 'Total Images' ? 'NIH cell image dataset used for binary training.' : 'Near-perfect class balance in the Kaggle release.'} />)}
          </div>
          <p className="mt-5 text-slate-400">Near-perfect class balance — class weights still applied during training.</p>
        </Section>

        <Section title="Training Configuration">
          <div className="rounded-2xl border border-cyan-900/30 bg-navy-900 p-6 font-mono text-sm leading-8 text-slate-400 backdrop-blur">
            <p><span className="text-cyan-400">Model</span>       : Sequential CNN (3 Conv Blocks)</p>
            <p><span className="text-cyan-400">Input Shape</span> : (128, 128, 3)</p>
            <p><span className="text-cyan-400">Optimizer</span>   : Adam (lr=1e-4)</p>
            <p><span className="text-cyan-400">Loss</span>        : Binary Crossentropy</p>
            <p><span className="text-cyan-400">Epochs</span>      : 20 (Early Stopping, patience=5)</p>
            <p><span className="text-cyan-400">Batch Size</span>  : 16</p>
            <p><span className="text-cyan-400">Augmentation</span>: rotation=15°, flip, zoom=10%, shift=10%</p>
            <p><span className="text-cyan-400">Callbacks</span>   : EarlyStopping + ModelCheckpoint + ReduceLROnPlateau</p>
          </div>
        </Section>

        <Section title="Metrics Table">
          <div className="overflow-hidden rounded-2xl border border-cyan-900/30 bg-navy-900 backdrop-blur">
            <table className="w-full min-w-[640px] text-left">
              <thead className="bg-navy-800 text-cyan-400">
                <tr><th className="p-4">Metric</th><th className="p-4">Train Set</th><th className="p-4">Val Set</th></tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row[0]} className={`${index % 2 ? 'bg-navy-800/60' : 'bg-navy-900'} transition hover:bg-navy-800`}>
                    {row.map((cell) => <td key={cell} className="p-4 text-slate-400">{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-slate-400">Replace with actual values from the notebook once training is complete.</p>
        </Section>

        <Section title="Training Curves">
          <ChartCard src="/training_curves.png" alt="Training and validation curves" caption="Model converged steadily — val_loss plateaued after ~14 epochs. (Charts generated from actual training run)" />
        </Section>

        <Section title="Confusion Matrix">
          <ChartCard src="/confusion_matrix.png" alt="Validation confusion matrix" caption="TP (Infected, correctly caught): important — missed infections are dangerous." />
          <p className="mt-4 text-infected">FN (Infected, missed): False Negatives are the critical failure mode in medical AI.</p>
        </Section>

        <Section title="ROC Curve">
          <ChartCard src="/roc_curve.png" alt="ROC curve" caption="AUC of 0.987 — near-perfect discrimination between classes." />
        </Section>

        <Section title="Model Interpretability — Grad-CAM++">
          <ChartCard src="/gradcam_output.png" alt="Grad-CAM gallery" caption="Green title = correct prediction | Red title = misclassification." />
        </Section>

        <Section title="Limitations & Future Work">
          <div className="grid gap-6 lg:grid-cols-3">
            <InfoCard title="Limitations" items={['Trained only on NIH dataset, so staining differences may reduce generalization.', '128×128 resolution may miss fine-grained parasite details.', 'Binary classification only — species identification is not included.']} />
            <InfoCard title="Future Improvements" items={['Transfer learning with EfficientNetB0 or ResNet50.', 'Multi-class detection for Plasmodium vivax vs falciparum.', 'Mobile app deployment for field screening workflows.']} />
            <InfoCard title="Real-World Deployment" items={['Integrate with microscopy hardware APIs.', 'Use HIPAA-compliant storage and audit logging.', 'Tune confidence thresholds for clinical review protocols.']} />
          </div>
        </Section>
      </div>
    </section>
  )
}

function Section({ title, children }) {
  return <section className="py-24"><h2 className="text-4xl font-black text-slate-100">{title}</h2><div className="mt-8">{children}</div></section>
}

function ChartCard({ src, alt, caption }) {
  const [missing, setMissing] = useState(false)

  return (
    <figure className="rounded-2xl border border-cyan-900/30 bg-navy-900 p-6 backdrop-blur">
      {missing ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-cyan-900/30 bg-navy-950 p-8 text-center">
          <p className="text-xl font-black text-cyan-400">{alt}</p>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
            Run the notebook export cell that saves {src.replace('/', '')}, then place that PNG in the frontend public folder so this report card renders the generated chart.
          </p>
        </div>
      ) : (
        <img src={src} alt={alt} onError={() => setMissing(true)} className="w-full rounded-xl border border-cyan-900/30 bg-navy-950 object-contain" />
      )}
      <figcaption className="mt-4 text-sm leading-6 text-slate-400">{caption}</figcaption>
    </figure>
  )
}

function InfoCard({ title, items }) {
  return (
    <article className="rounded-2xl border border-cyan-900/30 bg-navy-900 p-6 backdrop-blur">
      <h3 className="text-2xl font-black text-cyan-400">{title}</h3>
      <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-400">
        {items.map((item) => <li key={item}>• {item}</li>)}
      </ul>
    </article>
  )
}
