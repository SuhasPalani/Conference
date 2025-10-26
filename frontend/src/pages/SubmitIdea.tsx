// FILE: frontend/src/pages/SubmitIdea.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { ideaAPI } from '@/services/api';
import { useQuery } from '@tanstack/react-query';

export default function SubmitIdea() {
  const { logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    problem: '',
    solution: '',
    team: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [pitchDeck, setPitchDeck] = useState<File | null>(null);

  const { data: ideasData } = useQuery({
    queryKey: ['myIdeas'],
    queryFn: () => ideaAPI.getMyIdeas(),
  });

  const ideas = ideasData?.data?.ideas || [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await ideaAPI.create(formData);
      
      // Upload pitch deck if provided
      if (pitchDeck && data.idea._id) {
        await ideaAPI.uploadPitchDeck(data.idea._id, pitchDeck);
      }

      // Submit for review if not draft
      if (!isDraft && data.idea._id) {
        await ideaAPI.submit(data.idea._id);
      }

      addToast(
        isDraft ? 'Idea saved as draft!' : 'Idea submitted successfully!',
        'success'
      );
      navigate('/dashboard');
    } catch (error: any) {
      addToast(
        error.response?.data?.error || 'Failed to submit idea',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

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
              <Link
                to="/dashboard"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
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

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            Submit Your <span className="text-gradient">AI Idea</span>
          </h1>
          <p className="text-gray-400">Share your innovative solution with expert evaluators</p>
        </div>

        <div className="glass-morphism rounded-2xl p-8">
          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Idea Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="e.g., AI-Powered Climate Prediction System"
                required
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100</p>
            </div>

            {/* Abstract */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Abstract *
              </label>
              <textarea
                name="abstract"
                value={formData.abstract}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="Brief summary of your idea (what, why, impact)"
                required
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.abstract.length}/500</p>
            </div>

            {/* Problem */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Problem Statement *
              </label>
              <textarea
                name="problem"
                value={formData.problem}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="What problem does your AI solution address?"
                required
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.problem.length}/1000</p>
            </div>

            {/* Solution */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Solution *
              </label>
              <textarea
                name="solution"
                value={formData.solution}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="How does your AI solution work?"
                required
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.solution.length}/1000</p>
            </div>

            {/* Team */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Team Information *
              </label>
              <textarea
                name="team"
                value={formData.team}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="Team members, their roles, and relevant experience"
                required
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.team.length}/500</p>
            </div>

            {/* Pitch Deck Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Pitch Deck (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.ppt,.pptx"
                  onChange={(e) => setPitchDeck(e.target.files?.[0] || null)}
                  className="hidden"
                  id="pitchDeck"
                />
                <label htmlFor="pitchDeck" className="cursor-pointer">
                  <div className="text-4xl mb-2">📄</div>
                  {pitchDeck ? (
                    <p className="text-white">{pitchDeck.name}</p>
                  ) : (
                    <>
                      <p className="text-gray-400 mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, PPT, or PPTX (Max 10MB)
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={(e) => handleSubmit(e as any, true)}
                disabled={isLoading}
                className="flex-1 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all disabled:opacity-50"
              >
                Save as Draft
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 gradient-primary text-white rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Submitting...' : 'Submit for Review'}
              </button>
            </div>
          </form>
        </div>

        {/* My Ideas */}
        {ideas.length > 0 && (
          <div className="mt-12 glass-morphism rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Your Ideas</h2>
            <div className="space-y-4">
              {ideas.map((idea: any) => (
                <div
                  key={idea._id}
                  className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {idea.title}
                      </h3>
                      <p className="text-sm text-gray-400 mb-2">
                        {idea.abstract}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Created: {new Date(idea.createdAt).toLocaleDateString()}</span>
                        {idea.averageScore && (
                          <span className="text-orange-500 font-semibold">
                            Score: {idea.averageScore}/10
                          </span>
                        )}
                      </div>
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
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}