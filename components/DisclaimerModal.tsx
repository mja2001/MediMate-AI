import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface DisclaimerModalProps {
  onAccept: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ onAccept }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in-up">
        <div className="bg-teal-600 p-6 text-white text-center">
          <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Important Disclaimer</h2>
        </div>
        
        <div className="p-6 space-y-4 text-slate-600">
          <p className="font-medium text-slate-800">
            MediMate AI is an informational tool, not a doctor.
          </p>
          
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="text-teal-600 mt-0.5">•</span>
              <span>We <strong>do not</strong> provide medical diagnoses, prescriptions, or treatment plans.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-teal-600 mt-0.5">•</span>
              <span>Information provided is for educational purposes only.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-teal-600 mt-0.5">•</span>
              <span><strong>Always</strong> consult a qualified healthcare professional for medical advice.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-500 mt-0.5 font-bold">!</span>
              <span className="text-red-600 font-medium">If you have a medical emergency, call emergency services immediately.</span>
            </li>
          </ul>

          <button
            onClick={onAccept}
            className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            <span>I Understand & Agree</span>
            <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
