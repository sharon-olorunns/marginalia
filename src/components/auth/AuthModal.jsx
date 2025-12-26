import { useState } from 'react';
import { Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { Modal, Button, Input } from '../ui';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, signUp, resetPassword } = useAuth();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(null);
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    setMode('signin');
    onClose();
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      handleClose();
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(email, password);

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      setSuccess('Check your email to confirm your account!');
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error } = await resetPassword(email);

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Check your email for a password reset link!');
    }
    setIsLoading(false);
  };

  const getTitle = () => {
    switch (mode) {
      case 'signup': return 'Create Account';
      case 'forgot': return 'Reset Password';
      default: return 'Sign In';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={getTitle()} size="sm">
      {/* Success Message */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
          <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
          <p className="font-sans text-sm text-green-800">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
          <p className="font-sans text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Sign In Form */}
      {mode === 'signin' && (
        <form onSubmit={handleSignIn} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            icon={Mail}
            required
            disabled={isLoading}
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={Lock}
            required
            disabled={isLoading}
          />
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => handleModeSwitch('forgot')}
              className="font-sans text-sm text-amber-600 hover:text-amber-700"
            >
              Forgot password?
            </button>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            loading={isLoading}
          >
            Sign In
          </Button>

          <p className="text-center font-sans text-sm text-ink-500">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => handleModeSwitch('signup')}
              className="text-amber-600 hover:text-amber-700 font-medium"
            >
              Sign up
            </button>
          </p>
        </form>
      )}

      {/* Sign Up Form */}
      {mode === 'signup' && (
        <form onSubmit={handleSignUp} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            icon={Mail}
            required
            disabled={isLoading}
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={Lock}
            required
            disabled={isLoading}
          />
          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            icon={Lock}
            required
            disabled={isLoading}
          />

          <Button 
            type="submit" 
            className="w-full" 
            loading={isLoading}
          >
            Create Account
          </Button>

          <p className="text-center font-sans text-sm text-ink-500">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => handleModeSwitch('signin')}
              className="text-amber-600 hover:text-amber-700 font-medium"
            >
              Sign in
            </button>
          </p>
        </form>
      )}

      {/* Forgot Password Form */}
      {mode === 'forgot' && (
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <p className="font-sans text-sm text-ink-600 mb-4">
            Enter your email and we'll send you a link to reset your password.
          </p>
          
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            icon={Mail}
            required
            disabled={isLoading}
          />

          <Button 
            type="submit" 
            className="w-full" 
            loading={isLoading}
          >
            Send Reset Link
          </Button>

          <p className="text-center font-sans text-sm text-ink-500">
            <button
              type="button"
              onClick={() => handleModeSwitch('signin')}
              className="text-amber-600 hover:text-amber-700 font-medium"
            >
              Back to sign in
            </button>
          </p>
        </form>
      )}
    </Modal>
  );
}