import { motion, AnimatePresence } from 'framer-motion';
import { Recipe, Message } from '../types';

interface StepStateProps {
  recipe: Recipe;
  currentStep: number;
  messages: Message[];
  isListening: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onStop: () => void;
}

export const StepState = ({
  recipe,
  currentStep,
  messages,
  isListening,
  onPrevious,
  onNext,
  onStop,
}: StepStateProps) => {
  const step = recipe.recipe_steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === recipe.recipe_steps.length - 1;

  return (
    <div className="page-container relative">
      {/* Glow Effect */}
      <div className={`glow-effect ${isListening ? 'active' : ''}`} />

      {/* Main Content */}
      <div className="max-w-xl mx-auto">
        {/* Header with gradient */}
        <div className="step-header">
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill"
              style={{ 
                width: `${((currentStep + 1) / recipe.recipe_steps.length) * 100}%` 
              }}
            />
          </div>

          <div className="mb-12">
            <p className="body-base mb-2">Step {currentStep + 1}</p>
            <h2 className="heading-lg">{step.instruction}</h2>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="chat-container">
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="message-wrapper"
              >
                <div className={`message-inner message-inner--${msg.source}`}>
                  <div className={`chat-message chat-message-${msg.source}`}>
                    {msg.message}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Navigation Controls */}
        <div className="action-bar">
          <button 
            onClick={onPrevious}
            disabled={isFirstStep}
            className="nav-button nav-button--back"
          >
            <svg className="back-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
              <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/>
            </svg>
          </button>

          <button 
            onClick={onStop}
            className="nav-button nav-button--speak"
          >
            <svg className="speak-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
              <path d="M192 0C139 0 96 43 96 96l0 160c0 53 43 96 96 96s96-43 96-96l0-160c0-53-43-96-96-96zM64 216c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40c0 89.1 66.2 162.7 152 174.4l0 33.6-48 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l72 0 72 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-48 0 0-33.6c85.8-11.7 152-85.3 152-174.4l0-40c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40c0 70.7-57.3 128-128 128s-128-57.3-128-128l0-40z"/>
            </svg>
          </button>

          <button 
            onClick={onNext}
            disabled={isLastStep}
            className="nav-button nav-button--next"
          >
            <svg className="next-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
              <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}; 