
import React from 'react';
import { useApp } from '../store';

export default function Home() {
  const { t } = useApp();
  return (
    <div className="max-w-4xl mx-auto py-10 space-y-10">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-black text-slate-900 leading-tight">
          ডিজিটাল স্বাস্থ্যসেবা এখন <br/>
          <span className="text-emerald-600">আপনার হাতের মুঠোয়</span>
        </h1>
        <p className="text-slate-500 text-lg">আপনার ১০ সংখ্যার হেলথ আইডি ব্যবহার করে যেকোনো ক্লিনিক বা হাসপাতালে স্মার্ট সেবা গ্রহণ করুন।</p>
        <div className="flex justify-center gap-4">
          <button className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-emerald-200">হেলথ আইডি চেক করুন</button>
          <button className="bg-white border-2 px-8 py-4 rounded-2xl font-bold">বিস্তারিত জানুন</button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {[ {l: 'নিরাপদ ডেটা', i: '🛡️'}, {l: 'স্মার্ট কার্ড', i: '💳'}, {l: 'তাৎক্ষণিক রিপোর্ট', i: '📄'} ].map(x => (
          <div key={x.l} className="bg-white p-6 rounded-3xl border text-center space-y-2">
            <div className="text-3xl">{x.i}</div>
            <p className="font-bold text-slate-800">{x.l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
