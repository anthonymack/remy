import { motion } from 'framer-motion';
import { Recipe } from '../types';

interface ReadyStateProps {
  recipe: Recipe;
  onStart: () => void;
  onBack: () => void;
}

export const ReadyState = ({ recipe, onStart, onBack }: ReadyStateProps) => {
  return (
    <div className="centered-content text-center">
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 text-text-secondary hover:text-text"
      >
        ← Back
      </button>

      <h1 className="heading-xl mb-4">{recipe.title}</h1>
      
      <div className="flex items-center gap-4 mb-12">
        <div className="text-text-secondary">
          <span className="block text-2xl">{recipe.total_time}</span>
          <span className="text-sm">minutes</span>
        </div>
      </div>

      <button 
        onClick={onStart}
        className="relative w-20 h-20 rounded-full bg-accent group"
      >
        <div className="glow-effect opacity-0 group-hover:opacity-100" />
        <svg className="w-8 h-8 text-surface">
          {/* Play icon */}
        </svg>
      </button>
      
      <p className="body-base mt-4">
        Press play to start cooking
      </p>
    </div>
  );
}; 