
import React from 'react';
import { Message } from '../types';
import CodeBlock from './CodeBlock';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Basic markdown-like parsing for code blocks
  const renderContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        const language = match?.[1] || '';
        const code = match?.[2] || part.replace(/```/g, '').trim();
        return <CodeBlock key={index} code={code} language={language} />;
      }
      
      // Basic paragraph split for non-code text
      return part.split('\n').map((line, i) => (
        <p key={`${index}-${i}`} className={line.trim() === '' ? 'h-2' : 'mb-1 last:mb-0'}>
          {line}
        </p>
      ));
    });
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] md:max-w-[75%] px-5 py-3 rounded-2xl glass transition-all duration-300
          ${isUser 
            ? 'border-cyan-500/30 text-cyan-50 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
            : 'border-violet-500/30 text-slate-200 shadow-[0_0_15px_rgba(139,92,246,0.1)]'
          }
        `}
      >
        <div className="text-[15px] leading-relaxed">
          {renderContent(message.content)}
        </div>
        <div className="mt-2 text-[10px] opacity-40 uppercase tracking-widest font-medium">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
