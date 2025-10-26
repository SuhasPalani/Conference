// FILE: frontend/src/pages/Dashboard.tsx
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { ideaAPI, evaluationAPI } from '@/services/api';

export default function Dashboard() {
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

  const ideas = ideasData?.data?.ideas || [];
  const assignedIdeas = evaluationsData?.data?.ideas || [];

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
              <button
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

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {user?.roles.includes('founder') && (
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

          {user?.roles.includes('evaluator') && (
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

          {user?.roles.includes('admin') && (
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
        {user?.roles.includes('founder') && ideas.length > 0 && (
          <div className="glass-morphism rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Your Recent Ideas</h2>
            <div className="space-y-4">
              {ideas.slice(0, 3).map((idea: any) => (
                <div
                  key={idea._id}
                  className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-orange-500 transition-colors"
                >
                  <div className="flex items-center justify-between">
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assigned Ideas (Evaluator) */}
        {user?.roles.includes('evaluator') && assignedIdeas.length > 0 && (
          <div className="glass-morphism rounded-xl p-6 mt-6">
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
                        Status: {idea.evaluationStatus}
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