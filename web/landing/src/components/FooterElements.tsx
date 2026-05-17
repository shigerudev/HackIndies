import './FooterElements.css'

const FooterElements = () => {
  return (
    <div className="footer-elements">
      <div className="footer-left">
        <p className="description">
          It detects, triages, and alerts on credential exposure<br />
          through natural intelligence pipelines.<br />
          From OSINT signals to actionable playbooks,<br />
          it adapts to your institution's threat surface.
        </p>
      </div>
      <div className="footer-right">
        <button className="tag-btn glass pill">Defender briefings for complex threats</button>
        <div className="action-row">
          <button className="icon-btn glass pill">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 17L17 7M17 7H7M17 7V17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="tag-btn glass pill">Human-in-the-loop &amp; Action</button>
        </div>
      </div>
    </div>
  )
}

export default FooterElements
