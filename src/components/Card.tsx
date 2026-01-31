import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card as CardType } from '../types';
import { useKanban } from '../context/KanbanContext';
import './Card.css';

interface CardProps {
  card: CardType;
  columnColor: string;
}

export const Card: React.FC<CardProps> = ({ card, columnColor }) => {
  const { deleteCard, updateCardTitle } = useKanban();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'card',
      card,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    const trimmedTitle = title.trim();
    if (trimmedTitle && trimmedTitle !== card.title) {
      updateCardTitle(card.id, trimmedTitle);
    } else {
      setTitle(card.title);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setTitle(card.title);
      setIsEditing(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteCard(card.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`card ${isDragging ? 'dragging' : ''}`}
      onDoubleClick={handleDoubleClick}
    >
      <div className="card-indicator" style={{ backgroundColor: columnColor }} />
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="card-input"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="card-title">{card.title}</span>
      )}
      <button
        className="card-delete"
        onClick={handleDelete}
        aria-label="Delete card"
        title="Delete card"
      >
        🗑️
      </button>
    </div>
  );
};

