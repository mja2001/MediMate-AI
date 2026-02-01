import React from 'react';
import { X, Calendar, FileText, ChevronRight, History } from 'lucide-react';
import { Message } from '../types';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  onSelectMessage: (messageId: string) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ isOpen, onClose, messages, onSelectMessage }) => {
  // Filter for user messages that have attachments
  const documentEvents = messages.reduce((acc, msg, index) => {
    if (msg.role === 'user' && msg.attachment) {
      // Find corresponding response
      const response = messages[index + 1];
      if (response && response.role === 'model') {
        acc.push({
          request: msg,
          response: response
        });
      }
    }
    return acc;
  }, [] as { request: Message, response: Message }[]).reverse(); // Newest first

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity animate-fade-in" 
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
              <History size={20} className="text-teal-600" />
              Document History
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {documentEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                  <FileText size={32} />
                </div>
                <h3 className="text-slate-900 font-medium mb-1">No documents yet</h3>
                <p className="text-slate-500 text-sm">Upload medical documents to see your history here.</p>
              </div>
            ) : (
              documentEvents.map((event) => (
                <div 
                  key={event.request.id} 
                  onClick={() => onSelectMessage(event.request.id)}
                  className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-teal-300 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex p-3 gap-3">
                    <div className="w-20 h-20 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden border border-slate-100 relative">
                       {event.request.attachment?.mimeType.startsWith('image/') ? (
                         <img 
                           src={`data:${event.request.attachment.mimeType};base64,${event.request.attachment.data}`} 
                           alt="Document" 
                           className="w-full h-full object-cover"
                         />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-slate-400">
                           <FileText size={24} />
                         </div>
                       )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                        <Calendar size={12} />
                        <span>{new Date(event.request.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-800 line-clamp-1 mb-1">
                        {event.request.text || "Analyzed Document"}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {event.response.text.replace(/[#*`]/g, '')}
                      </p>
                    </div>
                  </div>
                  <div className="bg-slate-50 px-3 py-2 text-xs font-medium text-teal-700 flex items-center justify-between group-hover:bg-teal-50 transition-colors">
                    <span>View Analysis</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};
