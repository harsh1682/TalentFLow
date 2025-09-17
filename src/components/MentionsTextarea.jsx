import React, { useState, useRef, useEffect } from 'react';

export default function MentionsTextarea({ 
  value, 
  onChange, 
  placeholder = "Type @ to mention someone...",
  suggestions = [],
  className = "form-control"
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState(-1);
  const [mentionQuery, setMentionQuery] = useState('');
  const textareaRef = useRef(null);
  const suggestionsRef = useRef(null);

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const handleTextChange = (e) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    // Find the last @ symbol before cursor
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      // Check if there's no space between @ and cursor
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      if (!textAfterAt.includes(' ')) {
        setMentionStart(lastAtIndex);
        setMentionQuery(textAfterAt);
        setShowSuggestions(true);
        setSuggestionIndex(0);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
    
    onChange(e);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSuggestionIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (filteredSuggestions.length > 0) {
          insertMention(filteredSuggestions[suggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  const insertMention = (mention) => {
    const textarea = textareaRef.current;
    const start = mentionStart;
    const end = textarea.selectionStart;
    const beforeMention = value.substring(0, start);
    const afterMention = value.substring(end);
    const newValue = beforeMention + `@${mention} ` + afterMention;
    
    onChange({ target: { value: newValue } });
    setShowSuggestions(false);
    
    // Focus back to textarea after a brief delay
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        beforeMention.length + mention.length + 2,
        beforeMention.length + mention.length + 2
      );
    }, 0);
  };

  const handleSuggestionClick = (suggestion) => {
    insertMention(suggestion);
  };

  const handleBlur = (e) => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false);
      }
    }, 150);
  };

  const renderValueWithMentions = (text) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className="mention">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="mentions-container" style={{ position: 'relative' }}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
        rows="3"
      />
      
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="mentions-suggestions"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-base)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto'
          }}
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              className={`mentions-suggestion ${index === suggestionIndex ? 'mentions-suggestion--active' : ''}`}
              onClick={() => handleSuggestionClick(suggestion)}
              style={{
                padding: 'var(--space-8) var(--space-12)',
                cursor: 'pointer',
                backgroundColor: index === suggestionIndex ? 'var(--color-primary-50)' : 'transparent',
                color: 'var(--color-text)',
                fontSize: 'var(--font-size-sm)'
              }}
            >
              @{suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

