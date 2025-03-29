import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MealPlan from '../components/MealPlan';

function Meals() {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const [mealPlan, setMealPlan] = useState({
    Monday: { breakfast: '', lunch: '', dinner: '' },
    Tuesday: { breakfast: '', lunch: '', dinner: '' },
    Wednesday: { breakfast: '', lunch: '', dinner: '' },
    Thursday: { breakfast: '', lunch: '', dinner: '' },
    Friday: { breakfast: '', lunch: '', dinner: '' },
    Saturday: { breakfast: '', lunch: '', dinner: '' },
    Sunday: { breakfast: '', lunch: '', dinner: '' },
  });

  const updateMeal = (day, mealTime, value) => {
    setMealPlan({
      ...mealPlan,
      [day]: {
        ...mealPlan[day],
        [mealTime]: value
      }
    });
  };

  return (
    <div>
      <header className="navbar">
        <h1>Meal Planning</h1>
        <nav>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/groceries">Groceries</Link></li>
            <li><Link to="/meals">Meal Plan</Link></li>
          </ul>
        </nav>
      </header>
      
      <main className="container">
        <div className="card mt-3">
          <h2 className="card-title">Weekly Meal Plan</h2>
          <p className="mb-2">Plan your meals for the entire week</p>
          
          <MealPlan 
            daysOfWeek={daysOfWeek}
            mealPlan={mealPlan}
            onUpdateMeal={updateMeal}
          />
          
          <div className="mt-3">
            <button className="btn">Generate Shopping List</button>
            <button className="btn btn-secondary" style={{ marginLeft: '1rem' }}>Save Meal Plan</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Meals;
