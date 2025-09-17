import React, { useState } from 'react';
import './style.css';
import Nav from './components/Nav';
import Dashboard from './components/Dashboard';
import Jobs from './components/Jobs.jsx';
import Candidates from './components/Candidates.jsx';
import Assessments from './components/Assessments.jsx';
import NotificationSystem from './components/NotificationSystem.jsx';
import Footer from './components/Footer.jsx';
import { DataProvider, useData } from './store/DataProvider.jsx';
import { ErrorProvider } from './contexts/ErrorContext.jsx';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';

function AppShell() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { metrics, stageData } = useData();
  const location = useLocation();
  const navigate = useNavigate();

  const trends = [
    { date: '2025-09-08', count: 23 },
    { date: '2025-09-09', count: 31 },
    { date: '2025-09-10', count: 18 },
    { date: '2025-09-11', count: 42 },
    { date: '2025-09-12', count: 35 },
    { date: '2025-09-13', count: 28 },
    { date: '2025-09-14', count: 39 }
  ];

  const jobPerformance = [
    { job: 'Senior React Developer', applications: 89, hires: 3, conversionRate: 3.4 },
    { job: 'Full Stack Engineer', applications: 156, hires: 5, conversionRate: 3.2 },
    { job: 'DevOps Engineer', applications: 67, hires: 2, conversionRate: 3.0 }
  ];

  const recentActivity = [
    { type: 'application', candidate: 'Arjun Sharma', job: 'Senior React Developer', time: '2 hours ago' },
    { type: 'stage_change', candidate: 'Priya Patel', from: 'screen', to: 'tech', time: '4 hours ago' },
    { type: 'assessment', candidate: 'Rajesh Kumar', job: 'DevOps Engineer', time: '6 hours ago' }
  ];

  return (
    <div className="app">
      <Nav activeTab={activeTab} onSwitch={(tab) => {
        setActiveTab(tab);
        const map = { dashboard: '/', jobs: '/jobs', candidates: '/candidates', assessments: '/assessments' };
        navigate(map[tab] || '/');
      }} />
      <main className="main">
        <Routes>
          <Route path="/" element={
            <Dashboard
              metrics={metrics}
              stageData={stageData}
              trends={trends}
              jobPerformance={jobPerformance}
              recentActivity={recentActivity}
              onTimeRangeChange={() => {}}
            />
          } />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:jobId" element={<Jobs />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/candidates/:id" element={<Candidates />} />
          <Route path="/assessments" element={<Assessments />} />
        </Routes>
      </main>
      {location.pathname === '/' && (<Footer />)}
      <NotificationSystem />
    </div>
  );
}

export default function App() {
  return (
    <ErrorProvider>
      <DataProvider>
        <AppShell />
      </DataProvider>
    </ErrorProvider>
  );
}
