import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../AppContext'; // Updated import path

export const Hero = () => {
  const { lang, setLang, t } = useApp(); // Use t for translations

  return (
    <div className="relative bg-gradient-to-br from-emerald-700 to-green-900 min-h-screen flex items-center justify-center text-white overflow-hidden">
      {/* Background circles */}
      <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-emerald-600 opacity-20 animate-pulse-slow"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-green-600 opacity-20 animate-pulse-slow delay-500"></div>

      <div className="relative z-10 max-w-4xl mx-auto text-center px-6 py-16">
        {/* Language Toggle */}
        <div className="absolute top-6 right-6 flex bg-white bg-opacity-20 rounded-lg p-1 border border-white border-opacity-30">
          <button
            onClick={() => setLang("bn")}
            className={`px-3 py-1 text-[10px] font-black rounded ${
              lang === "bn" ? "bg-white text-emerald-700 shadow" : "text-white text-opacity-70 hover:text-opacity-100"
            }`}
          >
            বাংলা
          </button>
          <button
            onClick={() => setLang("en")}
            className={`px-3 py-1 text-[10px] font-black rounded ${
              lang === "en" ? "bg-white text-emerald-700 shadow" : "text-white text-opacity-70 hover:text-opacity-100"
            }`}
          >
            EN
          </button>
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 animate-fade-in-up">
          {t('hero_headline')} {/* Placeholder for translation */}
        </h1>
        <p className="text-lg md:text-xl mb-10 opacity-90 animate-fade-in-up delay-200">
          {t('hero_subtitle')} {/* Placeholder for translation */}
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up delay-400">
          <Link
            to="/signup"
            className="bg-white text-emerald-800 px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:bg-gray-100 transition-colors transform hover:scale-105"
          >
            {t('join_now')} {/* Placeholder for translation */}
          </Link>
          <Link
            to="/login"
            className="border-2 border-white px-8 py-4 rounded-full text-lg font-bold hover:bg-white hover:text-emerald-800 transition-colors transform hover:scale-105"
          >
            {t('learn_more')} {/* Placeholder for translation, using login as a proxy */}
          </Link>
        </div>
      </div>
    </div>
  );
};

// Add translations in translations.ts later
// hero_headline: "Your Health Records, Owned by You. Accessible Anywhere in Bangladesh."
// hero_subtitle: "Empowering patients with secure, digital health records. Connect with clinics, manage your data, and ensure seamless care."
// join_now: "Join Now"
// learn_more: "Login" // Using login for now, can be a dedicated "learn more" page later