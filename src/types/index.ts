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