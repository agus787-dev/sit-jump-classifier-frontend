import { ArrowRight, ScanSearch, Sparkles, Upload } from 'lucide-react'

const steps = [
  { icon: Upload, number: '01', title: 'Add a clip', description: 'Upload a short video with one person in view.' },
  { icon: ScanSearch, number: '02', title: 'We take a look', description: 'Our small CNN reads the movement in each frame.' },
  { icon: Sparkles, number: '03', title: 'Get your answer', description: 'See the best match, confidence, and both probabilities.' },
]

export function HowItWorks() {
  return (
    <section className="how-section" aria-labelledby="how-title">
      <div className="section-heading">
        <span className="eyebrow">SIMPLE AS THAT</span>
        <h2 id="how-title">How it works</h2>
      </div>
      <div className="steps-grid">
        {steps.map(({ icon: Icon, number, title, description }, index) => (
          <article className="step-card" key={number}>
            <div className="step-top">
              <span className="step-icon"><Icon size={18} aria-hidden="true" /></span>
              <span className="step-number">{number}</span>
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
            {index < steps.length - 1 && <ArrowRight className="step-arrow" size={16} aria-hidden="true" />}
          </article>
        ))}
      </div>
    </section>
  )
}
