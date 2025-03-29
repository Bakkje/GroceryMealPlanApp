import React from 'react';

function Recipe({ recipe }) {
  return (
    <div className="card">
      <h3 className="card-title">{recipe.title}</h3>
      
      {recipe.image && (
        <img 
          src={recipe.image} 
          alt={recipe.title} 
          style={{ 
            width: '100%', 
            height: '200px', 
            objectFit: 'cover',
            borderRadius: '4px',
            marginBottom: '1rem'
          }} 
        />
      )}
      
      <div className="mb-2">
        <strong>Prep Time:</strong> {recipe.prepTime} minutes | 
        <strong> Cook Time:</strong> {recipe.cookTime} minutes
      </div>
      
      <h4>Ingredients:</h4>
      <ul className="mb-2">
        {recipe.ingredients && recipe.ingredients.map((ingredient, index) => (
          <li key={index}>{ingredient}</li>
        ))}
      </ul>
      
      <h4>Instructions:</h4>
      <ol className="mb-2">
        {recipe.instructions && recipe.instructions.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ol>
      
      <div className="mt-2">
        <button className="btn btn-secondary">Add to Shopping List</button>
      </div>
    </div>
  );
}

export default Recipe;
