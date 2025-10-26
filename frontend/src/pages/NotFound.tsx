// FILE: frontend/src/pages/NotFound.tsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-black text-gradient mb-4">404</h1>
          <h2 className="text-3xl font-bold text-white mb-2">Page Not Found</h2>
          <p className="text-gray-400 mb-8">
            Oops! The page you're looking for doesn't exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-8 py-4 gradient-primary text-white rounded-lg font-semibold hover:opacity-90 transition-all"
          >
            Go Home
          <Link
            to="/dashboard"
            className="px-8 py-4 bg-white/5 backdrop-blur-md text-white rounded-lg font-semibold hover:bg-white/10 transition-all"
          >
            Dashboard
          </Link>
          </Link>
        </div>

        {/* Floating Animation */}
        <div className="mt-16">
          <div className="text-8xl animate-float">🚀</div>
        </div>
      </div>
    </div>
  );
}