import { Recipe } from '@/types';

interface ReadyStateProps {
  recipe: Recipe;
  onStart: () => void;
  onBack: () => void;
}

export const ReadyState = ({ recipe, onStart, onBack }: ReadyStateProps) => {
  return (
    <div className="centered-content text-center min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col justify-center">
        <h1 className="heading-xxl mb-4">{recipe.title}</h1>
        
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="text-text-secondary">
            <span className="heading-md">{recipe.total_time} </span>
            <span className="heading-md">minutes to cook</span>
          </div>
        </div>
      </div>

      <div className="action-bar" style={{ justifyContent: 'space-between' }}>
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
    </div>
  );
} 