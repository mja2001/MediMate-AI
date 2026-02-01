import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileText, Loader2 } from 'lucide-react';
import { Attachment } from '../types';

interface DocumentAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyze: (text: string, attachment: Attachment) => void;
}

export const DocumentAnalysisModal: React.FC<DocumentAnalysisModalProps> = ({
  isOpen,
  onClose,
  onAnalyze,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('Please analyze this medical document and explain the key findings in simple terms.');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const handleSubmit = () => {
    if (!file) return;
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      
      const attachment: Attachment = {
        mimeType: file.type,
        data: base64Data
      };

      onAnalyze(prompt, attachment);
      setIsProcessing(false);
      onClose();
      // Reset state
      setFile(null);
      setPreview(null);
      setPrompt('Please analyze this medical document and explain the key findings in simple terms.');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden animate-fade-in-up">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
            <FileText className="text-teal-600" size={20} />
            Analyze Document
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* File Upload Area */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
              file ? 'border-teal-200 bg-teal-50/50' : 'border-slate-200 hover:border-teal-400 hover:bg-slate-50'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
            
            {file ? (
              <div className="relative">
                {preview ? (
                  <img src={preview} alt="Preview" className="h-32 object-contain rounded-md" />
                ) : (
                  <FileText size={48} className="text-teal-600 mb-2" />
                )}
                <p className="text-sm font-medium text-teal-800 mt-2">{file.name}</p>
                <p className="text-xs text-teal-600">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-3">
                  <UploadCloud size={24} />
                </div>
                <p className="font-medium text-slate-700">Click to upload document</p>
                <p className="text-xs text-slate-400 mt-1">Supports images (JPG, PNG)</p>
              </>
            )}
          </div>

          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Question or Instruction
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full rounded-xl border-slate-200 focus:border-teal-500 focus:ring-teal-500 text-sm p-3"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={!file || isProcessing}
              className="flex-1 py-2.5 px-4 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={18} /> : 'Analyze Document'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
