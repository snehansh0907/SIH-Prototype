import type { AuthRole, FarmerUser } from '../types';

export const STORAGE_KEY_ROLE = 'krishi_sarthak_auth_role';
export const STORAGE_KEY_USER = 'krishi_sarthak_current_user';
export const STORAGE_KEY_LEGACY_USER = 'krishi_sarthak_auth_user';
export const STORAGE_KEY_REGISTERED = 'krishi_sarthak_registered_users';

export interface RegisterPayload {
  name: string;
  phone: string;
  email?: string;
  password: string;
  state?: string;
  district: string;
  taluka: string;
  village: string;
  pincode?: string;
  farmName: string;
  areaAcres: number | string;
  latitude?: number;
  longitude?: number;
  mainCrop: 'Tomato' | 'Cotton' | 'Soybean' | 'Sugarcane' | 'Maize' | 'Onion' | 'Rice' | 'Wheat' | string;
}

interface StoredRegisteredUser {
  user: FarmerUser;
  password: string;
  createdAt: string;
}

// ----------------------------------------------------
// Seeded Demo Farmers (Mapped directly to Supabase data)
// ----------------------------------------------------
export interface DemoFarmerConfig extends FarmerUser {
  loginAliases: string[];
  passwords: string[];
}

export const SEEDED_DEMO_FARMERS: Record<string, DemoFarmerConfig> = {
  ramesh: {
    id: '542d3fbc-f0f7-4e82-84b9-f8394659b61b',
    farmerId: 'farmer123',
    name: 'Ramesh Patil',
    nameMr: 'रमेश पाटील',
    phone: '9820000000',
    email: 'ramesh.patil@example.com',
    emailOrPhone: 'farmer123',
    village: 'Niphad',
    taluka: 'Niphad',
    district: 'Nashik',
    location: 'Niphad, Nashik',
    locationMr: 'निफाड, नाशिक',
    latitude: 20.156556,
    longitude: 74.117339,
    userType: 'demo',
    farmId: '17e5475b-6ec1-4473-9c56-9e7de02d63d9',
    farmName: "Ramesh's Farm",
    areaAcres: 3.29,
    monitoredCrop: 'Tomato',
    monitoredCropMr: 'टोमॅटो (अभिनव)',
    cropCycleId: '30dd71a7-0230-4492-8fd8-42d7a53af3a1',
    isDemo: false,
    avatar: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=200&q=80',
    loginAliases: ['farmer123', 'ramesh', 'ramesh.patil@example.com', '9820000000', 'ksf-ramesh'],
    passwords: ['farmer123', 'password123', 'demo123'],
  },
  vikas: {
    id: 'd53fc6d1-cca3-4c91-8c61-b32029cc231e',
    farmerId: 'vikas123',
    name: 'Vikas More',
    nameMr: 'विकास मोरे',
    phone: '9820002468',
    email: 'vikas.more@example.com',
    emailOrPhone: 'vikas123',
    village: 'Chandori',
    taluka: 'Niphad',
    district: 'Nashik',
    location: 'Chandori, Niphad, Nashik',
    locationMr: 'चांदोरी, निफाड, नाशिक',
    latitude: 20.079700,
    longitude: 74.032200,
    userType: 'demo',
    farmId: '46b37fe5-aedb-4e2c-bb26-a4e8b1dae26a',
    farmName: "Vikas's Farm",
    areaAcres: 3.51,
    monitoredCrop: 'Soybean',
    monitoredCropMr: 'सोयाबीन (JS-335)',
    cropCycleId: '576451d2-2927-49b8-a623-ff2b0114720d',
    isDemo: false,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    loginAliases: ['vikas123', 'vikas', 'vikas.more@example.com', '9820002468', 'ksf-vikas'],
    passwords: ['vikas123', 'password123', 'demo123'],
  },
  anita: {
    id: '6ecf18a7-f888-4ba6-9b7c-c43253a0409c',
    farmerId: 'anita123',
    name: 'Anita Shinde',
    nameMr: 'अनिता शिंदे',
    phone: '9820003702',
    email: 'anita.shinde@example.com',
    emailOrPhone: 'anita123',
    village: 'Ozar',
    taluka: 'Niphad',
    district: 'Nashik',
    location: 'Ozar, Niphad, Nashik',
    locationMr: 'ओझर, निफाड, नाशिक',
    latitude: 20.092700,
    longitude: 73.918900,
    userType: 'demo',
    farmId: '6e5c646e-53f8-4be4-a731-13ed3de4f3d0',
    farmName: "Anita's Farm",
    areaAcres: 2.45,
    monitoredCrop: 'Tomato',
    monitoredCropMr: 'टोमॅटो',
    cropCycleId: '6918ec13-ed28-4598-bdb4-3f994f35cbed',
    isDemo: false,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    loginAliases: ['anita123', 'anita', 'anita.shinde@example.com', '9820003702', 'ksf-anita'],
    passwords: ['anita123', 'password123', 'demo123'],
  },
};

