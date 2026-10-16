import { Github, Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="site-footer">
      <p><span>Small CNN trained on HMDB51</span><span className="footer-divider">·</span><span>jump vs sit</span></p>
      <a href="https://github.com/agus787-dev/sit-jump-classifier-frontend" target="_blank" rel="noreferrer">
        <Github size={15} aria-hidden="true" />
        <span>View on GitHub</span>
      </a>
      <p className="made-with">Made with <Heart size={12} aria-label="love" /></p>
    </footer>
  )
}
