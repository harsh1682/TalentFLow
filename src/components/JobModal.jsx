import React, { useEffect, useState } from 'react';

export default function JobModal({ isOpen, onClose, onSave, job = null }) {
  const [formData, setFormData] = useState({
    title: job?.title || '',
    slug: job?.slug || '',
    description: job?.description || '',
    requirements: job?.requirements || '',
    tags: job?.tags?.join(', ') || '',
    status: job?.status || 'active'
  });

  // Sync form when a different job is selected or modal opens
  useEffect(() => {
    if (!isOpen) return;
    setFormData({
      title: job?.title || '',
      slug: job?.slug || '',
      description: job?.description || '',
      requirements: job?.requirements || '',
      tags: job?.tags?.join(', ') || '',
      status: job?.status || 'active'
    });
  }, [job, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const jobData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      id: job?.id || Date.now(),
      order: job?.order || 0
    };
    onSave(jobData);
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
          <h3>{job ? 'Edit Job' : 'Create New Job'}</h3>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal__body modal__body--scrollable">
            <div className="form-group">
              <label className="form-label">Job Title</label>
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
              <label className="form-label">Job Slug</label>
              <input
                type="text"
                name="slug"
                className="form-control"
                value={formData.slug}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-control"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Requirements</label>
              <textarea
                name="requirements"
                className="form-control"
                rows="4"
                value={formData.requirements}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input
                type="text"
                name="tags"
                className="form-control"
                value={formData.tags}
                onChange={handleChange}
                placeholder="React, JavaScript, Remote"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                name="status"
                className="form-control"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div className="modal__footer">
            <button type="button" className="btn btn--outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary">Save Job</button>
          </div>
        </form>
      </div>
    </div>
  );
}
