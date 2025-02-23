'use client';

import { useState, useEffect } from 'react';
import { useConversation } from '@11labs/react';
import { Recipe, Message } from '@/types';
import { supabase } from '@/lib/supabase';
import { InitialState } from '@/components/InitialState';
import { LoadingState } from '@/components/LoadingState';
import { ReadyState } from '@/components/ReadyState';
import { StepState } from '@/components/StepState';
import { serif, sans } from './fonts';
import { StateWrapper } from '@/components/StateWrapper';
import { ErrorState } from '@/components/ErrorState';
import '@/app/styles/globals.scss';
import { IngredientsState } from '@/components/IngredientsState';

interface ElevenLabsMessage {
  source: 'ai' | 'user';
  message: string;
}

interface ElevenLabsError {
  message: string;
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
  const [isListening, setIsListening] = useState(false);
  const [isConversationActive, setIsConversationActive] = useState(false);

  const conversation = useConversation({
    apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY!,
    onConnect: () => {
      console.log('Connected to ElevenLabs');
      setStatus('connected');
      setIsListening(true);
      setIsConversationActive(true);
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs');
      setStatus('disconnected');
      setIsListening(false);
      setIsConversationActive(false);
    },
    onMessage: (message: ElevenLabsMessage) => {
      console.log('Raw message from ElevenLabs:', message);
      
      const formattedMessage = {
        message: message.message,
        source: message.source
      };
      
      setMessages(prevMessages => [...prevMessages, formattedMessage]);

      // Only process commands from user messages
      if (message.source === 'user') {
        const lowerMessage = message.message.toLowerCase();
        
        // Handle "next" commands
        if (
          lowerMessage.includes('next step') || 
          lowerMessage.includes('go forward') ||
          lowerMessage.includes('move forward')
        ) {
          console.log('Next step command detected');
          if (recipe && currentStep < recipe.recipe_steps.length - 1) {
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
            setCurrentStep(currentStep - 1);
          }
          return;
        }
      }
    },
    onError: (error: ElevenLabsError) => {
      console.error('ElevenLabs error:', error);
      setError(`Connection error: ${error.message}`);
      setStatus('error');
      setIsListening(false);
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

  const startConversation = async () => {
    try {
      setShowIngredients(false); // Move to step view
      setStatus('connecting');
      
      const dynamicVariables = createDynamicVariables(recipe!, currentStep);
      await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_AGENT_ID!,
        dynamicVariables
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to start conversation');
      setStatus('error');
    }
  };

  const toggleMicrophone = () => {
    if (isConversationActive) {
      conversation.endSession();
    } else {
      startConversation();
    }
    setIsConversationActive(prev => !prev);
  };

  // Modify step navigation to handle active conversations
  const handleStepChange = async (newStep: number) => {
    try {
      if (status === 'connected') {
        // End current conversation before changing steps
        await conversation.endSession();
        setStatus('disconnected');
      }
      
      // Clear messages and update step
      setMessages([]);
      setCurrentStep(newStep);
      
      if (status === 'connected' || status === 'connecting') {
        // Start new conversation with updated step context
        const dynamicVariables = createDynamicVariables(recipe!, newStep);
        await conversation.startSession({
          agentId: process.env.NEXT_PUBLIC_AGENT_ID!,
          dynamicVariables
        });
      }
    } catch (error) {
      console.error('Error changing steps:', error);
      setError(error instanceof Error ? error.message : 'Failed to change steps');
      setStatus('error');
    }
  };

  const handleSetRecipe = (newRecipe: Recipe | null) => {
    setRecipe(newRecipe);
    setShowIngredients(false); // Reset to ready state
    setCurrentStep(0);
    setMessages([]);
    setStatus('idle');
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      // Send URL to Make
      const response = await fetch('/api/parse-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: recipeUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to send recipe to parser');
      }

      // Poll for recipe every 2 seconds for up to 30 seconds
      let attempts = 0;
      const maxAttempts = 15;
      
      while (attempts < maxAttempts) {
        const { data, error } = await supabase
          .from('recipes')
          .select('*, recipe_ingredients(*), recipe_steps(*)')
          .eq('source_url', recipeUrl)
          .order('created_at', { ascending: false }) // Get most recent first
          .limit(1)  // Only get one result
          .maybeSingle(); // Returns null if no results, instead of throwing error

        if (error && error.code !== 'PGRST116') { // Ignore "no rows returned" error
          console.error('Supabase polling error:', error);
          // Only throw error if it's not a "no rows" error
          throw new Error('Failed to check recipe status');
        }

        if (data) {
          setRecipe(data);
          setShowIngredients(false);
          setCurrentStep(0);
          setMessages([]);
          setRecipeUrl('');
          setIsProcessing(false);
          setStatus('idle');
          return;
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      }

      throw new Error('Recipe processing timed out');
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
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

      <StateWrapper isVisible={!!recipe && !isProcessing && !showIngredients && status === 'idle'}>
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

      <StateWrapper isVisible={!!recipe && status !== 'idle'}>
        <StepState
          recipe={recipe!}
          currentStep={currentStep}
          messages={messages}
          isListening={isListening}
          onPrevious={() => handleStepChange(Math.max(0, currentStep - 1))}
          onNext={() => handleStepChange(Math.min(recipe!.recipe_steps.length - 1, currentStep + 1))}
          onStop={toggleMicrophone}
          isConversationActive={status === 'connected'}
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