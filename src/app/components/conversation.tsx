'use client';

import { useConversation } from '@11labs/react';
import { useCallback } from 'react';
import { Message } from '@/types';

interface ConversationError {
  message: string;
}

interface ElevenLabsMessage {
  content: string;
}

export function Conversation() {
  const conversation = useConversation({
    onConnect: () => console.log('Connected'),
    onDisconnect: () => console.log('Disconnected'),
    onMessage: (rawMessage: ElevenLabsMessage) => {
      // Convert ElevenLabs message format to our Message format
      const formattedMessage: Message = {
        message: rawMessage.content,
        source: 'ai'
      };
      console.log('Message:', formattedMessage);
      // You'll need to pass this message up to your parent component
      // via a callback prop
    },
    onError: (error: ConversationError) => console.error('Error:', error),
  });

  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start the conversation with your agent
      await conversation.startSession({
        agentId: 'RnodwNtSjXU9HP0IzJHR', // Replace with your agent ID
      });

    } catch {
      console.error('Failed to start conversation');
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        <button
          onClick={startConversation}
          disabled={conversation.status === 'connected'}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Start Conversation
        </button>
        <button
          onClick={stopConversation}
          disabled={conversation.status !== 'connected'}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300"
        >
          Stop Conversation
        </button>
      </div>

      <div className="flex flex-col items-center">
        <p>Status: {conversation.status}</p>
        <p>Agent is {conversation.isSpeaking ? 'speaking' : 'listening'}</p>
      </div>
    </div>
  );
}
