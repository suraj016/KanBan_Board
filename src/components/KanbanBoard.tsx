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

    const overColumn = columns.find((col) => col.id === overId);
    if (overColumn) {
      const targetCards = cards.filter((c) => c.columnId === overColumn.id);
      moveCard(activeId, overColumn.id as ColumnId, targetCards.length);
      setActiveId(null);
      return;
    }

    const overCard = cards.find((c) => c.id === overId);
    if (overCard) {
      const targetColumnId = overCard.columnId as ColumnId;
      const targetCards = cards.filter((c) => c.columnId === targetColumnId);
      const overIndex = targetCards.findIndex((c) => c.id === overId);
      
      if (activeCard.columnId === targetColumnId) {
        const activeIndex = targetCards.findIndex((c) => c.id === activeId);
        const newIndex = activeIndex < overIndex ? overIndex + 1 : overIndex;
        moveCard(activeId, targetColumnId, newIndex);
      } else {
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

