import React from 'react';

function GroceryList({ items, onToggleComplete, onDeleteItem }) {
  if (items.length === 0) {
    return <p>Your grocery list is empty. Add some items above!</p>;
  }

  return (
    <div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map(item => (
          <li key={item.id} className="list-item">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => onToggleComplete(item.id)}
                style={{ marginRight: '10px' }}
              />
              <div>
                <span style={{ 
                  textDecoration: item.completed ? 'line-through' : 'none',
                  marginRight: '10px',
                  fontWeight: 500
                }}>
                  {item.name}
                </span>
                <span style={{ color: '#666', fontSize: '0.9rem' }}>
                  {item.quantity}
                </span>
              </div>
            </div>
            <button 
              onClick={() => onDeleteItem(item.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ff6b6b',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GroceryList;
