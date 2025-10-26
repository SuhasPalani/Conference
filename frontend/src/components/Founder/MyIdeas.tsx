// FILE: frontend/src/components/Founder/MyIdeas.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ideaAPI } from '@/services/api';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/utils';

export default function MyIdeas() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [selectedIdea, setSelectedIdea] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['myIdeas'],
    queryFn: () => ideaAPI.getMyIdeas(),
  });

  const ideas = data?.data?.ideas || [];

  const submitMutation = useMutation({
    mutationFn: (id: string) => ideaAPI.submit(id),
    onSuccess: () => {
      addToast('Idea submitted for review!', 'success');
      queryClient.invalidateQueries({ queryKey: ['myIdeas'] });
      setSelectedIdea(null);
    },
    onError: (error: any) => {
      addToast(error.response?.data?.error || 'Failed to submit idea', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ideaAPI.delete(id),
    onSuccess: () => {
      addToast('Idea deleted successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['myIdeas'] });
      setSelectedIdea(null);
    },
    onError: (error: any) => {
      addToast(error.response?.data?.error || 'Failed to delete idea', 'error');
    },
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-700 text-gray-300',
      submitted: 'bg-blue-900 text-blue-300',
      under_review: 'bg-yellow-900 text-yellow-300',
      approved: 'bg-green-900 text-green-300',
      rejected: 'bg-red-900 text-red-300',
    };
    return colors[status] || 'bg-gray-700 text-gray-300';
  };

  if (isLoading) {
    return (
      <div className="glass-morphism rounded-xl p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-morphism rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Your Ideas</h2>
          <span className="px-3 py-1 bg-orange-900/30 text-orange-300 rounded-full text-sm font-semibold">
            {ideas.length} total
          </span>
        </div>

        {ideas.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💡</div>
            <h3 className="text-xl font-bold text-white mb-2">No Ideas Yet</h3>
            <p className="text-gray-400">
              Start by submitting your first AI innovation idea!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {ideas.map((idea: any) => (
              <div
                key={idea._id}
                className="p-6 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-orange-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {idea.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                      {idea.abstract}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-4 ${getStatusColor(
                      idea.status
                    )}`}
                  >
                    {idea.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span>📅 Created: {formatDate(idea.createdAt)}</span>
                  {idea.submittedAt && (
                    <span>✅ Submitted: {formatDate(idea.submittedAt)}</span>
                  )}
                  {idea.averageScore && (
                    <span className="text-orange-500 font-semibold">
                      ⭐ Score: {idea.averageScore}/10
                    </span>
                  )}
                  {idea.evaluationCount > 0 && (
                    <span>👥 {idea.evaluationCount} evaluations</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedIdea(idea)}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-semibold hover:bg-gray-600 transition-all"
                  >
                    View Details
                  </button>

                  {idea.status === 'draft' && (
                    <>
                      <button
                        onClick={() => submitMutation.mutate(idea._id)}
                        disabled={submitMutation.isPending}
                        className="px-4 py-2 gradient-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50"
                      >
                        Submit for Review
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${idea.title}"? This action cannot be undone.`)) {
                            deleteMutation.mutate(idea._id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        className="px-4 py-2 bg-red-900/30 text-red-400 rounded-lg text-sm font-semibold hover:bg-red-900/50 transition-all disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {selectedIdea && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-morphism rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-2">{selectedIdea.title}</h2>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                    selectedIdea.status
                  )}`}
                >
                  {selectedIdea.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => setSelectedIdea(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">ABSTRACT</h3>
                <p className="text-white">{selectedIdea.abstract}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">PROBLEM</h3>
                <p className="text-white">{selectedIdea.problem}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">SOLUTION</h3>
                <p className="text-white">{selectedIdea.solution}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">TEAM</h3>
                <p className="text-white">{selectedIdea.team}</p>
              </div>

              {selectedIdea.averageScore && (
                <div className="p-4 gradient-dark rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Average Score</span>
                    <span className="text-3xl font-black text-gradient">
                      {selectedIdea.averageScore}/10
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}