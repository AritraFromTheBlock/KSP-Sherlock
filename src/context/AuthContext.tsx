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
  updateProfile
} from 'firebase/auth';

export interface NormalizedUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  currentUser: NormalizedUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(normalizeUser(user));
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = async (): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
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

  const logout = async (): Promise<void> => {
    try {
      setError(null);
      await signOut(auth);
      sessionStorage.removeItem('otpVerified');
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

  const value = {
    currentUser,
    loading,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
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
