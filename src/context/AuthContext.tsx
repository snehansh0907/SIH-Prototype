import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthRole, FarmerUser } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  authState: AuthRole;
  user: FarmerUser | null;
  isAuthenticated: boolean;
  isFarmer: boolean;
  isDemo: boolean;
  isLoginModalOpen: boolean;
  login: (idOrEmail: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  loginAsDemo: () => void;
  logout: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  requireFarmerAccess: (onSuccessAction?: () => void) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthRole>('unauthenticated');
  const [user, setUser] = useState<FarmerUser | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Initialize session from localStorage
  useEffect(() => {
    const session = authService.getStoredSession();
    setAuthState(session.role);
    setUser(session.user);
  }, []);

  const login = async (idOrEmail: string, pass: string) => {
    const res = await authService.login(idOrEmail, pass);
    if (res.success && res.user) {
      setAuthState('farmer');
      setUser(res.user);
      setIsLoginModalOpen(false);
      return { success: true };
    }
    return { success: false, message: res.message || 'Login failed. Please check credentials.' };
  };

  const loginAsDemo = async () => {
    const res = await authService.loginAsDemo();
    setAuthState('demo');
    setUser(res.user);
    setIsLoginModalOpen(false);
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
   * Guard function: checks if active session is 'farmer'.
   * If yes, returns true and executes optional callback.
   * If no (demo mode or unauthenticated), opens the friendly Farmer Login Required modal and returns false.
   */
  const requireFarmerAccess = (onSuccessAction?: () => void): boolean => {
    if (authState === 'farmer') {
      if (onSuccessAction) onSuccessAction();
      return true;
    }

    // Open restriction modal
    setIsLoginModalOpen(true);
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        user,
        isAuthenticated: authState === 'farmer' || authState === 'demo',
        isFarmer: authState === 'farmer',
        isDemo: authState === 'demo',
        isLoginModalOpen,
        login,
        loginAsDemo,
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
