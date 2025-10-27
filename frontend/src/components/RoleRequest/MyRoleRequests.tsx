// FILE: frontend/src/components/RoleRequest/MyRoleRequests.tsx
import { useQuery } from '@tanstack/react-query';
import { roleRequestAPI } from '@/services/api';
import { formatDate } from '@/lib/utils';

export default function MyRoleRequests() {
  const { data, isLoading } = useQuery({
    queryKey: ['myRoleRequests'],
    queryFn: () => roleRequestAPI.getMy(),
  });

  const requests = data?.data?.roleRequests || [];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-900 text-yellow-300 border-yellow-700',
      approved: 'bg-green-900 text-green-300 border-green-700',
      rejected: 'bg-red-900 text-red-300 border-red-700',
    };
    return colors[status] || 'bg-gray-700 text-gray-300 border-gray-600';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      pending: '⏳',
      approved: '✅',
      rejected: '❌',
    };
    return icons[status] || '📝';
  };

  if (isLoading) {
    return (
      <div className="glass-morphism rounded-xl p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-morphism rounded-xl p-8">
      <h2 className="text-2xl font-bold text-white mb-6">My Role Requests</h2>

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-bold text-white mb-2">No Requests Yet</h3>
          <p className="text-gray-400">
            You haven't submitted any role requests. Click "Request New Role" to get started!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((request: any) => (
            <div
              key={request._id}
              className="p-6 bg-gray-800/50 rounded-lg border border-gray-700"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1 capitalize">
                    {request.role} Role
                  </h3>
                  <p className="text-sm text-gray-400">
                    Requested on {formatDate(request.requestedAt)}
                  </p>
                </div>
                <span
                  className={`
                    px-4 py-2 rounded-lg text-sm font-semibold border-2 flex items-center gap-2
                    ${getStatusColor(request.status)}
                  `}
                >
                  <span>{getStatusIcon(request.status)}</span>
                  {request.status.toUpperCase()}
                </span>
              </div>

              {/* Reason */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-400 mb-2">YOUR REASON</h4>
                <p className="text-sm text-white whitespace-pre-wrap">{request.reason}</p>
              </div>

              {/* Previous Work */}
              {request.previousWork && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-400 mb-2">PREVIOUS WORK</h4>
                  <p className="text-sm text-white whitespace-pre-wrap">{request.previousWork}</p>
                </div>
              )}

              {/* Review Info */}
              {request.status !== 'pending' && (
                <div className={`
                  mt-4 p-4 rounded-lg border-2
                  ${request.status === 'approved' 
                    ? 'bg-green-900/20 border-green-700' 
                    : 'bg-red-900/20 border-red-700'
                  }
                `}>
                  <h4 className="text-sm font-semibold text-white mb-2">
                    Admin Review
                  </h4>
                  {request.reviewedAt && (
                    <p className="text-xs text-gray-400 mb-2">
                      Reviewed on {formatDate(request.reviewedAt)}
                    </p>
                  )}
                  {request.reviewNotes && (
                    <p className="text-sm text-gray-300 italic">
                      "{request.reviewNotes}"
                    </p>
                  )}
                  {request.status === 'approved' && (
                    <p className="text-sm text-green-300 mt-2">
                      🎉 Congratulations! You now have access to {request.role} features.
                    </p>
                  )}
                </div>
              )}

              {/* Pending Status Info */}
              {request.status === 'pending' && (
                <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                  <p className="text-sm text-yellow-300">
                    ⏳ Your request is being reviewed by our admin team. You'll receive an email notification once it's processed.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}