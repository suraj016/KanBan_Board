export interface Card {
  id: string;
  title: string;
  columnId: string;
}

export interface Column {
  id: string;
  title: string;
  color: string;
}

export type ColumnId = 'todo' | 'in-progress' | 'done';

