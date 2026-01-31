import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Card, Column, ColumnId } from '../types';

interface KanbanContextType {
  cards: Card[];
  columns: Column[];
  addCard: (columnId: ColumnId, title: string) => void;
  deleteCard: (cardId: string) => void;
  updateCardTitle: (cardId: string, title: string) => void;
  moveCard: (cardId: string, targetColumnId: ColumnId, newIndex: number) => void;
}

const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

const initialColumns: Column[] = [
  { id: 'todo', title: 'Todo', color: '#3b82f6' },
  { id: 'in-progress', title: 'In Progress', color: '#f97316' },
  { id: 'done', title: 'Done', color: '#22c55e' },
];

const initialCards: Card[] = [
  { id: '1', title: 'Create initial project plan', columnId: 'todo' },
  { id: '2', title: 'Design landing page', columnId: 'todo' },
  { id: '3', title: 'Review codebase structure', columnId: 'todo' },
  { id: '4', title: 'Implement authentication', columnId: 'in-progress' },
  { id: '5', title: 'Set up database schema', columnId: 'in-progress' },
  { id: '6', title: 'Fix navbar bugs', columnId: 'in-progress' },
  { id: '7', title: 'Organize project repository', columnId: 'done' },
  { id: '8', title: 'Write API documentation', columnId: 'done' },
];

export const KanbanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [columns] = useState<Column[]>(initialColumns);

  const addCard = (columnId: ColumnId, title: string) => {
    const newCard: Card = {
      id: Date.now().toString(),
      title,
      columnId,
    };
    setCards((prev) => [...prev, newCard]);
  };

  const deleteCard = (cardId: string) => {
    setCards((prev) => prev.filter((card) => card.id !== cardId));
  };

  const updateCardTitle = (cardId: string, title: string) => {
    setCards((prev) =>
      prev.map((card) => (card.id === cardId ? { ...card, title } : card))
    );
  };

  const moveCard = (cardId: string, targetColumnId: ColumnId, newIndex: number) => {
    setCards((prev) => {
      const card = prev.find((c) => c.id === cardId);
      if (!card) return prev;

      // If moving within the same column, handle reordering
      if (card.columnId === targetColumnId) {
        const columnCards = prev.filter((c) => c.columnId === targetColumnId);
        const otherCards = prev.filter((c) => c.columnId !== targetColumnId);
        const oldIndex = columnCards.findIndex((c) => c.id === cardId);
        
        if (oldIndex === newIndex) return prev;

        const reorderedColumnCards = [...columnCards];
        const [movedCard] = reorderedColumnCards.splice(oldIndex, 1);
        reorderedColumnCards.splice(newIndex, 0, movedCard);

        return [...otherCards, ...reorderedColumnCards];
      }

      // Moving to a different column
      const otherCards = prev.filter((c) => c.id !== cardId);
      const targetColumnCards = otherCards.filter((c) => c.columnId === targetColumnId);
      const nonTargetCards = otherCards.filter((c) => c.columnId !== targetColumnId);

      const beforeCards = targetColumnCards.slice(0, newIndex);
      const afterCards = targetColumnCards.slice(newIndex);

      return [
        ...nonTargetCards,
        ...beforeCards,
        { ...card, columnId: targetColumnId },
        ...afterCards,
      ];
    });
  };

  return (
    <KanbanContext.Provider
      value={{
        cards,
        columns,
        addCard,
        deleteCard,
        updateCardTitle,
        moveCard,
      }}
    >
      {children}
    </KanbanContext.Provider>
  );
};

export const useKanban = () => {
  const context = useContext(KanbanContext);
  if (!context) {
    throw new Error('useKanban must be used within a KanbanProvider');
  }
  return context;
};

