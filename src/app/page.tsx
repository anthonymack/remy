'use client';

import { useState, useEffect } from 'react';
import { useConversation } from '@11labs/react';
import { Recipe, Message } from '@/types';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

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
    onMessage: (message: Message) => {
      console.log('Received message:', message);
    },
    onError: (error: Error) => {
      console.error('ElevenLabs error:', error);
      setError(`Connection error: ${error.message}`);
      setStatus('error');
    }
  });

  useEffect(() => {
    async function fetchRecipes() {
      console.log('Starting to fetch recipes...');
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          id,
          title,
          total_time,
          source_url,
          created_at,
          recipe_ingredients (
            recipe_id,
            ingredient,
            amount,
            unit
          ),
          recipe_steps (
            recipe_id,
            step_number,
            instruction
          )
        `)
        .order('title');

      console.log('Raw Supabase response:', data);
      console.log('Supabase error if any:', error);

      if (error) {
        console.error('Error fetching recipes:', error);
        return;
      }

      if (!data || data.length === 0) {
        console.log('No recipes found in the database');
        return;
      }

      setRecipes(data);
    }

    fetchRecipes();
  }, []);

  const startConversation = async () => {
    try {
      setStatus('starting');
      setError(null);
      
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const context = `SYSTEM: You are a cooking assistant. You have access to the following recipe information which you should use to help guide the user:

RECIPE NAME: ${recipe?.title}
TOTAL TIME: ${recipe?.total_time} minutes

INGREDIENTS:
${recipe?.recipe_ingredients?.map(ing => `- ${ing.amount} ${ing.unit} ${ing.ingredient}`).join('\n')}

COOKING STEPS:
${recipe?.recipe_steps?.map(step => `${step.step_number}. ${step.instruction}`).join('\n')}

CURRENT STEP: ${currentStep + 1}
INSTRUCTION: ${recipe?.recipe_steps?.[currentStep]?.instruction}

YOUR ROLE: You should:
1. Help guide the user through the current step
2. Answer questions about ingredients and other steps
3. Be ready to move to the next step when they're done
4. Always reference the recipe details provided above when answering questions

Remember to use this recipe information in your responses.`;

      console.log('Starting conversation with context:', context);

      await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_AGENT_ID!,
        context: context
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
      .map(ing => `${ing.amount} ${ing.unit} ${ing.ingredient}`)
      .join(', ');

    return `
      I'm helping someone cook ${recipe.title}. 
      This recipe takes ${recipe.total_time}.
      
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
    
    await conversation.startSession({
      agentId: process.env.NEXT_PUBLIC_AGENT_ID!,
      context: formatRecipeContext(recipe)
    });
  };

  const previousStep = async () => {
    if (!recipe || currentStep <= 0) return;
    
    const prevStep = currentStep - 1;
    setCurrentStep(prevStep);
    
    await conversation.startSession({
      agentId: process.env.NEXT_PUBLIC_AGENT_ID!,
      context: formatRecipeContext(recipe)
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleRecipeData = (data: Recipe) => {
    setRecipe(data);
    setCurrentStep(0);
  };

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">Cooking Assistant</h1>
        
        {/* Recipe Selector */}
        <div className="mb-6">
          <select 
            className="w-full p-2 border rounded"
            onChange={(e) => {
              const selectedRecipe = recipes.find(r => r.id === e.target.value);
              if (selectedRecipe) {
                setRecipe(selectedRecipe);
                setCurrentStep(0);
              }
            }}
            value={recipe?.id || ''}
          >
            <option value="">Select a recipe...</option>
            {recipes.map(r => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
        </div>

        {/* Status Display */}
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <p>Status: <span className="font-semibold">{status}</span></p>
          {error && (
            <p className="text-red-500 mt-2">{error}</p>
          )}
        </div>

        {recipe && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">{recipe.title}</h2>
            
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