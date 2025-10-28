// FILE: frontend/src/pages/Dashboard.tsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { ideaAPI, evaluationAPI, roleRequestAPI } from '@/services/api';
import NotificationBell from '@/components/Notifications/NotificationBell';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const { data: ideasData } = useQuery({
    queryKey: ['myIdeas'],
    queryFn: () => ideaAPI.getMyIdeas(),
    enabled: user?.roles.includes('founder'),
  });

  const { data: evaluationsData } = useQuery({
    queryKey: ['assignedIdeas'],
    queryFn: () => evaluationAPI.getAssigned(),
    enabled: user?.roles.includes('evaluator'),
  });

  const { data: roleRequestsData } = useQuery({
    queryKey: ['myRoleRequests'],
    queryFn: () => roleRequestAPI.getMy(),
  });

  const ideas = ideasData?.data?.ideas || [];
  const assignedIdeas = evaluationsData?.data?.ideas || [];
  const roleRequests = roleRequestsData?.data?.roleRequests || [];
  const pendingRequests = roleRequests.filter((r: any) => r.status === 'pending');

  const hasFounderRole = user?.roles.includes('founder');
  const hasEvaluatorRole = user?.roles.includes('evaluator');
  const hasAdminRole = user?.roles.includes('admin');
  const canRequestRoles = !hasFounderRole || !hasEvaluatorRole;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="backdrop-blur border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg gradient-primary" />
              <span className="text-2xl font-bold text-gradient">mAIple</span>
            </Link>

            <div className="flex items-center space-x-6">
              <NotificationBell />
              <button
                type="button"
                onClick={logout}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-white mb-2">
            Welcome back, <span className="text-gradient">{user?.fullName}</span>
          </h1>
          <p className="text-gray-400">Here's what's happening with your account</p>
        </div>

        {/* Role Request CTA */}
        {canRequestRoles && pendingRequests.length === 0 && (
          <div className="mb-8 glass-morphism rounded-xl p-6 border-2 border-orange-500/50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  🚀 Unlock More Features
                </h3>
                <p className="text-gray-400 mb-4">
                  Request founder or evaluator roles to access idea submission and evaluation features!
                </p>
                <Link
                  to="/role-request"
                  className="inline-block px-6 py-3 gradient-primary text-white rounded-lg font-semibold hover:opacity-90 transition-all"
                >
                  Request Role Access
                </Link>
              </div>
              <div className="text-6xl ml-4">🔓</div>
            </div>
          </div>
        )}

        {/* Pending Role Requests Alert */}
        {pendingRequests.length > 0 && (
          <div className="mb-8 glass-morphism rounded-xl p-6 border-2 border-yellow-500/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">⏳</div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    Role Request Pending
                  </h3>
                  <p className="text-sm text-gray-400">
                    Your {pendingRequests.map((r: any) => r.role).join(', ')} request(s) are being reviewed by admins
                  </p>
                </div>
              </div>
              <Link
                to="/role-request"
                className="px-4 py-2 bg-yellow-900/30 text-yellow-300 rounded-lg text-sm font-semibold hover:bg-yellow-900/50 transition-all"
              >
                View Status
              </Link>
            </div>
          </div>
        )}

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {hasFounderRole && (
            <Link
              to="/submit-idea"
              className="p-6 glass-morphism rounded-xl card-glow hover:scale-105 transition-transform"
            >
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold text-white mb-2">Submit Idea</h3>
              <p className="text-gray-400 mb-4">Share your innovative AI solution</p>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-gradient">{ideas.length}</span>
                <span className="text-sm text-gray-500">Ideas Submitted</span>
              </div>
            </Link>
          )}

          {hasEvaluatorRole && (
            <Link
              to="/evaluate"
              className="p-6 glass-morphism rounded-xl card-glow hover:scale-105 transition-transform"
            >
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-2xl font-bold text-white mb-2">Evaluate Ideas</h3>
              <p className="text-gray-400 mb-4">Review assigned submissions</p>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-gradient">
                  {assignedIdeas.length}
                </span>
                <span className="text-sm text-gray-500">Assigned</span>
              </div>
            </Link>
          )}

          {hasAdminRole && (
            <Link
              to="/admin"
              className="p-6 glass-morphism rounded-xl card-glow hover:scale-105 transition-transform"
            >
              <div className="text-4xl mb-4">👑</div>
              <h3 className="text-2xl font-bold text-white mb-2">Admin Panel</h3>
              <p className="text-gray-400 mb-4">Manage users and ideas</p>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-gradient">→</span>
                <span className="text-sm text-gray-500">Access</span>
              </div>
            </Link>
          )}
        </div>

        {/* Recent Ideas (Founder) */}
        {hasFounderRole && ideas.length > 0 && (
  <div className="glass-morphism rounded-xl p-6 mb-8">
    <h2 className="text-2xl font-bold text-white mb-6">Your Recent Ideas</h2>
    <div className="space-y-4">
      {ideas.slice(0, 3).map((idea: any) => (
        <div
          key={idea._id}
          className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-orange-500 transition-colors"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">
                {idea.title}
              </h3>
              <p className="text-sm text-gray-400 line-clamp-1">
                {idea.abstract}
              </p>
            </div>
            <span
              className={`
                px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-4
                ${idea.status === 'draft' ? 'bg-gray-700 text-gray-300' : ''}
                ${idea.status === 'submitted' ? 'bg-blue-900 text-blue-300' : ''}
                ${idea.status === 'under_review' ? 'bg-yellow-900 text-yellow-300' : ''}
                ${idea.status === 'approved' ? 'bg-green-900 text-green-300' : ''}
                ${idea.status === 'rejected' ? 'bg-red-900 text-red-300' : ''}
              `}
            >
              {idea.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          {/* ✅ ADD: Show Score and Comments */}
          {/* ✅ ADD: Show Score and Comments */}
          {idea.averageScore && (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl font-bold text-orange-500">
                  ⭐ {idea.averageScore}/10
                </span>
                {idea.status === 'approved' && (
                  <span className="text-xs text-green-400">✅ Approved!</span>
                )}
                {idea.status === 'rejected' && (
                  <span className="text-xs text-red-400">📝 Needs Improvement</span>
                )}
              </div>
              
              {/* Show latest evaluation comment */}
              {idea.evaluations && idea.evaluations.length > 0 && idea.evaluations[0].comments && (
                <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                  <p className="text-xs font-semibold text-gray-400 mb-1">
                    Latest Feedback from {idea.evaluations[0].evaluatorName}:
                  </p>
                  <p className="text-sm text-gray-300 italic line-clamp-2">
                    "{idea.evaluations[0].comments}"
                  </p>
                </div>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              navigate(`/idea/${idea._id}`); // Navigate to dedicated idea view page
            }}
            className="text-sm text-orange-500 hover:text-orange-400 font-semibold"
          >
            View Full Details →
          </button>

          {/* <Link
            to="/submit-idea"
            className="text-sm text-orange-500 hover:text-orange-400 font-semibold"
          >
            View Details →
          </Link> */}
        </div>
      ))}
    </div>
  </div>
)}

        {/* Assigned Ideas (Evaluator) */}
        {hasEvaluatorRole && assignedIdeas.length > 0 && (
          <div className="glass-morphism rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Ideas to Evaluate</h2>
            <div className="space-y-4">
              {assignedIdeas.slice(0, 3).map((idea: any) => (
                <div
                  key={idea._id}
                  className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-orange-500 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {idea.title}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Status: {idea.evaluationStatus?.replace('_', ' ')}
                      </p>
                    </div>
                    <Link
                      to={`/evaluate?id=${idea._id}`}
                      className="px-4 py-2 gradient-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
                    >
                      Evaluate
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}