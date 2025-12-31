import React, { useState } from 'react';
import { useApp } from '../AppContext';

const Landing: React.FC = () => {
  const { signUp, signIn, signInWithGithub, lang, setLang, t } = useApp();
  const [mode, setMode] = useState<'start' | 'login' | 'register'>('start');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);
    try {
      if (password.length < 6) {
        throw new Error(lang === 'bn' ? "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।" : "Password must be at least 6 characters.");
      }
      await signUp(email, password, name, phone);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGithubLogin = async () => {
    setError(null);
    setIsProcessing(true);
    try {
      await signInWithGithub();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const quickLogin = async (demoEmail: string) => {
    setError(null);
    setIsProcessing(true);
    try {
      await signIn(demoEmail, "password");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const LanguageToggle = () => (
    <div className="fixed top-8 right-8 z-[200] flex bg-white/90 backdrop-blur-xl rounded-[1.5rem] p-2 border shadow-2xl transition-all">
      <button 
        onClick={() => setLang('bn')} 
        className={`px-5 py-2.5 text-xs font-black rounded-xl transition-all ${lang === 'bn' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-slate-400 hover:text-slate-600'}`}
      >
        বাংলা
      </button>
      <button 
        onClick={() => setLang('en')} 
        className={`px-5 py-2.5 text-xs font-black rounded-xl transition-all ${lang === 'en' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-slate-400 hover:text-slate-600'}`}
      >
        EN
      </button>
    </div>
  );

  if (mode === 'register') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-500">
        <LanguageToggle />
        <div className="ui-card max-w-lg w-full p-12 space-y-10">
          <button onClick={() => setMode('start')} className="text-slate-400 font-bold text-xs uppercase hover:text-slate-600 transition-colors tracking-widest flex items-center gap-2">
            <span>←</span> {lang === 'bn' ? 'পেছনে' : 'Back'}
          </button>
          <div className="text-center space-y-3">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">{lang === 'bn' ? 'হেলথ আইডি তৈরি করুন' : 'Create Health ID'}</h2>
            <p className="text-slate-500 text-base">{lang === 'bn' ? 'আপনার নিরাপদ ডিজিটাল স্বাস্থ্য যাত্রা শুরু করুন।' : 'Start your secure digital health journey.'}</p>
          </div>
          
          {error && <div className="p-5 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100">{error}</div>}

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="ui-label">{t('full_name')}</label>
              <input className="ui-input" placeholder="e.g. Rahim Ahmed" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="ui-label">{t('email')}</label>
              <input type="email" className="ui-input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="ui-label">{t('phone')}</label>
              <input className="ui-input" placeholder="01XXXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="ui-label">{lang === 'bn' ? 'পাসওয়ার্ড নির্বাচন করুন' : 'Choose Password'}</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="ui-input pr-12" 
                  placeholder={lang === 'bn' ? 'নূন্যতম ৬ অক্ষর' : 'Min. 6 characters'} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isProcessing} className="ui-btn ui-btn-primary w-full py-5 text-lg shadow-2xl shadow-emerald-200 mt-4">
              {isProcessing ? '...' : (lang === 'bn' ? 'আমার আইডি তৈরি করুন' : 'Generate My ID')}
            </button>
          </form>

          <div className="relative flex items-center justify-center py-4">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-xs font-black text-slate-400 uppercase tracking-widest">OR</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <button 
            onClick={handleGithubLogin}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-4 bg-slate-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
          >
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            Continue with GitHub
          </button>

          <p className="text-center text-xs text-slate-400 font-bold tracking-widest uppercase">
            {lang === 'bn' ? 'ইতিমধ্যেই নিবন্ধিত?' : 'ALREADY REGISTERED?'} <button onClick={() => setMode('login')} className="text-emerald-600 hover:text-emerald-700 underline underline-offset-4 ml-1">{lang === 'bn' ? 'এখানে সাইন ইন করুন' : 'SIGN IN HERE'}</button>
          </p>
        </div>
      </div>
    );
  }

  if (mode === 'login') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-500">
        <LanguageToggle />
        <div className="ui-card max-w-lg w-full p-12 space-y-10">
          <button onClick={() => setMode('start')} className="text-slate-400 font-bold text-xs uppercase hover:text-slate-600 transition-colors tracking-widest flex items-center gap-2">
            <span>←</span> {lang === 'bn' ? 'পেছনে' : 'Back'}
          </button>
          <div className="text-center space-y-3">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">{lang === 'bn' ? 'স্বাগতম' : 'Welcome Back'}</h2>
            <p className="text-slate-500 text-base">{lang === 'bn' ? 'আপনার স্বাস্থ্য ভল্ট অ্যাক্সেস করতে সাইন ইন করুন।' : 'Sign in to access your health vault.'}</p>
          </div>

          {error && <div className="p-5 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="ui-label">{t('email')}</label>
              <input type="email" className="ui-input font-bold" placeholder="rahim@gmail.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="ui-label">{lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="ui-input pr-12 font-bold" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isProcessing} className="ui-btn ui-btn-primary w-full py-5 text-lg shadow-2xl shadow-emerald-200 mt-4">
              {isProcessing ? '...' : (lang === 'bn' ? 'লগইন করুন' : 'Login')}
            </button>
          </form>

          <div className="relative flex items-center justify-center py-4">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-xs font-black text-slate-400 uppercase tracking-widest">OR</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <button 
            onClick={handleGithubLogin}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-4 bg-slate-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
          >
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            Login with GitHub
          </button>

          <div className="pt-8 border-t space-y-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => quickLogin('rahim@gmail.com')} className="p-5 bg-emerald-50 text-emerald-700 rounded-3xl text-[11px] font-black border-2 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200 transition-all text-center leading-relaxed">
                Patient / Admin<br/>(Rahim)
              </button>
              <button onClick={() => quickLogin('sabrina@gmail.com')} className="p-5 bg-blue-50 text-blue-700 rounded-3xl text-[11px] font-black border-2 border-blue-100 hover:bg-blue-100 hover:border-blue-200 transition-all text-center leading-relaxed">
                Doctor Panel<br/>(Sabrina)
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 font-bold tracking-widest uppercase">
            {lang === 'bn' ? 'নতুন ইউজার?' : 'NEW HERE?'} <button onClick={() => setMode('register')} className="text-emerald-600 hover:text-emerald-700 underline underline-offset-4 ml-1">{lang === 'bn' ? 'অ্যাকাউন্ট তৈরি করুন' : 'CREATE ACCOUNT'}</button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-1000">
      <LanguageToggle />
      <div className="max-w-3xl space-y-16">
        <div className="space-y-8">
          <div className="w-24 h-24 bg-emerald-600 text-white rounded-[2.5rem] flex items-center justify-center text-5xl mx-auto shadow-[0_30px_60px_-15px_rgba(16,185,129,0.3)] mb-8 transform hover:rotate-12 transition-transform cursor-pointer">🏥</div>
          <h1 className="text-7xl font-black text-slate-900 leading-tight tracking-tight">
            DiGi Health
          </h1>
          <p className="text-slate-500 text-2xl max-w-xl mx-auto leading-relaxed font-medium">
            {lang === 'bn' ? 'একটি নিরাপদ ক্লিনিকাল নেটওয়ার্ক যা প্রান্তিক পর্যায়ে রোগী এবং ডাক্তারদের সংযুক্ত করে।' : 'A secure clinical network connecting patients and doctors across the grassroots.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <button onClick={() => setMode('register')} className="bg-emerald-600 text-white p-12 rounded-[3.5rem] text-left hover:bg-emerald-700 transition-all shadow-[0_25px_50px_-12px_rgba(16,185,129,0.2)] group hover:-translate-y-2">
             <span className="text-5xl block mb-6 group-hover:scale-125 transition-transform origin-left">📝</span>
             <p className="font-black text-2xl">{lang === 'bn' ? 'নিবন্ধন করুন' : 'Register Now'}</p>
             <p className="text-emerald-200 text-xs font-black mt-2 uppercase tracking-widest opacity-80">{lang === 'bn' ? 'পেশেন্ট আইডি তৈরি করুন' : 'Create Patient ID'}</p>
          </button>
          <button onClick={() => setMode('login')} className="bg-slate-900 text-white p-12 rounded-[3.5rem] text-left hover:bg-slate-800 transition-all shadow-[0_25px_50px_-12px_rgba(15,23,42,0.2)] group hover:-translate-y-2">
             <span className="text-5xl block mb-6 group-hover:scale-125 transition-transform origin-left">🔑</span>
             <p className="font-black text-2xl">{lang === 'bn' ? 'লগইন' : 'Login'}</p>
             <p className="text-slate-400 text-xs font-black mt-2 uppercase tracking-widest opacity-80">{lang === 'bn' ? 'পাসওয়ার্ড দিয়ে প্রবেশ করুন' : 'Access with Password'}</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;