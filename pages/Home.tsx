import React from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';

export default function Home() {
  const { t, currentUser } = useApp();

  return (
    <div className="max-w-4xl mx-auto py-16 space-y-16 animate-in fade-in">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-black text-slate-900 leading-tight tracking-tight">
          ডিজিটাল স্বাস্থ্যসেবা <br/>
          <span className="text-emerald-600">এখন আপনার হাতে</span>
        </h1>
        <p className="text-slate-500 text-xl max-w-2xl mx-auto leading-relaxed">
          আপনার হেলথ আইডি ব্যবহার করে যেকোনো প্রান্ত থেকে স্মার্ট স্বাস্থ্যসেবা গ্রহণ করুন। নিরাপদ, দ্রুত এবং আধুনিক।
        </p>
        
        <div className="flex justify-center gap-4">
          {currentUser ? (
            <Link to="/profile" className="bg-emerald-600 text-white px-10 py-5 rounded-[2rem] font-black text-lg shadow-2xl shadow-emerald-200 hover:scale-105 transition-transform">
              আমার ড্যাশবোর্ড দেখুন
            </Link>
          ) : (
             <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">লগইন করুন শুরু করতে</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[ 
          { l: 'নিরাপদ ডেটা', i: '🛡️', d: 'আপনার সকল তথ্য এনক্রিপ্টেড থাকে।' }, 
          { l: 'স্মার্ট আইডি', i: '💳', d: '১০ সংখ্যার অনন্য হেলথ আইডি।' }, 
          { l: 'ডিজিটাল রিপোর্ট', i: '📄', d: 'সহজ এবং দ্রুত অনলাইন রিপোর্ট।' } 
        ].map(x => (
          <div key={x.l} className="bg-white p-10 rounded-[3rem] border border-slate-100 text-center space-y-4 hover:shadow-xl transition-all group">
            <div className="text-5xl group-hover:scale-125 transition-transform">{x.i}</div>
            <div>
              <h3 className="font-black text-slate-800 text-lg">{x.l}</h3>
              <p className="text-slate-400 text-xs font-bold mt-2 uppercase">{x.d}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}