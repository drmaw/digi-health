
import React from 'react';
import { UserProfile } from '../types';

interface ProfileCardProps {
  user: UserProfile;
  onClick: (user: UserProfile) => void;
  isSelected?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ user, onClick, isSelected }) => {
  return (
    <div 
      onClick={() => onClick(user)}
      className={`group relative flex items-center gap-4 p-5 rounded-[2rem] cursor-pointer transition-all shadow-sm border-2 
        ${isSelected 
          ? 'bg-emerald-50 border-emerald-500 scale-[1.02] shadow-xl shadow-emerald-100' 
          : 'bg-white border-transparent hover:border-emerald-200 hover:shadow-lg'}`}
    >
      <div className="relative">
        <img 
          src={user.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} 
          className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-white shadow-sm" 
          alt={user.name} 
        />
        {user.redFlag?.isPresent && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white font-bold">!</span>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-black text-slate-800 truncate group-hover:text-emerald-700">{user.name}</p>
        </div>
        <div className="flex gap-2 mt-1">
          <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase">{user.gender}</span>
          <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase">{user.age}Y</span>
        </div>
        <p className="text-[10px] font-mono font-bold text-emerald-600 mt-2">{user.healthId}</p>
        <p className="text-[9px] font-bold text-slate-400">{user.phone}</p>
      </div>

      {isSelected && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 text-2xl animate-in zoom-in">
          ✅
        </div>
      )}
    </div>
  );
};
