export interface Message {
  type: string;
  content: string;
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

/** Recipe ingredient with amount, unit and name */
export interface RecipeIngredient {
  amount: number;
  unit: string;
  ingredients: {
    name: string;
  };
}

/** Single step in a recipe */
export interface RecipeStep {
  step_number: number;
  instruction: string;
}

/** Complete recipe information */
export interface Recipe {
  id: string;
  name: string;
  description: string;
  cooking_time: string;
  serving_size: number;
  recipe_ingredients: RecipeIngredient[];
  recipe_steps: RecipeStep[];
} 