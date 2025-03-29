import React from 'react';

function MealPlan({ daysOfWeek, mealPlan, onUpdateMeal }) {
  return (
    <div className="meal-plan">
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={tableHeaderStyle}>Day</th>
            <th style={tableHeaderStyle}>Breakfast</th>
            <th style={tableHeaderStyle}>Lunch</th>
            <th style={tableHeaderStyle}>Dinner</th>
          </tr>
        </thead>
        <tbody>
          {daysOfWeek.map(day => (
            <tr key={day}>
              <td style={tableCellStyle}>
                <strong>{day}</strong>
              </td>
              <td style={tableCellStyle}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Breakfast"
                  value={mealPlan[day].breakfast}
                  onChange={(e) => onUpdateMeal(day, 'breakfast', e.target.value)}
                />
              </td>
              <td style={tableCellStyle}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Lunch"
                  value={mealPlan[day].lunch}
                  onChange={(e) => onUpdateMeal(day, 'lunch', e.target.value)}
                />
              </td>
              <td style={tableCellStyle}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Dinner"
                  value={mealPlan[day].dinner}
                  onChange={(e) => onUpdateMeal(day, 'dinner', e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const tableHeaderStyle = {
  textAlign: 'left',
  padding: '10px',
  backgroundColor: '#f8f9fa',
  borderBottom: '2px solid #dee2e6'
};

const tableCellStyle = {
  padding: '10px',
  borderBottom: '1px solid #dee2e6'
};

export default MealPlan;
