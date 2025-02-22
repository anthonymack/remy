'use client';

import { useState, useEffect } from 'react';
import { useConversation } from '@11labs/react';
import { Recipe } from '@/types';
import { supabase } from '@/lib/supabase';
import { motion } from "motion/react";
import { Playfair_Display } from 'next/font/google';
import { useSwipeable, SwipeEventData, SwipeableProps } from 'react-swipeable';

const playfair = Playfair_Display({ subsets: ['latin'] });

interface Message {
  source: string;
  message: string;
  role?: 'assistant' | 'user';
}

export default function Home() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [status, setStatus] = useState('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeUrl, setRecipeUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);

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

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setMessages([]);
    }
  };
  const moveToNextStep = () => {
    if (recipe?.recipe_steps && currentStep < recipe.recipe_steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setMessages([]);
    }
  };

  const handlers: SwipeableProps = {
    onSwipedLeft: async () => {
      if (recipe?.recipe_steps && currentStep < recipe.recipe_steps.length - 1) {
        await moveToNextStep();
      }
    },
    onSwipedRight: async () => {
      if (recipe?.recipe_steps && currentStep > 0) {
        await previousStep();
      }
    },
    onSwiping: (e: SwipeEventData) => {
      setIsDragging(true);
      setDragDirection(e.dir === 'Left' ? 'left' : 'right');
    },
    onSwiped: () => {
      setIsDragging(false);
      setDragDirection(null);
    },
    trackMouse: true,
    trackTouch: true,
    delta: 50,
    swipeDuration: 500
  };

  const swipeHandlers = useSwipeable(handlers);

  return (
    <main className="min-h-screen bg-[#FAF7F4]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto p-4 md:p-8"
      >
        {/* Recipe Input Section */}
        <div className="mb-8">
          <h1 className={`${playfair.className} text-3xl text-[#2C3639] mb-6`}>
            Cooking Assistant
          </h1>
          
          <motion.form 
            onSubmit={handleUrlSubmit} 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <input
              type="url"
              value={recipeUrl}
              onChange={(e) => setRecipeUrl(e.target.value)}
              placeholder="Paste recipe URL here..."
              className="w-full p-4 bg-white rounded-xl border-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2C3639]"
              disabled={isProcessing}
            />
            <motion.button 
              type="submit"
              disabled={isProcessing || !recipeUrl}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full p-4 bg-[#2C3639] text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing Recipe...' : 'Start Cooking'}
            </motion.button>
          </motion.form>

          <motion.select 
            className="mt-4 w-full p-4 bg-white rounded-xl border-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2C3639]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onChange={(e) => {
              const selectedRecipe = recipes.find(r => r.id === e.target.value);
              if (selectedRecipe) {
                handleSetRecipe(selectedRecipe);
              }
            }}
            value={recipe?.id || ''}
          >
            <option value="">Select a saved recipe...</option>
            {recipes.map((r) => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </motion.select>
        </div>

        {/* Recipe Content */}
        {recipe && recipe.recipe_steps && recipe.recipe_steps.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <div 
              {...swipeHandlers}
              className={`relative bg-white rounded-2xl p-8 shadow-sm touch-pan-y cursor-grab 
                ${isDragging ? 'cursor-grabbing select-none' : ''}`}
              style={{
                transform: isDragging && dragDirection 
                  ? `translateX(${dragDirection === 'left' ? '-10px' : '10px'})` 
                  : 'translateX(0)',
                transition: 'transform 0.2s ease'
              }}
            >
              <div className="flex justify-between text-sm text-gray-500 mb-4">
                {currentStep > 0 && (
                  <span className={`transition-opacity ${isDragging && dragDirection === 'right' ? 'opacity-100' : 'opacity-50'}`}>
                    ← Previous step
                  </span>
                )}
                {currentStep < recipe.recipe_steps.length - 1 && (
                  <span className={`transition-opacity ${isDragging && dragDirection === 'left' ? 'opacity-100' : 'opacity-50'}`}>
                    Next step →
                  </span>
                )}
              </div>
              
              <h2 className={`${playfair.className} text-lg text-[#2C3639] mb-2`}>
                Step {currentStep + 1}
              </h2>
              <p className="text-xl text-[#2C3639] leading-relaxed">
                {recipe.recipe_steps[currentStep]?.instruction || ''}
              </p>

              {/* Step indicator dots */}
              <div className="flex justify-center space-x-2 mt-6">
                {recipe.recipe_steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep ? 'bg-[#2C3639]' : 'bg-[#E8E3DD]'
                    }`}
                  />
                ))}
              </div>

              {/* Visual swipe hints */}
              <div className={`absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-[#2C3639]/0 to-transparent 
                transition-opacity ${currentStep > 0 ? 'opacity-5' : 'opacity-0'} 
                ${isDragging && dragDirection === 'right' ? 'opacity-10' : ''}`} 
              />
              <div className={`absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-[#2C3639]/0 to-transparent 
                transition-opacity ${currentStep < recipe.recipe_steps.length - 1 ? 'opacity-5' : 'opacity-0'}
                ${isDragging && dragDirection === 'left' ? 'opacity-10' : ''}`} 
              />
            </div>

            {/* Chat Messages */}
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                >
                  <div 
                    className={`rounded-2xl px-6 py-4 max-w-[80%] ${
                      msg.role === 'assistant'
                        ? 'bg-[#2C3639] text-white' 
                        : 'bg-[#E8E3DD] text-[#2C3639]'
                    }`}
                  >
                    <p className="text-base">{msg.message}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Controls */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#FAF7F4] border-t border-[#E8E3DD]">
              <div className="max-w-lg mx-auto flex space-x-4">
                {status === 'connected' ? (
                  <motion.button
                    onClick={stopConversation}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full p-4 bg-white border border-[#2C3639] text-[#2C3639] rounded-xl"
                  >
                    Stop Assistant
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={startConversation}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full p-4 bg-[#2C3639] text-white rounded-xl"
                    disabled={status === 'starting'}
                  >
                    {status === 'starting' ? 'Starting...' : 'Start Assistant'}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}