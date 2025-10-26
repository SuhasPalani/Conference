// FILE: frontend/src/components/Evaluator/AssignedIdeas.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { evaluationAPI } from '@/services/api';
import { formatDate } from '@/lib/utils';

interface AssignedIdeasProps {
  onSelectIdea: (idea: any) => void;
  selectedIdeaId?: string;
}

export default function AssignedIdeas({ onSelectIdea, selectedIdeaId }: AssignedIdeasProps) {
  const [filterStatus, setFilterStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['assignedIdeas', filterStatus],
    queryFn: () => evaluationAPI.getAssigned(filterStatus),
  });

  const ideas = data?.data?.ideas || [];

  if (isLoading) {
    return (
      <div className="glass-morphism rounded-xl p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-morphism rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Assigned Ideas</h2>
        <span className="px-3 py-1 bg-orange-900/30 text-orange-300 rounded-full text-sm font-semibold">
          {ideas.length} total
        </span>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <label htmlFor="filter-status" className="block text-sm font-medium text-gray-300 mb-2">
          Filter by Status
        </label>
        <select
          id="filter-status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Ideas List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {ideas.map((idea: any) => (
          <button
            key={idea._id}
            onClick={() => onSelectIdea(idea)}
            className={`
              w-full p-4 rounded-lg text-left transition-all
              ${selectedIdeaId === idea._id
                ? 'bg-orange-900/30 border-2 border-orange-500'
                : 'bg-gray-800/50 border border-gray-700 hover:border-orange-500'
              }
            `}
          >
            <h3 className="font-semibold text-white mb-1 line-clamp-2">
              {idea.title}
            </h3>
            <p className="text-xs text-gray-400 mb-2 line-clamp-1">
              {idea.abstract}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                📅 {formatDate(idea.createdAt)}
              </span>
              <span
                className={`
                  px-2 py-1 rounded text-xs font-semibold
                  ${idea.evaluationStatus === 'pending' ? 'bg-yellow-900 text-yellow-300' : ''}
                  ${idea.evaluationStatus === 'completed' ? 'bg-green-900 text-green-300' : ''}
                  ${idea.evaluationStatus === 'not_started' ? 'bg-gray-700 text-gray-300' : ''}
                `}
              >
                {idea.evaluationStatus?.replace('_', ' ').toUpperCase() || 'NOT STARTED'}
              </span>
            </div>
          </button>
        ))}

        {ideas.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⭐</div>
            <h3 className="text-lg font-bold text-white mb-2">No Ideas Found</h3>
            <p className="text-gray-400 text-sm">
              {filterStatus ? 'Try adjusting your filter' : 'No ideas assigned yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}