import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Column as ColumnType, ColumnId } from '../types';
import { useKanban } from '../context/KanbanContext';
import { Card } from './Card';
import './Column.css';

interface ColumnProps {
  column: ColumnType;
}

export const Column: React.FC<ColumnProps> = ({ column }) => {
  const { cards, addCard } = useKanban();
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');

  const columnCards = cards
    .filter((card) => card.columnId === column.id)
    .map((card) => card.id);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      addCard(column.id as ColumnId, newCardTitle.trim());
      setNewCardTitle('');
      setIsAddingCard(false);
    }
  };

  const handleCancel = () => {
    setNewCardTitle('');
    setIsAddingCard(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddCard();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div
      className={`column ${isOver ? 'drag-over' : ''}`}
      ref={setNodeRef}
    >
      <div
        className="column-header"
        style={{ backgroundColor: column.color }}
      >
        <div className="column-title-wrapper">
          <h2 className="column-title">{column.title}</h2>
          <span className="column-count">{columnCards.length}</span>
        </div>
        <button
          className="column-add-button"
          onClick={() => setIsAddingCard(true)}
          aria-label={`Add card to ${column.title}`}
        >
          +
        </button>
      </div>

      {isAddingCard && (
        <div className="add-card-form">
          <input
            type="text"
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter card title..."
            className="add-card-input"
            autoFocus
          />
          <div className="add-card-actions">
            <button onClick={handleAddCard} className="add-card-submit">
              Add
            </button>
            <button onClick={handleCancel} className="add-card-cancel">
              Cancel
            </button>
          </div>
        </div>
      )}

      <button
        className="add-card-button"
        onClick={() => setIsAddingCard(true)}
        style={{ display: isAddingCard ? 'none' : 'block' }}
      >
        + Add Card
      </button>

      <SortableContext
        items={columnCards}
        strategy={verticalListSortingStrategy}
      >
        <div className="column-cards">
          {cards
            .filter((card) => card.columnId === column.id)
            .map((card) => (
              <Card key={card.id} card={card} columnColor={column.color} />
            ))}
        </div>
      </SortableContext>
    </div>
  );
};

