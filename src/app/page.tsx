'use client';

import { useState } from 'react';
import { useConversation } from '@11labs/react';

interface RecipeIngredient {
  amount: number;
  unit: string;
  ingredients: {
    name: string;
  };
}

interface RecipeStep {
  step_number: number;
  instruction: string;
}

interface Recipe {
  name: string;
  description: string;
  cooking_time: string;
  serving_size: number;
  recipe_ingredients: RecipeIngredient[];
  recipe_steps: RecipeStep[];
}

interface Message {
  type: string;
  content: string;
}

interface ConversationError {
  message: string;
}

interface ConversationConfig {
  apiKey: string;
  onConnect: () => void;
  onDisconnect: () => void;
  onMessage: (message: Message) => void;
  onError: (error: ConversationError) => void;
}

interface ConversationSession {
  agentId: string;
  context: string;
}

export default function Home() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('idle');
  const [currentStep, setCurrentStep] = useState(0);

  const conversation = useConversation({
    apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY!,
    onConnect: () => {
      console.log('Connected to ElevenLabs');
      setStatus('connected');
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs');
      setStatus('disconnected');
    },
    onMessage: (message) => {
      console.log('Received message:', message);
    },
    onError: (error) => {
      console.error('ElevenLabs error:', error);
      setError(`Connection error: ${error.message}`);
      setStatus('error');
    }
  });

  const startConversation = async () => {
    try {
      setStatus('starting');
      setError(null);
      
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_AGENT_ID!,
        context: "You are a helpful cooking assistant."
      });

    } catch (error) {
      console.error('Startup error:', error);
      setError(`Failed to start: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setStatus('error');
    }
  };

  const stopConversation = async () => {
    try {
      if (conversation) {
        await conversation.endSession();
        setStatus('idle');
      }
    } catch (error) {
      console.error('Stop error:', error);
      setError(`Failed to stop: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const formatRecipeContext = (recipe: Recipe) => {
    const ingredients = recipe.recipe_ingredients
      .map(ing => `${ing.amount} ${ing.unit} ${ing.ingredients.name}`)
      .join(', ');

    return `
      I'm helping someone cook ${recipe.name}. 
      This recipe serves ${recipe.serving_size} people and takes ${recipe.cooking_time}.
      
      The ingredients needed are: ${ingredients}
      
      There are ${recipe.recipe_steps.length} steps in total.
      The current step (${currentStep + 1}) is: ${recipe.recipe_steps[currentStep]?.instruction}
      
      Please help guide the user through this step and be ready to move to the next step when they're done.
      If they ask about ingredients or previous steps, you can reference those details from what I've provided.
    `;
  };

  const moveToNextStep = async () => {
    if (!recipe || currentStep >= recipe.recipe_steps.length - 1) return;
    
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    
    await conversation.updateContext(formatRecipeContext(recipe));
  };

  const previousStep = async () => {
    if (!recipe || currentStep <= 0) return;
    
    const prevStep = currentStep - 1;
    setCurrentStep(prevStep);
    
    await conversation.updateContext(formatRecipeContext(recipe));
  };

  // This would be called when Make sends the recipe data
  const handleRecipeData = (recipeData: Recipe) => {
    setRecipe(recipeData);
    setCurrentStep(0);
  };

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">Cooking Assistant</h1>
        
        {/* Status Display */}
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <p>Status: <span className="font-semibold">{status}</span></p>
          {error && (
            <p className="text-red-500 mt-2">{error}</p>
          )}
        </div>

        {recipe && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">{recipe.name}</h2>
            <p className="mb-4">{recipe.description}</p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-bold mb-2">Current Step ({currentStep + 1} of {recipe.recipe_steps.length})</h3>
              <p>{recipe.recipe_steps[currentStep]?.instruction}</p>
            </div>

            <div className="flex gap-4 mb-6">
              <button
                onClick={previousStep}
                disabled={currentStep === 0}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous Step
              </button>
              <button
                onClick={moveToNextStep}
                disabled={currentStep === recipe.recipe_steps.length - 1}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-4">
          <button
            onClick={startConversation}
            disabled={status === 'connected' || status === 'starting'}
            className={`px-6 py-3 rounded-lg text-white ${
              status === 'connected' || status === 'starting'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {status === 'starting' ? 'Starting...' : 'Start Cooking Assistant'}
          </button>
          
          {status === 'connected' && (
            <button
              onClick={stopConversation}
              className="px-6 py-3 rounded-lg text-white bg-red-600 hover:bg-red-700"
            >
              Stop Assistant
            </button>
          )}
        </div>

        {/* Debug Info (remove in production) */}
        <div className="mt-8 p-4 bg-gray-100 rounded text-sm">
          <p>Debug Info:</p>
          <p>Agent ID set: {process.env.NEXT_PUBLIC_AGENT_ID ? 'Yes' : 'No'}</p>
          <p>API Key set: {process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </main>
  );
}