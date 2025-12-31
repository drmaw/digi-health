import React from 'react';
import { UserProfile } from '../types';

interface ConfirmationModalProps {
  user: UserProfile;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ user, onConfirm, onCancel, title = "পেশেন্ট ভেরিফিকেশন (Verify Patient)" }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-700" onClick={onCancel}></div>
      
      <div className="relative bg-white rounded-[4rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] max-w-lg w-full p-16 animate-in zoom-in slide-in-from-bottom-20 duration-500 overflow-hidden border border-white/20">
        {/* Verification Strip */}
        <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600"></div>
        
        <div className="text-center space-y-12">
          <div className="mx-auto w-40 h-40 rounded-[3.5rem] border-8 border-slate-50 shadow-2xl overflow-hidden relative group transform hover:rotate-3 transition-transform duration-500">
            <img 
              src={user.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} 
              className="w-full h-full object-cover"
              alt={user.name} 
            />
          </div>
          
          <div className="space-y-6">
            <div className="flex justify-center mb-4">
              <span className="ui-badge bg-emerald-100 text-emerald-800 px-6 py-2 rounded-full border-2 border-emerald-200 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                IDENTITY VERIFIED
              </span>
            </div>
            <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">{user.name}</h3>
            <div className="bg-slate-50 px-8 py-4 rounded-[2rem] border-2 border-slate-100 inline-block">
               <p className="text-emerald-600 font-mono font-black text-3xl tracking-tighter">
                 {user.healthId}
               </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-8">
             <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Age</p>
                <p className="text-2xl font-black text-slate-800">{user.age} Yrs</p>
             </div>
             <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Blood</p>
                <p className="text-2xl font-black text-slate-800">{user.bloodGroup || 'N/A'}</p>
             </div>
          </div>

          <div className="bg-slate-950 p-8 rounded-[2.5rem] text-left border border-white/5">
             <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-3">
               🛡️ Clinical Declaration
             </p>
             <p className="text-xs font-bold text-slate-300 leading-relaxed italic opacity-80">
               "Authorized clinical access requested. I declare this inquiry is for immediate medical care purposes."
             </p>
          </div>

          <div className="flex flex-col gap-6 pt-6">
            <button 
              onClick={onConfirm} 
              className="ui-btn ui-btn-primary py-8 text-2xl shadow-[0_30px_60px_-15px_rgba(16,185,129,0.4)] rounded-[3rem] w-full active:scale-95 transition-all hover:bg-emerald-600"
            >
              Verify & Access
            </button>
            <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 text-xs font-black uppercase tracking-[0.3em] transition-colors">
              Abort Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};