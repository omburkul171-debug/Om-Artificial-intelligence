
import React from 'react';
import { MessageSquarePlus, History, Settings, Trash2, Github } from 'lucide-react';
import { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
}) => {
  return (
    <div className="flex flex-col h-full glass border-r border-white/5 w-72 md:w-80 transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="p-6">
        <button
          onClick={onNewChat}
          className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium shadow-lg hover:shadow-violet-500/20 transition-all duration-300 group"
        >
          <MessageSquarePlus className="w-5 h-5 transition-transform group-hover:scale-110" />
          <span>New Chat</span>
        </button>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-4">
        <div className="flex items-center gap-2 px-2 mb-4 text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">
          <History className="w-3.5 h-3.5" />
          Recent Sessions
        </div>
        
        {sessions.length === 0 ? (
          <div className="text-center py-10 px-6">
            <p className="text-slate-500 text-sm">No recent conversations.</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 border border-transparent
                ${activeSessionId === session.id 
                  ? 'bg-white/5 border-white/10 text-white' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }
              `}
              onClick={() => onSelectSession(session.id)}
            >
              <div className="flex flex-col flex-1 min-w-0 pr-2">
                <span className="text-sm font-medium truncate">{session.title}</span>
                <span className="text-[10px] opacity-40 mt-1">
                  {new Date(session.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer Settings */}
      <div className="p-6 border-t border-white/5 flex flex-col gap-4">
        <div className="flex items-center gap-3 px-2 text-slate-400 hover:text-white cursor-pointer transition-colors">
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">System Settings</span>
        </div>
        <div className="flex items-center gap-3 px-2 text-slate-400 hover:text-white cursor-pointer transition-colors">
          <Github className="w-5 h-5" />
          <span className="text-sm font-medium">OAI Community</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
