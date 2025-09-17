import React, { useState, useMemo } from 'react';
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
import { useDroppable } from '@dnd-kit/core';
import NotesDisplay from './NotesDisplay.jsx';

const stages = [
  { id: 'applied', name: 'Applied', color: 'status--info' },
  { id: 'screen', name: 'Screen', color: 'status--warning' },
  { id: 'tech', name: 'Technical', color: 'status--warning' },
  { id: 'offer', name: 'Offer', color: 'status--success' },
  { id: 'hired', name: 'Hired', color: 'status--success' },
  { id: 'rejected', name: 'Rejected', color: 'status--error' },
];

function SortableCandidate({ candidate, jobTitleById, onEdit, onViewProfile }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: candidate.id });

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
      {...listeners}
      className="kanban-candidate"
      onClick={() => onViewProfile ? onViewProfile(candidate) : onEdit(candidate)}
    >
      <div className="kanban-candidate__header">
        <h4 className="kanban-candidate__name">{candidate.name}</h4>
        <span className="kanban-candidate__job">{jobTitleById(candidate.jobId)}</span>
      </div>
      <div className="kanban-candidate__details">
        <p className="kanban-candidate__email">{candidate.email}</p>
        {candidate.notes && (
          <NotesDisplay 
            notes={candidate.notes} 
            className="kanban-candidate__notes"
          />
        )}
      </div>
    </div>
  );
}

function KanbanColumn({ stage, candidates, jobTitleById, onEdit, onViewProfile }) {
  const { setNodeRef } = useDroppable({ id: stage.id });
  return (
    <div className="kanban-column">
      <div className="kanban-column__header">
        <h3 className="kanban-column__title">{stage.name}</h3>
        <span className="kanban-column__count">{candidates.length}</span>
      </div>
      <div className="kanban-column__content" ref={setNodeRef}>
        <SortableContext items={candidates.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {candidates.map(candidate => (
            <SortableCandidate
              key={candidate.id}
              candidate={candidate}
              jobTitleById={jobTitleById}
              onEdit={onEdit}
              onViewProfile={onViewProfile}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export default function KanbanBoard({ onEditCandidate, onViewProfile }) {
  const { candidates, jobs, setCandidates } = useData();
  const [activeId, setActiveId] = useState(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const jobTitleById = (id) => jobs.find(j => j.id === id)?.title || 'No Job';

  const candidatesByStage = useMemo(() => {
    const grouped = {};
    stages.forEach(stage => {
      const stageCandidates = candidates
        .filter(c => c.stage === stage.id)
        .slice()
        .sort((a, b) => {
          const ao = typeof a.order === 'number' ? a.order : a.id;
          const bo = typeof b.order === 'number' ? b.order : b.id;
          return ao - bo;
        });
      grouped[stage.id] = stageCandidates;
    });
    return grouped;
  }, [candidates]);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeCandidate = candidates.find(c => c.id === active.id);
    if (!activeCandidate) return;

    let targetStage = null;
    // If dropped over a column, over.id will be the stage id
    if (stages.some(s => s.id === over.id)) {
      targetStage = over.id;
    } else {
      // Otherwise over is another candidate card; infer its stage
      const overCandidate = candidates.find(c => c.id === over.id);
      if (overCandidate) targetStage = overCandidate.stage;
    }

    if (targetStage && targetStage !== activeCandidate.stage) {
      // Update the candidate's stage
      setCandidates(candidates.map(candidate => 
        candidate.id === active.id 
          ? { ...candidate, stage: targetStage }
          : candidate
      ));
    } else if (over.id !== active.id) {
      // Reorder within the same stage
      const overCandidate = candidates.find(c => c.id === over.id);
      if (overCandidate && overCandidate.stage === activeCandidate.stage) {
        const stageCandidates = candidatesByStage[activeCandidate.stage];
        const oldIndex = stageCandidates.findIndex(c => c.id === active.id);
        const newIndex = stageCandidates.findIndex(c => c.id === over.id);
        
        if (oldIndex !== newIndex) {
          const reorderedCandidates = arrayMove(stageCandidates, oldIndex, newIndex);
          const updatedCandidates = candidates.map(candidate => {
            const reorderedIndex = reorderedCandidates.findIndex(rc => rc.id === candidate.id);
            if (reorderedIndex !== -1) {
              return { ...candidate, order: reorderedIndex };
            }
            return candidate;
          });
          setCandidates(updatedCandidates);
        }
      }
    }
  };

  const activeCandidate = activeId ? candidates.find(c => c.id === activeId) : null;

  return (
    <div className="kanban-board">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban-columns">
          {stages.map(stage => (
            <div
              key={stage.id}
              data-type="column"
              data-stage-id={stage.id}
              className="kanban-column-wrapper"
            >
              <KanbanColumn
                stage={stage}
                candidates={candidatesByStage[stage.id] || []}
                jobTitleById={jobTitleById}
                onEdit={onEditCandidate}
                onViewProfile={onViewProfile}
              />
            </div>
          ))}
        </div>
        
        <DragOverlay>
          {activeCandidate ? (
            <div className="kanban-candidate kanban-candidate--dragging">
              <div className="kanban-candidate__header">
                <h4 className="kanban-candidate__name">{activeCandidate.name}</h4>
                <span className="kanban-candidate__job">{jobTitleById(activeCandidate.jobId)}</span>
              </div>
              <div className="kanban-candidate__details">
                <p className="kanban-candidate__email">{activeCandidate.email}</p>
                {activeCandidate.notes && (
                  <NotesDisplay 
                    notes={activeCandidate.notes} 
                    className="kanban-candidate__notes"
                  />
                )}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
