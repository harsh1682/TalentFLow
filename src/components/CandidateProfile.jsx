import React, { useState, useEffect } from 'react';
import { useData } from '../store/DataProvider.jsx';
import NotesDisplay from './NotesDisplay.jsx';

export default function CandidateProfile({ candidateId, onClose, onEdit }) {
  const { candidates, jobs, setCandidates } = useData();
  const [candidate, setCandidate] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const foundCandidate = candidates.find(c => c.id === parseInt(candidateId));
    if (foundCandidate) {
      setCandidate(foundCandidate);
      setEditData(foundCandidate);
      generateTimeline(foundCandidate);
    }
  }, [candidateId, candidates]);

  const generateTimeline = (candidate) => {
    const timelineEvents = [
      {
        id: 1,
        type: 'applied',
        title: 'Applied for Position',
        description: `Applied for ${jobs.find(j => j.id === candidate.jobId)?.title || 'Unknown Position'}`,
        date: candidate.appliedDate || new Date().toISOString(),
        status: 'completed'
      },
      {
        id: 2,
        type: 'stage_change',
        title: 'Current Stage',
        description: `Currently in ${candidate.stage} stage`,
        date: new Date().toISOString(),
        status: 'current'
      }
    ];

    // Add stage progression based on current stage
    const stages = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];
    const currentStageIndex = stages.indexOf(candidate.stage);
    
    if (currentStageIndex > 0) {
      for (let i = 1; i <= currentStageIndex; i++) {
        timelineEvents.push({
          id: i + 2,
          type: 'stage_change',
          title: `Moved to ${stages[i]} stage`,
          description: `Progressed from ${stages[i-1]} to ${stages[i]}`,
          date: new Date(Date.now() - (currentStageIndex - i) * 24 * 60 * 60 * 1000).toISOString(),
          status: i === currentStageIndex ? 'current' : 'completed'
        });
      }
    }

    // Add notes as timeline events
    if (candidate.notes) {
      timelineEvents.push({
        id: timelineEvents.length + 1,
        type: 'note',
        title: 'Note Added',
        description: candidate.notes,
        date: new Date().toISOString(),
        status: 'completed'
      });
    }

    // Sort by date
    timelineEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    setTimeline(timelineEvents);
  };

  const handleStageChange = (newStage) => {
    if (candidate) {
      const updatedCandidate = { ...candidate, stage: newStage };
      setCandidates(candidates.map(c => c.id === candidate.id ? updatedCandidate : c));
      setCandidate(updatedCandidate);
      generateTimeline(updatedCandidate);
    }
  };

  const handleSave = () => {
    if (candidate) {
      setCandidates(candidates.map(c => c.id === candidate.id ? editData : c));
      setCandidate(editData);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditData(candidate);
    setIsEditing(false);
  };

  if (!candidate) {
    return (
      <div className="candidate-profile">
        <div className="candidate-profile__header">
          <button className="btn btn--outline" onClick={onClose}>← Back to Candidates</button>
        </div>
        <div className="candidate-profile__content">
          <p>Candidate not found</p>
        </div>
      </div>
    );
  }

  const job = jobs.find(j => j.id === candidate.jobId);

  return (
    <div className="candidate-profile">
      <div className="candidate-profile__header">
        <button className="btn btn--outline" onClick={onClose}>← Back to Candidates</button>
        <div className="candidate-profile__actions">
          {!isEditing ? (
            <div className="candidate-profile__action-buttons">
              <button className="btn btn--outline" onClick={() => onEdit(candidate)}>Edit in Modal</button>
              <button className="btn btn--primary" onClick={() => setIsEditing(true)}>Edit Inline</button>
            </div>
          ) : (
            <div className="candidate-profile__edit-actions">
              <button className="btn btn--outline" onClick={handleCancel}>Cancel</button>
              <button className="btn btn--primary" onClick={handleSave}>Save Changes</button>
            </div>
          )}
        </div>
      </div>

      <div className="candidate-profile__content">
        <div className="candidate-profile__main">
          <div className="candidate-profile__info">
            <div className="candidate-profile__avatar">
              <span>{candidate.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="candidate-profile__details">
              <h1 className="candidate-profile__name">
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control"
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                  />
                ) : (
                  candidate.name
                )}
              </h1>
              <p className="candidate-profile__email">
                {isEditing ? (
                  <input
                    type="email"
                    className="form-control"
                    value={editData.email}
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                  />
                ) : (
                  candidate.email
                )}
              </p>
              <p className="candidate-profile__job">
                {job ? job.title : 'No Job Assigned'}
              </p>
              <div className="candidate-profile__stage">
                <span className={`status status--${candidate.stage === 'hired' ? 'success' : candidate.stage === 'rejected' ? 'error' : 'warning'}`}>
                  {candidate.stage}
                </span>
              </div>
            </div>
          </div>

          <div className="candidate-profile__sections">
            <div className="candidate-profile__section">
              <h3>Contact Information</h3>
              <div className="candidate-profile__field">
                <label>Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    className="form-control"
                    value={editData.phone || ''}
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                  />
                ) : (
                  <span>{candidate.phone || 'Not provided'}</span>
                )}
              </div>
              <div className="candidate-profile__field">
                <label>Experience</label>
                {isEditing ? (
                  <input
                    type="number"
                    className="form-control"
                    value={editData.experience || ''}
                    onChange={(e) => setEditData({...editData, experience: e.target.value})}
                  />
                ) : (
                  <span>{candidate.experience ? `${candidate.experience} years` : 'Not specified'}</span>
                )}
              </div>
              <div className="candidate-profile__field">
                <label>Skills</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control"
                    value={editData.skills ? editData.skills.join(', ') : ''}
                    onChange={(e) => setEditData({...editData, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                  />
                ) : (
                  <div className="candidate-profile__skills">
                    {candidate.skills?.map(skill => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    )) || 'No skills listed'}
                  </div>
                )}
              </div>
            </div>

            <div className="candidate-profile__section">
              <h3>Notes</h3>
              {isEditing ? (
                <textarea
                  className="form-control"
                  rows="4"
                  value={editData.notes || ''}
                  onChange={(e) => setEditData({...editData, notes: e.target.value})}
                  placeholder="Add notes about this candidate..."
                />
              ) : (
                <div className="candidate-profile__notes">
                  {candidate.notes ? (
                    <NotesDisplay notes={candidate.notes} />
                  ) : (
                    <p className="text-gray-500">No notes added yet</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="candidate-profile__timeline">
          <h3>Timeline</h3>
          <div className="timeline">
            {timeline.map((event, index) => (
              <div key={event.id} className={`timeline-item timeline-item--${event.status}`}>
                <div className="timeline-item__marker">
                  <div className="timeline-item__dot"></div>
                </div>
                <div className="timeline-item__content">
                  <div className="timeline-item__header">
                    <h4 className="timeline-item__title">{event.title}</h4>
                    <span className="timeline-item__date">
                      {new Date(event.date).toLocaleDateString()} {new Date(event.date).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="timeline-item__description">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="candidate-profile__stage-controls">
        <h3>Move to Stage</h3>
        <div className="stage-buttons">
          {['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'].map(stage => (
            <button
              key={stage}
              className={`btn ${candidate.stage === stage ? 'btn--primary' : 'btn--outline'}`}
              onClick={() => handleStageChange(stage)}
              disabled={candidate.stage === stage}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
