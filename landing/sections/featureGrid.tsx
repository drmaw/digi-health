import React from 'react';

export const FeatureGrid = () => {
  const features = [
    {
      title: 'Patient-Owned Records',
      description: 'Your medical data is yours. Securely store, access, and control who views your health records.'
    },
    {
      title: 'Clinic Uploads Simplified',
      description: 'Healthcare providers can easily upload your reports and prescriptions directly to your secure profile.'
    },
    {
      title: 'Time-Bound Access Control',
      description: 'Grant temporary access to your medical records for specific doctors or clinics, with automatic revocation.'
    },
    {
      title: 'Audit & Governance Visibility',
      description: 'Every access and modification to your record is logged, ensuring transparency and accountability.'
    }
  ];

  // Governance: Sections remain visible to reflect system capability even when unused.
  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-slate-50 p-8 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};