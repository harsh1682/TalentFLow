import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const DataContext = createContext(null);

const STORAGE_KEYS = {
  jobs: 'talentflow_jobs',
  candidates: 'talentflow_candidates',
  assessments: 'talentflow_assessments',
};

function getDefaultJobs() {
  const jobs = [
    {id: 1, title: 'Senior React Developer', slug: 'senior-react-developer', status: 'active', tags: ['React','JavaScript','Frontend'], order: 1, createdDate: '2025-08-15'},
    {id: 2, title: 'Full Stack Engineer', slug: 'full-stack-engineer', status: 'active', tags: ['Node.js','React','MongoDB'], order: 2, createdDate: '2025-08-20'},
    {id: 3, title: 'DevOps Engineer', slug: 'devops-engineer', status: 'archived', tags: ['AWS','Docker','Kubernetes'], order: 3, createdDate: '2025-07-10'},
    {id: 4, title: 'Product Manager', slug: 'product-manager', status: 'active', tags: ['Strategy','Analytics'], order: 4, createdDate: '2025-09-01'},
    {id: 5, title: 'UX Designer', slug: 'ux-designer', status: 'active', tags: ['Figma','Research'], order: 5, createdDate: '2025-09-05'},
    {id: 6, title: 'Data Scientist', slug: 'data-scientist', status: 'archived', tags: ['ML','Statistics'], order: 6, createdDate: '2025-07-20'},
    {id: 7, title: 'Backend Engineer', slug: 'backend-engineer', status: 'active', tags: ['Java','Spring'], order: 7, createdDate: '2025-08-25'},
    {id: 8, title: 'Mobile Developer', slug: 'mobile-developer', status: 'active', tags: ['React Native','iOS'], order: 8, createdDate: '2025-09-10'},
  ];
  for (let i = 9; i <= 25; i++) {
    const allTags = ['JavaScript','React','Node.js','Python','Java','AWS','Docker','MongoDB','SQL','Git','TypeScript','Vue.js'];
    const numTags = Math.floor(Math.random() * 3) + 1;
    const shuffled = allTags.sort(() => 0.5 - Math.random());
    jobs.push({
      id: i,
      title: `Job Position ${i}`,
      slug: `job-position-${i}`,
      status: Math.random() > 0.3 ? 'active' : 'archived',
      tags: shuffled.slice(0, numTags),
      order: i,
      createdDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  }
  return jobs;
}

function getDefaultCandidates() {
  const candidates = [];
  const stages = ['applied','screen','tech','offer','hired','rejected'];
  const firstNames = ['Arjun','Priya','Rajesh','Kavya','Vikram','Ananya','Suresh','Deepika','Rahul','Shreya','Kiran','Meera','Ajay','Pooja','Nikhil','Sneha','Ravi','Kriti','Amit','Divya'];
  const lastNames = ['Sharma','Patel','Singh','Kumar','Gupta','Agarwal','Verma','Jain','Malhotra','Reddy','Iyer','Nair','Bose','Chatterjee','Das','Banerjee','Mukherjee','Ghosh','Bhattacharya','Sengupta'];
  for (let i = 1; i <= 1200; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
    const stage = stages[Math.floor(Math.random() * stages.length)];
    const appliedDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString();
    const candidate = { id: i, name, email, stage, jobId: Math.floor(Math.random() * 8) + 1, appliedDate };
    if (stage === 'hired') candidate.hiredDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();
    candidates.push(candidate);
  }
  return candidates;
}

function getDefaultAssessments() {
  return [
    {
      id: 1,
      title: 'React Developer Assessment',
      description: 'Technical assessment for React developers',
      jobId: 1,
      timeLimit: 60,
      passingScore: 70,
      questions: [
        {
          id: 1,
          text: 'What is the purpose of useEffect in React?',
          type: 'multiple_choice',
          options: ['State management', 'Side effects', 'Rendering', 'Event handling'],
          required: true
        },
        {
          id: 2,
          text: 'Explain the difference between props and state.',
          type: 'text',
          options: [],
          required: true
        }
      ],
      createdAt: '2025-09-01T10:00:00Z'
    }
  ];
}

export function DataProvider({ children }) {
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [assessments, setAssessments] = useState([]);

  useEffect(() => {
    const storedJobs = JSON.parse(localStorage.getItem(STORAGE_KEYS.jobs) || 'null');
    const storedCandidates = JSON.parse(localStorage.getItem(STORAGE_KEYS.candidates) || 'null');
    const storedAssessments = JSON.parse(localStorage.getItem(STORAGE_KEYS.assessments) || 'null');
    setJobs(storedJobs || getDefaultJobs());

    // One-time migration: ensure candidate names are Indian. If existing local data
    // contains mostly non-Indian names, reseed with Indian names for visual parity.
    const indianLastNames = ['Sharma','Patel','Singh','Kumar','Gupta','Agarwal','Verma','Jain','Malhotra','Reddy','Iyer','Nair','Bose','Chatterjee','Das','Banerjee','Mukherjee','Ghosh','Bhattacharya','Sengupta'];
    const isIndianName = (fullName) => {
      if (typeof fullName !== 'string') return false;
      const parts = fullName.trim().split(/\s+/);
      const last = parts[parts.length - 1];
      return indianLastNames.includes(last);
    };

    if (Array.isArray(storedCandidates) && storedCandidates.length > 0) {
      const sampleSize = Math.min(50, storedCandidates.length);
      let indianCount = 0;
      for (let i = 0; i < sampleSize; i++) {
        const c = storedCandidates[i];
        if (isIndianName(c?.name)) indianCount++;
      }
      const ratio = indianCount / sampleSize;
      if (ratio < 0.5) {
        const reseeded = getDefaultCandidates();
        setCandidates(reseeded);
        localStorage.setItem(STORAGE_KEYS.candidates, JSON.stringify(reseeded));
      } else {
        setCandidates(storedCandidates);
      }
    } else {
      const defaults = getDefaultCandidates();
      setCandidates(defaults);
      localStorage.setItem(STORAGE_KEYS.candidates, JSON.stringify(defaults));
    }
    setAssessments(storedAssessments || getDefaultAssessments());
  }, []);

  useEffect(() => {
    if (jobs.length) localStorage.setItem(STORAGE_KEYS.jobs, JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    if (candidates.length) localStorage.setItem(STORAGE_KEYS.candidates, JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    if (assessments.length) localStorage.setItem(STORAGE_KEYS.assessments, JSON.stringify(assessments));
  }, [assessments]);

  const metrics = useMemo(() => {
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(j => j.status === 'active').length;
    const totalCandidates = candidates.length;
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const candidatesHiredThisMonth = candidates.filter(c => c.stage === 'hired' && c.hiredDate && (new Date(c.hiredDate).getMonth() === thisMonth) && (new Date(c.hiredDate).getFullYear() === thisYear)).length;
    return { totalJobs, activeJobs, totalCandidates, candidatesHiredThisMonth, assessmentCompletionRate: 78, averageTimeToHire: 23, pipelineConversionRate: 15 };
  }, [jobs, candidates]);

  const stageData = useMemo(() => {
    const stages = ['applied','screen','tech','offer','hired','rejected'];
    const colors = { applied: '#1FB8CD', screen: '#FFC185', tech: '#B4413C', offer: '#ECEBD5', hired: '#5D878F', rejected: '#DB4545' };
    const counts = candidates.reduce((acc, c) => { acc[c.stage] = (acc[c.stage] || 0) + 1; return acc; }, {});
    return stages.map(stage => ({ stage, count: counts[stage] || 0, color: colors[stage] }));
  }, [candidates]);

  const value = {
    jobs, setJobs,
    candidates, setCandidates,
    assessments, setAssessments,
    metrics, stageData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}


