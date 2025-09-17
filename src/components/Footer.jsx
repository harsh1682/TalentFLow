import React from 'react';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="app-footer" role="contentinfo">
      <div className="app-footer__inner">
        <span className="app-footer__brand">TalentFlow</span>
        <span className="app-footer__meta">© {year} • All rights reserved</span>
        <nav className="app-footer__links" aria-label="Footer">
          <a href="#" className="app-footer__link">Privacy</a>
          <a href="#" className="app-footer__link">Terms</a>
          <a href="#" className="app-footer__link">Support</a>
        </nav>
      </div>
    </footer>
  );
}


