import React, { useMemo, useState } from 'react';
import { useData } from '../store/DataProvider.jsx';
import { useError } from '../contexts/ErrorContext.jsx';
import CandidateModal from './CandidateModal.jsx';
import NotesDisplay from './NotesDisplay.jsx';
import KanbanBoard from './KanbanBoard.jsx';
import CandidateProfile from './CandidateProfile.jsx';

export default function Candidates() {
  const { candidates, jobs, setCandidates } = useData();
  const { showError, showSuccess } = useError();
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'kanban', or 'profile'
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [originalCandidates, setOriginalCandidates] = useState(candidates);
  const pageSize = 20;

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return candidates
      .filter(c => c.name.toLowerCase().includes(s) || c.email.toLowerCase().includes(s))
      .filter(c => !stage || c.stage === stage);
  }, [candidates, search, stage]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const pageItems = filtered.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

  const getStageClass = (st) => ({
    applied: 'status--info', screen: 'status--warning', tech: 'status--warning', offer: 'status--success', hired: 'status--success', rejected: 'status--error'
  })[st] || 'status--info';

  const jobTitleById = (id) => jobs.find(j => j.id === id)?.title || 'No Job';

  const handleSaveCandidate = async (candidateData) => {
    try {
      // Store original state for rollback
      setOriginalCandidates([...candidates]);
      
      if (editingCandidate) {
        setCandidates(candidates.map(c => c.id === editingCandidate.id ? { ...candidateData, id: editingCandidate.id } : c));
      } else {
        setCandidates([...candidates, candidateData]);
      }
      
      // Simulate API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // 12% chance of failure for testing
          if (Math.random() < 0.12) {
            reject(new Error('Failed to save candidate on server'));
          } else {
            resolve();
          }
        }, 900);
      });
      
      showSuccess(editingCandidate ? 'Candidate updated successfully' : 'Candidate added successfully');
      setEditingCandidate(null);
    } catch (error) {
      // Rollback on failure
      setCandidates(originalCandidates);
      showError('Failed to save candidate. Please try again.');
      console.error('Candidate save failed:', error);
    }
  };

  const handleEditCandidate = (candidate) => {
    setEditingCandidate(candidate);
    setShowModal(true);
  };

  const handleViewProfile = (candidate) => {
    setSelectedCandidateId(candidate.id);
    setViewMode('profile');
  };

  const handleCandidateClick = (candidate) => {
    // Always show profile when clicking on candidate
    handleViewProfile(candidate);
  };

  const handleCreateCandidate = () => {
    setEditingCandidate(null);
    setShowModal(true);
  };

  return (
    <div className="tab-content" id="candidates-tab">
      <div className="page-header">
        <div className="page-header__content">
          <h2>Candidates</h2>
          <button className="btn btn--primary" onClick={handleCreateCandidate}>Add Candidate</button>
        </div>
        <div className="filters">
          <input className="form-control" placeholder="Search candidates..." value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} />
          <select className="form-control" value={stage} onChange={(e) => { setPage(1); setStage(e.target.value); }}>
            <option value="">All Stages</option>
            <option value="applied">Applied</option>
            <option value="screen">Screen</option>
            <option value="tech">Technical</option>
            <option value="offer">Offer</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
          <div className="view-toggle">
            <button 
              className={`btn ${viewMode === 'list' ? 'btn--primary' : 'btn--outline'}`}
              onClick={() => setViewMode('list')}
            >
              List View
            </button>
            <button 
              className={`btn ${viewMode === 'kanban' ? 'btn--primary' : 'btn--outline'}`}
              onClick={() => setViewMode('kanban')}
            >
              Kanban View
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="candidates-list-view">
          <div className="virtual-list">
            {pageItems.map(c => (
            <div className="candidate-item" key={c.id}>
              <div className="candidate-info" onClick={() => handleCandidateClick(c)}>
                <h4>{c.name}</h4>
                <p>{c.email} • {jobTitleById(c.jobId)}</p>
                {c.notes && (
                  <NotesDisplay 
                    notes={c.notes} 
                    className="candidate-notes"
                  />
                )}
              </div>
              <div className="candidate-actions">
                <div className="candidate-stage">
                  <span className={`status ${getStageClass(c.stage)}`}>{c.stage}</span>
                </div>
                <button 
                  className="btn btn--sm btn--outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditCandidate(c);
                  }}
                  title="Edit Candidate"
                >
                  Edit
                </button>
              </div>
            </div>
            ))}
          </div>
          <div className="pagination">
            <button className="pagination-btn" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</button>
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(i => (
              <button key={i} className={`pagination-btn ${i === page ? 'pagination-btn--active' : ''}`} onClick={() => setPage(i)}>{i}</button>
            ))}
            <button className="pagination-btn" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
            <span className="pagination-info">{filtered.length} total candidates</span>
          </div>
        </div>
      ) : viewMode === 'kanban' ? (
        <div className="candidates-kanban-view">
          <KanbanBoard 
            onEditCandidate={handleEditCandidate} 
            onViewProfile={handleViewProfile}
          />
        </div>
      ) : (
        <CandidateProfile 
          candidateId={selectedCandidateId} 
          onClose={() => setViewMode('list')}
          onEdit={handleEditCandidate}
        />
      )}

      <CandidateModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveCandidate}
        candidate={editingCandidate}
      />
    </div>
  );
}


