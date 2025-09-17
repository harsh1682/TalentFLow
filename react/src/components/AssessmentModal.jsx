import React, { useState } from 'react';
import { useData } from '../store/DataProvider.jsx';

export default function AssessmentModal({ isOpen, onClose, onSave, assessment = null }) {
  const { jobs } = useData();
  const [formData, setFormData] = useState({
    title: assessment?.title || '',
    description: assessment?.description || '',
    jobId: assessment?.jobId || '',
    questions: assessment?.questions || [
      { id: 1, text: '', type: 'multiple_choice', options: ['', '', '', ''], required: true }
    ],
    timeLimit: assessment?.timeLimit || 30,
    passingScore: assessment?.passingScore || 70
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const assessmentData = {
      ...formData,
      id: assessment?.id || Date.now(),
      createdAt: assessment?.createdAt || new Date().toISOString()
    };
    onSave(assessmentData);
    onClose();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleQuestionChange = (questionIndex, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      [field]: value
    };
    setFormData({
      ...formData,
      questions: newQuestions
    });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setFormData({
      ...formData,
      questions: newQuestions
    });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        { 
          id: Date.now(), 
          text: '', 
          type: 'multiple_choice', 
          options: ['', '', '', ''], 
          required: true 
        }
      ]
    });
  };

  const removeQuestion = (questionIndex) => {
    if (formData.questions.length > 1) {
      const newQuestions = formData.questions.filter((_, index) => index !== questionIndex);
      setFormData({
        ...formData,
        questions: newQuestions
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal__backdrop" onClick={onClose}></div>
      <div className="modal__content modal__content--large">
        <div className="modal__header">
          <h3>{assessment ? 'Edit Assessment' : 'Create New Assessment'}</h3>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            <div className="form-group">
              <label className="form-label">Assessment Title</label>
              <input
                type="text"
                name="title"
                className="form-control"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-control"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">For Job</label>
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
              <label className="form-label">Time Limit (minutes)</label>
              <input
                type="number"
                name="timeLimit"
                className="form-control"
                value={formData.timeLimit}
                onChange={handleChange}
                min="5"
                max="180"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Passing Score (%)</label>
              <input
                type="number"
                name="passingScore"
                className="form-control"
                value={formData.passingScore}
                onChange={handleChange}
                min="0"
                max="100"
              />
            </div>

            <div className="form-group">
              <div className="flex justify-between items-center">
                <label className="form-label">Questions</label>
                <button type="button" className="btn btn--sm btn--primary" onClick={addQuestion}>
                  Add Question
                </button>
              </div>
            </div>

            {formData.questions.map((question, questionIndex) => (
              <div key={question.id} className="question">
                <div className="question-header">
                  <span className="question-type">Question {questionIndex + 1}</span>
                  {formData.questions.length > 1 && (
                    <button 
                      type="button" 
                      className="btn btn--sm btn--outline"
                      onClick={() => removeQuestion(questionIndex)}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="question-text">
                  <textarea
                    className="form-control"
                    value={question.text}
                    onChange={(e) => handleQuestionChange(questionIndex, 'text', e.target.value)}
                    placeholder="Enter your question here..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Question Type</label>
                  <select
                    className="form-control"
                    value={question.type}
                    onChange={(e) => handleQuestionChange(questionIndex, 'type', e.target.value)}
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="text">Text Answer</option>
                    <option value="code">Code Challenge</option>
                  </select>
                </div>
                {question.type === 'multiple_choice' && (
                  <div className="question-options">
                    <label className="form-label">Options</label>
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="option-input">
                        <input
                          type="text"
                          className="form-control"
                          value={option}
                          onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                          placeholder={`Option ${optionIndex + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
                <div className="form-group">
                  <label className="flex items-center gap-8">
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(e) => handleQuestionChange(questionIndex, 'required', e.target.checked)}
                    />
                    Required Question
                  </label>
                </div>
              </div>
            ))}
          </div>
          <div className="modal__footer">
            <button type="button" className="btn btn--outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary">Save Assessment</button>
          </div>
        </form>
      </div>
    </div>
  );
}

