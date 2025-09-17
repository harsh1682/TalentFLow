import React, { useState } from 'react';
import { useData } from '../store/DataProvider.jsx';
import MentionsTextarea from './MentionsTextarea.jsx';

export default function CandidateModal({ isOpen, onClose, onSave, candidate = null }) {
  const { jobs, candidates } = useData();
  
  // Generate mention suggestions from existing candidates and team members
  const mentionSuggestions = [
    ...candidates.map(c => c.name),
    'HR Team',
    'Tech Lead',
    'Manager',
    'Recruiter',
    'Interviewer'
  ];
  const [formData, setFormData] = useState({
    name: candidate?.name || '',
    email: candidate?.email || '',
    phone: candidate?.phone || '',
    experience: candidate?.experience || '',
    skills: candidate?.skills?.join(', ') || '',
    jobId: candidate?.jobId || '',
    stage: candidate?.stage || 'applied',
    resume: candidate?.resume || '',
    notes: candidate?.notes || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const candidateData = {
      ...formData,
      skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
      id: candidate?.id || Date.now(),
      appliedDate: candidate?.appliedDate || new Date().toISOString()
    };
    onSave(candidateData);
    onClose();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal__backdrop" onClick={onClose}></div>
      <div className="modal__content modal__content--large">
        <div className="modal__header">
          <h3>{candidate ? 'Edit Candidate' : 'Add New Candidate'}</h3>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal__body modal__body--scrollable">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Years of Experience</label>
              <input
                type="number"
                name="experience"
                className="form-control"
                value={formData.experience}
                onChange={handleChange}
                min="0"
                max="50"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Skills (comma separated)</label>
              <input
                type="text"
                name="skills"
                className="form-control"
                value={formData.skills}
                onChange={handleChange}
                placeholder="React, JavaScript, Node.js"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Applied for Job</label>
              <select
                name="jobId"
                className="form-control"
                value={formData.jobId}
                onChange={handleChange}
                required
              >
                <option value="">Select a job</option>
                {jobs.filter(job => job.status === 'active').map(job => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Current Stage</label>
              <select
                name="stage"
                className="form-control"
                value={formData.stage}
                onChange={handleChange}
              >
                <option value="applied">Applied</option>
                <option value="screening">Screening</option>
                <option value="interview">Interview</option>
                <option value="assessment">Assessment</option>
                <option value="offer">Offer</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Resume URL</label>
              <input
                type="url"
                name="resume"
                className="form-control"
                value={formData.resume}
                onChange={handleChange}
                placeholder="https://example.com/resume.pdf"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <MentionsTextarea
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes about the candidate... Type @ to mention someone"
                suggestions={mentionSuggestions}
                className="form-control"
              />
            </div>
          </div>
          <div className="modal__footer">
            <button type="button" className="btn btn--outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary">Save Candidate</button>
          </div>
        </form>
      </div>
    </div>
  );
}
