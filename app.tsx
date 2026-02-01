import React, { useState, useEffect, useRef } from 'react';
import { HeartPulse, History, Settings, MoreVertical, FileText, Activity, Pill, HelpCircle } from 'lucide-react';
import { Message, ChatState, AppView, Attachment } from './types';
import { sendMessageToGemini } from './services/geminiService';
import { DisclaimerModal } from './components/DisclaimerModal';
import { MessageBubble } from './components/MessageBubble';
import { InputArea } from './components/InputArea';
import { DocumentAnalysisModal } from './components/DocumentAnalysisModal';
import { HistorySidebar } from './components/HistorySidebar';

const INITIAL_MESSAGE: Message = {
  id: 'init-1',
  role: 'model',
  text: "Hello! I'm MediMate AI, your personal healthcare companion. 👋\n\nI can help you understand medical documents, track symptoms visually, or answer health questions.\n\n**Please note:** I am an AI, not a doctor. Always consult a professional for medical advice.\n\nHow can I help you today?",
  timestamp: Date.now()
};

const SUGGESTIONS = [
  {
    icon: <FileText size={24} />,
    title: "Analyze Lab Report",
    prompt: "I'm uploading my recent blood test results. Can you help me understand what they mean?",
    action: 'populate'
  },
  {
    icon: <Activity size={24} />,
    title: "Track Symptoms",
    prompt: "I have a rash on my arm. Here's a photo. What should I know about it?",
    action: 'populate'
  },
  {
    icon: <Pill size={24} />,
    title: "Medication Info",
    prompt: "I was prescribed Lisinopril 10mg. What does this medication do and what should I watch out for?",
    action: 'send'
  },
  {
    icon: <HelpCircle size={24} />,
    title: "Health Question",
    prompt: "What does it mean when my doctor says I have elevated liver enzymes?",
    action: 'send'
  }
];

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.DISCLAIMER);
  const [chatState, setChatState] = useState<ChatState>({
    messages: [INITIAL_MESSAGE],
    isLoading: false,
    error: null
  });
  const [inputText, setInputText] = useState('');
  const [showDocModal, setShowDocModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Only scroll to bottom if we are not viewing history and a new message comes in
    // or if it's the initial load
    scrollToBottom();
  }, [chatState.messages]);

  const handleDisclaimerAccept = () => {
    setView(AppView.CHAT);
  };

  const handleSendMessage = async (text: string, attachment?: Attachment) => {
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      attachment,
      timestamp: Date.now()
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, newUserMessage],
      isLoading: true,
      error: null
    }));

    try {
      const responseText = await sendMessageToGemini(
        chatState.messages,
        text,
        attachment
      );

      const newBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, newBotMessage],
        isLoading: false
      }));
    } catch (error) {
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: "I'm having trouble connecting right now. Please try again."
      }));
    }
  };

  const handleSuggestionClick = (suggestion: typeof SUGGESTIONS[0]) => {
    if (suggestion.action === 'populate') {
      setInputText(suggestion.prompt);
    } else {
      handleSendMessage(suggestion.prompt);
    }
  };

  const handleScrollToMessage = (messageId: string) => {
    setShowHistory(false);
    // Slight delay to allow sidebar to close
    setTimeout(() => {
      const element = messageRefs.current.get(messageId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Optional: Add a highlight effect class here if desired
      }
    }, 100);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden relative">
      {view === AppView.DISCLAIMER && (
        <DisclaimerModal onAccept={handleDisclaimerAccept} />
      )}
      
      <DocumentAnalysisModal 
        isOpen={showDocModal}
        onClose={() => setShowDocModal(false)}
        onAnalyze={handleSendMessage}
      />

      <HistorySidebar 
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        messages={chatState.messages}
        onSelectMessage={handleScrollToMessage}
      />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-6 shadow-sm flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-teal-200 shadow-lg">
            <HeartPulse size={24} />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg leading-tight">MediMate AI</h1>
            <p className="text-xs text-teal-600 font-medium">Healthcare Companion</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={() => setShowDocModal(true)}
             className="flex items-center gap-2 bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-2 rounded-lg transition-colors mr-2 border border-teal-200 shadow-sm"
             title="Upload Medical Document"
           >
             <FileText size={18} />
             <span className="hidden md:inline text-sm font-medium">Analyze Doc</span>
           </button>
           <button 
             onClick={() => setShowHistory(true)}
             className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors hidden md:block"
             title="History"
           >
             <History size={20} />
           </button>
           <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors hidden md:block">
             <Settings size={20} />
           </button>
           <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
             <MoreVertical size={20} />
           </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto scrollbar-hide p-4 md:p-6 pb-0">
        <div className="max-w-4xl mx-auto flex flex-col min-h-full justify-end">
           {/* Welcome Helper (Only show if just init message) */}
           {chatState.messages.length === 1 && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 px-2 md:px-4">
               {SUGGESTIONS.map((s, idx) => (
                 <button 
                   key={idx}
                   onClick={() => handleSuggestionClick(s)}
                   className="group flex items-center gap-4 bg-white border border-slate-200 hover:border-teal-400 hover:shadow-md hover:bg-teal-50/30 p-4 rounded-xl transition-all text-left"
                 >
                   <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                     {s.icon}
                   </div>
                   <div>
                     <h3 className="font-semibold text-slate-800 text-sm md:text-base group-hover:text-teal-700">{s.title}</h3>
                     <p className="text-xs text-slate-500 line-clamp-1">{s.prompt}</p>
                   </div>
                 </button>
               ))}
             </div>
           )}

           {chatState.messages.map((msg) => (
             <div 
               key={msg.id}
               ref={(el) => {
                 if (el) messageRefs.current.set(msg.id, el);
                 else messageRefs.current.delete(msg.id);
               }}
             >
               <MessageBubble message={msg} />
             </div>
           ))}
           
           {chatState.isLoading && (
             <div className="flex w-full mb-6 justify-start">
                <div className="flex max-w-[75%] flex-row gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
                    <HeartPulse size={16} className="animate-pulse" />
                  </div>
                  <div className="bg-white border border-slate-100 px-5 py-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
             </div>
           )}
           
           {chatState.error && (
             <div className="w-full text-center my-4">
               <span className="bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm font-medium">
                 {chatState.error}
               </span>
             </div>
           )}

           <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* Input Area */}
      <InputArea 
        onSendMessage={handleSendMessage} 
        isLoading={chatState.isLoading}
        inputValue={inputText}
        setInputValue={setInputText}
      />
    </div>
  );
};

export default App;
