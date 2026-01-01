import React from 'react';

export const Governance = () => {
  // Governance: Sections remain visible to reflect system capability even when unused.
  return (
    <div className="py-16 bg-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">Governance & Trust</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Patient Data Ownership</h3>
            <p className="text-gray-600">You retain full ownership and control over your health records. We provide the secure platform; you decide who sees your data.</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Temporary Institutional Access</h3>
            <p className="text-gray-600">Access granted to healthcare providers is temporary and revocable, ensuring your data is only accessed when necessary and by your consent.</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Accountability & Audit</h3>
            <p className="text-gray-600">All interactions with your health records are logged and auditable, creating a transparent history of access for enhanced security and trust.</p>
          </div>
        </div>
      </div>
    </div>
  );
};