// FILE: frontend/src/components/RoleRequest/RoleRequestForm.tsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roleRequestAPI } from '@/services/api';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';

export default function RoleRequestForm() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [selectedRole, setSelectedRole] = useState<'founder' | 'evaluator' | ''>('');
  const [reason, setReason] = useState('');
  const [previousWork, setPreviousWork] = useState('');

  const submitMutation = useMutation({
    mutationFn: (data: any) => roleRequestAPI.submit(data),
    onSuccess: () => {
      addToast('Role request submitted! Admins will review it soon.', 'success');
      queryClient.invalidateQueries({ queryKey: ['myRoleRequests'] });
      setSelectedRole('');
      setReason('');
      setPreviousWork('');
    },
    onError: (error: any) => {
      addToast(error.response?.data?.error || 'Failed to submit request', 'error');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      addToast('Please select a role', 'warning');
      return;
    }

    if (reason.length < 50) {
      addToast('Please provide a detailed reason (at least 50 characters)', 'warning');
      return;
    }

    submitMutation.mutate({
      role: selectedRole,
      reason,
      previousWork: previousWork || undefined,
    });
  };

  const roleInfo = {
    founder: {
      icon: '🚀',
      title: 'Founder',
      description: 'Submit and manage your AI/ML innovation ideas',
      requirements: [
        'Describe your entrepreneurial background',
        'Explain your AI/ML expertise',
        'Share your motivation for joining',
        'Provide links to previous work/portfolio (optional)',
      ],
    },
    evaluator: {
      icon: '⭐',
      title: 'Evaluator',
      description: 'Review and score submitted AI/ML ideas',
      requirements: [
        'Demonstrate expertise in AI/ML field',
        'Share relevant industry/academic experience',
        'Explain why you want to evaluate ideas',
        'Provide credentials (publications, Google Scholar, etc.)',
      ],
    },
  };

  const currentRoleInfo = selectedRole ? roleInfo[selectedRole] : null;

  // Check if user already has the role
  const hasRole = (role: string) => user?.roles.includes(role);

  return (
    <div className="glass-morphism rounded-xl p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Request New Role</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Select Role to Request *
          </label>
          <div className="grid md:grid-cols-2 gap-4">
            {(['founder', 'evaluator'] as const).map((role) => {
              const info = roleInfo[role];
              const disabled = hasRole(role);

              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => !disabled && setSelectedRole(role)}
                  disabled={disabled}
                  className={`
                    p-6 rounded-lg text-left transition-all border-2
                    ${selectedRole === role
                      ? 'border-orange-500 bg-orange-900/20'
                      : disabled
                      ? 'border-gray-800 bg-gray-800/30 opacity-50 cursor-not-allowed'
                      : 'border-gray-700 hover:border-orange-500/50 bg-gray-800/30'
                    }
                  `}
                >
                  <div className="text-4xl mb-3">{info.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {info.title}
                    {disabled && <span className="text-xs text-green-400 ml-2">(Already have)</span>}
                  </h3>
                  <p className="text-sm text-gray-400">{info.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Requirements Display */}
        {currentRoleInfo && (
          <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-300 mb-2">
              📋 Requirements for {currentRoleInfo.title} Role
            </h4>
            <ul className="text-xs text-blue-200 space-y-1">
              {currentRoleInfo.requirements.map((req, i) => (
                <li key={i}>• {req}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Why do you want this role? *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
            placeholder="Provide a detailed explanation of your background, expertise, and motivation..."
            maxLength={1000}
            required
          />
          <div className="flex justify-between text-xs mt-1">
            <span className={reason.length < 50 ? 'text-yellow-500' : 'text-gray-500'}>
              Minimum 50 characters
            </span>
            <span className="text-gray-500">{reason.length}/1000</span>
          </div>
        </div>

        {/* Previous Work */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Previous Work / Portfolio (Optional)
          </label>
          <textarea
            value={previousWork}
            onChange={(e) => setPreviousWork(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
            placeholder="Share links to your portfolio, publications, projects, GitHub, LinkedIn, etc."
            maxLength={1000}
          />
          <p className="text-xs text-gray-500 mt-1">{previousWork.length}/1000</p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitMutation.isPending || !selectedRole || reason.length < 50}
          className="w-full py-3 gradient-primary text-white rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitMutation.isPending ? 'Submitting...' : 'Submit Request'}
        </button>

        {/* Info */}
        <div className="p-4 bg-gray-800/50 rounded-lg">
          <p className="text-xs text-gray-400">
            <strong className="text-white">Note:</strong> Your request will be reviewed by our admin team. 
            You'll be notified via email once your request is processed. This usually takes 1-2 business days.
          </p>
        </div>
      </form>
    </div>
  );
}