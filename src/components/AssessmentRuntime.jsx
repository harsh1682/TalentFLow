import React, { useEffect, useMemo, useState } from 'react';

// Local storage helpers
function getDraftKey(jobId) {
  return `talentflow_assessment_draft_${jobId}`;
}

function getResponseKey(jobId, candidateId) {
  return `talentflow_assessment_response_${jobId}_${candidateId}`;
}

export default function AssessmentRuntime({ assessment, candidateId = 'demo', onSubmit }) {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const jobId = assessment?.jobId;

  // Load last response for this candidate if present
  useEffect(() => {
    if (!jobId || !candidateId) return;
    try {
      const saved = JSON.parse(localStorage.getItem(getResponseKey(jobId, candidateId)) || 'null');
      if (saved && saved.values) setValues(saved.values);
    } catch {}
  }, [jobId, candidateId]);

  const questionsList = useMemo(() => {
    if (!assessment?.sections) return [];
    const list = [];
    assessment.sections.forEach(section => {
      section.questions.forEach(q => list.push({ ...q, sectionId: section.id }));
    });
    return list;
  }, [assessment]);

  const isQuestionVisible = (q) => {
    if (!q?.showIf) return true;
    const { questionId, equalsValue } = q.showIf;
    if (!questionId) return true;
    const val = values[questionId];
    if (Array.isArray(val)) return val.includes(equalsValue);
    return val === equalsValue;
  };

  const validate = () => {
    const newErrors = {};
    questionsList.forEach(q => {
      if (!isQuestionVisible(q)) return;
      const val = values[q.id];
      if (q.required) {
        const empty = (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0));
        if (empty) newErrors[q.id] = 'This field is required';
      }
      if (q.type === 'numeric' && val !== undefined && val !== '') {
        const num = Number(val);
        if (Number.isNaN(num)) newErrors[q.id] = 'Enter a valid number';
        if (q.min != null && num < q.min) newErrors[q.id] = `Must be >= ${q.min}`;
        if (q.max != null && num > q.max) newErrors[q.id] = `Must be <= ${q.max}`;
      }
      if ((q.type === 'short_text' || q.type === 'long_text') && q.maxLength && typeof val === 'string') {
        if (val.length > q.maxLength) newErrors[q.id] = `Max length is ${q.maxLength}`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!assessment) return;
    if (!validate()) return;
    const payload = {
      assessmentId: assessment.id,
      jobId: assessment.jobId,
      candidateId,
      submittedAt: new Date().toISOString(),
      values,
    };
    try {
      localStorage.setItem(getResponseKey(assessment.jobId, candidateId), JSON.stringify(payload));
      // Also append to a list for history
      const listKey = `talentflow_assessment_responses_${assessment.jobId}`;
      const list = JSON.parse(localStorage.getItem(listKey) || '[]');
      list.push(payload);
      localStorage.setItem(listKey, JSON.stringify(list));
    } catch {}
    if (onSubmit) onSubmit(payload);
  };

  const handleChange = (q, next) => {
    setValues(prev => ({ ...prev, [q.id]: next }));
  };

  if (!assessment) return null;

  return (
    <form className="assessment-preview" onSubmit={handleSubmit}>
      {assessment.sections.map(section => (
        <div key={section.id} className="assessment-form-section">
          <h3>{section.title}</h3>
          {section.questions.map((q) => isQuestionVisible(q) && (
            <div key={q.id} className="assessment-question">
              <label className="form-label">
                {q.text} {q.required && <span className="required-indicator">*</span>}
              </label>
              {(q.type === 'single_choice' || q.type === 'multi_choice') && (
                <div className="assessment-options">
                  {q.options.map((opt, idx) => (
                    <label key={idx} className="assessment-option">
                      <input
                        type={q.type === 'single_choice' ? 'radio' : 'checkbox'}
                        name={`q-${q.id}`}
                        checked={q.type === 'single_choice' ? values[q.id] === opt : Array.isArray(values[q.id]) && values[q.id].includes(opt)}
                        onChange={(e) => {
                          if (q.type === 'single_choice') handleChange(q, opt);
                          else {
                            const arr = Array.isArray(values[q.id]) ? values[q.id].slice() : [];
                            if (e.target.checked) {
                              if (!arr.includes(opt)) arr.push(opt);
                            } else {
                              const i = arr.indexOf(opt);
                              if (i >= 0) arr.splice(i, 1);
                            }
                            handleChange(q, arr);
                          }
                        }}
                      />
                      <span>{opt || `Option ${idx + 1}`}</span>
                    </label>
                  ))}
                </div>
              )}
              {q.type === 'short_text' && (
                <input
                  className="form-control"
                  value={values[q.id] || ''}
                  maxLength={q.maxLength || undefined}
                  onChange={(e) => handleChange(q, e.target.value)}
                />
              )}
              {q.type === 'long_text' && (
                <textarea
                  className="form-control"
                  rows="4"
                  value={values[q.id] || ''}
                  maxLength={q.maxLength || undefined}
                  onChange={(e) => handleChange(q, e.target.value)}
                />
              )}
              {q.type === 'numeric' && (
                <input
                  className="form-control"
                  type="number"
                  value={values[q.id] ?? ''}
                  min={q.min != null ? q.min : undefined}
                  max={q.max != null ? q.max : undefined}
                  onChange={(e) => handleChange(q, e.target.value)}
                />
              )}
              {q.type === 'file' && (
                <input
                  className="form-control"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    handleChange(q, file ? { name: file.name, size: file.size, type: file.type } : null);
                  }}
                />
              )}
              {errors[q.id] && <div className="error" role="alert">{errors[q.id]}</div>}
            </div>
          ))}
        </div>
      ))}
      <div className="text-right">
        <button type="submit" className="btn btn--primary">Submit Responses</button>
      </div>
    </form>
  );
}


