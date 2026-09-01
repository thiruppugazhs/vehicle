import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useFleet } from '../../context/FleetContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authMode,
    setAuthMode,
    updateUserProfile,
    setIsOnboardingActive,
    setActiveTab
  } = useFleet();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (authMode === 'signup') {
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (!email.includes('@')) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        updateUserProfile({
          name: fullName,
          email: email || 'user@apexlogistics.com',
          isOnboarded: false
        });
        setIsAuthModalOpen(false);
        setIsOnboardingActive(true);
        setActiveTab('dashboard');
      }, 600);
    } else if (authMode === 'login') {
      if (!email.trim() || !password.trim()) {
        setErrorMessage('Please provide both email and password.');
        return;
      }
      if (!email.includes('@') || password.length < 4) {
        setErrorMessage('Invalid credentials. Please check your email or password.');
        return;
      }
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        updateUserProfile({
          email: email
        });
        setIsAuthModalOpen(false);
        setActiveTab('dashboard');
      }, 600);
    } else if (authMode === 'forgot') {
      if (!email.trim() || !email.includes('@')) {
        setErrorMessage('Please enter a valid email to receive a reset link.');
        return;
      }
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setSuccessMessage(`Password reset link sent to ${email}. You can simulate clicking the link below.`);
      }, 600);
    } else if (authMode === 'reset') {
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setSuccessMessage('Password has been reset successfully! Please sign in with your new credentials.');
        setAuthMode('login');
        setPassword('');
        setConfirmPassword('');
      }, 600);
    }
  };

  const handleGoogleOAuth = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      updateUserProfile({
        name: 'Alex Rivera',
        email: 'alex.rivera@gmail.com',
        role: 'Fleet Manager'
      });
      setIsAuthModalOpen(false);
      setActiveTab('dashboard');
    }, 700);
  };

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={() => setIsAuthModalOpen(false)}
      title={
        authMode === 'signup'
          ? 'Create your FleetPulse Account'
          : authMode === 'forgot'
          ? 'Reset Your Password'
          : authMode === 'reset'
          ? 'Set New Password'
          : 'Welcome Back to FleetPulse'
      }
      subtitle={
        authMode === 'signup'
          ? 'Get started in under 2 minutes. No credit card required.'
          : authMode === 'forgot'
          ? 'Enter your registered email to receive password reset instructions.'
          : authMode === 'reset'
          ? 'Choose a strong new password for your FleetPulse account.'
          : 'Enter your credentials to access your vehicle command center.'
      }
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Google OAuth Option */}
        {authMode !== 'forgot' && authMode !== 'reset' && (
          <>
            <button
              type="button"
              onClick={handleGoogleOAuth}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm shadow-2xs hover:border-slate-300 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.97 0 12s.46 3.83 1.26 5.42l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-xs text-slate-400 font-medium uppercase tracking-wider absolute">
                Or with email
              </span>
            </div>
          </>
        )}

        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
          {authMode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Vikram Malhotra"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                required
              />
            </div>
          </div>

          {authMode === 'reset' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {authMode !== 'forgot' && authMode !== 'reset' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-xs text-amber-700 hover:text-amber-800 font-semibold"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  required
                />
              </div>
            </div>
          )}

          {authMode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  required
                />
              </div>
            </div>
          )}

          {authMode === 'forgot' && successMessage && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('reset');
                  setSuccessMessage('');
                  setErrorMessage('');
                }}
                className="w-full py-2 px-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl font-bold text-xs hover:bg-amber-100 transition-colors"
              >
                Simulate Opening Reset Link
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : authMode === 'signup' ? (
              <>
                Create Account & Onboard
                <ArrowRight className="w-4 h-4" />
              </>
            ) : authMode === 'forgot' ? (
              'Send Reset Link'
            ) : authMode === 'reset' ? (
              'Save New Password & Log In'
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-500">
          {authMode === 'signup' ? (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => {
                  setAuthMode('login');
                  setErrorMessage('');
                }}
                className="font-bold text-amber-700 hover:text-amber-800"
              >
                Sign In
              </button>
            </p>
          ) : authMode === 'login' ? (
            <p>
              Don't have an account yet?{' '}
              <button
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMessage('');
                }}
                className="font-bold text-amber-700 hover:text-amber-800"
              >
                Create one free
              </button>
            </p>
          ) : (
            <button
              onClick={() => {
                setAuthMode('login');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="font-bold text-amber-700 hover:text-amber-800"
            >
              Back to Login
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
