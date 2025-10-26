// FILE: frontend/src/pages/Landing.tsx
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-morphism">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg gradient-primary animate-pulse-glow" />
              <span className="text-2xl font-bold text-gradient">mAIple</span>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="px-6 py-2 gradient-primary text-white rounded-lg font-semibold hover:opacity-90 transition-all"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-6 py-2 text-white hover:text-orange-400 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-2 gradient-primary text-white rounded-lg font-semibold hover:opacity-90 transition-all"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-slide-up">
            <h1 className="text-6xl md:text-7xl font-black mb-6">
              Shape the Future of{' '}
              <span className="text-gradient">AI Innovation</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Submit groundbreaking AI ideas, get expert evaluations, and compete
              for funding at the premier AI/ML conference
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="px-8 py-4 gradient-primary text-white rounded-lg text-lg font-bold hover:opacity-90 transition-all transform hover:scale-105"
              >
                Submit Your Idea
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 glass-morphism text-white rounded-lg text-lg font-semibold hover:bg-white/10 transition-all"
              >
                Become an Evaluator
              </Link>
            </div>
          </div>

          {/* Floating Cards */}
          <div className="mt-20 grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🚀',
                title: 'Submit Ideas',
                desc: 'Share your innovative AI solutions',
              },
              {
                icon: '⭐',
                title: 'Expert Review',
                desc: 'Get evaluated by industry leaders',
              },
              {
                icon: '🏆',
                title: 'Win Funding',
                desc: 'Top ideas receive investment',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-8 glass-morphism rounded-2xl card-glow animate-float"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                <div className="text-6xl mb-4">{item.icon}</div>
                <h3 className="text-2xl font-bold text-gradient mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 gradient-dark">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8 text-center">
          {[
            { num: '500+', label: 'Ideas Submitted' },
            { num: '150+', label: 'Expert Evaluators' },
            { num: '$2M+', label: 'Funding Awarded' },
            { num: '50+', label: 'Success Stories' },
          ].map((stat, i) => (
            <div key={i} className="animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="text-5xl font-black text-gradient mb-2">{stat.num}</div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16">
            Why Choose <span className="text-gradient">mAIple</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            {[
              {
                title: 'For Founders',
                features: [
                  'Submit unlimited AI/ML ideas',
                  'Get detailed feedback from experts',
                  'Track evaluation progress in real-time',
                  'Connect with investors and mentors',
                ],
              },
              {
                title: 'For Evaluators',
                features: [
                  'Review cutting-edge AI innovations',
                  'Contribute to the AI community',
                  'Network with industry leaders',
                  'Gain recognition in the field',
                ],
              },
            ].map((section, i) => (
              <div key={i} className="p-8 glass-morphism rounded-2xl">
                <h3 className="text-2xl font-bold text-gradient mb-6">
                  {section.title}
                </h3>
                <ul className="space-y-4">
                  {section.features.map((feature, j) => (
                    <li key={j} className="flex items-start">
                      <span className="text-orange-500 mr-3 text-xl">✓</span>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 gradient-primary rounded-3xl">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Ready to Innovate?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of innovators shaping the future of AI
            </p>
            <Link
              to="/register"
              className="inline-block px-10 py-4 bg-white text-orange-600 rounded-lg text-lg font-bold hover:bg-gray-100 transition-all transform hover:scale-105"
            >
              Start Your Journey
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>&copy; 2025 mAIple Conference. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}