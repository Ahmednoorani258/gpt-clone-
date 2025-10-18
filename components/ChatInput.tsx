import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { SendIcon } from './Icons';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      // Set a max-height to prevent infinite growth
      const maxHeight = 208; // Equivalent to max-h-52
      if (textareaRef.current.scrollHeight > maxHeight) {
        textareaRef.current.style.height = `${maxHeight}px`;
        textareaRef.current.style.overflowY = 'auto';
      } else {
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        textareaRef.current.style.overflowY = 'hidden';
      }
    }
  }, [inputValue]);

  const handleSubmit = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSubmit = inputValue.trim() && !isLoading;

  return (
    <div className="relative flex items-center bg-[#40414f] rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.10)] border border-gray-700">
      <textarea
        ref={textareaRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message Gemini..."
        rows={1}
        className="w-full bg-transparent p-4 pr-12 text-white placeholder-gray-400 resize-none focus:outline-none max-h-52"
        disabled={isLoading}
      />
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors"
      >
        <SendIcon className={`w-5 h-5 ${canSubmit ? 'text-white' : 'text-gray-500'}`} />
      </button>
    </div>
  );
};

export default ChatInput;