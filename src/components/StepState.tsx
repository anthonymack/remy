import { motion, AnimatePresence } from 'framer-motion';
import { Recipe, Message } from '../types';
import { useState, useEffect, useRef } from 'react';

interface StepStateProps {
  recipe: Recipe;
  currentStep: number;
  messages: Message[];
  isListening: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onStop: () => void;
  isConversationActive: boolean;
}

export const StepState = ({
  recipe,
  currentStep,
  messages,
  isListening,
  onPrevious,
  onNext,
  onStop,
  isConversationActive,
}: StepStateProps) => {
  const [showIngredients, setShowIngredients] = useState(false);
  const step = recipe.recipe_steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === recipe.recipe_steps.length - 1;
  const [audioLevel, setAudioLevel] = useState(0);
  const animationFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let audioContext: AudioContext | null = null;

    const setupAudioAnalyser = async () => {
      if (isConversationActive) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStreamRef.current = stream;
          audioContext = new AudioContext();
          const source = audioContext.createMediaStreamSource(stream);
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);
          analyserRef.current = analyser;

          const updateLevel = () => {
            if (!analyserRef.current) return;
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            const normalized = Math.min(average / 128, 1);
            setAudioLevel(normalized);
            animationFrameRef.current = requestAnimationFrame(updateLevel);
          };

          updateLevel();
        } catch (err) {
          console.error('Error accessing microphone:', err);
        }
      }
    };

    setupAudioAnalyser();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContext) {
        audioContext.close();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      analyserRef.current = null;
    };
  }, [isConversationActive]);

  return (
    <div className="page-container relative">
      {/* Main Content */}
      <div className="max-w-xl mx-auto">
        {/* Header with gradient */}
        <div className="step-header">
          <div className="flex items-center justify-between">
            <div className="progress-bar-container" style={{ width: 'calc(100% - 60px)' }}>
              <div 
                className="progress-bar-fill"
                style={{ 
                  width: `${((currentStep + 1) / recipe.recipe_steps.length) * 100}%` 
                }}
              />
            </div>

            {/* Ingredients Button - horizontally aligned with progress bar */}
            <button 
              onClick={() => setShowIngredients(true)}
              className="w-10 h-10 bg-surface rounded-full 
                text-text-secondary hover:text-text hover:bg-opacity-80 
                transition-colors duration-200 flex items-center justify-center"
            >
              <svg 
                className="w-5 h-5" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 512 512"
                fill="currentColor"
              >
                <path d="M64 144a48 48 0 1 0 0-96 48 48 0 1 0 0 96zM192 64c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L192 64zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-288 0zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-288 0zM64 464a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm48-208a48 48 0 1 0 -96 0 48 48 0 1 0 96 0z"/>
              </svg>
            </button>
          </div>

          <div className="mt-8">
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
            className={`nav-button nav-button--speak ${isConversationActive ? 'active' : ''}`}
            style={{ 
              '--audio-level': audioLevel,
            } as React.CSSProperties}
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

      {/* Modal - Updated with ingredients-state styling */}
      {showIngredients && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button 
              onClick={() => setShowIngredients(false)}
              className="modal-close"
            >
              ✕
            </button>
            
            <div className="ingredients-state">
              <div className="ingredients-content">
                {Object.entries(recipe.recipe_ingredients.reduce((groups, ingredient) => {
                  const aisle = ingredient.aisle || 'Other';
                  if (!groups[aisle]) groups[aisle] = [];
                  groups[aisle].push(ingredient);
                  return groups;
                }, {} as Record<string, typeof recipe.recipe_ingredients>)).map(([aisle, ingredients]) => (
                  <div key={aisle} className="ingredient-group">
                    <h3 className="heading-md mb-4">{aisle}</h3>
                    <div className="ingredient-list">
                      {ingredients.map((ingredient, index) => (
                        <div key={index} className="ingredient-item">
                          <span className="ingredient-amount">
                            {ingredient.amount} {ingredient.unit}
                          </span>
                          <span className="ingredient-name">
                            {ingredient.ingredient}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Glow Effect */}
      <div className={`glow-effect ${isListening ? 'active' : ''}`} />
    </div>
  );
}; 