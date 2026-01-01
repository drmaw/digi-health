import React from 'react';

export const Footer = () => {
  // Governance: Sections remain visible to reflect system capability even when unused.
  return (
    <footer className="bg-gray-800 text-gray-300 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-lg font-semibold mb-2">DiGi Health</p>
        <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
        <p className="mt-2 text-sm opacity-75">Empowering patients through digital health in Bangladesh.</p>
        <div className="flex justify-center space-x-4 mt-6">
          <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};