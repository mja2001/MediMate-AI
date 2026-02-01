import React from 'react';
import { Message } from '../types';
import { Bot, User, FileImage } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

// Simple formatter for basic markdown-like syntax without heavy libraries
const formatText = (text: string) => {
  return text.split('\n').map((line, i) => {
    // Headers
    if (line.startsWith('## ')) {
      return <h3 key={i} className="text-lg font-bold text-teal-800 mt-4 mb-2">{line.replace('## ', '')}</h3>;
    }
    if (line.startsWith('# ')) {
      return <h2 key={i} className="text-xl font-bold text-teal-900 mt-5 mb-3">{line.replace('# ', '')}</h2>;
    }
    // Bullet points
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      return (
        <div key={i} className="flex items-start ml-2 mb-1">
          <span className="mr-2 text-teal-500">•</span>
          <span>{line.trim().substring(2)}</span>
        </div>
      );
    }
    // Bold text (simple regex for **text**)
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <p key={i} className={`mb-2 ${line.trim() === '' ? 'h-2' : ''}`}>
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="font-semibold text-slate-800">{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </p>
    );
  });
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isModel = message.role === 'model';

  return (
    <div className={`flex w-full mb-6 ${isModel ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isModel ? 'flex-row' : 'flex-row-reverse'} gap-3`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-sm ${
          isModel ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-600'
        }`}>
          {isModel ? <Bot size={20} /> : <User size={20} />}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col ${isModel ? 'items-start' : 'items-end'}`}>
          <div className={`px-5 py-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed ${
            isModel 
              ? 'bg-white text-slate-700 rounded-tl-none border border-slate-100' 
              : 'bg-teal-600 text-white rounded-tr-none'
          }`}>
            {message.attachment && (
              <div className="mb-3 rounded-lg overflow-hidden border border-white/20">
                 {message.attachment.mimeType.startsWith('image/') ? (
                    <img 
                      src={`data:${message.attachment.mimeType};base64,${message.attachment.data}`} 
                      alt="User uploaded content" 
                      className="max-w-full max-h-64 object-cover"
                    />
                 ) : (
                   <div className="flex items-center gap-2 p-3 bg-white/10">
                     <FileImage size={20} />
                     <span className="text-xs">Attached File</span>
                   </div>
                 )}
              </div>
            )}
            
            <div className={isModel ? 'prose-sm' : ''}>
              {isModel ? formatText(message.text) : <p>{message.text}</p>}
            </div>
          </div>
          <span className="text-xs text-slate-400 mt-1 px-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};
