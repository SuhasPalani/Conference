// FILE: frontend/src/components/Admin/RoleRequestManagement.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/services/api';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/utils';

export default function RoleRequestManagement() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState('pending');
  const [filterRole, setFilterRole] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['adminRoleRequests', filterStatus, filterRole],
    queryFn: () => adminAPI.getRoleRequests({ status: filterStatus, role: filterRole }),
  });

  const requests = data?.data?.roleRequests || [];

  const reviewMutation = useMutation({
    mutationFn: ({ userId, requestId, action, reviewNotes }: any) =>
      adminAPI.reviewRoleRequest(userId, requestId, { action, reviewNotes }),
    onSuccess: () => {
      addToast('Role request reviewed successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['adminRoleRequests'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      setSelectedRequest(null);
    },
    onError: (error: any) => {
      addToast(error.response?.data?.error || 'Failed to review request', 'error');
    },
  });

  const handleReview = (action: 'approve' | 'reject', reviewNotes: string) => {
    if (!selectedRequest) return;

    reviewMutation.mutate({
      userId: selectedRequest.user.id,
      requestId: selectedRequest._id,
      action,
      reviewNotes,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="glass-morphism rounded-xl p-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-300 mb-2">
              Filter by Status
            </label>
            <select
              id="filterStatus"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label htmlFor="filterRole" className="block text-sm font-medium text-gray-300 mb-2">
              Filter by Role
            </label>
            <select
              id="filterRole"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
            >
              <option value="">All Roles</option>
              <option value="founder">Founder</option>
              <option value="evaluator">Evaluator</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.map((request: any) => (
          <div
            key={request._id}
            className="glass-morphism rounded-xl p-6 hover:border-orange-500 border border-gray-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white">
                    {request.user.fullName}
                  </h3>
                  <span className="px-3 py-1 bg-orange-900/30 text-orange-300 rounded-full text-xs font-semibold capitalize">
                    {request.role}
                  </span>
                  <span
                    className={`
                      px-3 py-1 rounded-full text-xs font-semibold
                      ${request.status === 'pending' ? 'bg-yellow-900 text-yellow-300' : ''}
                      ${request.status === 'approved' ? 'bg-green-900 text-green-300' : ''}
                      ${request.status === 'rejected' ? 'bg-red-900 text-red-300' : ''}
                    `}
                  >
                    {request.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{request.user.email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Requested on {formatDate(request.requestedAt)}
                </p>
              </div>

              {request.status === 'pending' && (
                <button
                  onClick={() => setSelectedRequest(request)}
                  className="px-4 py-2 gradient-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
                >
                  Review
                </button>
              )}
            </div>

            {/* Reason Preview */}
            <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
              <h4 className="text-xs font-semibold text-gray-400 mb-1">REASON</h4>
              <p className="text-sm text-white line-clamp-3">{request.reason}</p>
            </div>

            {request.reviewNotes && (
              <div className="mt-3 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                <h4 className="text-xs font-semibold text-blue-300 mb-1">ADMIN NOTES</h4>
                <p className="text-sm text-blue-200">{request.reviewNotes}</p>
              </div>
            )}
          </div>
        ))}

        {requests.length === 0 && (
          <div className="glass-morphism rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Requests Found</h3>
            <p className="text-gray-400">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <ReviewModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onReview={handleReview}
          isLoading={reviewMutation.isPending}
        />
      )}
    </div>
  );
}

// Review Modal Component
function ReviewModal({ request, onClose, onReview, isLoading }: any) {
  const [action, setAction] = useState<'approve' | 'reject' | ''>('');
  const [reviewNotes, setReviewNotes] = useState('');

  const handleSubmit = () => {
    if (!action) return;
    onReview(action, reviewNotes);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-morphism rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">Review Role Request</h3>
            <p className="text-gray-400">{request.user.fullName} - {request.user.email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Request Details */}
        <div className="space-y-4 mb-6">
          <div className="p-4 bg-orange-900/20 border border-orange-700/50 rounded-lg">
            <h4 className="text-sm font-semibold text-orange-300 mb-1">REQUESTED ROLE</h4>
            <p className="text-lg font-bold text-white capitalize">{request.role}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-2">REASON</h4>
            <p className="text-white whitespace-pre-wrap">{request.reason}</p>
          </div>

          {request.previousWork && (
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-2">PREVIOUS WORK</h4>
              <p className="text-white whitespace-pre-wrap">{request.previousWork}</p>
            </div>
          )}
        </div>

        {/* Decision */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Decision *
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setAction('approve')}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${action === 'approve'
                  ? 'border-green-500 bg-green-900/20'
                  : 'border-gray-700 hover:border-green-500/50'
                }
              `}
            >
              <div className="text-3xl mb-2">✅</div>
              <div className="font-bold text-white">Approve</div>
            </button>
            <button
              type="button"
              onClick={() => setAction('reject')}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${action === 'reject'
                  ? 'border-red-500 bg-red-900/20'
                  : 'border-gray-700 hover:border-red-500/50'
                }
              `}
            >
              <div className="text-3xl mb-2">❌</div>
              <div className="font-bold text-white">Reject</div>
            </button>
          </div>
        </div>

        {/* Review Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Review Notes (Optional)
          </label>
          <textarea
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
            placeholder="Add any notes or feedback for the user..."
            maxLength={500}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !action}
            className="flex-1 py-3 gradient-primary text-white rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
}