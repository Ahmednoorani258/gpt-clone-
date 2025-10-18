import React, { useRef, useEffect } from 'react';
import { Message } from '../types';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { GeminiLogo } from './Icons';

interface ChatViewProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
}

const SuggestionCard: React.FC<{ title: string, subtitle: string, onClick: () => void }> = ({ title, subtitle, onClick }) => (
    <div onClick={onClick} className="p-4 border border-gray-600 rounded-lg cursor-pointer hover:bg-[#202123] transition-colors">
        <p className="text-sm font-semibold text-gray-200">{title}</p>
        <p className="text-sm text-gray-400">{subtitle}</p>
    </div>
);

const ChatView: React.FC<ChatViewProps> = ({ messages, isLoading, onSendMessage }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="mb-8">
                <GeminiLogo className="w-16 h-16 text-white" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
                <SuggestionCard title="Write a story" subtitle="about a robot who learns to paint" onClick={() => onSendMessage('Write a story about a robot who learns to paint')} />
                <SuggestionCard title="Explain quantum computing" subtitle="in simple terms" onClick={() => onSendMessage('Explain quantum computing in simple terms')} />
                <SuggestionCard title="Suggest some gift ideas" subtitle="for a friend who loves hiking" onClick={() => onSendMessage('Suggest some gift ideas for a friend who loves hiking')} />
                <SuggestionCard title="Help me debug my code" subtitle="that's throwing a null pointer exception" onClick={() => onSendMessage("Help me debug my code that's throwing a null pointer exception")} />
            </div>
          </div>
        ) : (
          <div>
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <ChatMessage message={{ role: 'model', content: '...' }} isLoading={true} />
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>
      <footer className="bg-[#343541] w-full max-w-3xl mx-auto px-4 pb-4">
        <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
        <p className="text-xs text-center text-gray-500 pt-2">
          Gemini may produce inaccurate information, including about people, so double-check its responses.
        </p>
      </footer>
    </div>
  );
};

export default ChatView;