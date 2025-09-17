import React from 'react';

export default function Nav({ activeTab, onSwitch }) {
  return (
    <nav className="nav">
      <div className="nav__container">
        <div className="nav__brand">
          <h1>TalentFlow</h1>
        </div>
        <div className="nav__links">
          <button
            className={`nav__link ${activeTab === 'dashboard' ? 'nav__link--active' : ''}`}
            onClick={() => onSwitch('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`nav__link ${activeTab === 'jobs' ? 'nav__link--active' : ''}`}
            onClick={() => onSwitch('jobs')}
          >
            Jobs
          </button>
          <button
            className={`nav__link ${activeTab === 'candidates' ? 'nav__link--active' : ''}`}
            onClick={() => onSwitch('candidates')}
          >
            Candidates
          </button>
          <button
            className={`nav__link ${activeTab === 'assessments' ? 'nav__link--active' : ''}`}
            onClick={() => onSwitch('assessments')}
          >
            Assessments
          </button>
        </div>
      </div>
    </nav>
  );
}


