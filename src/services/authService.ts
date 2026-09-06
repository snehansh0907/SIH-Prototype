import type { AuthRole, FarmerUser } from '../types';
import { apiClient } from './apiClient';

export const STORAGE_KEY_ROLE = 'krishi_sarthak_auth_role';
export const STORAGE_KEY_USER = 'krishi_sarthak_current_user';
export const STORAGE_KEY_LEGACY_USER = 'krishi_sarthak_auth_user';
export const STORAGE_KEY_REGISTERED = 'krishi_sarthak_registered_users';

export const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL || 'https://kgsrhvwvgasbwacdcsis.supabase.co';
export const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_zALZE6HHDSsEHsFJmk-v1Q_vE_QJJCX';

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

const CROP_MR_MAP: Record<string, string> = {
  Tomato: 'टोमॅटो',
  Cotton: 'कापूस',
  Soybean: 'सोयाबीन',
  Sugarcane: 'ऊस',
  Maize: 'मका',
  Onion: 'कांदा',
  Rice: 'भात',
  Wheat: 'गहू',
};

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
    nameHi: 'रमेश पाटिल',
    nameMr: 'रमेश पाटील',
    phone: '9820000000',
    email: 'ramesh.patil@example.com',
    emailOrPhone: 'farmer123',
    village: 'Niphad',
    taluka: 'Niphad',
    district: 'Nashik',
    location: 'Niphad, Nashik',
    locationHi: 'निफाड, नासिक',
    locationMr: 'निफाड, नाशिक',
    latitude: 20.156556,
    longitude: 74.117339,
    userType: 'demo',
    farmId: '17e5475b-6ec1-4473-9c56-9e7de02d63d9',
    farmName: "Ramesh's Farm",
    areaAcres: 3.29,
    monitoredCrop: 'Tomato',
    monitoredCropHi: 'टमाटर (अभिनव)',
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
    nameHi: 'विकास मोरे',
    nameMr: 'विकास मोरे',
    phone: '9820002468',
    email: 'vikas.more@example.com',
    emailOrPhone: 'vikas123',
    village: 'Chandori',
    taluka: 'Niphad',
    district: 'Nashik',
    location: 'Chandori, Niphad, Nashik',
    locationHi: 'चांदोरी, निफाड, नासिक',
    locationMr: 'चांदोरी, निफाड, नाशिक',
    latitude: 20.0797,
    longitude: 74.0322,
    userType: 'demo',
    farmId: '46b37fe5-aedb-4e2c-bb26-a4e8b1dae26a',
    farmName: "Vikas's Farm",
    areaAcres: 3.51,
    monitoredCrop: 'Soybean',
    monitoredCropHi: 'सोयाबीन (JS-335)',
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
    nameHi: 'अनिता शिंदे',
    nameMr: 'अनिता शिंदे',
    phone: '9820003702',
    email: 'anita.shinde@example.com',
    emailOrPhone: 'anita123',
    village: 'Ozar',
    taluka: 'Niphad',
    district: 'Nashik',
    location: 'Ozar, Niphad, Nashik',
    locationHi: 'ओझर, निफाड, नासिक',
    locationMr: 'ओझर, निफाड, नाशिक',
    latitude: 20.0927,
    longitude: 73.9189,
    userType: 'demo',
    farmId: '6e5c646e-53f8-4be4-a731-13ed3de4f3d0',
    farmName: "Anita's Farm",
    areaAcres: 2.45,
    monitoredCrop: 'Tomato',
    monitoredCropHi: 'टमाटर',
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
  nameHi: 'डेमो किसान (अतिथि)',
  nameMr: 'डेमो वापरकर्ता (अतिथी)',
  emailOrPhone: 'demo@krishisarthak.in',
  latitude: 20.156556,
  longitude: 74.117339,
  userType: 'demo',
  isDemo: true,
};

