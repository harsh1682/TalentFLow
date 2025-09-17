import React from 'react';

export default function NotesDisplay({ notes, className = '' }) {
  if (!notes) return null;

  // Split text by mentions and render them with proper styling
  const renderNotes = (text) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className="mention-display">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className={`notes-display ${className}`}>
      {renderNotes(notes)}
    </div>
  );
}

