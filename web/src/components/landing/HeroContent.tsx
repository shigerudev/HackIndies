'use client'

import Image from 'next/image'
import './HeroContent.css'

const HeroContent = () => {
  return (
    <div className="hero-content">
      <div className="hero-logo-wrap">
        <Image
          src="/logo-horizontal.png"
          alt="NOMAD Centinela — alerta temprana"
          width={640}
          height={160}
          className="hero-logo"
          priority
        />
      </div>
      <p className="hero-tagline">
        Alerta temprana de exposición de credenciales en instituciones públicas de LATAM.
      </p>
      <div className="cta-container">
        <a href="/dashboard#pipeline" className="cta-btn pill">
          Ir al panel
        </a>
      </div>
    </div>
  )
}

export default HeroContent
