
import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  Mic, 
  Menu, 
  X, 
  Sparkles,
  Zap,
  Cpu,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import MessageBubble from './components/MessageBubble';
import { Message, ChatSession } from './types';
import { streamAIResponse } from './services/geminiService';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isAiResponding, setIsAiResponding] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages, isAiResponding]);

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Logical Thread',
      messages: [],
      updatedAt: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setIsSidebarOpen(false);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeSessionId || isAiResponding) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: Date.now()
    };

    const targetSessionId = activeSessionId;

    // Add user message to state
    setSessions(prev => prev.map(s => {
      if (s.id === targetSessionId) {
        return {
          ...s,
          messages: [...s.messages, userMessage],
          updatedAt: Date.now(),
          title: s.messages.length === 0 ? inputText.slice(0, 30) + (inputText.length > 30 ? '...' : '') : s.title
        };
      }
      return s;
    }));

    setInputText('');
    setIsAiResponding(true);

    try {
      const currentSession = sessions.find(s => s.id === targetSessionId);
      const messageHistory = [...(currentSession?.messages || []), userMessage];
      
      let fullAssistantContent = '';
      const assistantMessageId = (Date.now() + 1).toString();

      // Create empty assistant message
      setSessions(prev => prev.map(s => {
        if (s.id === targetSessionId) {
          return {
            ...s,
            messages: [...s.messages, {
              id: assistantMessageId,
              role: 'assistant',
              content: '',
              timestamp: Date.now()
            }]
          };
        }
        return s;
      }));

      // Stream the response
      await streamAIResponse(messageHistory, (chunk) => {
        fullAssistantContent += chunk;
        setSessions(prev => prev.map(s => {
          if (s.id === targetSessionId) {
            const updatedMessages = s.messages.map(m => 
              m.id === assistantMessageId ? { ...m, content: fullAssistantContent } : m
            );
            return { ...s, messages: updatedMessages };
          }
          return s;
        }));
      });

    } catch (error) {
      console.error("Failed to get response", error);
      // Handle error state
    } finally {
      setIsAiResponding(false);
    }
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(null);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#020617] text-slate-200 overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-900/10 blur-[120px] rounded-full z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/10 blur-[120px] rounded-full z-0" />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop always visible, Mobile hidden via transform */}
      <aside className={`fixed md:relative inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <Sidebar 
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={setActiveSessionId}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
        />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 z-10 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-white/5 glass sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 md:hidden hover:bg-white/5 rounded-lg transition-colors"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center font-bold text-white shadow-lg">
                O
              </div>
              <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">OAI</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Neural Live</span>
            </div>
            <div className="w-10 h-10 rounded-full border border-white/10 p-0.5 shadow-lg shadow-black/20 hover:scale-105 transition-transform cursor-pointer">
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-sm font-bold text-white uppercase tracking-tighter">
                OM
              </div>
            </div>
          </div>
        </header>

        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8" ref={chatContainerRef}>
          {!activeSessionId ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto px-4">
              <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center shadow-[0_0_50px_rgba(139,92,246,0.2)] animate-pulse mb-8 border border-white/20">
                <span className="text-6xl font-black text-white italic">O</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-white">OM AI</h1>
              <p className="text-slate-400 text-lg md:text-xl font-light mb-12 tracking-wide">The Future of Logical Reasoning</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                {[
                  { icon: <Sparkles className="w-5 h-5" />, label: "Intelligent Synthesis", desc: "Summarize complex papers" },
                  { icon: <Zap className="w-5 h-5" />, label: "Rapid Coding", desc: "Build enterprise apps" },
                  { icon: <ShieldCheck className="w-5 h-5" />, label: "Safe Execution", desc: "Private data processing" }
                ].map((feature, i) => (
                  <div key={i} className="glass p-5 rounded-2xl border border-white/5 hover:border-violet-500/30 transition-all cursor-pointer group">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 text-violet-400 group-hover:bg-violet-500/10 transition-colors">
                      {feature.icon}
                    </div>
                    <h3 className="font-bold text-white mb-1">{feature.label}</h3>
                    <p className="text-xs text-slate-500">{feature.desc}</p>
                  </div>
                ))}
              </div>

              <button 
                onClick={handleNewChat}
                className="mt-12 px-8 py-3 rounded-full bg-white text-slate-950 font-bold hover:bg-slate-200 transition-colors shadow-xl"
              >
                Initiate Logical Thread
              </button>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto pb-32">
              {activeSession?.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Cpu className="w-16 h-16 text-slate-800 mb-6" />
                  <h2 className="text-2xl font-bold text-slate-600">Thread Initialized</h2>
                  <p className="text-slate-500 max-w-sm mt-2">OM AI is ready to analyze your request. What's on your mind?</p>
                </div>
              ) : (
                activeSession?.messages.map((m) => (
                  <MessageBubble key={m.id} message={m} />
                ))
              )}
              {isAiResponding && (
                <div className="flex gap-2 items-center text-slate-500 text-xs font-medium px-4 py-2 animate-pulse">
                  <Sparkles className="w-3 h-3 text-violet-500" />
                  <span>OM AI is synthesizing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        {activeSessionId && (
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-[#020617] via-[#020617]/90 to-transparent">
            <div className="max-w-4xl mx-auto relative group">
              <form 
                onSubmit={handleSendMessage}
                className={`flex items-center gap-3 p-2 pl-4 rounded-2xl glass transition-all duration-500 border
                  ${isTyping ? 'border-violet-500/50 shadow-[0_0_20px_rgba(139,92,246,0.2)]' : 'border-white/10'}
                `}
              >
                <button type="button" className="p-2 text-slate-500 hover:text-cyan-400 transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                
                <input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onFocus={() => setIsTyping(true)}
                  onBlur={() => setIsTyping(false)}
                  placeholder="Ask OM AI anything..."
                  className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder:text-slate-600 py-3 text-[15px]"
                />

                <div className="flex items-center gap-1">
                  <button type="button" className="p-2 text-slate-500 hover:text-violet-400 transition-colors">
                    <Mic className="w-5 h-5" />
                  </button>
                  <button 
                    type="submit"
                    disabled={!inputText.trim() || isAiResponding}
                    className={`p-2 rounded-xl transition-all duration-300
                      ${inputText.trim() && !isAiResponding 
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg' 
                        : 'bg-white/5 text-slate-700 cursor-not-allowed'
                      }
                    `}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
              <div className="mt-3 flex justify-center gap-6 text-[10px] font-bold text-slate-600 uppercase tracking-widest pointer-events-none">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> End-to-End Encrypted</span>
                <span className="flex items-center gap-1.5"><ChevronDown className="w-3 h-3" /> v3.0 Pro Model</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
