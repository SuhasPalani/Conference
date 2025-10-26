// FILE: frontend/src/pages/EvaluateIdeas.tsx
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { evaluationAPI } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function EvaluateIdeas() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const selectedIdeaId = searchParams.get('id');

  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [scores, setScores] = useState({
    innovation: 5,
    feasibility: 5,
    impact: 5,
    presentation: 5,
  });
  const [comments, setComments] = useState('');

  const { data: assignedData } = useQuery({
    queryKey: ['assignedIdeas'],
    queryFn: () => evaluationAPI.getAssigned(),
  });

  const ideas = assignedData?.data?.ideas || [];

  const submitMutation = useMutation({
    mutationFn: (data: any) => evaluationAPI.submit(data),
    onSuccess: () => {
      addToast('Evaluation submitted successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['assignedIdeas'] });
      setSelectedIdea(null);
      setScores({ innovation: 5, feasibility: 5, impact: 5, presentation: 5 });
      setComments('');
    },
    onError: (error: any) => {
      addToast(error.response?.data?.error || 'Failed to submit evaluation', 'error');
    },
  });

  const handleScoreChange = (category: string, value: number) => {
    setScores({ ...scores, [category]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIdea) return;

    submitMutation.mutate({
      ideaId: selectedIdea._id,
      scores,
      comments,
    });
  };

  const averageScore = ((scores.innovation + scores.feasibility + scores.impact + scores.presentation) / 4).toFixed(1);

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
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            Evaluate <span className="text-gradient">AI Ideas</span>
          </h1>
          <p className="text-gray-400">Review and score assigned submissions</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Ideas List */}
          <div className="lg:col-span-1">
            <div className="glass-morphism rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Assigned Ideas</h2>
              <div className="space-y-3">
                {ideas.map((idea: any) => (
                  <button
                    key={idea._id}
                    onClick={() => setSelectedIdea(idea)}
                    className={`
                      w-full p-4 rounded-lg text-left transition-all
                      ${selectedIdea?._id === idea._id
                        ? 'bg-orange-900/30 border-2 border-orange-500'
                        : 'bg-gray-800/50 border border-gray-700 hover:border-orange-500'
                      }
                    `}
                  >
                    <h3 className="font-semibold text-white mb-1 line-clamp-2">
                      {idea.title}
                    </h3>
                    <span
                      className={`
                        inline-block px-2 py-1 rounded text-xs font-semibold
                        ${idea.evaluationStatus === 'pending' ? 'bg-yellow-900 text-yellow-300' : ''}
                        ${idea.evaluationStatus === 'completed' ? 'bg-green-900 text-green-300' : ''}
                        ${idea.evaluationStatus === 'not_started' ? 'bg-gray-700 text-gray-300' : ''}
                      `}
                    >
                      {idea.evaluationStatus.replace('_', ' ').toUpperCase()}
                    </span>
                  </button>
                ))}
                {ideas.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No ideas assigned yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Evaluation Form */}
          <div className="lg:col-span-2">
            {selectedIdea ? (
              <div className="glass-morphism rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">{selectedIdea.title}</h2>

                <div className="space-y-6 mb-8">
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
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 border-t border-gray-700 pt-8">
                  <h3 className="text-xl font-bold text-white">Evaluation Scores</h3>

                  {/* Score Sliders */}
                  {Object.entries(scores).map(([category, value]) => {
                    const inputId = `score-${category}`;
                    return (
                      <div key={category}>
                        <div className="flex justify-between items-center mb-2">
                          <label htmlFor={inputId} id={`${inputId}-label`} className="text-sm font-medium text-gray-300 capitalize">
                            {category}
                          </label>
                          <span className="text-2xl font-bold text-gradient">{value}/10</span>
                        </div>
                        <input
                          id={inputId}
                          aria-labelledby={`${inputId}-label`}
                          title={`${category} score`}
                          type="range"
                          min="1"
                          max="10"
                          value={value}
                          onChange={(e) => handleScoreChange(category, parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                      </div>
                    );
                  })}

                  {/* Average Score */}
                  <div className="p-4 gradient-dark rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold">Average Score</span>
                      <span className="text-3xl font-black text-gradient">{averageScore}/10</span>
                    </div>
                  </div>

                  {/* Comments */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Comments
                    </label>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="Provide detailed feedback..."
                      maxLength={1000}
                    />
                    <p className="text-xs text-gray-500 mt-1">{comments.length}/1000</p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="w-full py-3 gradient-primary text-white rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {submitMutation.isPending ? 'Submitting...' : 'Submit Evaluation'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="glass-morphism rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">⭐</div>
                <h3 className="text-2xl font-bold text-white mb-2">Select an Idea</h3>
                <p className="text-gray-400">
                  Choose an idea from the list to start evaluating
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}