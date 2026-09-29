import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthRole, FarmerUser } from '../types';
import { authService } from '../services/authService';

import type { RegisterPayload } from '../services/authService';

interface AuthContextType {
  authState: AuthRole;
  user: FarmerUser | null;
  isAuthenticated: boolean;
  isFarmer: boolean;
  isVetOfficial: boolean;
  isDemo: boolean;
  isLoginModalOpen: boolean;
  login: (idOrEmail: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; message?: string; user?: FarmerUser }>;
  loginAsDemo: (specificKey?: 'ramesh' | 'vikas' | 'anita' | 'sunita' | 'suresh' | 'vet_kadam') => void;
  loginAsVetOfficial: () => void;
  logout: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  requireFarmerAccess: (onSuccessAction?: () => void) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthRole>(() => authService.getStoredSession().role);
  const [user, setUser] = useState<FarmerUser | null>(() => authService.getStoredSession().user);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Synchronize session from localStorage on mount and window focus/storage events
  useEffect(() => {
    const session = authService.getStoredSession();
    if (session.user?.id !== user?.id || session.role !== authState) {
      setAuthState(session.role);
      setUser(session.user);
    }
  }, []);

  const login = async (idOrEmail: string, pass: string) => {
    const res = await authService.login(idOrEmail, pass);
    if (res.success && res.user) {
      const nextRole: AuthRole = res.user.role === 'vet_official' ? 'vet_official' : 'farmer';
      setAuthState(nextRole);
      setUser(res.user);
      setIsLoginModalOpen(false);
      return { success: true };
    }
    return { success: false, message: res.message || 'Login failed. Please check credentials.' };
  };

  const register = async (payload: RegisterPayload) => {
    const res = await authService.register(payload);
    if (res.success && res.user) {
      const nextRole: AuthRole = res.user.role === 'vet_official' ? 'vet_official' : 'farmer';
      setAuthState(nextRole);
      setUser(res.user);
      setIsLoginModalOpen(false);
      return { success: true, user: res.user };
    }
    return { success: false, message: res.message || 'Registration failed' };
  };

  const loginAsDemo = async (specificKey?: 'ramesh' | 'vikas' | 'anita' | 'sunita' | 'suresh' | 'vet_kadam') => {
    const res = await authService.loginAsDemo(specificKey);
    const nextRole: AuthRole = res.user.role === 'vet_official' ? 'vet_official' : 'demo';
    setAuthState(nextRole);
    setUser(res.user);
    setIsLoginModalOpen(false);
  };

  const loginAsVetOfficial = async () => {
    await loginAsDemo('vet_kadam');
  };

  const logout = () => {
    authService.logout();
    setAuthState('unauthenticated');
    setUser(null);
    setIsLoginModalOpen(false);
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  /**
   * Guard function: checks if active session is 'farmer' or 'vet_official'.
   */
  const requireFarmerAccess = (onSuccessAction?: () => void): boolean => {
    if (authState === 'farmer' || authState === 'vet_official') {
      if (onSuccessAction) onSuccessAction();
      return true;
    }

    // Open restriction modal
    setIsLoginModalOpen(true);
    return false;
  };

  const isVetOfficial = authState === 'vet_official' || user?.role === 'vet_official';

  return (
    <AuthContext.Provider
      value={{
        authState,
        user,
        isAuthenticated: authState === 'farmer' || authState === 'demo' || authState === 'vet_official',
        isFarmer: authState === 'farmer',
        isVetOfficial,
        isDemo: authState === 'demo',
        isLoginModalOpen,
        login,
        register,
        loginAsDemo,
        loginAsVetOfficial,
        logout,
        openLoginModal,
        closeLoginModal,
        requireFarmerAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
