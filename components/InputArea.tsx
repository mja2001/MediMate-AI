import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Loader2, Mic, MicOff } from 'lucide-react';
import { Attachment } from '../types';

interface InputAreaProps {
  onSendMessage: (text: string, attachment?: Attachment) => void;
  isLoading: boolean;
  inputValue: string;
  setInputValue: (val: string) => void;
}

export const InputArea: React.FC<InputAreaProps> = ({ 
  onSendMessage, 
  isLoading, 
  inputValue, 
  setInputValue 
}) => {
  const [attachment, setAttachment] = useState<Attachment | undefined>(undefined);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const initialTextRef = useRef<string>('');

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleSend = () => {
    if ((!inputValue.trim() && !attachment) || isLoading) return;
    onSendMessage(inputValue, attachment);
    setInputValue('');
    setAttachment(undefined);
    // Stop recording if active when sending
    if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,") to get just the data
      const base64Data = base64String.split(',')[1];
      
      setAttachment({
        mimeType: file.type,
        data: base64Data
      });
    };
    reader.readAsDataURL(file);
    
    // Reset input value so same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = () => {
    setAttachment(undefined);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    // Save current text to append to
    initialTextRef.current = inputValue;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      
      // We construct the new value by taking what was there before start + what has been recognized since start
      const currentSessionTranscript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');

      const separator = initialTextRef.current && !initialTextRef.current.endsWith(' ') ? ' ' : '';
      setInputValue(initialTextRef.current + separator + currentSessionTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className="bg-white border-t border-slate-100 p-4 sticky bottom-0 z-20">
      <div className="max-w-4xl mx-auto">
        {attachment && (
          <div className="mb-3 flex items-start animate-fade-in-up">
            <div className="relative group">
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200">
                <img 
                  src={`data:${attachment.mimeType};base64,${attachment.data}`} 
                  alt="Attachment preview" 
                  className="w-full h-full object-cover"
                />
              </div>
              <button 
                onClick={removeAttachment}
                className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-0.5 shadow-md hover:bg-red-500 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="ml-3 text-xs text-slate-500 max-w-[200px]">
              <p className="font-medium text-slate-700">Image attached</p>
              <p>Ready to analyze.</p>
            </div>
          </div>
        )}
        
        <div className={`flex items-end gap-2 bg-slate-50 p-2 rounded-xl border transition-all ${
            isListening ? 'border-red-400 ring-1 ring-red-400 bg-red-50' : 'border-slate-200 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500'
        }`}>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
            title="Attach image"
            disabled={isLoading || isListening}
          >
            <Paperclip size={20} />
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </button>
          
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : "Type a message or upload a photo..."}
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-2.5 text-slate-700 placeholder:text-slate-400"
            rows={1}
            disabled={isLoading}
          />
          
          <button
            onClick={toggleListening}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isListening 
                ? 'bg-red-500 text-white hover:bg-red-600 shadow-md animate-pulse' 
                : 'text-slate-400 hover:text-teal-600 hover:bg-teal-50'
            }`}
            title={isListening ? "Stop recording" : "Voice input"}
            disabled={isLoading}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <button
            onClick={handleSend}
            disabled={(!inputValue.trim() && !attachment) || isLoading}
            className={`p-2 rounded-lg transition-all duration-200 ${
              (!inputValue.trim() && !attachment) || isLoading
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
            }`}
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
        <div className="text-center mt-2">
           <p className="text-[10px] text-slate-400">
             MediMate AI can make mistakes. Please verify important information with a doctor.
           </p>
        </div>
      </div>
    </div>
  );
};
