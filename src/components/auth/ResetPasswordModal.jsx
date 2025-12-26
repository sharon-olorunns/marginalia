import { useState } from 'react';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { Modal, Button, Input } from '../ui';
import { useAuth } from '../../context/AuthContext';

export default function ResetPasswordModal({ isOpen, onClose }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { updatePassword } = useAuth();

  const handleSubmit = async (e) => {
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

    const { error } = await updatePassword(password);

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      setSuccess(true);
      setIsLoading(false);
      // Close after short delay
      setTimeout(() => {
        setPassword('');
        setConfirmPassword('');
        setSuccess(false);
        onClose();
      }, 2000);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Set New Password" 
      size="sm"
      showClose={false}
    >
      {success ? (
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={24} className="text-green-600" />
          </div>
          <p className="font-sans text-ink-900 font-medium mb-1">Password Updated!</p>
          <p className="font-sans text-sm text-ink-500">You can now use your new password to sign in.</p>
        </div>
      ) : (
        <>
          <p className="font-sans text-sm text-ink-600 mb-4">
            Enter your new password below.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
              <p className="font-sans text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={Lock}
              required
              disabled={isLoading}
            />
            <Input
              label="Confirm New Password"
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
              Update Password
            </Button>
          </form>
        </>
      )}
    </Modal>
  );
}