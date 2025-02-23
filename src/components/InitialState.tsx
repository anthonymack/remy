import { Recipe } from '@/types';
import { useState } from 'react';
import { PreviousRecipesModal } from './PreviousRecipesModal';

export const InitialState = ({
  recipeUrl,
  onUrlChange,
  onSubmit,
  isProcessing,
  recipes,
  onRecipeSelect,
  error
}: {
  recipeUrl: string;
  onUrlChange: (url: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isProcessing: boolean;
  recipes: Recipe[];
  onRecipeSelect: (recipe: Recipe) => void;
  error?: string;
}) => {
  const [showPreviousRecipes, setShowPreviousRecipes] = useState(false);

  return (
    <div className="centered-content text-center">
      <div className="w-full relative">
        <h1 className="heading-logo">Rémy</h1>
        <p className="body-lg mb-12">What are we cooking today?</p>

        <div className="w-full max-w-md mx-auto">
          <form onSubmit={onSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <input
              type="url"
              value={recipeUrl}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder="Paste recipe URL here"
              className="input-url"
              disabled={isProcessing}
            />
            <div className="flex items-center justify-center gap-4">
              <button 
                type="submit"
                disabled={isProcessing || !recipeUrl}
                className="button button-primary"
              >
                Start cooking
              </button>
              {recipes.length > 0 && (
                <button 
                  type="button"
                  onClick={() => setShowPreviousRecipes(true)}
                  className="button button-surface flex items-center gap-2"
                >
                  <svg 
                    className="w-6 h-6" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 512 512"
                    fill="currentColor"
                  >
                    <path d="M40 48C26.7 48 16 58.7 16 72v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V72c0-13.3-10.7-24-24-24H40zM192 64c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zM16 232v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V232c0-13.3-10.7-24-24-24H40c-13.3 0-24 10.7-24 24zM40 368c-13.3 0-24 10.7-24 24v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V392c0-13.3-10.7-24-24-24H40z"/>
                  </svg>
                  Past recipes
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {showPreviousRecipes && (
        <PreviousRecipesModal
          recipes={recipes}
          onSelect={onRecipeSelect}
          onClose={() => setShowPreviousRecipes(false)}
        />
      )}
    </div>
  );
} 