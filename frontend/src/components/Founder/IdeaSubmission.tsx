// FILE: frontend/src/components/Founder/IdeaSubmission.tsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ideaAPI } from '@/services/api';
import { useToast } from '@/hooks/useToast';

interface IdeaSubmissionProps {
  onSuccess?: () => void;
}

export default function IdeaSubmission({ onSuccess }: IdeaSubmissionProps) {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    problem: '',
    solution: '',
    team: '',
  });
  const [pitchDeck, setPitchDeck] = useState<File | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: any) => ideaAPI.create(data),
    onSuccess: async (response) => {
      const ideaId = response.data.idea._id;

      // Upload pitch deck if provided
      if (pitchDeck && ideaId) {
        try {
          await ideaAPI.uploadPitchDeck(ideaId, pitchDeck);
        } catch (error) {
          console.error('Failed to upload pitch deck:', error);
        }
      }

      addToast('Idea created successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['myIdeas'] });
      resetForm();
      onSuccess?.();
    },
    onError: (error: any) => {
      addToast(error.response?.data?.error || 'Failed to create idea', 'error');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        addToast('File size must be less than 10MB', 'error');
        return;
      }
      setPitchDeck(file);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      abstract: '',
      problem: '',
      solution: '',
      team: '',
    });
    setPitchDeck(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="glass-morphism rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Submit New Idea</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
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
              onChange={handleFileChange}
              className="hidden"
              id="pitchDeck"
            />
            <label htmlFor="pitchDeck" className="cursor-pointer">
              <div className="text-4xl mb-2">📄</div>
              {pitchDeck ? (
                <div>
                  <p className="text-white font-semibold">{pitchDeck.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(pitchDeck.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="w-full py-3 gradient-primary text-white rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createMutation.isPending ? 'Creating...' : 'Create Idea'}
        </button>
      </form>
    </div>
  );
}