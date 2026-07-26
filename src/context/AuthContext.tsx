import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from '../config/firebase';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
  setPersistence,
  browserSessionPersistence
} from 'firebase/auth';

export interface NormalizedUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  currentUser: NormalizedUser | null;
  isAuthenticated: boolean;
  isPendingAuth: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
  verify2FA: (code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeUser = (user: User | null): NormalizedUser | null => {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<NormalizedUser | null>(null);
  const [isOtpVerified, setIsOtpVerified] = useState<boolean>(() => sessionStorage.getItem('otpVerified') === 'true');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set Firebase to session-only persistence
    setPersistence(auth, browserSessionPersistence).catch(console.error);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(normalizeUser(user));
      // If user logs out elsewhere or token expires, clear OTP state
      if (!user) {
        sessionStorage.removeItem('otpVerified');
        setIsOtpVerified(false);
      }
      setLoading(false);
    });

    // Force clear session on tab close to guarantee "sign out on close"
    const handleBeforeUnload = () => {
      // Note: We don't call signOut(auth) here because browserSessionPersistence handles the Firebase side automatically,
      // but we explicitly remove the 2FA flag just in case.
      sessionStorage.removeItem('otpVerified');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const loginWithGoogle = async (): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      await setPersistence(auth, browserSessionPersistence);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setError(err.message || 'Google Sign-In failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      await setPersistence(auth, browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error('Email Sign-In Error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signupWithEmail = async (email: string, password: string, fullName: string): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      await setPersistence(auth, browserSessionPersistence);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: fullName });
      setCurrentUser(normalizeUser({ ...userCredential.user, displayName: fullName } as User));
    } catch (err: any) {
      console.error('Email Sign-Up Error:', err);
      setError(err.message || 'Signup failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async (code: string): Promise<boolean> => {
    try {
      setError(null);
      // In a real Catalyst implementation, this would be an API call:
      // await apiClient.post('/verify-2fa', { code });
      
      const FIXED_PIN = import.meta.env.VITE_ACCESS_PIN || "262026";
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (code === FIXED_PIN) {
        sessionStorage.setItem('otpVerified', 'true');
        setIsOtpVerified(true);
        return true;
      } else {
        setError('Invalid access code. Please try again.');
        return false;
      }
    } catch (err: any) {
      console.error('2FA Error:', err);
      setError(err.message || 'Verification failed.');
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setError(null);
      sessionStorage.removeItem('otpVerified');
      setIsOtpVerified(false);
      await signOut(auth);
    } catch (err: any) {
      console.error('Logout error:', err);
      setError('Failed to sign out cleanly.');
    }
  };

  const getIdToken = async (forceRefresh = false): Promise<string | null> => {
    if (auth.currentUser) {
      return auth.currentUser.getIdToken(forceRefresh);
    }
    return null;
  };

  const clearError = () => setError(null);

  const isAuthenticated = !!currentUser && isOtpVerified;
  const isPendingAuth = !!currentUser && !isOtpVerified;

  const value = {
    currentUser,
    isAuthenticated,
    isPendingAuth,
    loading,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    verify2FA,
    logout,
    getIdToken,
    error,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