function parseUserMeta(raw?: string): any {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function generateFarmerId(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `KSF-${id}`;
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const authService = {
  /**
   * Universal Login:
   * 1. Authenticates against the shared Supabase backend API (`/api/auth/login`).
   * 2. Direct Supabase REST fallback if the local Express server is unreachable.
   * 3. Retains demo user login capability for demo aliases without interfering with real users.
   * 4. Saves session in localStorage for session persistence only.
   */
  async login(
    idOrEmailOrPhone: string,
    passwordInput: string
  ): Promise<{ success: boolean; user?: FarmerUser; message?: string }> {
    const cleanInput = (idOrEmailOrPhone || '').trim();
    const cleanPassword = (passwordInput || '').trim();
    const cleanLower = cleanInput.toLowerCase();
    const cleanPhone = cleanInput.replace(/\D/g, '');

    if (!cleanInput || !cleanPassword) {
      return { success: false, message: 'Please enter both Farmer ID / Mobile / Email and Password.' };
    }

    // ----------------------------------------------------
    // Primary: Call Backend Authentication API
    // ----------------------------------------------------
    try {
      const res = await apiClient<{ success: boolean; user: FarmerUser; message?: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier: cleanInput, password: cleanPassword }),
        timeout: 7000,
      });

      if (res.success && res.user) {
        const role: AuthRole = res.user.userType === 'demo' ? 'demo' : 'farmer';
        localStorage.setItem(STORAGE_KEY_ROLE, role);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(res.user));
        localStorage.setItem(STORAGE_KEY_LEGACY_USER, JSON.stringify(res.user));
        return { success: true, user: res.user };
      }
    } catch (apiErr: any) {
      const errMsg = apiErr?.message || '';
      // If the backend actively rejected with wrong password or not found, return that error
      if (errMsg.includes('Incorrect password') || errMsg.includes('Farmer account not found')) {
        return { success: false, message: errMsg };
      }
      console.warn('[authService] Backend API login unavailable, falling back to direct Supabase query:', errMsg);
    }

    // ----------------------------------------------------
    // Fallback: Direct Supabase REST Database Query
    // (Used when frontend runs independently without local Express backend)
    // ----------------------------------------------------
    // 1. Check if input is a recognized demo alias
    for (const key of Object.keys(SEEDED_DEMO_FARMERS)) {
      const demo = SEEDED_DEMO_FARMERS[key];
      if (demo.loginAliases.some((a) => a.toLowerCase() === cleanLower)) {
        if (!demo.passwords.includes(cleanPassword)) {
          return { success: false, message: 'Incorrect password. Please try again.' };
        }
        const demoUser: FarmerUser = {
          ...demo,
          userType: 'demo',
          isDemo: false,
        };
        localStorage.setItem(STORAGE_KEY_ROLE, 'farmer');
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(demoUser));
        localStorage.setItem(STORAGE_KEY_LEGACY_USER, JSON.stringify(demoUser));
        return { success: true, user: demoUser };
      }
    }

    // 2. Query Supabase REST API directly
    try {
      const supaHeaders = {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Accept: 'application/json',
      };

      let supaUser: any = null;

      // Check by phone
      if (cleanPhone.length >= 10) {
        const pRes = await fetch(`${SUPABASE_URL}/rest/v1/users?phone=eq.${cleanPhone}&select=*`, {
          headers: supaHeaders,
        });
        if (pRes.ok) {
          const pData = await pRes.json();
          if (Array.isArray(pData) && pData.length > 0) supaUser = pData[0];
        }
      }

      // Check by email
      if (!supaUser && cleanInput.includes('@')) {
        const eRes = await fetch(
          `${SUPABASE_URL}/rest/v1/users?email=ilike.${encodeURIComponent(cleanLower)}&select=*`,
          { headers: supaHeaders }
        );
        if (eRes.ok) {
          const eData = await eRes.json();
          if (Array.isArray(eData) && eData.length > 0) supaUser = eData[0];
        }
      }

      // Check by farmerId in preferred_language metadata
      if (!supaUser) {
        const fRes = await fetch(
          `${SUPABASE_URL}/rest/v1/users?preferred_language=ilike.*${encodeURIComponent(cleanInput)}*&select=*`,
          { headers: supaHeaders }
        );
        if (fRes.ok) {
          const fData = await fRes.json();
          if (Array.isArray(fData) && fData.length > 0) {
            supaUser =
              fData.find((u: any) => {
                const m = parseUserMeta(u.preferred_language);
                return m.farmerId && m.farmerId.toLowerCase() === cleanLower;
              }) || fData[0];
          }
        }
      }

      // Verify user from Supabase
      if (supaUser) {
        const meta = parseUserMeta(supaUser.preferred_language);
        const storedPw = meta.pw || 'farmer123';

        if (storedPw !== cleanPassword) {
          return { success: false, message: 'Incorrect password. Please try again.' };
        }

        // Fetch farm from Supabase
        let farm: any = null;
        try {
          const farmRes = await fetch(`${SUPABASE_URL}/rest/v1/farms?farmer_id=eq.${supaUser.id}&select=*`, {
            headers: supaHeaders,
          });
          if (farmRes.ok) {
            const farmData = await farmRes.json();
            if (Array.isArray(farmData) && farmData.length > 0) farm = farmData[0];
          }
        } catch {}

        // Fetch crop cycle from Supabase
        let cycle: any = null;
        if (farm) {
          try {
            const cycleRes = await fetch(
              `${SUPABASE_URL}/rest/v1/crop_cycles?farm_id=eq.${farm.id}&status=eq.active&select=*`,
              { headers: supaHeaders }
            );
            if (cycleRes.ok) {
              const cycleData = await cycleRes.json();
              if (Array.isArray(cycleData) && cycleData.length > 0) cycle = cycleData[0];
            }
          } catch {}
        }

        const finalCrop = cycle?.crop_name || meta.mainCrop || 'Tomato';
        const finalFarmName = farm?.farm_name || meta.farmName || `${supaUser.name.split(' ')[0]}'s Farm`;
        const finalVillage = farm?.village || meta.village || supaUser.taluka || '';
        const finalTaluka = farm?.taluka || supaUser.taluka || '';
        const finalDistrict = farm?.district || supaUser.district || '';

        const userObj: FarmerUser = {
          id: supaUser.id,
          farmerId: meta.farmerId || `KSF-${supaUser.id.slice(0, 6).toUpperCase()}`,
          name: supaUser.name,
          nameMr: supaUser.name,
          phone: supaUser.phone,
          email: supaUser.email || undefined,
          emailOrPhone: supaUser.phone || supaUser.email || cleanInput,
          state: meta.state || '',
          village: finalVillage,
          taluka: finalTaluka,
          district: finalDistrict,
          pincode: meta.pincode || undefined,
          location: `${finalVillage}, ${finalTaluka}`,
          locationMr: `${finalVillage}, ${finalTaluka}`,
          latitude: farm?.latitude ?? meta.latitude ?? 20.085,
          longitude: farm?.longitude ?? meta.longitude ?? 74.11,
          userType: 'registered',
          farmId: farm?.id,
          farmName: finalFarmName,
          areaAcres: farm?.area_acres ?? meta.areaAcres ?? 2.5,
          monitoredCrop: finalCrop,
          monitoredCropMr: CROP_MR_MAP[finalCrop] || finalCrop,
          cropCycleId: cycle?.id,
          isDemo: false,
          isNewUser: false,
        };

        localStorage.setItem(STORAGE_KEY_ROLE, 'farmer');
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userObj));
        localStorage.setItem(STORAGE_KEY_LEGACY_USER, JSON.stringify(userObj));

        return { success: true, user: userObj };
      }
    } catch (supaErr) {
      console.error('[authService] Direct Supabase login fallback error:', supaErr);
    }

    return {
      success: false,
      message: 'Farmer account not found. Please check your Farmer ID / Mobile Number, or click Create Account to register.',
    };
  },

  /**
   * Register a new Farmer:
   * 1. Inserts farmer into Supabase database (users, farms, crop_cycles) via backend API.
   * 2. Direct Supabase REST fallback if backend is offline.
   * 3. Saves active session locally.
   */
  async register(
    payload: RegisterPayload
  ): Promise<{ success: boolean; user?: FarmerUser; message?: string }> {
    const name = (payload.name || '').trim();
    const phone = (payload.phone || '').trim().replace(/\D/g, '');
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

    // ----------------------------------------------------
    // Primary: Register via Backend API
    // ----------------------------------------------------
    try {
      const res = await apiClient<{ success: boolean; user: FarmerUser; message?: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
        timeout: 10000,
      });

      if (res.success && res.user) {
        localStorage.setItem(STORAGE_KEY_ROLE, 'farmer');
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(res.user));
        localStorage.setItem(STORAGE_KEY_LEGACY_USER, JSON.stringify(res.user));
        return { success: true, user: res.user, message: res.message };
      }
    } catch (apiErr: any) {
      const errMsg = apiErr?.message || '';
      if (errMsg.includes('already registered')) {
        return { success: false, message: errMsg };
      }
      console.warn('[authService] Backend API register unavailable, attempting direct Supabase insertion:', errMsg);
    }

    // ----------------------------------------------------
    // Fallback: Direct Supabase REST Insertion
    // ----------------------------------------------------
    try {
      const supaHeaders = {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      };

      // 1. Check for duplicate phone
      const phoneCheckRes = await fetch(`${SUPABASE_URL}/rest/v1/users?phone=eq.${phone}&select=id`, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      });
      if (phoneCheckRes.ok) {
        const phoneData = await phoneCheckRes.json();
        if (Array.isArray(phoneData) && phoneData.length > 0) {
          return {
            success: false,
            message: `An account is already registered with mobile ${phone}. Please log in using your password.`,
          };
        }
      }

      // 2. Generate IDs
      const userId = generateUUID();
      const farmId = generateUUID();
      const cropCycleId = generateUUID();
      const farmerId = generateFarmerId();
      const lat = payload.latitude || 20.085;
      const lng = payload.longitude || 74.11;
      const parsedAcres = parseFloat(String(areaAcres)) || 2.0;

      const meta = JSON.stringify({
        pw: password,
        farmerId,
        state,
        village,
        pincode: payload.pincode || '',
        farmName,
        areaAcres: parsedAcres,
        mainCrop,
        latitude: lat,
        longitude: lng,
      });

      // 3. Insert user into Supabase
      const userRes = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
        method: 'POST',
        headers: supaHeaders,
        body: JSON.stringify({
          id: userId,
          name,
          phone,
          email: payload.email?.trim() || null,
          role: 'farmer',
          preferred_language: meta,
          district,
          taluka,
        }),
      });

      if (!userRes.ok) {
        const errJson = await userRes.json().catch(() => ({}));
        throw new Error(errJson.message || `Failed to create user in Supabase: ${userRes.statusText}`);
      }

      // 4. Insert farm into Supabase
      await fetch(`${SUPABASE_URL}/rest/v1/farms`, {
        method: 'POST',
        headers: supaHeaders,
        body: JSON.stringify({
          id: farmId,
          farmer_id: userId,
          farm_name: farmName,
          latitude: lat,
          longitude: lng,
          village,
          taluka,
          district,
          area_acres: parsedAcres,
        }),
      }).catch((e) => console.warn('[authService] Direct farm insert warning:', e));

      // 5. Insert crop cycle into Supabase
      await fetch(`${SUPABASE_URL}/rest/v1/crop_cycles`, {
        method: 'POST',
        headers: supaHeaders,
        body: JSON.stringify({
          id: cropCycleId,
          farm_id: farmId,
          crop_name: mainCrop,
          variety: 'Selected',
          crop_stage: 'vegetative',
          status: 'active',
        }),
      }).catch((e) => console.warn('[authService] Direct cycle insert warning:', e));

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
        latitude: lat,
        longitude: lng,
        userType: 'registered',
        farmId,
        farmName,
        areaAcres: parsedAcres,
        monitoredCrop: mainCrop,
        monitoredCropMr: CROP_MR_MAP[mainCrop] || mainCrop,
        cropCycleId,
        isDemo: false,
        isNewUser: true,
      };

      localStorage.setItem(STORAGE_KEY_ROLE, 'farmer');
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
      localStorage.setItem(STORAGE_KEY_LEGACY_USER, JSON.stringify(newUser));

      return {
        success: true,
        user: newUser,
        message: `Account created successfully! Your Farmer ID is ${farmerId}.`,
      };
    } catch (directErr: any) {
      console.error('[authService] Direct Supabase registration error:', directErr);
      return {
        success: false,
        message: directErr.message || 'Registration failed. Please check network connection.',
      };
    }
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
    return [];
  },
};
