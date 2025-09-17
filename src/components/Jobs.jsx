import React, { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useData } from '../store/DataProvider.jsx';
import { useOptimisticUpdate } from '../hooks/useOptimisticUpdate.js';
import { useError } from '../contexts/ErrorContext.jsx';
import JobModal from './JobModal.jsx';
import { useParams } from 'react-router-dom';

export default function Jobs() {
  const { jobs, setJobs } = useData();
  const { showError, showSuccess } = useError();
  const { jobId } = useParams();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [tags, setTags] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [isReordering, setIsReordering] = useState(false);
  const pageSize = 6;

  // Store original jobs for rollback
  const [originalJobs, setOriginalJobs] = useState(jobs);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    const t = tags.toLowerCase();
    return jobs
      .filter(j => (j.title.toLowerCase().includes(s) || j.slug.toLowerCase().includes(s)))
      .filter(j => !status || j.status === status)
      .filter(j => !t || j.tags.some(tag => tag.toLowerCase().includes(t)))
      .sort((a, b) => a.order - b.order);
  }, [jobs, search, status, tags]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const pageItems = filtered.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

  const toggleStatus = async (id) => {
    // Optimistic toggle with rollback on failure
    const original = [...jobs];
    const next = jobs.map(j => j.id === id ? { ...j, status: j.status === 'active' ? 'archived' : 'active' } : j);
    setJobs(next);
    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // 10% failure chance to simulate server error
          if (Math.random() < 0.1) reject(new Error('Failed to update status'));
          else resolve();
        }, 700);
      });
      const updated = next.find(j => j.id === id);
      showSuccess(updated.status === 'archived' ? 'Job archived' : 'Job unarchived');
    } catch (e) {
      setJobs(original);
      showError('Could not update job status. Reverted changes.');
      console.error(e);
    }
  };

  const handleSaveJob = async (jobData) => {
    try {
      // Store original state for rollback
      setOriginalJobs([...jobs]);
      
      if (editingJob) {
        setJobs(jobs.map(j => j.id === editingJob.id ? { ...jobData, id: editingJob.id } : j));
      } else {
        setJobs([...jobs, { ...jobData, order: jobs.length }]);
      }
      
      // Simulate API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // 10% chance of failure for testing
          if (Math.random() < 0.1) {
            reject(new Error('Failed to save job on server'));
          } else {
            resolve();
          }
        }, 800);
      });
      
      showSuccess(editingJob ? 'Job updated successfully' : 'Job created successfully');
      setEditingJob(null);
    } catch (error) {
      // Rollback on failure
      setJobs(originalJobs);
      showError('Failed to save job. Please try again.');
      console.error('Job save failed:', error);
    }
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowModal(true);
  };

  const handleCreateJob = () => {
    setEditingJob(null);
    setShowModal(true);
  };

  // Open modal prefilled when visiting /jobs/:jobId
  useEffect(() => {
    if (jobId) {
      const idNum = parseInt(jobId, 10);
      const job = jobs.find(j => j.id === idNum);
      if (job) {
        setEditingJob(job);
        setShowModal(true);
      }
    }
  }, [jobId, jobs]);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = filtered.findIndex(job => job.id === active.id);
    const newIndex = filtered.findIndex(job => job.id === over.id);

    if (oldIndex !== newIndex) {
      // Store original state for rollback
      setOriginalJobs([...jobs]);
      
      // Optimistic update
      const reorderedJobs = arrayMove(filtered, oldIndex, newIndex);
      const updatedJobs = reorderedJobs.map((job, index) => ({
        ...job,
        order: index
      }));

      // Update the jobs with new order
      const newJobs = jobs.map(job => {
        const reorderedJob = updatedJobs.find(uj => uj.id === job.id);
        return reorderedJob ? reorderedJob : job;
      });

      setJobs(newJobs);
      setIsReordering(true);

      try {
        // Simulate API call with potential failure
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            // 15% chance of failure for testing
            if (Math.random() < 0.15) {
              reject(new Error('Failed to reorder jobs on server'));
            } else {
              resolve();
            }
          }, 1000);
        });
        
        showSuccess('Jobs reordered successfully');
      } catch (error) {
        // Rollback on failure
        setJobs(originalJobs);
        showError('Failed to reorder jobs. Changes have been reverted.');
        console.error('Job reordering failed:', error);
      } finally {
        setIsReordering(false);
      }
    }
  };

  // Sortable Job Card Component
  function SortableJobCard({ job, onEdit, onToggleStatus }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: job.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        // Only start drag when using the drag handle to prevent action clicks from dragging
        className={`job-card ${isDragging ? 'job-card--dragging' : ''}`}
      >
        <div className="job-card__header">
          <h3 className="job-card__title">{job.title}</h3>
          <div className="job-card__actions">
            <button className="job-card__action" title="Edit" onClick={(e) => { e.stopPropagation(); onEdit(job); }}>Edit</button>
            <button className="job-card__action" title={job.status === 'active' ? 'Archive' : 'Unarchive'} onClick={(e) => { e.stopPropagation(); onToggleStatus(job.id); }}>
              {job.status === 'active' ? 'Archive' : 'Unarchive'}
            </button>
          </div>
        </div>
        <div className="job-card__slug">{job.slug}</div>
        <div className="job-card__tags">
          {job.tags.map(tag => (<span className="job-tag" key={tag}>{tag}</span>))}
        </div>
        <div className="job-card__status">
          <span className={`status ${job.status === 'active' ? 'status--success' : 'status--info'}`}>{job.status}</span>
        </div>
        <div className="job-card__drag-handle" {...listeners}>
          <span>⋮⋮</span>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content" id="jobs-tab">
      <div className="page-header">
        <div className="page-header__content">
          <h2>Job Listings</h2>
          <button className="btn btn--primary" onClick={handleCreateJob}>Create Job</button>
        </div>
        <div className="filters">
          <input className="form-control" placeholder="Search jobs..." value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} />
          <select className="form-control" value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
          <input className="form-control" placeholder="Filter by tags..." value={tags} onChange={(e) => { setPage(1); setTags(e.target.value); }} />
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="jobs-grid">
          <SortableContext items={pageItems.map(job => job.id)} strategy={verticalListSortingStrategy}>
            {pageItems.map(job => (
              <SortableJobCard
                key={job.id}
                job={job}
                onEdit={handleEditJob}
                onToggleStatus={toggleStatus}
              />
            ))}
          </SortableContext>
        </div>
        
        <DragOverlay>
          {activeId ? (
            <div className="job-card job-card--dragging">
              <div className="job-card__header">
                <h3 className="job-card__title">{filtered.find(j => j.id === activeId)?.title}</h3>
                <div className="job-card__actions">
                  <button className="job-card__action" disabled>Edit</button>
                  <button className="job-card__action" disabled>Archive</button>
                </div>
              </div>
              <div className="job-card__slug">{filtered.find(j => j.id === activeId)?.slug}</div>
              <div className="job-card__tags">
                {filtered.find(j => j.id === activeId)?.tags.map(tag => (<span className="job-tag" key={tag}>{tag}</span>))}
              </div>
              <div className="job-card__status">
                <span className={`status ${filtered.find(j => j.id === activeId)?.status === 'active' ? 'status--success' : 'status--info'}`}>
                  {filtered.find(j => j.id === activeId)?.status}
                </span>
              </div>
              <div className="job-card__drag-handle">
                <span>⋮⋮</span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {isReordering && (
        <div className="reorder-indicator">
          <span>Reordering jobs...</span>
        </div>
      )}

      <div className="pagination">
        <button className="pagination-btn" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 10).map(i => (
          <button key={i} className={`pagination-btn ${i === page ? 'pagination-btn--active' : ''}`} onClick={() => setPage(i)}>{i}</button>
        ))}
        <button className="pagination-btn" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
      </div>

      <JobModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveJob}
        job={editingJob}
      />
    </div>
  );
}


