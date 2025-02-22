export interface Message {
  source: string;
  message: string;
  role?: 'assistant' | 'user';
}

export interface ConversationError {
  message: string;
}

export interface ConversationConfig {
  apiKey: string;
  onConnect: () => void;
  onDisconnect: () => void;
  onMessage: (message: Message) => void;
  onError: (error: ConversationError) => void;
}

export interface ConversationSession {
  agentId: string;
  context: string;
}

/** Recipe from Supabase */
export interface Recipe {
  id: string;
  title: string;
  total_time: number;
  source_url: string;
  created_at: string;
  recipe_ingredients: RecipeIngredient[];
  recipe_steps: RecipeStep[];
}

/** Recipe ingredient with amount, unit and name */
export interface RecipeIngredient {
  recipe_id: string;
  ingredient: string;
  amount: number;
  unit: string;
}

/** Single step in a recipe */
export interface RecipeStep {
  recipe_id: string;
  step_number: number;
  instruction: string;
} 