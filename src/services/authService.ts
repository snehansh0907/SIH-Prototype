import type { AuthRole, FarmerUser } from '../types';

const STORAGE_KEY_ROLE = 'krishi_sarthak_auth_role';
const STORAGE_KEY_USER = 'krishi_sarthak_auth_user';

export const MOCK_FARMER_USER: FarmerUser = {
  id: 'farmer-demo-001',
  name: 'Demo Farmer',
  nameMr: 'डेमो शेतकरी',
  emailOrPhone: 'farmer123',
  location: 'Nashik, Maharashtra',
  locationMr: 'नाशिक, महाराष्ट्र',
  monitoredCrop: 'Tomato (Trishul 44)',
  monitoredCropMr: 'टोमॅटो (त्रिशूल ४४)',
  avatar: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=200&q=80',
  isDemo: false,
};

export const MOCK_DEMO_USER: FarmerUser = {
  id: 'demo-public-001',
  name: 'Demo Explorer',
  nameMr: 'डेमो वापरकर्ता',
  emailOrPhone: 'demo@krishisarthak.in',
  location: 'Public Demo Mode',
  locationMr: 'डेमो नमुना मोड',
  monitoredCrop: 'Sample Crop View',
  monitoredCropMr: 'नमुना पीक',
  isDemo: true,
};

export const authService = {
  /**
   * Mock login function. Accepts farmer123 / farmer123 or any non-empty input for demo convenience.
   * Can easily be replaced by real API call: fetch('/api/v1/auth/login', ...)
   */
  async login(idOrEmail: string, password: string): Promise<{ success: boolean; user?: FarmerUser; message?: string }> {
    // Artificial slight delay for realistic UI response
    await new Promise((res) => setTimeout(res, 400));

    const cleanInput = idOrEmail.trim().toLowerCase();
    
    // Accept standard demo credentials or any reasonable input for presentation testing
    if (!cleanInput || !password) {
      return { success: false, message: 'Please enter both Farmer ID / Email and Password.' };
    }

    if (password.length < 3) {
      return { success: false, message: 'Password must be at least 3 characters.' };
    }

    // Save session
    localStorage.setItem(STORAGE_KEY_ROLE, 'farmer');
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(MOCK_FARMER_USER));

    return {
      success: true,
      user: MOCK_FARMER_USER,
    };
  },

  async loginAsDemo(): Promise<{ user: FarmerUser }> {
    localStorage.setItem(STORAGE_KEY_ROLE, 'demo');
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(MOCK_DEMO_USER));
    return { user: MOCK_DEMO_USER };
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEY_ROLE);
    localStorage.removeItem(STORAGE_KEY_USER);
  },

  getStoredSession(): { role: AuthRole; user: FarmerUser | null } {
    try {
      const storedRole = localStorage.getItem(STORAGE_KEY_ROLE) as AuthRole | null;
      const storedUser = localStorage.getItem(STORAGE_KEY_USER);

      if (storedRole === 'farmer' && storedUser) {
        return { role: 'farmer', user: JSON.parse(storedUser) };
      }

      if (storedRole === 'demo') {
        return { role: 'demo', user: MOCK_DEMO_USER };
      }
    } catch {
      // Fallthrough to unauthenticated on error
    }

    return { role: 'unauthenticated', user: null };
  },
};
