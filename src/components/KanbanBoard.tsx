import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { Column } from './Column';
import { Card } from './Card';
import { useKanban } from '../context/KanbanContext';
import { ColumnId } from '../types';
import './KanbanBoard.css';

export const KanbanBoard: React.FC = () => {
  const { cards, columns, moveCard } = useKanban();
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeCard = cards.find((c) => c.id === activeId);
    if (!activeCard) {
      setActiveId(null);
      return;
    }

    // Check if dropped on a column
    const overColumn = columns.find((col) => col.id === overId);
    if (overColumn) {
      const targetColumnCards = cards
        .filter((c) => c.columnId === overColumn.id)
        .map((c) => c.id);
      const newIndex = targetColumnCards.length;
      moveCard(activeId, overColumn.id as ColumnId, newIndex);
      setActiveId(null);
      return;
    }

    // Check if dropped on another card
    const overCard = cards.find((c) => c.id === overId);
    if (overCard) {
      const targetColumnId = overCard.columnId as ColumnId;
      const targetColumnCards = cards
        .filter((c) => c.columnId === targetColumnId)
        .map((c) => c.id);
      const overIndex = targetColumnCards.indexOf(overId);
      
      // Calculate the correct insertion index
      if (activeCard.columnId === targetColumnId) {
        // Moving within the same column
        const activeIndex = targetColumnCards.indexOf(activeId);
        let newIndex = overIndex;
        // If dragging down, insert after the target; if dragging up, insert before
        if (activeIndex < overIndex) {
          newIndex = overIndex + 1;
        } else {
          newIndex = overIndex;
        }
        moveCard(activeId, targetColumnId, newIndex);
      } else {
        // Moving to a different column - insert at the position of the target card
        moveCard(activeId, targetColumnId, overIndex);
      }
      setActiveId(null);
      return;
    }

    setActiveId(null);
  };

  const activeCard = activeId ? cards.find((c) => c.id === activeId) : null;
  const activeColumn = activeCard
    ? columns.find((col) => col.id === activeCard.columnId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board">
        {columns.map((column) => (
          <Column key={column.id} column={column} />
        ))}
      </div>
      <DragOverlay>
        {activeCard && activeColumn ? (
          <div className="card-overlay">
            <Card card={activeCard} columnColor={activeColumn.color} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

