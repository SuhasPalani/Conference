// FILE: frontend/src/pages/Admin.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AdminDashboard from '@/components/Admin/Dashboard';
import UserManagement from '@/components/Admin/UserManagement';
import IdeaManagement from '@/components/Admin/IdeaManagement';
import RoleAssignment from '@/components/Admin/RoleAssignment';

export default function Admin() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'ideas' | 'assign'>('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="glass-morphism border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg gradient-primary" />
              <span className="text-2xl font-bold text-gradient">mAIple Admin</span>
            </Link>

            <div className="flex items-center space-x-6">
              <span className="text-gray-400">Hi, {user?.fullName}</span>
              <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <button onClick={logout} className="text-gray-400 hover:text-white transition-colors">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            Admin <span className="text-gradient">Panel</span>
          </h1>
          <p className="text-gray-400">Manage users, ideas, and evaluator assignments</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
            { id: 'users', label: '👥 Users', icon: '👥' },
            { id: 'ideas', label: '💡 Ideas', icon: '💡' },
            { id: 'assign', label: '🎯 Assign Evaluators', icon: '🎯' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap
                ${activeTab === tab.id
                  ? 'gradient-primary text-white'
                  : 'glass-morphism text-gray-400 hover:text-white'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'ideas' && <IdeaManagement />}
        {activeTab === 'assign' && <RoleAssignment />}
      </div>
    </div>
  );
}