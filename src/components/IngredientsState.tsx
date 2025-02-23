import { Recipe } from '@/types';
import { motion } from 'framer-motion';

interface IngredientsStateProps {
  recipe: Recipe;
  onStart: () => void;
  onBack: () => void;
}

export function IngredientsState({ recipe, onStart, onBack }: IngredientsStateProps) {
  // Group ingredients by aisle
  const groupedIngredients = recipe.recipe_ingredients.reduce((acc, ingredient) => {
    const aisle = ingredient.aisle || 'Other';
    if (!acc[aisle]) {
      acc[aisle] = [];
    }
    acc[aisle].push(ingredient);
    return acc;
  }, {} as Record<string, typeof recipe.recipe_ingredients>);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="ingredients-state"
    >
      <div className="ingredients-content">
        <h2 className="heading-step">Gather your ingredients</h2>
        <h3 className="heading-xl mb-8">{recipe.title}</h3>

        {Object.entries(groupedIngredients).map(([aisle, ingredients]) => (
          <div key={aisle} className="ingredient-group">
            <h4 className="heading-md mb-4">{aisle}</h4>
            <ul className="ingredient-list">
              {ingredients.map((ingredient) => (
                <li key={ingredient.ingredient} className="ingredient-item">
                  <span className="ingredient-amount">
                    {ingredient.amount} {ingredient.unit}
                  </span>
                  <span className="ingredient-name">
                    {ingredient.ingredient}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="action-bar">
        <button 
          onClick={onBack}
          className="nav-button nav-button--back"
        >
          <svg className="back-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
            <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/>
          </svg>
        </button>
        <button 
          onClick={onStart}
          className="nav-button nav-button--next"
        >
          <svg className="next-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
            <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/>
          </svg>
        </button>
      </div>
    </motion.div>
  );
} 