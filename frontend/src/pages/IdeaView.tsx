// frontend/src/pages/IdeaView.tsx
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ideaAPI } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';

export default function IdeaView() {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['idea', id],
    queryFn: () => ideaAPI.getById(id!),
    enabled: !!id,
  });

  const idea = data?.data?.idea;
  const evaluations = data?.data?.evaluations || [];

  const canEdit = () => {
    if (!idea) return false;
    const isFounder = idea.founderId._id === user?.id;
    const editableStatuses = ['draft', 'rejected', 'submitted', 'under_review'];
    return isFounder && editableStatuses.includes(idea.status);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Idea Not Found</h2>
          <Link to="/dashboard" className="text-orange-500 hover:text-orange-400">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

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

  // ✅ Fix file URL construction
  const apiUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const pitchDeckUrl = idea.pitchDeck ? `${apiUrl}/${idea.pitchDeck}` : null;

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
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          ← Back
        </button>

        {/* Idea Header */}
        <div className="glass-morphism rounded-xl p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-black text-white mb-4">{idea.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                <span>👤 {idea.founderId.fullName}</span>
                <span>📅 {formatDate(idea.createdAt)}</span>
                {idea.submittedAt && <span>✅ Submitted: {formatDate(idea.submittedAt)}</span>}
              </div>
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(idea.status)}`}>
                {idea.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {/* Score Display */}
            {idea.averageScore && (
              <div className="text-center ml-8">
                <div className="text-5xl font-black text-gradient mb-2">{idea.averageScore}/10</div>
                <div className="text-sm text-gray-400">Average Score</div>
                {idea.evaluationCount > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    {idea.evaluationCount} evaluation(s)
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {canEdit() && (
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/submit-idea')}
                className="px-6 py-3 bg-blue-900/30 text-blue-300 rounded-lg font-semibold hover:bg-blue-900/50 transition-all"
              >
                Edit Idea
              </button>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Idea Details */}
            <div className="glass-morphism rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Idea Details</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">ABSTRACT</h3>
                  <p className="text-white whitespace-pre-wrap">{idea.abstract}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">PROBLEM STATEMENT</h3>
                  <p className="text-white whitespace-pre-wrap">{idea.problem}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">SOLUTION</h3>
                  <p className="text-white whitespace-pre-wrap">{idea.solution}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">TEAM</h3>
                  <p className="text-white whitespace-pre-wrap">{idea.team}</p>
                </div>
              </div>
            </div>

            {/* Pitch Deck Viewer */}
            {pitchDeckUrl && (
              <div className="glass-morphism rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Pitch Deck</h2>
                
                <div className="mb-4 flex gap-3">
                  <a
                    href={pitchDeckUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-orange-900/30 text-orange-300 rounded-lg hover:bg-orange-900/50 transition-colors"
                  >
                    <span className="mr-2">📄</span>
                    Open in New Tab
                  </a>
                  <a
                    href={pitchDeckUrl}
                    download
                    className="inline-flex items-center px-4 py-2 bg-blue-900/30 text-blue-300 rounded-lg hover:bg-blue-900/50 transition-colors"
                  >
                    <span className="mr-2">⬇️</span>
                    Download
                  </a>
                </div>

                {/* PDF Viewer */}
                <div className="w-full h-[800px] bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                  <iframe
                    src={pitchDeckUrl}
                    className="w-full h-full"
                    title="Pitch Deck"
                  />
                </div>
              </div>
            )}

            {/* Evaluations */}
            {evaluations.length > 0 && (
              <div className="glass-morphism rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Evaluations</h2>
                <div className="space-y-6">
                  {evaluations.map((evaluation: any) => (
                    <div key={evaluation._id} className="p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-1">
                            {evaluation.evaluatorId.fullName}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {formatDate(evaluation.submittedAt)}
                          </p>
                        </div>
                        <div className="text-3xl font-black text-gradient">
                          {evaluation.averageScore}/10
                        </div>
                      </div>

                      {/* Score Breakdown */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="p-3 bg-gray-900/50 rounded-lg">
                          <div className="text-xs text-gray-400 mb-1">Innovation</div>
                          <div className="text-lg font-bold text-white">{evaluation.scores.innovation}/10</div>
                        </div>
                        <div className="p-3 bg-gray-900/50 rounded-lg">
                          <div className="text-xs text-gray-400 mb-1">Feasibility</div>
                          <div className="text-lg font-bold text-white">{evaluation.scores.feasibility}/10</div>
                        </div>
                        <div className="p-3 bg-gray-900/50 rounded-lg">
                          <div className="text-xs text-gray-400 mb-1">Impact</div>
                          <div className="text-lg font-bold text-white">{evaluation.scores.impact}/10</div>
                        </div>
                        <div className="p-3 bg-gray-900/50 rounded-lg">
                          <div className="text-xs text-gray-400 mb-1">Presentation</div>
                          <div className="text-lg font-bold text-white">{evaluation.scores.presentation}/10</div>
                        </div>
                      </div>

                      {/* Comments */}
                      <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                        <h5 className="text-xs font-semibold text-blue-300 mb-2">FEEDBACK</h5>
                        <p className="text-sm text-white whitespace-pre-wrap italic">"{evaluation.comments}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-morphism rounded-xl p-6 sticky top-24">
              <h3 className="text-xl font-bold text-white mb-4">Details</h3>

              <div className="space-y-4">
                {/* Status */}
                <div>
                  <div className="text-xs font-semibold text-gray-400 mb-2">STATUS</div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(idea.status)}`}>
                    {idea.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Evaluators */}
                {idea.assignedEvaluators && idea.assignedEvaluators.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-gray-400 mb-2">EVALUATORS</div>
                    <div className="space-y-2">
                      {idea.assignedEvaluators.map((evaluator: any) => (
                        <div key={evaluator._id} className="text-sm text-white">
                          {evaluator.fullName}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div>
                  <div className="text-xs font-semibold text-gray-400 mb-2">CREATED</div>
                  <div className="text-sm text-white">{formatDate(idea.createdAt)}</div>
                </div>

                {idea.submittedAt && (
                  <div>
                    <div className="text-xs font-semibold text-gray-400 mb-2">SUBMITTED</div>
                    <div className="text-sm text-white">{formatDate(idea.submittedAt)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}