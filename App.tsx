import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Message, ChatSession } from './types';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';

const App: React.FC = () => {
  const [chats, setChats] = useState<ChatSession[]>(() => {
    try {
      const savedChats = localStorage.getItem('gemini-chat-history');
      return savedChats ? JSON.parse(savedChats) : [];
    } catch (error) {
      console.error("Failed to load chats from localStorage", error);
      return [];
    }
  });

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const genAI = useRef<GoogleGenAI | null>(null);

  useEffect(() => {
    // Initialize the AI model
    try {
      if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
      }
      genAI.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } catch (e: any) {
      console.error(e);
      setError("Failed to initialize the AI model. Please check your API key and reload the page.");
    }

    // Determine the active chat on initial load
    if (chats.length > 0 && !activeChatId) {
        const savedActiveId = localStorage.getItem('gemini-active-chat-id');
        if (savedActiveId && chats.some(c => c.id === savedActiveId)) {
            setActiveChatId(savedActiveId);
        } else {
            setActiveChatId(chats[0].id);
        }
    }
  }, []);

  // Persist chats and active chat ID to localStorage
  useEffect(() => {
    localStorage.setItem('gemini-chat-history', JSON.stringify(chats));
    if (activeChatId) {
        localStorage.setItem('gemini-active-chat-id', activeChatId);
    } else {
        localStorage.removeItem('gemini-active-chat-id');
    }
  }, [chats, activeChatId]);


  const activeChat = chats.find(chat => chat.id === activeChatId);

  const renameChat = (id: string, title: string) => {
    setChats(chats.map(chat => (chat.id === id ? { ...chat, title } : chat)));
  };

  const deleteChat = (idToDelete: string) => {
    const updatedChats = chats.filter(chat => chat.id !== idToDelete);
    setChats(updatedChats);

    if (activeChatId === idToDelete) {
        if (updatedChats.length > 0) {
            const deletedIndex = chats.findIndex(chat => chat.id === idToDelete);
            const newIndex = Math.max(0, deletedIndex - 1);
            setActiveChatId(updatedChats[newIndex]?.id || null);
        } else {
            setActiveChatId(null);
        }
    }
  };

  const generateChatTitle = async (chatId: string, userPrompt: string, modelResponse: string) => {
    try {
      if (!genAI.current) return;
      const titlePrompt = `Summarize this conversation with a short title (max 5 words):\n\nUser: "${userPrompt}"\nAssistant: "${modelResponse}"\n\nTitle:`;
      const result = await genAI.current.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: titlePrompt
      });
      const newTitle = result.text.trim().replace(/"/g, '');
      if (newTitle) {
        renameChat(chatId, newTitle);
      }
    } catch (e) {
      console.error("Failed to generate chat title:", e);
    }
  };

  const sendMessage = async (text: string) => {
    let currentChatId = activeChatId;

    // If there's no active chat, create a new one first
    if (!currentChatId) {
        const newChat: ChatSession = {
          id: crypto.randomUUID(),
          title: "New Chat",
          messages: []
        };
        setChats(prev => [newChat, ...prev]);
        setActiveChatId(newChat.id);
        currentChatId = newChat.id;
    }
    
    if (!genAI.current || !currentChatId) return;

    setIsLoading(true);
    setError(null);
    const userMessage: Message = { role: 'user', content: text };
    
    const isFirstMessage = chats.find(c => c.id === currentChatId)?.messages.length === 0;

    // Add user message to state
    setChats(prev => prev.map(chat =>
      chat.id === currentChatId
        ? { ...chat, messages: [...chat.messages, userMessage] }
        : chat
    ));
    
    const history = (chats.find(c => c.id === currentChatId)?.messages || []).map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
    }));

    try {
      const stream = await genAI.current.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: [...history, { role: 'user', parts: [{ text }] }],
        config: {
          systemInstruction: 'You are a helpful assistant, designed to mimic the style and functionality of ChatGPT. Provide informative, creative, and well-structured responses.',
        }
      });
      
      let modelResponse = '';
      setChats(prev => prev.map(c => c.id === currentChatId ? {...c, messages: [...c.messages, {role: 'model', content: ''}]} : c));

      for await (const chunk of stream) {
        modelResponse += chunk.text;
        setChats(prev => prev.map(c => {
            if (c.id === currentChatId) {
                const newMessages = [...c.messages];
                if (newMessages.length > 0) {
                  newMessages[newMessages.length - 1].content = modelResponse;
                }
                return { ...c, messages: newMessages };
            }
            return c;
        }));
      }

      if (isFirstMessage) {
        await generateChatTitle(currentChatId, text, modelResponse);
      }
    } catch (e: any) {
      console.error(e);
      const errorMessage = "An error occurred while communicating with the AI. Please try again.";
      setError(errorMessage);
      setChats(prev => prev.map(c => c.id === currentChatId ? {...c, messages: [...c.messages, { role: 'model', content: "Sorry, I couldn't process that. Please try again." }]} : c));
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setError(null);
    const newChat: ChatSession = {
      id: crypto.randomUUID(),
      title: "New Chat",
      messages: []
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  };

  const selectChat = (id: string) => {
    setError(null);
    setActiveChatId(id);
  }

  return (
    <div className="flex h-screen overflow-hidden text-white">
      <Sidebar 
        chats={chats}
        activeChatId={activeChatId}
        startNewChat={startNewChat} 
        selectChat={selectChat}
        renameChat={renameChat}
        deleteChat={deleteChat}
      />
      <div className="flex-1 flex flex-col bg-[#343541]">
        {error && (
            <div className="bg-red-500 text-white p-4 text-center">
                {error}
            </div>
        )}
        <ChatView
          key={activeChatId} 
          messages={activeChat?.messages || []} 
          isLoading={isLoading} 
          onSendMessage={sendMessage}
        />
      </div>
    </div>
  );
};

export default App;