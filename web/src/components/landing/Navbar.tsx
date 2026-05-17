'use client'

import Image from 'next/image'
import './Navbar.css'

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo-container">
        <a href="/" className="logo-link" aria-label="Inicio NOMAD Centinela">
          <Image
            src="/logo-horizontal.png"
            alt="NOMAD Centinela"
            width={280}
            height={70}
            className="navbar-logo"
            priority
          />
        </a>
      </div>
      <div className="nav-main glass pill">
        <div className="nav-links">
          <a href="#platform" className="nav-link">
            Plataforma
          </a>
          <a href="#platform-agents" className="nav-link">
            Agentes
          </a>
          <a href="#cases" className="nav-link">
            Casos
          </a>
          <a href="#customers" className="nav-link">
            Comparativa
          </a>
        </div>
        <a href="/dashboard" className="login-btn pill">
          Panel
        </a>
      </div>
    </nav>
  )
}

export default Navbar
