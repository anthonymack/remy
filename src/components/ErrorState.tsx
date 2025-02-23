import { motion } from 'framer-motion';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export const ErrorState = ({ message, onRetry }: ErrorStateProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-screen p-4"
    >
      <div className="text-center mb-8">
        <p className="text-red-500 mb-4">{message}</p>
        <button 
          onClick={onRetry}
          className="button button-secondary"
        >
          Try Again
        </button>
      </div>
    </motion.div>
  );
}; 