import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import GroceryList from '../components/GroceryList';

function Groceries() {
  const [groceryItems, setGroceryItems] = useState([
    { id: 1, name: 'Milk', quantity: '1 gallon', completed: false },
    { id: 2, name: 'Eggs', quantity: '1 dozen', completed: false },
    { id: 3, name: 'Bread', quantity: '1 loaf', completed: true },
    { id: 4, name: 'Apples', quantity: '6', completed: false },
  ]);

  const [newItem, setNewItem] = useState({ name: '', quantity: '' });

  const addItem = (e) => {
    e.preventDefault();
    if (newItem.name.trim() === '') return;
    
    const item = {
      id: Date.now(),
      name: newItem.name,
      quantity: newItem.quantity || '1',
      completed: false
    };
    
    setGroceryItems([...groceryItems, item]);
    setNewItem({ name: '', quantity: '' });
  };

  const toggleComplete = (id) => {
    setGroceryItems(
      groceryItems.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const deleteItem = (id) => {
    setGroceryItems(groceryItems.filter(item => item.id !== id));
  };

  return (
    <div>
      <header className="navbar">
        <h1>Grocery Lists</h1>
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
          <h2 className="card-title">My Grocery List</h2>
          
          <form onSubmit={addItem} className="mb-3">
            <div className="form-group">
              <input
                type="text"
                className="form-control"
                placeholder="Add new item..."
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                className="form-control"
                placeholder="Quantity"
                value={newItem.quantity}
                onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
              />
            </div>
            <button type="submit" className="btn">Add Item</button>
          </form>
          
          <GroceryList 
            items={groceryItems} 
            onToggleComplete={toggleComplete}
            onDeleteItem={deleteItem}
          />
        </div>
      </main>
    </div>
  );
}

export default Groceries;
