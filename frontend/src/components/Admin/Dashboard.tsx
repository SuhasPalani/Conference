import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '@/services/api';
import { formatDate } from '@/lib/utils';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: () => adminAPI.getDashboard(),
  });

  const stats = data?.data?.stats;
  const recentIdeas = data?.data?.recentIdeas || [];
  const recentEvaluations = data?.data?.recentEvaluations || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="👥"
          label="Total Users"
          value={stats?.users?.total || 0}
          color="blue"
        />
        <StatCard
          icon="💡"
          label="Total Ideas"
          value={stats?.ideas?.total || 0}
          color="orange"
        />
        <StatCard
          icon="⭐"
          label="Evaluations"
          value={stats?.evaluations?.total || 0}
          color="yellow"
        />
        <StatCard
          icon="✅"
          label="Approved Ideas"
          value={stats?.ideas?.approved || 0}
          color="green"
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* User Breakdown */}
        <div className="glass-morphism rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <span className="mr-2">👥</span>
            User Breakdown
          </h3>
          <div className="space-y-3">
            <StatRow label="Founders" value={stats?.users?.founders || 0} total={stats?.users?.total || 1} />
            <StatRow label="Evaluators" value={stats?.users?.evaluators || 0} total={stats?.users?.total || 1} />
            <StatRow label="Admins" value={stats?.users?.admins || 0} total={stats?.users?.total || 1} />
            <StatRow label="Verified" value={stats?.users?.verified || 0} total={stats?.users?.total || 1} />
          </div>
        </div>

        {/* Idea Status */}
        <div className="glass-morphism rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <span className="mr-2">💡</span>
            Idea Status
          </h3>
          <div className="space-y-3">
            <StatRow label="Draft" value={stats?.ideas?.draft || 0} total={stats?.ideas?.total || 1} color="gray" />
            <StatRow label="Submitted" value={stats?.ideas?.submitted || 0} total={stats?.ideas?.total || 1} color="blue" />
            <StatRow label="Under Review" value={stats?.ideas?.underReview || 0} total={stats?.ideas?.total || 1} color="yellow" />
            <StatRow label="Approved" value={stats?.ideas?.approved || 0} total={stats?.ideas?.total || 1} color="green" />
            <StatRow label="Rejected" value={stats?.ideas?.rejected || 0} total={stats?.ideas?.total || 1} color="red" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Ideas */}
        <div className="glass-morphism rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Recent Ideas</h3>
          <div className="space-y-3">
            {recentIdeas.length > 0 ? (
              recentIdeas.map((idea: any) => (
                <div
                  key={idea._id}
                  className="p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <h4 className="text-white font-semibold mb-1 line-clamp-1">
                    {idea.title}
                  </h4>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">
                      by {idea.founderId?.fullName}
                    </span>
                    <span className="text-gray-500">
                      {formatDate(idea.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent ideas</p>
            )}
          </div>
        </div>

        {/* Recent Evaluations */}
        <div className="glass-morphism rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Recent Evaluations</h3>
          <div className="space-y-3">
            {recentEvaluations.length > 0 ? (
              recentEvaluations.map((evaluation: any) => (
                <div
                  key={evaluation._id}
                  className="p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <h4 className="text-white font-semibold mb-1 line-clamp-1">
                    {evaluation.ideaId?.title}
                  </h4>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">
                      by {evaluation.evaluatorId?.fullName}
                    </span>
                    <span className="text-orange-500 font-semibold">
                      {evaluation.averageScore}/10
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent evaluations</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  const colorClasses: any = {
    blue: 'from-blue-500/20 to-blue-600/20',
    orange: 'from-orange-500/20 to-orange-600/20',
    yellow: 'from-yellow-500/20 to-yellow-600/20',
    green: 'from-green-500/20 to-green-600/20',
  };

  return (
    <div className={`glass-morphism rounded-xl p-6 bg-gradient-to-br ${colorClasses[color]}`}>
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-3xl font-black text-gradient mb-1">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}

function StatRow({ label, value, total, color = 'orange' }: any) {
  const percentage = ((value / total) * 100).toFixed(0);
  
  const colorClasses: any = {
    gray: 'bg-gray-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    orange: 'bg-orange-500',
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-semibold">{value}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colorClasses[color]} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}