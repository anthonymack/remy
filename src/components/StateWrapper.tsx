import { motion, AnimatePresence } from 'framer-motion';

interface StateWrapperProps {
  children: React.ReactNode;
  isVisible: boolean;
}

export const StateWrapper = ({ children, isVisible }: StateWrapperProps) => {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 