// FILE: frontend/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { ToastContainer } from './hooks/useToast';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import SubmitIdea from './pages/SubmitIdea';
import EvaluateIdeas from './pages/EvaluateIdeas';
import RoleRequest from './pages/RoleRequest';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
import IdeaView from './pages/IdeaView';


function ProtectedRoute({ 
  children, 
  roles,
  requireVerified = true 
}: { 
  children: React.ReactNode; 
  roles?: string[];
  requireVerified?: boolean;
}) {
  const { isAuthenticated, user, isInitialized } = useAuth();

  // Show loading while checking auth
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check email verification
  if (requireVerified && !user?.isVerified) {
    return <Navigate to="/verify-otp" replace state={{ email: user?.email }} />;
  }

  // Check role requirements
  if (roles && !roles.some(role => user?.roles.includes(role))) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { checkAuth, isInitialized } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Show loading screen while checking auth
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes - Basic Auth Required */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/role-request"
          element={
            <ProtectedRoute>
              <RoleRequest />
            </ProtectedRoute>
          }
        />
        
        {/* Protected Routes - Role-Specific */}
        <Route
          path="/submit-idea"
          element={
            <ProtectedRoute roles={['founder']}>
              <SubmitIdea />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/evaluate"
          element={
            <ProtectedRoute roles={['evaluator']}>
              <EvaluateIdeas />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/idea/:id"
          element={
            <ProtectedRoute>
              <IdeaView />
            </ProtectedRoute>
          }
        />
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;