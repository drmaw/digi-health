import React, { useState, useEffect } from 'react';
import { db } from '../../firebase'; // Assuming firebase.ts is in the root
import { EmptyState } from '../../components/EmptyState'; // Assuming EmptyState.tsx is in components

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
        const doctorsSnapshot = await db.collection('users').where('activeRoles', 'array-contains', 'Doctor').get();
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

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">Loading statistics...</div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center text-red-500">{error}</div>
    );
  }

  // Governance: Sections remain visible to reflect system capability even when unused.
  return (
    <div className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">Our Impact</h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg p-6 text-center">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {totalUsers > 0 ? totalUsers : <EmptyState title="No Users" message="This stat will update as users join." />}
            </dd>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg p-6 text-center">
            <dt className="text-sm font-medium text-gray-500 truncate">Organizations Involved</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {activeOrganizations > 0 ? activeOrganizations : <EmptyState title="No Organizations" message="This stat will update as organizations join." />}
            </dd>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg p-6 text-center">
            <dt className="text-sm font-medium text-gray-500 truncate">Doctors Involved</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {doctorsInvolved > 0 ? doctorsInvolved : <EmptyState title="No Doctors" message="This stat will update as doctors join." />}
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
};