import React from 'react';
import { KanbanProvider } from './context/KanbanContext';
import { KanbanBoard } from './components/KanbanBoard';
import './App.css';

function App() {
  return (
    <KanbanProvider>
      <div className="app">
        <header className="app-header">
          <h1>Kanban Board</h1>
        </header>
        <main className="app-main">
          <KanbanBoard />
        </main>
      </div>
    </KanbanProvider>
  );
}

export default App;

