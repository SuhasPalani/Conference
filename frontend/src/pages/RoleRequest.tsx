// FILE: frontend/src/pages/RoleRequest.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import RoleRequestForm from '@/components/RoleRequest/RoleRequestForm';
import MyRoleRequests from '@/components/RoleRequest/MyRoleRequests';

export default function RoleRequest() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'request' | 'history'>('request');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="glass-morphism border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg gradient-primary" />
              <span className="text-2xl font-bold text-gradient">mAIple</span>
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            Request <span className="text-gradient">Role Access</span>
          </h1>
          <p className="text-gray-400">
            Apply for founder or evaluator roles to unlock new features
          </p>
        </div>

        {/* Current Roles Badge */}
        <div className="glass-morphism rounded-xl p-6 mb-8">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">YOUR CURRENT ROLES</h3>
          <div className="flex gap-2 flex-wrap">
            {user?.roles.map((role) => (
              <span
                key={role}
                className="px-4 py-2 bg-orange-900/30 text-orange-300 rounded-lg text-sm font-semibold capitalize"
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('request')}
            className={`
              px-6 py-3 rounded-lg font-semibold transition-all
              ${activeTab === 'request'
                ? 'gradient-primary text-white'
                : 'glass-morphism text-gray-400 hover:text-white'
              }
            `}
          >
            📝 Request New Role
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`
              px-6 py-3 rounded-lg font-semibold transition-all
              ${activeTab === 'history'
                ? 'gradient-primary text-white'
                : 'glass-morphism text-gray-400 hover:text-white'
              }
            `}
          >
            📋 My Requests
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'request' ? <RoleRequestForm /> : <MyRoleRequests />}
      </div>
    </div>
  );
}