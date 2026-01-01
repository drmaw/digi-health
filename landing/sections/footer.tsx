import React from 'react';

export const Footer = () => {
  // Governance: Sections remain visible to reflect system capability even when unused.
  return (
    <footer className="bg-gray-800 text-gray-300 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p>&copy; {new Date().getFullYear()} DiGi Health. All rights reserved.</p>
        <p className="mt-2 text-sm">Empowering patients through digital health.</p>
      </div>
    </footer>
  );
};