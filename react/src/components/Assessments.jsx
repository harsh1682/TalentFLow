import React, { useState, useMemo } from 'react';
import { useData } from '../store/DataProvider.jsx';
import AssessmentModal from './AssessmentModal.jsx';
import AssessmentRuntime from './AssessmentRuntime.jsx';

export default function Assessments() {
  const { jobs, assessments, setAssessments } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [showRuntime, setShowRuntime] = useState(false);
  const activeJobs = jobs.filter(j => j.status === 'active');

  const handleSaveAssessment = (assessmentData) => {
    if (editingAssessment) {
      setAssessments(assessments.map(a => a.id === editingAssessment.id ? { ...assessmentData, id: editingAssessment.id } : a));
    } else {
      setAssessments([...assessments, assessmentData]);
    }
    setEditingAssessment(null);
  };

  const handleCreateAssessment = () => {
    setEditingAssessment(null);
    setShowModal(true);
  };

  const handleJobSelect = (jobId) => {
    setSelectedJobId(jobId);
    if (jobId) {
      const job = jobs.find(j => j.id === parseInt(jobId));
      // Load draft if exists
      const draftKey = `talentflow_assessment_draft_${parseInt(jobId)}`;
      const draft = JSON.parse(localStorage.getItem(draftKey) || 'null');
      const base = {
        title: `${job.title} Assessment`,
        description: `Technical assessment for ${job.title} position`,
        jobId: parseInt(jobId),
        timeLimit: 60,
        passingScore: 70,
        sections: [
          {
            id: Date.now(),
            title: 'Section 1',
            questions: [
              {
                id: Date.now() + 1,
                text: '',
                type: 'single_choice',
                options: ['', '', '', ''],
                required: true
              }
            ]
          }
        ]
      };
      setCurrentAssessment(draft || base);
    } else {
      setCurrentAssessment(null);
    }
  };

  const addSection = () => {
    if (currentAssessment) {
      setCurrentAssessment({
        ...currentAssessment,
        sections: [
          ...currentAssessment.sections,
          { id: Date.now(), title: `Section ${currentAssessment.sections.length + 1}`, questions: [] }
        ]
      });
    }
  };

  const addQuestion = (sectionId) => {
    if (currentAssessment) {
      setCurrentAssessment({
        ...currentAssessment,
        sections: currentAssessment.sections.map(s =>
          s.id === sectionId
            ? {
                ...s,
                questions: [
                  ...s.questions,
                  { id: Date.now(), text: '', type: 'single_choice', options: ['', '', '', ''], required: true }
                ]
              }
            : s
        )
      });
    }
  };

  const updateQuestion = (sectionId, questionId, field, value) => {
    if (currentAssessment) {
      setCurrentAssessment({
        ...currentAssessment,
        sections: currentAssessment.sections.map(s =>
          s.id === sectionId
            ? {
                ...s,
                questions: s.questions.map(q => (q.id === questionId ? { ...q, [field]: value } : q))
              }
            : s
        )
      });
    }
  };

  const updateQuestionOption = (sectionId, questionId, optionIndex, value) => {
    if (currentAssessment) {
      setCurrentAssessment({
        ...currentAssessment,
        sections: currentAssessment.sections.map(s =>
          s.id === sectionId
            ? {
                ...s,
                questions: s.questions.map(q =>
                  q.id === questionId
                    ? { ...q, options: q.options.map((opt, idx) => (idx === optionIndex ? value : opt)) }
                    : q
                )
              }
            : s
        )
      });
    }
  };

  const removeQuestion = (sectionId, questionId) => {
    if (currentAssessment) {
      setCurrentAssessment({
        ...currentAssessment,
        sections: currentAssessment.sections.map(s =>
          s.id === sectionId
            ? { ...s, questions: s.questions.filter(q => q.id !== questionId) }
            : s
        )
      });
    }
  };

  const removeSection = (sectionId) => {
    if (currentAssessment && currentAssessment.sections.length > 1) {
      setCurrentAssessment({
        ...currentAssessment,
        sections: currentAssessment.sections.filter(s => s.id !== sectionId)
      });
    }
  };

  const saveCurrentAssessment = () => {
    if (
      currentAssessment &&
      currentAssessment.title &&
      currentAssessment.sections?.some(sec => sec.questions.some(q => q.text.trim()))
    ) {
      const assessmentData = {
        ...currentAssessment,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      setAssessments([...assessments, assessmentData]);
      try {
        localStorage.removeItem(`talentflow_assessment_draft_${currentAssessment.jobId}`);
      } catch {}
      setCurrentAssessment(null);
      setSelectedJobId('');
    }
  };

  // Persist builder draft per jobId
  React.useEffect(() => {
    if (currentAssessment?.jobId) {
      try {
        localStorage.setItem(`talentflow_assessment_draft_${currentAssessment.jobId}`, JSON.stringify(currentAssessment));
      } catch {}
    }
  }, [currentAssessment]);

  return (
    <div className="tab-content" id="assessments-tab">
      <div className="page-header">
        <div className="page-header__content">
          <h2>Assessment Builder</h2>
        </div>
        <div className="assessment-job-selector">
          <select 
            className="form-control" 
            value={selectedJobId} 
            onChange={(e) => handleJobSelect(e.target.value)}
          >
            <option value="">Select a job to start building...</option>
            {activeJobs.map(j => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
        </div>
      </div>

      {currentAssessment ? (
        <div className="assessment-builder">
          <div className="builder-panel">
              <div className="builder-header">
              <h3>Assessment Builder</h3>
              <div className="flex gap-8">
                <button className="btn btn--sm btn--outline" onClick={() => setCurrentAssessment(null)}>Cancel</button>
                <button className="btn btn--sm btn--primary" onClick={saveCurrentAssessment}>Save Assessment</button>
                  <button className="btn btn--sm btn--outline" onClick={() => setShowRuntime(s => !s)}>{showRuntime ? 'Hide Runtime' : 'Open Runtime'}</button>
              </div>
            </div>
            <div className="sections-container">
              <div className="form-group">
                <label className="form-label">Assessment Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={currentAssessment.title}
                  onChange={(e) => setCurrentAssessment({...currentAssessment, title: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={currentAssessment.description}
                  onChange={(e) => setCurrentAssessment({...currentAssessment, description: e.target.value})}
                />
              </div>
              <div className="flex gap-16">
                <div className="form-group flex-1">
                  <label className="form-label">Time Limit (minutes)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={currentAssessment.timeLimit}
                    onChange={(e) => setCurrentAssessment({...currentAssessment, timeLimit: parseInt(e.target.value) || 60})}
                    min="5"
                    max="180"
                  />
                </div>
                <div className="form-group flex-1">
                  <label className="form-label">Passing Score (%)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={currentAssessment.passingScore}
                    onChange={(e) => setCurrentAssessment({...currentAssessment, passingScore: parseInt(e.target.value) || 70})}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="flex justify-between items-center">
                  <label className="form-label">Sections</label>
                  <button className="btn btn--sm btn--primary" onClick={addSection}>
                    Add Section
                  </button>
                </div>
              </div>

              {currentAssessment.sections.map((section, sIdx) => (
                <div key={section.id} className="section">
                  <div className="section-header">
                    <h4 className="section-title">{section.title}</h4>
                    <div className="section-actions">
                      {currentAssessment.sections.length > 1 && (
                        <button className="btn btn--sm btn--outline" onClick={() => removeSection(section.id)}>Remove Section</button>
                      )}
                      <button className="btn btn--sm btn--primary" onClick={() => addQuestion(section.id)}>Add Question</button>
                    </div>
                  </div>
                  <div className="section-content">
                  {section.questions.map((question, index) => (
                    <div key={question.id} className="question">
                  <div className="question-header">
                    <span className="question-type">Question {index + 1}</span>
                    {section.questions.length > 1 && (
                      <button 
                        className="btn btn--sm btn--outline"
                        onClick={() => removeQuestion(section.id, question.id)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="question-text">
                    <textarea
                      className="form-control"
                      value={question.text}
                      onChange={(e) => updateQuestion(section.id, question.id, 'text', e.target.value)}
                      placeholder="Enter your question here..."
                      rows="2"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Question Type</label>
                    <select
                      className="form-control"
                      value={question.type}
                      onChange={(e) => updateQuestion(section.id, question.id, 'type', e.target.value)}
                    >
                      <option value="single_choice">Single Choice</option>
                      <option value="multi_choice">Multiple Choice</option>
                      <option value="short_text">Short Text</option>
                      <option value="long_text">Long Text</option>
                      <option value="numeric">Numeric (with range)</option>
                      <option value="file">File Upload (stub)</option>
                    </select>
                  </div>
                  {(question.type === 'single_choice' || question.type === 'multi_choice') && (
                    <div className="question-options">
                      <label className="form-label">Options</label>
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="option-input">
                          <input
                            type="text"
                            className="form-control"
                            value={option}
                            onChange={(e) => updateQuestionOption(section.id, question.id, optionIndex, e.target.value)}
                            placeholder={`Option ${optionIndex + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {question.type === 'short_text' && (
                    <input className="form-control" placeholder="Short answer" disabled />
                  )}
                  {question.type === 'long_text' && (
                    <textarea className="form-control" rows="4" placeholder="Long answer" disabled />
                  )}
                  {question.type === 'numeric' && (
                    <div className="flex gap-16">
                      <div className="form-group flex-1">
                        <label className="form-label">Min</label>
                        <input type="number" className="form-control" value={question.min ?? ''} onChange={(e) => updateQuestion(section.id, question.id, 'min', e.target.value === '' ? undefined : Number(e.target.value))} />
                      </div>
                      <div className="form-group flex-1">
                        <label className="form-label">Max</label>
                        <input type="number" className="form-control" value={question.max ?? ''} onChange={(e) => updateQuestion(section.id, question.id, 'max', e.target.value === '' ? undefined : Number(e.target.value))} />
                      </div>
                    </div>
                  )}
                  {question.type === 'file' && (
                    <div className="form-group">
                      <label className="form-label">File Upload (stub)</label>
                      <input type="file" className="form-control" disabled />
                    </div>
                  )}
                  <div className="form-group">
                    <label className="flex items-center gap-8">
                      <input
                        type="checkbox"
                        checked={question.required}
                        onChange={(e) => updateQuestion(section.id, question.id, 'required', e.target.checked)}
                      />
                      Required Question
                    </label>
                  </div>
                </div>
                  ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="preview-panel">
            <div className="preview-header">
              <h3>Live Preview</h3>
              <span className="text-gray-500">{currentAssessment.sections.reduce((acc, s) => acc + s.questions.length, 0)} questions</span>
            </div>
            <div className="preview-content">
              {!showRuntime ? (
              <div className="assessment-preview">
                <h4>{currentAssessment.title || 'Untitled Assessment'}</h4>
                <p className="text-gray-500 mb-16">{currentAssessment.description || 'No description'}</p>
                <div className="flex gap-16 mb-16">
                  <span className="text-sm text-gray-500">Time: {currentAssessment.timeLimit} minutes</span>
                  <span className="text-sm text-gray-500">Passing: {currentAssessment.passingScore}%</span>
                </div>
                {currentAssessment.sections.map((section, sIdx) => (
                  <div key={section.id} className="assessment-form-section">
                    <h3>{section.title}</h3>
                    {section.questions.map((question, index) => (
                      <div key={question.id} className="assessment-question-preview">
                        <h5>
                          Question {index + 1} {question.required && <span className="required-indicator">*</span>}
                        </h5>
                        <p className="mb-8">{question.text || 'Enter question text...'}</p>
                        {(question.type === 'single_choice' || question.type === 'multi_choice') && (
                          <div className="assessment-options">
                            {question.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="assessment-option">
                                <input type={question.type === 'single_choice' ? 'radio' : 'checkbox'} name={`q${question.id}`} disabled />
                                <span>{option || `Option ${optionIndex + 1}`}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {question.type === 'short_text' && (
                          <input className="form-control" placeholder="Short answer" disabled />
                        )}
                        {question.type === 'long_text' && (
                          <textarea className="form-control" rows="4" placeholder="Long answer" disabled />
                        )}
                        {question.type === 'numeric' && (
                          <input className="form-control" type="number" placeholder={`Number ${question.min != null ? `(min ${question.min})` : ''} ${question.max != null ? `(max ${question.max})` : ''}`.trim()} disabled />
                        )}
                        {question.type === 'file' && (
                          <input className="form-control" type="file" disabled />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              ) : (
                <AssessmentRuntime assessment={currentAssessment} candidateId={'demo'} onSubmit={() => {}} />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="assessment-builder">
          <div className="builder-panel">
            <div className="builder-header">
              <h3>Assessment Builder</h3>
            </div>
            <div className="sections-container">
              <div className="text-center py-32">
                <h4>Select a job to start building an assessment</h4>
                <p className="text-gray-500">Choose a job position from the dropdown above to create a customized assessment</p>
              </div>
            </div>
          </div>
          <div className="preview-panel">
            <div className="preview-header">
              <h3>Live Preview</h3>
            </div>
            <div className="preview-content">
              <div className="text-center py-32">
                <p className="text-gray-500">Preview will appear here when you start building an assessment</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <AssessmentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveAssessment}
        assessment={editingAssessment}
      />
    </div>
  );
}


