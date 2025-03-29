import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <header className="navbar">
        <h1>Grocery & Meal Planner</h1>
        <nav>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/groceries">Groceries</Link></li>
            <li><Link to="/meals">Meal Plan</Link></li>
          </ul>
        </nav>
      </header>
      
      <main className="container">
        <div className="mt-3 text-center">
          <h2>Welcome to Your Grocery & Meal Planner</h2>
          <p className="mb-3">Manage your grocery lists and plan your meals in one place</p>
        </div>
        
        <div className="grid mt-3">
          <div className="card">
            <h3 className="card-title">Grocery Lists</h3>
            <p>Create and manage your grocery shopping lists</p>
            <Link to="/groceries" className="btn mt-2">View Groceries</Link>
          </div>
          
          <div className="card">
            <h3 className="card-title">Meal Planning</h3>
            <p>Plan your meals for the week ahead</p>
            <Link to="/meals" className="btn mt-2">View Meal Plan</Link>
          </div>
          
          <div className="card">
            <h3 className="card-title">Recipes</h3>
            <p>Browse and save your favorite recipes</p>
            <button className="btn mt-2">Coming Soon</button>
          </div>
        </div>
      </main>
      
      <footer className="text-center mt-3">
        <p>Grocery & Meal Planner - Your personal food organizer</p>
      </footer>
    </div>
  );
}

export default Home;
