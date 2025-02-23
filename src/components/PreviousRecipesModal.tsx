import { Recipe } from '@/types';
import { motion } from 'framer-motion';

interface PreviousRecipesModalProps {
  recipes: Recipe[];
  onSelect: (recipe: Recipe) => void;
  onClose: () => void;
}

export const PreviousRecipesModal = ({ recipes, onSelect, onClose }: PreviousRecipesModalProps) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button 
          onClick={onClose}
          className="modal-close"
        >
          ✕
        </button>
        
        <div className="p-8">
          <h2 className="heading-xl mb-8">Previous Recipes</h2>
          <div className="space-y-4">
            {recipes.map(recipe => (
              <button
                key={recipe.id}
                onClick={() => {
                  onSelect(recipe);
                  onClose();
                }}
                className="w-full text-left p-4 bg-surface rounded-xl hover:bg-opacity-80 
                  transition-colors duration-200"
              >
                <h3 className="heading-md mb-2">{recipe.title}</h3>
                <p className="body-base">{recipe.total_time} minutes to cook</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 