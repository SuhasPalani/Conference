// FILE: frontend/src/components/Admin/UserManagement.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/services/api';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/utils';

export default function UserManagement() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['adminUsers', searchTerm, filterRole],
    queryFn: () => adminAPI.getUsers({ search: searchTerm, role: filterRole }),
  });

  const users = data?.data?.users || [];

  const updateRolesMutation = useMutation({
    mutationFn: ({ id, roles }: { id: string; roles: string[] }) =>
      adminAPI.updateUserRoles(id, roles),
    onSuccess: () => {
      addToast('User roles updated successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setSelectedUser(null);
    },
    onError: (error: any) => {
      addToast(error.response?.data?.error || 'Failed to update roles', 'error');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => adminAPI.deleteUser(id),
    onSuccess: () => {
      addToast('User deleted successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setSelectedUser(null);
    },
    onError: (error: any) => {
      addToast(error.response?.data?.error || 'Failed to delete user', 'error');
    },
  });

  const handleRoleToggle = (role: string) => {
    if (!selectedUser) return;
    
    const newRoles = selectedUser.roles.includes(role)
      ? selectedUser.roles.filter((r: string) => r !== role)
      : [...selectedUser.roles, role];
    
    setSelectedUser({ ...selectedUser, roles: newRoles });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="glass-morphism rounded-xl p-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search Users
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label htmlFor="filterRole" className="block text-sm font-medium text-gray-300 mb-2">
              Filter by Role
            </label>
            <select
              id="filterRole"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              aria-label="Filter users by role"
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
            >
              <option value="">All Roles</option>
              <option value="basic">Basic</option>
              <option value="founder">Founder</option>
              <option value="evaluator">Evaluator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-morphism rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800/50">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">
                  User
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">
                  Email
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">
                  Roles
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">
                  Joined
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => (
                <tr
                  key={user._id}
                  className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold mr-3">
                        {user.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-white font-semibold">{user.fullName}</div>
                        {user.isVerified ? (
                          <span className="text-xs text-green-400">✓ Verified</span>
                        ) : (
                          <span className="text-xs text-gray-500">Not verified</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-400">{user.email}</td>
                  <td className="py-4 px-6">
                    <div className="flex gap-1 flex-wrap">
                      {user.roles.map((role: string) => (
                        <span
                          key={role}
                          className="px-2 py-1 bg-orange-900/30 text-orange-300 rounded text-xs font-semibold"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-400 text-sm">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="text-orange-500 hover:text-orange-400 text-sm font-semibold transition-colors"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No users found
            </div>
          )}
        </div>
      </div>

      {/* Edit User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-morphism rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-2">Edit User</h3>
            <p className="text-gray-400 mb-6">{selectedUser.fullName}</p>

            {/* Role Checkboxes */}
            <div className="space-y-3 mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                User Roles
              </label>
              {['basic', 'founder', 'evaluator', 'admin'].map((role) => (
                <label
                  key={role}
                  className="flex items-center p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedUser.roles.includes(role)}
                    onChange={() => handleRoleToggle(role)}
                    className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-orange-500 focus:ring-orange-500 focus:ring-offset-0"
                  />
                  <span className="ml-3 text-white capitalize">{role}</span>
                  {role === 'basic' && (
                    <span className="ml-auto text-xs text-gray-500">Required</span>
                  )}
                </label>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  updateRolesMutation.mutate({
                    id: selectedUser._id,
                    roles: selectedUser.roles,
                  })
                }
                disabled={updateRolesMutation.isPending}
                className="flex-1 py-3 gradient-primary text-white rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50"
              >
                {updateRolesMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            {/* Delete User */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <button
                onClick={() => {
                  if (confirm(`Delete user ${selectedUser.fullName}? This action cannot be undone.`)) {
                    deleteUserMutation.mutate(selectedUser._id);
                  }
                }}
                disabled={deleteUserMutation.isPending}
                className="w-full py-2 bg-red-900/30 text-red-400 rounded-lg text-sm font-semibold hover:bg-red-900/50 transition-all disabled:opacity-50"
              >
                {deleteUserMutation.isPending ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}