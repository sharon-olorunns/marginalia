import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured] = useState(isSupabaseConfigured());
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          console.log('User signed in:', session?.user?.email);
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setIsRecoveryMode(false);
        } else if (event === 'PASSWORD_RECOVERY') {
          // User clicked password reset link
          console.log('Password recovery mode');
          setIsRecoveryMode(true);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [isConfigured]);

  // Sign up with email and password
  const signUp = async (email, password) => {
    if (!isConfigured) {
      return { error: { message: 'Cloud sync is not configured' } };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    return { data, error };
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    if (!isConfigured) {
      return { error: { message: 'Cloud sync is not configured' } };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  };

  // Sign out
  const signOut = async () => {
    if (!isConfigured) return;

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
    }
  };

  // Reset password (send email)
  const resetPassword = async (email) => {
    if (!isConfigured) {
      return { error: { message: 'Cloud sync is not configured' } };
    }

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}`,
    });

    return { data, error };
  };

  // Update password (after clicking reset link)
  const updatePassword = async (newPassword) => {
    if (!isConfigured) {
      return { error: { message: 'Cloud sync is not configured' } };
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (!error) {
      setIsRecoveryMode(false);
    }

    return { data, error };
  };

  // Clear recovery mode (if user wants to cancel)
  const clearRecoveryMode = () => {
    setIsRecoveryMode(false);
  };

  const value = {
    user,
    isLoading,
    isConfigured,
    isAuthenticated: !!user,
    isRecoveryMode,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    clearRecoveryMode,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}