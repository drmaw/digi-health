import React, { useState, useEffect } from 'react';
import { db } from '../../firebase'; // Assuming firebase.ts is in the root
import { EmptyState } from '../../components/EmptyState'; // Assuming EmptyState.tsx is in components
import { UserRole } from '../../types'; // Import UserRole

export const Stats = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeOrganizations, setActiveOrganizations] = useState(0);
  const [doctorsInvolved, setDoctorsInvolved] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch Total Users
        const usersSnapshot = await db.collection('users').get();
        setTotalUsers(usersSnapshot.size);

        // Fetch Active Organizations
        const orgsSnapshot = await db.collection('organizations').where('status', '==', 'active').get();
        setActiveOrganizations(orgsSnapshot.size);

        // Fetch Doctors Involved
        const doctorsSnapshot = await db.collection('users').where('activeRoles', 'array-contains', UserRole.DOCTOR).get();
        setDoctorsInvolved(doctorsSnapshot.size);

      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Failed to load statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Governance: Sections remain visible to reflect system capability even when unused.
  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">Our Impact in Bangladesh</h2>
        {loading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-100 overflow-hidden shadow rounded-lg p-6 text-center animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-4 mx-auto"></div>
                <div className="h-8 bg-gray-300 rounded w-1/4 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg p-6 text-center border border-gray-100">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
              <dd className="mt-1 text-4xl font-extrabold text-emerald-600">
                {totalUsers > 0 ? totalUsers.toLocaleString() : '0'}
              </dd>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg p-6 text-center border border-gray-100">
              <dt className="text-sm font-medium text-gray-500 truncate">Organizations Involved</dt>
              <dd className="mt-1 text-4xl font-extrabold text-emerald-600">
                {activeOrganizations > 0 ? activeOrganizations.toLocaleString() : '0'}
              </dd>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg p-6 text-center border border-gray-100">
              <dt className="text-sm font-medium text-gray-500 truncate">Doctors Involved</dt>
              <dd className="mt-1 text-4xl font-extrabold text-emerald-600">
                {doctorsInvolved > 0 ? doctorsInvolved.toLocaleString() : '0'}
              </dd>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};