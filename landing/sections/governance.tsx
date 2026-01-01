import React from 'react';

export const Governance = () => {
  // Governance: Sections remain visible to reflect system capability even when unused.
  return (
    <div className="py-20 bg-emerald-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-center mb-12">Trust and Transparency</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-emerald-800 p-8 rounded-xl shadow-md border border-emerald-600">
            <h3 className="text-xl font-semibold mb-3">Patient Data Ownership</h3>
            <p className="opacity-90">You retain full ownership and control over your health records. We provide the secure platform; you decide who sees your data.</p>
          </div>
          <div className="bg-emerald-800 p-8 rounded-xl shadow-md border border-emerald-600">
            <h3 className="text-xl font-semibold mb-3">Temporary Institutional Access</h3>
            <p className="opacity-90">Access granted to healthcare providers is temporary and revocable, ensuring your data is only accessed when necessary and by your consent.</p>
          </div>
          <div className="bg-emerald-800 p-8 rounded-xl shadow-md border border-emerald-600">
            <h3 className="text-xl font-semibold mb-3">Accountability & Audit</h3>
            <p className="opacity-90">All interactions with your health records are logged and auditable, creating a transparent history of access for enhanced security and trust.</p>
          </div>
        </div>
      </div>
    </div>
  );
};