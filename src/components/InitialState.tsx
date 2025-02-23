import { motion } from 'framer-motion';
import { Recipe } from '@/types';

export const InitialState = ({ 
  recipeUrl, 
  onUrlChange, 
  onSubmit, 
  isProcessing,
  recipes,
  onRecipeSelect
}: {
  recipeUrl: string;
  onUrlChange: (url: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isProcessing: boolean;
  recipes: Recipe[];
  onRecipeSelect: (recipe: Recipe) => void;
}) => {
  return (
    <div className="centered-content text-center">
      <h1 className="heading-logo">Rémy</h1>
      <p className="body-lg mb-12">What are we cooking today?</p>

      <div className="w-full max-w-md">
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="url"
            value={recipeUrl}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="Paste recipe URL here"
            className="input-url"
            disabled={isProcessing}
          />
          <button 
            type="submit"
            disabled={isProcessing || !recipeUrl}
            className="button button-primary w-full"
          >
            Start cooking
          </button>
        </form>

        {/* Debug dropdown */}
        <select 
          className="mt-8 input-url"
          onChange={(e) => {
            const recipe = recipes.find(r => r.id === e.target.value);
            if (recipe) onRecipeSelect(recipe);
          }}
        >
          <option value="">Select a saved recipe...</option>
          {recipes.map(recipe => (
            <option key={recipe.id} value={recipe.id}>
              {recipe.title}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}; 