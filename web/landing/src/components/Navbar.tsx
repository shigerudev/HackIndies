import './Navbar.css'

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo-container">
        <div className="logo-placeholder">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="4" fill="white" fillOpacity="0.8" />
              <circle cx="16" cy="8" r="4" fill="white" fillOpacity="0.8" />
              <circle cx="8" cy="16" r="4" fill="white" fillOpacity="0.8" />
              <circle cx="16" cy="16" r="4" fill="white" fillOpacity="0.8" />
            </svg>
          </div>
          <span className="brand-name"><a href="">NOMAD</a></span>
        </div>
      </div>
      <div className="nav-main glass pill">
        <div className="nav-links">
          <a href="#platform" className="nav-link">Platform</a>
          <a href="#solutions" className="nav-link">Solutions</a>
          <a href="#cases" className="nav-link">Cases</a>
          <a href="#team" className="nav-link">Team</a>
        </div>
        <button className="login-btn pill">Login</button>
      </div>
    </nav>
  )
}

export default Navbar
