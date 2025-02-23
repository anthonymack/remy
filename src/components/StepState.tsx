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
        <div className="mb-12">
          <p className="body-base mb-2">Step {currentStep + 1}</p>
          <h2 className="heading-lg">{step.instruction}</h2>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {recipe.recipe_steps.map((_, index) => (
            <div
              key={index}
              className={`step-indicator ${
                index === currentStep ? 'step-indicator-active' : 'step-indicator-inactive'
              }`}
            />
          ))}
        </div>

        {/* Chat Messages */}
        <div className="chat-container">
          <div className="max-w-xl mx-auto space-y-4">
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${
                    msg.role === 'assistant' ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <div className={`chat-message chat-message-${msg.role}`}>
                    {msg.message}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="nav-controls">
          <div className="max-w-xl mx-auto py-4 px-4 flex items-center justify-between">
            <button
              onClick={onPrevious}
              disabled={isFirstStep}
              className="button button-secondary"
            >
              Previous
            </button>

            <button
              onClick={onStop}
              className="relative w-16 h-16 rounded-full bg-accent flex items-center justify-center"
            >
              <div className={`glow-effect ${isListening ? 'active' : ''}`} />
              <span className="w-6 h-6 bg-surface rounded-sm" />
            </button>

            <button
              onClick={onNext}
              disabled={isLastStep}
              className="button button-secondary"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 