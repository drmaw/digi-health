import React from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate
} from 'react-router-dom';

import { AppProvider, useApp } from './AppContext';
import { UserRole } from './types';

/* Pages */
import Landing from './pages/Landing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';

import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import StaffDashboard from './pages/StaffDashboard';
import OrgOwnerDashboard from './pages/OrgOwnerDashboard';
import ApplyRole from './pages/ApplyRole';
import AdminPanel from './pages/AdminPanel';
import ManageProfile from './pages/ManageProfile';

/* -------------------- Navigation -------------------- */

const NavLink = ({
  to,
  label,
  icon
}: {
  to: string;
  label: string;
  icon: string;
}) => {
  const loc = useLocation();
  const active = loc.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 p-3 rounded-xl transition ${
        active
          ? 'bg-emerald-600 text-white shadow-lg'
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="font-bold text-sm">{label}</span>
    </Link>
  );
};

const Sidebar = () => {
  const { currentUser, lang, setLang, t, logout } = useApp();
  if (!currentUser) return null;

  return (
    <div className="w-72 bg-white border-r h-screen flex flex-col p-6 sticky top-0 shadow-sm overflow-y-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-xl font-black text-emerald-700">DiGi Health</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Upazilla Hub
          </p>
        </div>

        <div className="flex bg-slate-100 rounded-lg p-1 border">
          <button
            onClick={() => setLang('bn')}
            className={`px-3 py-1 text-[10px] font-black rounded ${
              lang === 'bn'
                ? 'bg-white shadow text-emerald-700'
                : 'text-slate-400'
            }`}
          >
            বাংলা
          </button>
          <button
            onClick={() => setLang('en')}
            className={`px-3 py-1 text-[10px] font-black rounded ${
              lang === 'en'
                ? 'bg-white shadow text-emerald-700'
                : 'text-slate-400'
            }`}
          >
            EN
          </button>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        <NavLink to="/profile" label={t('home')} icon="🏠" />
        <NavLink to="/manage-profile" label={t('manage_profile')} icon="⚙️" />

        <div className="pt-4 mt-4 border-t space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-2">
            Professional
          </p>

          {currentUser.activeRoles.includes(UserRole.DOCTOR) && (
            <NavLink to="/doctor" label={t('doctor')} icon="🩺" />
          )}

          {currentUser.activeRoles.includes(UserRole.ORG_OWNER) && (
            <NavLink to="/org" label={t('org')} icon="🏢" />
          )}

          {currentUser.activeRoles.some((r) =>
            [
              UserRole.NURSE,
              UserRole.MANAGER,
              UserRole.PATHOLOGIST,
              UserRole.LAB_TECHNICIAN,
              UserRole.FRONT_DESK
            ].includes(r)
          ) && <NavLink to="/staff" label={t('staff')} icon="💼" />}

          {currentUser.activeRoles.includes(UserRole.ADMIN) && (
            <NavLink to="/admin" label={t('admin')} icon="🛡️" />
          )}
        </div>

        <div className="pt-4 mt-4 border-t">
          <NavLink to="/apply" label={t('apply')} icon="📝" />
        </div>
      </nav>

      <div className="pt-6 border-t mt-6 space-y-4">
        <div className="bg-slate-50 p-4 rounded-2xl border">
          <p className="text-xs font-black truncate">{currentUser.name}</p>
          <p className="text-[10px] font-mono font-bold text-emerald-600 mt-1">
            {currentUser.healthId}
          </p>
        </div>

        <button
          onClick={logout}
          className="w-full p-4 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 rounded-xl"
        >
          {lang === 'bn' ? 'লগ আউট' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
};

/* -------------------- Route Guard -------------------- */

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center font-black text-emerald-600 animate-pulse">
        LOADING...
      </div>
    );
  }

  return currentUser ? <>{children}</> : <Navigate to="/login" />;
};

/* -------------------- App -------------------- */

export default function App() {
  return (
    <AppProvider>
      <Router>
        <div className="flex min-h-screen">
          <SidebarWrapper />

          <main className="flex-1 p-8 overflow-x-hidden">
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />

              {/* Protected */}
              <Route path="/profile" element={<PrivateRoute><PatientDashboard /></PrivateRoute>} />
              <Route path="/manage-profile" element={<PrivateRoute><ManageProfile /></PrivateRoute>} />
              <Route path="/doctor" element={<PrivateRoute><DoctorDashboard /></PrivateRoute>} />
              <Route path="/staff" element={<PrivateRoute><StaffDashboard /></PrivateRoute>} />
              <Route path="/org" element={<PrivateRoute><OrgOwnerDashboard /></PrivateRoute>} />
              <Route path="/apply" element={<PrivateRoute><ApplyRole /></PrivateRoute>} />
              <Route path="/admin" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
}

const SidebarWrapper = () => {
  const { currentUser, isLoading } = useApp();
  if (isLoading || !currentUser) return null;
  return <Sidebar />;
};