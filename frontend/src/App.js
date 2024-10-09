import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ConditionalFooter from './components/Footer/ConditionalFooter';
import ConditionalHeader from './components/Header/ConditionalHeader';

function App() {
  return (
    <Router>
      <div className="App flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
        <main className="flex-grow">
        <ConditionalHeader />
        <Routes>
          <Route path="/" element={<Home />} />
          </Routes>
        </main>
        <ConditionalFooter />
      </div>
    </Router>
  );
}

export default App;