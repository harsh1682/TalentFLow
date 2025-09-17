import React, { useEffect, useRef } from 'react';
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, DoughnutController, ArcElement, Legend } from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, DoughnutController, ArcElement, Legend);

export default function Dashboard({ metrics, stageData, trends, jobPerformance, recentActivity, onTimeRangeChange }) {
  const applicationsCanvasRef = useRef(null);
  const pipelineCanvasRef = useRef(null);
  const applicationsChartRef = useRef(null);
  const pipelineChartRef = useRef(null);

  useEffect(() => {
    // Applications trend chart
    const ctx = applicationsCanvasRef.current;
    if (ctx) {
      if (applicationsChartRef.current) applicationsChartRef.current.destroy();
      applicationsChartRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: trends.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
          datasets: [{
            label: 'Applications',
            data: trends.map(item => item.count),
            borderColor: '#1FB8CD',
            backgroundColor: 'rgba(31, 184, 205, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
        }
      });
    }

    // Pipeline chart
    const pctx = pipelineCanvasRef.current;
    if (pctx) {
      if (pipelineChartRef.current) pipelineChartRef.current.destroy();
      pipelineChartRef.current = new Chart(pctx, {
        type: 'doughnut',
        data: {
          labels: stageData.map(s => s.stage.charAt(0).toUpperCase() + s.stage.slice(1)),
          datasets: [{
            data: stageData.map(s => s.count),
            backgroundColor: stageData.map(s => s.color),
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
      });
    }

    return () => {
      if (applicationsChartRef.current) applicationsChartRef.current.destroy();
      if (pipelineChartRef.current) pipelineChartRef.current.destroy();
    };
  }, [trends, stageData]);

  return (
    <div className="tab-content" id="dashboard-tab">
      <div className="page-header">
        <div className="page-header__content">
          <h2>Dashboard</h2>
          <div className="dashboard-controls">
            <select className="form-control" onChange={e => onTimeRangeChange(e.target.value)} defaultValue="30d">
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="3m">Last 3 months</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card__header"><h3>Total Jobs</h3></div>
          <div className="kpi-card__value">{metrics.totalJobs}</div>
          <div className="kpi-card__subtitle"><span>{metrics.activeJobs}</span> active</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card__header"><h3>Total Candidates</h3></div>
          <div className="kpi-card__value">{metrics.totalCandidates.toLocaleString()}</div>
          <div className="kpi-card__subtitle">across all stages</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card__header"><h3>Hired This Month</h3></div>
          <div className="kpi-card__value">{metrics.candidatesHiredThisMonth}</div>
          <div className="kpi-card__subtitle ">+25% vs last month</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card__header"><h3>Assessment Rate</h3></div>
          <div className="kpi-card__value">{metrics.assessmentCompletionRate}%</div>
          <div className="kpi-card__subtitle">completion rate</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card__header"><h3>Avg Time to Hire</h3></div>
          <div className="kpi-card__value">{metrics.averageTimeToHire}</div>
          <div className="kpi-card__subtitle">days</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card__header"><h3>Conversion Rate</h3></div>
          <div className="kpi-card__value">{metrics.pipelineConversionRate}%</div>
          <div className="kpi-card__subtitle">pipeline conversion</div>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-section">
          <div className="chart-header"><h3>Applications Trend</h3></div>
          <div className="chart-container" style={{ position: 'relative', height: 300 }}>
            <canvas ref={applicationsCanvasRef} />
          </div>
        </div>
        <div className="chart-section">
          <div className="chart-header"><h3>Candidate Pipeline</h3></div>
          <div className="chart-container" style={{ position: 'relative', height: 300 }}>
            <canvas ref={pipelineCanvasRef} />
          </div>
        </div>
      </div>

      <div className="dashboard-bottom">
        <div className="dashboard-section">
          <div className="section-header"><h3>Top Performing Jobs</h3></div>
          <div className="job-performance-list">
            {jobPerformance.map(job => (
              <div className="performance-item" key={job.job}>
                <div className="performance-info">
                  <h4>{job.job}</h4>
                  <p>{job.applications} applications • {job.hires} hires</p>
                </div>
                <div className="performance-metrics">
                  <span className="conversion-rate">{job.conversionRate}% conversion</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header"><h3>Recent Activity</h3></div>
          <div className="activity-feed">
            {recentActivity.map((activity, idx) => (
              <div className="activity-item" key={idx}>
                <div className={`activity-icon ${activity.type === 'application' ? 'activity-icon--application' : activity.type === 'stage_change' ? 'activity-icon--stage' : 'activity-icon--assessment'}`}>
                  {activity.type === 'application' ? '📝' : activity.type === 'stage_change' ? '🔄' : '📋'}
                </div>
                <div className="activity-content">
                  <p>
                    {activity.type === 'application' && (<><strong>{activity.candidate}</strong> applied to <em>{activity.job}</em></>)}
                    {activity.type === 'stage_change' && (<><strong>{activity.candidate}</strong> moved from {activity.from} to {activity.to} stage</>)}
                    {activity.type === 'assessment' && (<><strong>{activity.candidate}</strong> completed assessment for <em>{activity.job}</em></>)}
                  </p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


