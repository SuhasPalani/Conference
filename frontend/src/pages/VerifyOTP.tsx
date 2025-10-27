// FILE: frontend/src/pages/VerifyOTP.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '@/services/api';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';

export default function VerifyOTP() {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const { addToast } = useToast();
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      addToast('Please enter a 6-digit OTP', 'warning');
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await authAPI.verifyOTP(email, otp);
      
      // Store token and user
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      updateUser(data.user);
      
      addToast('Email verified successfully! Welcome to mAIple!', 'success');
      navigate('/dashboard');
    } catch (error: any) {
      addToast(
        error.response?.data?.error || 'Invalid OTP. Please try again.',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setIsResending(true);

    try {
      await authAPI.resendOTP(email);
      addToast('New OTP sent to your email!', 'success');
      setCountdown(60); // 60 seconds cooldown
    } catch (error: any) {
      addToast(
        error.response?.data?.error || 'Failed to resend OTP',
        'error'
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
          <div className="w-10 h-10 rounded-lg gradient-primary animate-pulse-glow" />
          <span className="text-3xl font-bold text-gradient">mAIple</span>
        </Link>

        {/* OTP Card */}
        <div className="glass-morphism rounded-2xl p-8 card-glow">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📧</div>
            <h2 className="text-3xl font-bold text-white mb-2">Verify Your Email</h2>
            <p className="text-gray-400">
              We've sent a 6-digit code to<br />
              <strong className="text-white">{email}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 text-center">
                Enter OTP Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setOtp(value.slice(0, 6));
                }}
                className="w-full px-4 py-4 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-center text-2xl font-bold tracking-widest placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="000000"
                maxLength={6}
                required
              />
              <p className="text-xs text-gray-500 text-center mt-2">
                {otp.length}/6 digits
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full py-3 gradient-primary text-white rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400 mb-2">Didn't receive the code?</p>
            {countdown > 0 ? (
              <p className="text-sm text-gray-500">
                Resend available in {countdown}s
              </p>
            ) : (
              <button
                onClick={handleResendOTP}
                disabled={isResending}
                className="text-sm text-orange-500 hover:text-orange-400 font-semibold transition-colors disabled:opacity-50"
              >
                {isResending ? 'Sending...' : 'Resend OTP'}
              </button>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
            <p className="text-xs text-blue-300">
              💡 <strong>Tip:</strong> Check your spam folder if you don't see the email. The OTP expires in 10 minutes.
            </p>
          </div>
        </div>

        {/* Back to Register */}
        <div className="mt-6 text-center">
          <Link
            to="/register"
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Registration
          </Link>
        </div>
      </div>
    </div>
  );
}