'use client';

import { useState, useEffect } from 'react';
import { useConversation } from '@11labs/react';
import { Recipe } from '@/types';
import { supabase } from '@/lib/supabase';

interface Message {
  source: string;
  message: string;
  role?: 'assistant' | 'user';
}

export default function Home() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeUrl, setRecipeUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

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
      setMessages(prevMessages => [...prevMessages, message]);
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

  // Helper function to create dynamic variables
  const createDynamicVariables = (recipe: Recipe, stepNumber: number) => ({
    recipe_title: recipe.title,
    total_time: recipe.total_time,
    current_step_number: stepNumber + 1,
    current_step: recipe.recipe_steps[stepNumber].instruction,
    total_steps: recipe.recipe_steps.length,
    ingredients_list: recipe.recipe_ingredients
      .map(ing => `${ing.amount} ${ing.unit} ${ing.ingredient}`)
      .join('\n'),
    steps_list: recipe.recipe_steps
      .map(step => `${step.step_number}. ${step.instruction}`)
      .join('\n')
  });

  const startConversation = async () => {
    try {
      setStatus('starting');
      setError(null);
      
      await navigator.mediaDevices.getUserMedia({ audio: true });

      if (!recipe) {
        throw new Error('No recipe selected');
      }

      const dynamicVariables = createDynamicVariables(recipe, currentStep);

      await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_AGENT_ID!,
        dynamicVariables
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

  const moveToNextStep = async () => {
    if (!recipe || currentStep >= recipe.recipe_steps.length - 1) return;
    
    try {
      // Stop current conversation if it's speaking
      if (status === 'connected') {
        await conversation.endSession();
      }
      
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      // Clear previous messages for the new step
      setMessages([]);
      
      const dynamicVariables = createDynamicVariables(recipe, nextStep);
      await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_AGENT_ID!,
        dynamicVariables
      });
    } catch (error) {
      console.error('Error moving to next step:', error);
      setError(`Failed to move to next step: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const previousStep = async () => {
    if (!recipe || currentStep <= 0) return;
    
    try {
      // Stop current conversation if it's speaking
      if (status === 'connected') {
        await conversation.endSession();
      }
      
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      
      // Clear previous messages for the new step
      setMessages([]);
      
      const dynamicVariables = createDynamicVariables(recipe, prevStep);
      await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_AGENT_ID!,
        dynamicVariables
      });
    } catch (error) {
      console.error('Error moving to previous step:', error);
      setError(`Failed to move to previous step: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleRecipeData = (data: Recipe) => {
    setRecipe(data);
    setCurrentStep(0);
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      // Log the request we're about to send
      console.log('Sending to Make:', { url: recipeUrl });

      const response = await fetch(process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ url: recipeUrl })
      });

      // Log the full response
      const responseText = await response.text();
      console.log('Make response:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      });

      if (!response.ok) {
        throw new Error(`Make webhook failed: ${response.status} ${responseText}`);
      }

      // Wait for Make to process and Supabase to update
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Fix the recipes refresh - use Supabase directly instead of API route
      const { data: newRecipes, error } = await supabase
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

      if (!error && newRecipes) {
        setRecipes(newRecipes);
      }
      
      setRecipeUrl('');
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-100">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <h1 className="text-2xl font-bold mb-6 p-8">Cooking Assistant</h1>
        
        <form onSubmit={handleUrlSubmit} className="mb-4 p-8">
          <input
            type="url"
            value={recipeUrl}
            onChange={(e) => setRecipeUrl(e.target.value)}
            placeholder="Paste recipe URL here..."
            className="w-full p-2 border rounded"
            disabled={isProcessing}
          />
          <button 
            type="submit" 
            disabled={isProcessing || !recipeUrl}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Recipe...
              </div>
            ) : (
              'Add Recipe'
            )}
          </button>
        </form>

        {/* Recipe Selector */}
        <div className="p-6 border-b">
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
        <div className="p-6 border-b">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              status === 'connected' ? 'bg-green-500' : 
              status === 'error' ? 'bg-red-500' : 
              'bg-gray-500'
            }`}></div>
            <p className="text-sm font-medium text-gray-600">
              Status: <span className="font-semibold">{status}</span>
            </p>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* Recipe Content */}
        {recipe && (
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{recipe.title}</h2>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-gray-900 mb-2">
                Step {currentStep + 1} of {recipe.recipe_steps.length}
              </h3>
              <p className="text-gray-600">{recipe.recipe_steps[currentStep]?.instruction}</p>
            </div>

            {/* Chat Messages */}
            <div className="mt-4 mb-4 border rounded-lg">
              <div className="h-60 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div 
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        msg.role === 'assistant'
                          ? 'bg-blue-100 text-blue-900' 
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={previousStep}
                disabled={currentStep === 0}
                className="flex-1 p-3 bg-gray-100 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={moveToNextStep}
                disabled={currentStep === recipe.recipe_steps.length - 1}
                className="flex-1 p-3 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Voice Control */}
        <div className="p-6">
          <button
            onClick={startConversation}
            disabled={status === 'connected' || status === 'starting'}
            className={`w-full p-4 rounded-lg font-medium transition-colors ${
              status === 'connected' || status === 'starting'
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {status === 'starting' ? 'Starting...' : 'Start Cooking Assistant'}
          </button>
          
          {status === 'connected' && (
            <button
              onClick={stopConversation}
              className="mt-3 w-full p-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Stop Assistant
            </button>
          )}
        </div>
      </div>
    </main>
  );
}