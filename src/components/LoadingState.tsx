import { motion } from 'framer-motion';

export const LoadingState = () => {
  return (
    <div className="centered-content text-center">
      <div className="relative mb-8">
        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <div className="glow-effect active" />
      </div>
      
      <h2 className="heading-lg mb-2">Processing Recipe</h2>
      <p className="body-base">This might take a moment...</p>
    </div>
  );
}; 