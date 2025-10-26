// FILE: frontend/src/components/Admin/IdeaManagement.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/services/api';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/utils';

export default function IdeaManagement() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedIdea, setSelectedIdea] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['adminIdeas', searchTerm, filterStatus],
    queryFn: () => adminAPI.getIdeas({ search: searchTerm, status: filterStatus }),
  });

  const ideas = data?.data?.ideas || [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminAPI.updateIdeaStatus(id, status),
    onSuccess: () => {
      addToast('Idea status updated successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['adminIdeas'] });
      setSelectedIdea(null);
    },
    onError: (error: any) => {
      addToast(error.response?.data?.error || 'Failed to update status', 'error');
    },
  });

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
              Search Ideas
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or abstract..."
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-300 mb-2">
              Filter by Status
            </label>
            <select
              id="filterStatus"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              aria-label="Filter ideas by status"
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ideas List */}
      <div className="space-y-4">
        {ideas.map((idea: any) => (
          <div
            key={idea._id}
            className="glass-morphism rounded-xl p-6 hover:border-orange-500 border border-gray-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">{idea.title}</h3>
                <p className="text-gray-400 mb-3 line-clamp-2">{idea.abstract}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                  <span>📅 {formatDate(idea.createdAt)}</span>
                  <span>👤 {idea.founderId?.fullName}</span>
                  {idea.averageScore && (
                    <span className="text-orange-500 font-semibold">
                      ⭐ {idea.averageScore}/10
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
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
                  
                  {idea.assignedEvaluators?.length > 0 && (
                    <span className="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-xs font-semibold">
                      {idea.assignedEvaluators.length} Evaluators
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

        {ideas.length === 0 && (
          <div className="glass-morphism rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">💡</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Ideas Found</h3>
            <p className="text-gray-400">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Manage Idea Modal */}
      {selectedIdea && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-morphism rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-2">Manage Idea</h3>
            <p className="text-gray-400 mb-6">{selectedIdea.title}</p>

            {/* Idea Details */}
            <div className="space-y-4 mb-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-1">ABSTRACT</h4>
                <p className="text-white text-sm">{selectedIdea.abstract}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-1">PROBLEM</h4>
                <p className="text-white text-sm">{selectedIdea.problem}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-1">SOLUTION</h4>
                <p className="text-white text-sm">{selectedIdea.solution}</p>
              </div>
            </div>

            {/* Update Status */}
            <div className="mb-6">
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

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedIdea(null)}
                className="flex-1 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  updateStatusMutation.mutate({
                    id: selectedIdea._id,
                    status: selectedIdea.status,
                  })
                }
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