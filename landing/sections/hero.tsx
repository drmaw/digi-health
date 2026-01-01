import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../AppContext';

export const Hero = () => {
  const { t } = useApp();

  return (
    <div className="relative bg-white min-h-[calc(100vh-80px)] flex items-center justify-center text-gray-800 overflow-hidden px-4 sm:px-6 lg:px-8">
      <div className="relative z-10 max-w-5xl mx-auto text-center py-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6 text-gray-900 animate-fade-in-up">
          {t('hero_headline')}
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl mb-10 text-gray-600 opacity-90 animate-fade-in-up delay-200">
          {t('hero_subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up delay-400">
          <Link
            to="/signup"
            className="bg-emerald-600 text-white px-10 py-4 rounded-full text-lg font-semibold shadow-lg hover:bg-emerald-700 transition-colors transform hover:scale-105"
          >
            {t('hero_cta_join')}
          </Link>
          <Link
            to="#features" // Placeholder for a section on the page or a dedicated 'Learn More' page
            className="border-2 border-emerald-600 text-emerald-700 px-10 py-4 rounded-full text-lg font-semibold hover:bg-emerald-50 transition-colors transform hover:scale-105"
          >
            {t('hero_cta_learn')}
          </Link>
        </div>
      </div>
    </div>
  );
};