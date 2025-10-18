import React, { useState, useRef, useEffect } from 'react';
import { PlusIcon, MessageSquareIcon, LogOutIcon, UserIcon, PencilIcon, CheckIcon, TrashIcon } from './Icons';
import { ChatSession } from '../types';

interface SidebarProps {
  startNewChat: () => void;
  chats: ChatSession[];
  activeChatId: string | null;
  selectChat: (id: string) => void;
  renameChat: (id: string, title: string) => void;
  deleteChat: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ startNewChat, chats, activeChatId, selectChat, renameChat, deleteChat }) => {
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingChatId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingChatId]);

  const handleRename = () => {
    if (editingChatId && tempTitle.trim()) {
      renameChat(editingChatId, tempTitle.trim());
    }
    setEditingChatId(null);
  };
  
  const handleEditClick = (e: React.MouseEvent, chat: ChatSession) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setTempTitle(chat.title);
  };
  
  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this chat?")) {
        deleteChat(id);
    }
  };

  return (
    <div className="w-64 bg-[#202123] p-2 flex flex-col">
      <button 
        onClick={startNewChat}
        className="flex items-center gap-3 p-3 text-left text-white text-sm rounded-lg border border-gray-700 hover:bg-gray-700/50 transition-colors w-full mb-2"
      >
        <PlusIcon className="h-4 w-4" />
        New Chat
      </button>
      <div className="flex-1 space-y-1 overflow-y-auto">
        {chats.map((chat) => (
          <div key={chat.id}>
            {editingChatId === chat.id ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-700">
                <MessageSquareIcon className="h-4 w-4 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename();
                    if (e.key === 'Escape') setEditingChatId(null);
                  }}
                  className="bg-transparent text-white text-sm focus:outline-none w-full"
                />
                 <button onClick={handleRename} className="text-gray-400 hover:text-white">
                  <CheckIcon className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => selectChat(chat.id)}
                className={`flex items-center gap-3 p-3 text-left text-white text-sm rounded-lg transition-colors w-full group ${activeChatId === chat.id ? 'bg-gray-700/80' : 'hover:bg-gray-700/50'}`}
              >
                <MessageSquareIcon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate flex-1">{chat.title}</span>
                {activeChatId === chat.id && (
                  <span className="flex items-center text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => handleEditClick(e, chat)} className="p-1 hover:text-white">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button onClick={(e) => handleDeleteClick(e, chat.id)} className="p-1 hover:text-white">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </span>
                )}
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="border-t border-gray-700 mt-2 pt-2">
         {/* Clerk social authentication placeholder */}
        <div className="flex items-center gap-3 p-3 text-white text-sm rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer">
          <UserIcon className="h-5 w-5 rounded-full" />
          <span className="font-medium">User Name</span>
        </div>
        <div className="flex items-center gap-3 p-3 text-red-400 text-sm rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer">
          <LogOutIcon className="h-4 w-4" />
          Log out
        </div>
      </div>
    </div>
  );
};

export default Sidebar;