export const MOCK_FARMER_USER: FarmerUser = SEEDED_DEMO_FARMERS.ramesh;

export const MOCK_DEMO_USER: FarmerUser = {
  ...SEEDED_DEMO_FARMERS.ramesh,
  name: 'Demo Explorer (Guest)',
  nameMr: 'डेमो वापरकर्ता (अतिथी)',
  emailOrPhone: 'demo@krishisarthak.in',
  latitude: 20.156556,
  longitude: 74.117339,
  userType: 'demo',
  isDemo: true,
};

// ----------------------------------------------------
// Storage Helpers
// ----------------------------------------------------
function getRegisteredUsers(): StoredRegisteredUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REGISTERED);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveRegisteredUsers(users: StoredRegisteredUser[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_REGISTERED, JSON.stringify(users));
  } catch (err) {
    console.warn('[authService] Failed to save registered users to localStorage:', err);
  }
}

function generateFarmerId(): string {
  // Generate distinct readable farmer ID format: KSF-XXXXXX
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `KSF-${id}`;
}

export const authService = {
  /**
   * Real Frontend Login:
   * 1. Checks locally registered users.
   * 2. Checks seeded backend demo farmers.
   * 3. Validates password.
   * 4. Fails with clear error if credentials do not match.
   */
  async login(
    idOrEmailOrPhone: string,
    passwordInput: string
  ): Promise<{ success: boolean; user?: FarmerUser; message?: string }> {
    await new Promise((res) => setTimeout(res, 350));

    const cleanInput = (idOrEmailOrPhone || '').trim().toLowerCase();
    const cleanPassword = (passwordInput || '').trim();

    if (!cleanInput || !cleanPassword) {
      return { success: false, message: 'Please enter both Farmer ID / Mobile / Email and Password.' };
    }

    // 1. Check registered users in localStorage
    const registeredList = getRegisteredUsers();
    const matchedRegistered = registeredList.find(
      (r) =>
        r.user.farmerId.toLowerCase() === cleanInput ||
        (r.user.phone && r.user.phone.toLowerCase() === cleanInput) ||
        (r.user.email && r.user.email.toLowerCase() === cleanInput)
    );

    if (matchedRegistered) {
      if (matchedRegistered.password !== cleanPassword) {
        return { success: false, message: 'Incorrect password. Please try again.' };
      }

      // Success: save active session
      localStorage.setItem(STORAGE_KEY_ROLE, 'farmer');
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(matchedRegistered.user));
      localStorage.setItem(STORAGE_KEY_LEGACY_USER, JSON.stringify(matchedRegistered.user));

      return {
        success: true,
        user: matchedRegistered.user,
      };
    }

    // 2. Check seeded backend demo farmers
    for (const key of Object.keys(SEEDED_DEMO_FARMERS)) {
      const demo = SEEDED_DEMO_FARMERS[key];
      const matchAlias = demo.loginAliases.some((a) => a.toLowerCase() === cleanInput);

      if (matchAlias) {
        const passwordMatches = demo.passwords.includes(cleanPassword);
        if (!passwordMatches) {
          return { success: false, message: 'Incorrect password. Please try again.' };
        }

        const userObj: FarmerUser = {
          id: demo.id,
          farmerId: demo.farmerId,
          name: demo.name,
          nameMr: demo.nameMr,
          phone: demo.phone,
          email: demo.email,
          emailOrPhone: demo.emailOrPhone,
          village: demo.village,
          taluka: demo.taluka,
          district: demo.district,
          location: demo.location,
          locationMr: demo.locationMr,
          userType: 'demo',
          farmId: demo.farmId,
          farmName: demo.farmName,
          areaAcres: demo.areaAcres,
          monitoredCrop: demo.monitoredCrop,
          monitoredCropMr: demo.monitoredCropMr,
          cropCycleId: demo.cropCycleId,
          isDemo: false,
          avatar: demo.avatar,
        };

        // Save session
        localStorage.setItem(STORAGE_KEY_ROLE, 'farmer');
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userObj));
        localStorage.setItem(STORAGE_KEY_LEGACY_USER, JSON.stringify(userObj));

        return {
          success: true,
          user: userObj,
        };
      }
    }

    // 3. User not found
    return {
      success: false,
      message: 'Farmer account not found. Please check your Farmer ID/Mobile, or click Create Account to register.',
    };
  },

  /**
   * Register a new Farmer:
   * 1. Validates inputs.
   * 2. Generates KSF-XXXXXX.
   * 3. Stores user in localStorage.
   * 4. Establishes active session.
   */
  async register(
    payload: RegisterPayload
  ): Promise<{ success: boolean; user?: FarmerUser; message?: string }> {
    await new Promise((res) => setTimeout(res, 400));

    const name = (payload.name || '').trim();
    const phone = (payload.phone || '').trim();
    const password = (payload.password || '').trim();
    const village = (payload.village || '').trim();
    const taluka = (payload.taluka || payload.village || '').trim();
    const district = (payload.district || '').trim();
    const state = (payload.state || '').trim();
    const farmName = (payload.farmName || '').trim() || `${name.split(' ')[0]}'s Farm`;
    const areaAcres = payload.areaAcres || 2;
    const mainCrop = payload.mainCrop || 'Tomato';

    if (!name || name.length < 2) {
      return { success: false, message: 'Please enter your full name.' };
    }
    if (!phone || phone.length < 10) {
      return { success: false, message: 'Please enter a valid 10-digit mobile number.' };
    }
    if (!password || password.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters.' };
    }
    if (!village || !district) {
      return { success: false, message: 'Please complete your Village and District.' };
    }

    // Check if phone or email already registered
    const existing = getRegisteredUsers();
    const duplicate = existing.find(
      (r) =>
        r.user.phone === phone ||
        (payload.email && r.user.email?.toLowerCase() === payload.email.trim().toLowerCase())
    );
    if (duplicate) {
      return {
        success: false,
        message: `An account is already registered with mobile ${phone}. Please login using your password or Farmer ID: ${duplicate.user.farmerId}`,
      };
    }

    // Generate Farmer ID
    const farmerId = generateFarmerId();
    const userId = `usr_${Date.now()}`;

    const cropMrMap: Record<string, string> = {
      Tomato: 'टोमॅटो',
      Cotton: 'कापूस',
      Soybean: 'सोयाबीन',
      Sugarcane: 'ऊस',
      Maize: 'मका',
      Onion: 'कांदा',
      Rice: 'भात',
      Wheat: 'गहू',
    };

    const newUser: FarmerUser = {
      id: userId,
      farmerId,
      name,
      nameMr: name,
      phone,
      email: payload.email?.trim() || undefined,
      emailOrPhone: phone,
      state,
      village,
      taluka,
      district,
      pincode: payload.pincode,
      location: `${village}, ${taluka}`,
      locationMr: `${village}, ${taluka}`,
      latitude: payload.latitude,
      longitude: payload.longitude,
      userType: 'registered',
      farmName,
      areaAcres,
      monitoredCrop: mainCrop,
      monitoredCropMr: cropMrMap[mainCrop] || mainCrop,
      isDemo: false,
      isNewUser: true,
    };

    // Save to registered database
    existing.push({
      user: newUser,
      password,
      createdAt: new Date().toISOString(),
    });
    saveRegisteredUsers(existing);

    // Automatically set active session
    localStorage.setItem(STORAGE_KEY_ROLE, 'farmer');
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
    localStorage.setItem(STORAGE_KEY_LEGACY_USER, JSON.stringify(newUser));

    return {
      success: true,
      user: newUser,
    };
  },

  /**
   * Continue as Demo User (Guest mode)
   */
  async loginAsDemo(specificKey: 'ramesh' | 'vikas' | 'anita' = 'ramesh'): Promise<{ user: FarmerUser }> {
    const demo = SEEDED_DEMO_FARMERS[specificKey] || SEEDED_DEMO_FARMERS.ramesh;
    const demoUser: FarmerUser = {
      ...demo,
      name: `Demo Explorer (${demo.name})`,
      nameMr: `डेमो वापरकर्ता (${demo.nameMr})`,
      emailOrPhone: 'demo@krishisarthak.in',
      userType: 'demo',
      isDemo: true,
    };

    localStorage.setItem(STORAGE_KEY_ROLE, 'demo');
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(demoUser));
    localStorage.setItem(STORAGE_KEY_LEGACY_USER, JSON.stringify(demoUser));
    return { user: demoUser };
  },

  /**
   * Log out active session
   */
  logout(): void {
    localStorage.removeItem(STORAGE_KEY_ROLE);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_LEGACY_USER);
  },

  /**
   * Restore stored session on refresh
   */
  getStoredSession(): { role: AuthRole; user: FarmerUser | null } {
    try {
      const storedRole = localStorage.getItem(STORAGE_KEY_ROLE) as AuthRole | null;
      const storedUser = localStorage.getItem(STORAGE_KEY_USER) || localStorage.getItem(STORAGE_KEY_LEGACY_USER);

      if ((storedRole === 'farmer' || storedRole === 'demo') && storedUser) {
        const parsed = JSON.parse(storedUser);
        return { role: storedRole, user: parsed };
      }
    } catch {
      // Fallthrough to unauthenticated on error
    }

    return { role: 'unauthenticated', user: null };
  },

  /**
   * Get all registered users (for debugging / admin inspection)
   */
  getAllRegisteredUsers(): FarmerUser[] {
    return getRegisteredUsers().map((r) => r.user);
  },
};
