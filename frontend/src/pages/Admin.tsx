// FILE: frontend/src/pages/Admin.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { adminAPI } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function Admin() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'ideas'>('dashboard');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedIdea, setSelectedIdea] = useState<any>(null);

  // Queries
  const { data: dashboardData } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: () => adminAPI.getDashboard(),
  });

  const { data: usersData } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => adminAPI.getUsers(),
    enabled: activeTab === 'users',
  });

  const { data: ideasData } = useQuery({
    queryKey: ['adminIdeas'],
    queryFn: () => adminAPI.getIdeas(),
    enabled: activeTab === 'ideas',
  });

  const stats = dashboardData?.data?.stats;
  const users = usersData?.data?.users || [];
  const ideas = ideasData?.data?.ideas || [];

  // Mutations
  const updateRolesMutation = useMutation({
    mutationFn: ({ id, roles }: { id: string; roles: string[] }) =>
      adminAPI.updateUserRoles(id, roles),
    onSuccess: () => {
      addToast('User roles updated successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setSelectedUser(null);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminAPI.updateIdeaStatus(id, status),
    onSuccess: () => {
      addToast('Idea status updated successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['adminIdeas'] });
      setSelectedIdea(null);
    },
  });

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
          <p className="text-gray-400">Manage users, ideas, and platform settings</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
            { id: 'users', label: '👥 Users', icon: '👥' },
            { id: 'ideas', label: '💡 Ideas', icon: '💡' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                px-6 py-3 rounded-lg font-semibold transition-all
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

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Total Users', value: stats.users.total, icon: '👥' },
                { label: 'Total Ideas', value: stats.ideas.total, icon: '💡' },
                { label: 'Evaluations', value: stats.evaluations.total, icon: '⭐' },
                { label: 'Approved', value: stats.ideas.approved, icon: '✅' },
              ].map((stat, i) => (
                <div key={i} className="glass-morphism rounded-xl p-6 card-glow">
                  <div className="text-4xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-black text-gradient mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Detailed Stats */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-morphism rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">User Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Founders', value: stats.users.founders, color: 'orange' },
                    { label: 'Evaluators', value: stats.users.evaluators, color: 'blue' },
                    { label: 'Admins', value: stats.users.admins, color: 'purple' },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center">
                      <span className="text-gray-400">{item.label}</span>
                      <span className="text-white font-bold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-morphism rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Idea Status</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Draft', value: stats.ideas.draft, color: 'gray' },
                    { label: 'Submitted', value: stats.ideas.submitted, color: 'blue' },
                    { label: 'Under Review', value: stats.ideas.underReview, color: 'yellow' },
                    { label: 'Approved', value: stats.ideas.approved, color: 'green' },
                    { label: 'Rejected', value: stats.ideas.rejected, color: 'red' },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center">
                      <span className="text-gray-400">{item.label}</span>
                      <span className="text-white font-bold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="glass-morphism rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">User Management</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Roles</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u: any) => (
                    <tr key={u._id} className="border-b border-gray-800 hover:bg-gray-800/30">
                      <td className="py-3 px-4 text-white">{u.fullName}</td>
                      <td className="py-3 px-4 text-gray-400">{u.email}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1 flex-wrap">
                          {u.roles.map((role: string) => (
                            <span
                              key={role}
                              className="px-2 py-1 bg-orange-900/30 text-orange-300 rounded text-xs"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="text-orange-500 hover:text-orange-400 text-sm font-semibold"
                        >
                          Edit Roles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Ideas Tab */}
        {activeTab === 'ideas' && (
          <div className="glass-morphism rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Idea Management</h2>
            <div className="space-y-4">
              {ideas.map((idea: any) => (
                <div
                  key={idea._id}
                  className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-orange-500 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{idea.title}</h3>
                      <p className="text-sm text-gray-400 mb-2">
                        by {idea.founderId.fullName}
                      </p>
                      <div className="flex items-center gap-4">
                        <span
                          className={`
                            px-3 py-1 rounded-full text-xs font-semibold
                            ${idea.status === 'draft' ? 'bg-gray-700 text-gray-300' : ''}
                            ${idea.status === 'submitted' ? 'bg-blue-900 text-blue-300' : ''}
                            ${idea.status === 'under_review' ? 'bg-yellow-900 text-yellow-300' : ''}
                            ${idea.status === 'approved' ? 'bg-green-900 text-green-300' : ''}
                            ${idea.status === 'rejected' ? 'bg-red-900 text-red-300' : ''}
                          `}
                        >
                          {idea.status.replace('_', ' ').toUpperCase()}
                        </span>
                        {idea.averageScore && (
                          <span className="text-sm text-orange-500 font-semibold">
                            Score: {idea.averageScore}/10
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedIdea(idea)}
                      className="px-4 py-2 gradient-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-morphism rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-4">Edit User Roles</h3>
            <p className="text-gray-400 mb-6">{selectedUser.fullName}</p>
            
            <div className="space-y-3 mb-6">
              {['basic', 'founder', 'evaluator', 'admin'].map((role) => (
                <label key={role} className="flex items-center p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedUser.roles.includes(role)}
                    onChange={(e) => {
                      const newRoles = e.target.checked
                        ? [...selectedUser.roles, role]
                        : selectedUser.roles.filter((r: string) => r !== role);
                      setSelectedUser({ ...selectedUser, roles: newRoles });
                    }}
                    className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-orange-500"
                  />
                  <span className="ml-3 text-white capitalize">{role}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => updateRolesMutation.mutate({ id: selectedUser._id, roles: selectedUser.roles })}
                disabled={updateRolesMutation.isPending}
                className="flex-1 py-3 gradient-primary text-white rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50"
              >
                {updateRolesMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Idea Modal */}
      {selectedIdea && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-morphism rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-4">Manage Idea</h3>
            <p className="text-gray-400 mb-6">{selectedIdea.title}</p>
            
            <div className="space-y-3 mb-6">
              <label htmlFor="idea-status" className="block text-sm font-medium text-gray-300 mb-2">
                Update Status
              </label>
              <select
                id="idea-status"
                value={selectedIdea.status}
                onChange={(e) => setSelectedIdea({ ...selectedIdea, status: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
              >
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedIdea(null)}
                className="flex-1 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => updateStatusMutation.mutate({ id: selectedIdea._id, status: selectedIdea.status })}
                disabled={updateStatusMutation.isPending}
                className="flex-1 py-3 gradient-primary text-white rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50"
              >
                {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}