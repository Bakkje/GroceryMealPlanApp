import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/main.css';

// Import pages
import Home from './pages/Home';
import Groceries from './pages/Groceries';
import Meals from './pages/Meals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/groceries" element={<Groceries />} />
        <Route path="/meals" element={<Meals />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
