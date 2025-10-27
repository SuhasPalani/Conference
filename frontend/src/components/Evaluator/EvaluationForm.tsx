// FILE: frontend/src/components/Evaluator/EvaluationForm.tsx
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluationAPI } from '@/services/api';
import { useToast } from '@/hooks/useToast';

interface EvaluationFormProps {
  idea: any;
}

export default function EvaluationForm({ idea }: EvaluationFormProps) {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [scores, setScores] = useState({
    innovation: 5,
    feasibility: 5,
    impact: 5,
    presentation: 5,
  });
  const [comments, setComments] = useState('');

  useEffect(() => {
    // Reset form when idea changes
    setScores({
      innovation: 5,
      feasibility: 5,
      impact: 5,
      presentation: 5,
    });
    setComments('');
  }, [idea._id]);

  const submitMutation = useMutation({
    mutationFn: (data: any) => evaluationAPI.submit(data),
    onSuccess: () => {
      addToast('Evaluation submitted successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['assignedIdeas'] });
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

    if (comments.trim().length < 20) {
      addToast('Please provide detailed comments (at least 20 characters)', 'warning');
      return;
    }

    submitMutation.mutate({
      ideaId: idea._id,
      scores,
      comments,
    });
  };

  const averageScore = (
    (scores.innovation + scores.feasibility + scores.impact + scores.presentation) / 4
  ).toFixed(1);

  const scoreCategories = [
    { key: 'innovation', label: 'Innovation', description: 'Originality and creativity of the idea' },
    { key: 'feasibility', label: 'Feasibility', description: 'Technical and practical viability' },
    { key: 'impact', label: 'Impact', description: 'Potential positive effect on society/industry' },
    { key: 'presentation', label: 'Presentation', description: 'Clarity and quality of the proposal' },
  ];

  return (
    <div className="glass-morphism rounded-xl p-8">
      <h2 className="text-2xl font-bold text-white mb-2">{idea.title}</h2>
      <p className="text-gray-400 mb-6">by {idea.founderId?.fullName}</p>

      {/* Idea Details */}
      <div className="space-y-4 mb-8 pb-8 border-b border-gray-700">
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">ABSTRACT</h3>
          <p className="text-white">{idea.abstract}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">PROBLEM</h3>
          <p className="text-white">{idea.problem}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">SOLUTION</h3>
          <p className="text-white">{idea.solution}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">TEAM</h3>
          <p className="text-white">{idea.team}</p>
        </div>

        {/* ✅ FIXED: Show Pitch Deck if available */}
        {idea.pitchDeck && (
  <div>
    <h3 className="text-sm font-semibold text-gray-400 mb-2">PITCH DECK</h3>
    <a 
      href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/${idea.pitchDeck}`} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="inline-flex items-center px-4 py-2 bg-orange-900/30 text-orange-300 rounded-lg hover:bg-orange-900/50 transition-colors"
    >
      <span className="mr-2">📄</span>
      View Pitch Deck
    </a>
    <p className="text-xs text-gray-500 mt-2">
      File: {idea.pitchDeck.split('/').pop()}
    </p>
  </div>
)}

      </div>

      {/* Evaluation Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="text-xl font-bold text-white mb-4">Your Evaluation</h3>

        {/* Score Sliders */}
        {scoreCategories.map((category) => {
          const inputId = `score-${category.key}`;
          return (
            <div key={category.key}>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <label 
                    htmlFor={inputId} 
                    id={`${inputId}-label`}
                    className="text-sm font-medium text-gray-300"
                  >
                    {category.label}
                  </label>
                  <p className="text-xs text-gray-500">{category.description}</p>
                </div>
                <span className="text-2xl font-bold text-gradient">
                  {scores[category.key as keyof typeof scores]}/10
                </span>
              </div>
              <input
                id={inputId}
                aria-labelledby={`${inputId}-label`}
                title={`${category.label} score`}
                type="range"
                min="1"
                max="10"
                value={scores[category.key as keyof typeof scores]}
                onChange={(e) => handleScoreChange(category.key, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>
          );
        })}

        {/* Average Score Display */}
        <div className="p-4 gradient-dark rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-white font-semibold">Average Score</span>
            <span className="text-3xl font-black text-gradient">{averageScore}/10</span>
          </div>
        </div>

        {/* Comments */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Detailed Comments *
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
            placeholder="Provide constructive feedback on the idea's strengths, weaknesses, and potential improvements..."
            maxLength={1000}
            required
          />
          <div className="flex justify-between text-xs mt-1">
            <span className="text-gray-500">Minimum 20 characters</span>
            <span className={comments.length < 20 ? 'text-yellow-500' : 'text-gray-500'}>
              {comments.length}/1000
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitMutation.isPending || comments.trim().length < 20}
          className="w-full py-3 gradient-primary text-white rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitMutation.isPending ? 'Submitting...' : 'Submit Evaluation'}
        </button>

        {/* Warning for completed evaluations */}
        {idea.evaluationStatus === 'completed' && (
          <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
            <p className="text-yellow-300 text-sm">
              ⚠️ You have already submitted an evaluation for this idea. Submitting again will update your previous evaluation.
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
