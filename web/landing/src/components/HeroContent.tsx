import './HeroContent.css'

const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL ?? 'http://localhost:3000'

const HeroContent = () => {
  return (
    <div className="hero-content">
      <h1 className="hero-title">
        <span className="sans-bold">Meet NOMAD.</span>
        <br />
        <span className="serif-italic">Expose threats</span>
        <span className="sans-light"> before</span>
        <br />
        <span className="sans-light">they strike</span>
      </h1>
      <div className="cta-container">
        <a href={`${DASHBOARD_URL}/dashboard`} className="cta-btn pill" style={{ display: 'inline-block' }}>
          Start monitoring now
        </a>
      </div>
    </div>
  )
}

export default HeroContent
