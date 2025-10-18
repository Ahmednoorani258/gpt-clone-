import React from 'react';
import { Message } from '../types';
import { UserIcon, GeminiIcon } from './Icons';

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
}

// A simple markdown-like parser to format code blocks
const FormattedContent: React.FC<{ content: string }> = ({ content }) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return (
        <div className="prose prose-invert max-w-none">
            {parts.map((part, index) => {
                if (part.startsWith('```') && part.endsWith('```')) {
                    const codeBlock = part.slice(3, -3);
                    const language = codeBlock.match(/^(.*?)\n/)?.[1] || '';
                    const code = language ? codeBlock.substring(language.length + 1) : codeBlock;
                    return (
                        <div key={index} className="bg-black rounded-md my-4">
                            <div className="flex items-center justify-between px-4 py-1 bg-gray-800 rounded-t-md">
                                <span className="text-xs text-gray-400">{language || 'code'}</span>
                                <button className="text-xs text-gray-400 hover:text-white" onClick={() => navigator.clipboard.writeText(code)}>Copy code</button>
                            </div>
                            <pre className="p-4 overflow-x-auto"><code className={`language-${language}`}>{code}</code></pre>
                        </div>
                    );
                }
                return <p key={index} className="whitespace-pre-wrap">{part}</p>;
            })}
        </div>
    );
};


const LoadingCursor: React.FC = () => (
  <span className="animate-ping inline-block w-2 h-4 bg-white" />
);


const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLoading = false }) => {
  const isUserModel = message.role === 'user';
  
  return (
    <div className={`py-6 ${!isUserModel ? 'bg-[#444654]' : ''}`}>
        <div className="max-w-3xl mx-auto px-4 md:px-0 flex gap-4">
            <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full">
                {isUserModel ? (
                    <div className="w-full h-full flex items-center justify-center rounded-full bg-[#19c37d]">
                        <UserIcon className="w-5 h-5 text-white" /> 
                    </div>
                ) : <GeminiIcon className="w-7 h-7" />}
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-gray-200 leading-relaxed">
                   {message.content === '...' && isLoading ? <LoadingCursor /> : <FormattedContent content={message.content} />}
                </div>
            </div>
        </div>
    </div>
  );
};

export default ChatMessage;