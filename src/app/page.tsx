'use client';

import { useState, useEffect } from 'react';
import { useConversation } from '@11labs/react';
import { Recipe } from '@/types';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { InitialState } from '@/components/InitialState';
import { LoadingState } from '@/components/LoadingState';
import { ReadyState } from '@/components/ReadyState';
import { StepState } from '@/components/StepState';
import { serif, sans } from './fonts';
import { StateWrapper } from '@/components/StateWrapper';
import { ErrorState } from '@/components/ErrorState';
import '@/app/styles/globals.scss';
import { IngredientsState } from '@/components/IngredientsState';

interface Message {
  message: string;
  role: 'assistant' | 'user';
}

export default function Home() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [status, setStatus] = useState('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeUrl, setRecipeUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showIngredients, setShowIngredients] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleMessage = async (message: Message) => {
    console.log('Received message:', message);
    setMessages(prevMessages => [...prevMessages, message]);

    // Check for navigation commands in user messages
    if (message.role === 'user') {
      const lowerMessage = message.message.toLowerCase();
      console.log('Processing user message:', lowerMessage);
      
      // Handle "next" commands
      if (
        lowerMessage.includes('next step') || 
        lowerMessage.includes('go forward') ||
        lowerMessage.includes('move forward')
      ) {
        console.log('Next step command detected');
        if (recipe && currentStep < recipe.recipe_steps.length - 1) {
          console.log('Current step before:', currentStep);
          setCurrentStep(currentStep + 1);
        }
        return;
      }
      
      // Handle "previous" commands
      if (
        lowerMessage.includes('previous step') || 
        lowerMessage.includes('go back') ||
        lowerMessage.includes('last step') ||
        lowerMessage.includes('move back')
      ) {
        console.log('Previous step command detected');
        if (recipe && currentStep > 0) {
          console.log('Current step before:', currentStep);
          setCurrentStep(currentStep - 1);
        }
        return;
      }
    }
  };

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
    onMessage: handleMessage,
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
            unit,
            aisle
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

  const readCurrentStep = async () => {
    console.log('Reading step:', currentStep);
    if (!recipe || !recipe.recipe_steps) {
      console.error('No recipe or steps available');
      return;
    }
    
    try {
      // End the current session if one exists
      if (status === 'connected') {
        await conversation.endSession();
      }
      
      // Create new dynamic variables
      const dynamicVariables = createDynamicVariables(recipe, currentStep);
      console.log('Dynamic variables:', dynamicVariables);

      // Start a new session with the current step
      await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_AGENT_ID!,
        dynamicVariables
      });
    } catch (error) {
      console.error('Error reading step:', error);
    }
  };

  const startConversation = async () => {
    try {
      setStatus('starting');
      setError(null);

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } else {
        throw new Error('getUserMedia is not supported in this browser.');
      }

      if (!recipe) {
        throw new Error('No recipe selected');
      }

      // Start initial narration
      await readCurrentStep();
      setStatus('connected');

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
    }
  };

  const handleSetRecipe = (newRecipe: Recipe | null) => {
    if (newRecipe && Array.isArray(newRecipe.recipe_steps) && newRecipe.recipe_steps.length > 0) {
      setRecipe(newRecipe);
      setCurrentStep(0);
    } else {
      console.error('Invalid recipe structure:', newRecipe);
      setRecipe(null);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ url: recipeUrl })
      });

      if (!response.ok) {
        throw new Error(`Failed to process recipe: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.recipeId) {
        throw new Error('No recipe ID returned from processing');
      }

      // Fetch the new recipe
      const { data: newRecipe, error: fetchError } = await supabase
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
            unit,
            aisle
          ),
          recipe_steps (
            recipe_id,
            step_number,
            instruction
          )
        `)
        .eq('id', data.recipeId)
        .single();

      if (fetchError || !newRecipe) {
        throw new Error(fetchError?.message || 'Failed to fetch new recipe');
      }

      handleSetRecipe(newRecipe);
      setRecipeUrl('');
      
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className={`min-h-screen bg-background ${serif.variable} ${sans.variable}`}>
      <StateWrapper isVisible={!recipe && !isProcessing}>
        <InitialState
          recipeUrl={recipeUrl}
          onUrlChange={setRecipeUrl}
          onSubmit={handleUrlSubmit}
          isProcessing={isProcessing}
          recipes={recipes}
          onRecipeSelect={handleSetRecipe}
        />
      </StateWrapper>

      <StateWrapper isVisible={isProcessing}>
        <LoadingState />
      </StateWrapper>

      <StateWrapper isVisible={!!recipe && !isProcessing && !showIngredients}>
        <ReadyState
          recipe={recipe!}
          onStart={() => setShowIngredients(true)}
          onBack={() => handleSetRecipe(null)}
        />
      </StateWrapper>

      <StateWrapper isVisible={!!recipe && showIngredients && status === 'idle'}>
        <IngredientsState
          recipe={recipe!}
          onStart={startConversation}
          onBack={() => setShowIngredients(false)}
        />
      </StateWrapper>

      <StateWrapper isVisible={!!recipe && showIngredients && status !== 'idle'}>
        <StepState
          recipe={recipe!}
          currentStep={currentStep}
          messages={messages}
          isListening={status === 'connected'}
          onPrevious={() => setCurrentStep(Math.max(0, currentStep - 1))}
          onNext={() => setCurrentStep(Math.min(recipe!.recipe_steps.length - 1, currentStep + 1))}
          onStop={stopConversation}
        />
      </StateWrapper>

      {error && (
        <ErrorState 
          message={error} 
          onRetry={() => {
            setError(null);
            setStatus('idle');
          }} 
        />
      )}
    </main>
  );
}