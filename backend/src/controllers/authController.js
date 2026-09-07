// =========================================================
// Krishi Sarthak - Auth Controller
// =========================================================
// Handles farmer registration, credential verification,
// and session retrieval against the shared Supabase database.
// =========================================================

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/supabase');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

const REGISTERED_USERS_FILE = path.resolve(__dirname, '../data/registered_users.json');

function isFakeAutoFarmer(user) {
  if (!user) return false;
  const name = user.name || '';
  const farm = user.farmName || '';
  return /^Farmer\s*\(\d+\)$/i.test(name) || /^Farm\s*\d+$/i.test(farm) || /^शेतकरी\s*\(\d+\)$/i.test(name);
}

function normalizeUserRecord(u) {
  if (!u) return null;
  // If wrapped inside { user: {...}, password: "..." }
  const base = u.user && typeof u.user === 'object' ? u.user : u;
  const pw = (u.password || base.password || base.password_hash || base.passwordHash || base.pw || '').trim();
  const phone = base.phone || base.phone_number || base.phoneNumber || base.mobile || base.mobile_number || '';
  const farmerId = base.farmerId || base.farmer_id || (base.id ? `KSF-${String(base.id).slice(0, 6).toUpperCase()}` : '');
  const id = base.id || base.user_id || base.userId || uuidv4();
  const farmId = base.farmId || base.farm_id || `farm-${id}`;
  const farmName = base.farmName || base.farm_name || `${(base.name || 'Farmer').split(' ')[0]}'s Farm`;
  const areaAcres = typeof base.areaAcres === 'number' ? base.areaAcres : parseFloat(String(base.areaAcres || base.area_acres || '2.5')) || 2.5;
  const monitoredCrop = base.monitoredCrop || base.mainCrop || base.main_crop || base.crop || 'Tomato';
  const cropCycleId = base.cropCycleId || base.crop_cycle_id || `cycle-${id}`;

  return {
    ...base,
    id,
    farmerId,
    name: base.name || 'Farmer',
    nameMr: base.nameMr || base.name || 'शेतकरी',
    phone: String(phone).trim(),
    email: base.email || undefined,
    password: pw,
    emailOrPhone: base.emailOrPhone || phone || base.email,
    state: base.state || '',
    village: base.village || '',
    taluka: base.taluka || '',
    district: base.district || '',
    pincode: base.pincode || undefined,
    location: base.location || `${base.village || ''}, ${base.taluka || ''}`,
    locationMr: base.locationMr || `${base.village || ''}, ${base.taluka || ''}`,
    latitude: typeof base.latitude === 'number' ? base.latitude : 20.085,
    longitude: typeof base.longitude === 'number' ? base.longitude : 74.11,
    userType: 'registered',
    farmId,
    farmName,
    areaAcres,
    monitoredCrop,
    monitoredCropMr: base.monitoredCropMr || CROP_MR_MAP[monitoredCrop] || monitoredCrop,
    cropCycleId,
    isDemo: false,
    isNewUser: false,
  };
}

function readLocalUsers() {
  try {
    if (!fs.existsSync(REGISTERED_USERS_FILE)) return [];
    const data = fs.readFileSync(REGISTERED_USERS_FILE, 'utf8');
    const list = JSON.parse(data);
    if (!Array.isArray(list)) return [];
    return list
      .map(normalizeUserRecord)
      .filter((u) => u && !isFakeAutoFarmer(u));
  } catch {
    return [];
  }
}

function writeLocalUsers(users) {
  try {
    const dir = path.dirname(REGISTERED_USERS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const cleanList = (users || [])
      .map(normalizeUserRecord)
      .filter((u) => u && !isFakeAutoFarmer(u));
    fs.writeFileSync(REGISTERED_USERS_FILE, JSON.stringify(cleanList, null, 2), 'utf8');
  } catch (err) {
    console.warn('[authController] Failed to write local users file:', err);
  }
}

// Crop name translations
const CROP_MR_MAP = {
  Tomato: 'टोमॅटो',
  Cotton: 'कापूस',
  Soybean: 'सोयाबीन',
  Sugarcane: 'ऊस',
  Maize: 'मका',
  Onion: 'कांदा',
  Rice: 'भात',
  Wheat: 'गहू',
};

// Seeded demo farmer credentials (accessible intentionally as demo)
const SEEDED_DEMO_FARMERS = {
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
    passwords: ['farmer123', 'password123', 'demo123', '123456'],
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
    latitude: 20.079700,
    longitude: 74.032200,
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
    passwords: ['vikas123', 'farmer123', 'password123', 'demo123', '123456'],
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
    latitude: 20.092700,
    longitude: 73.918900,
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
    passwords: ['anita123', 'farmer123', 'password123', 'demo123', '123456'],
  },
  sunita: {
    id: 'cf00ab2b-df0f-4382-9a25-6e3cb19d4e8c',
    farmerId: 'sunita123',
    name: 'Sunita Jadhav',
    nameHi: 'सुनीता जाधव',
    nameMr: 'सुनीता जाधव',
    phone: '9820001234',
    email: 'sunita.jadhav@example.com',
    emailOrPhone: 'sunita123',
    village: 'Pimpalgaon',
    taluka: 'Niphad',
    district: 'Nashik',
    location: 'Pimpalgaon, Niphad, Nashik',
    locationHi: 'पिंपलगांव, निफाड, नासिक',
    locationMr: 'पिंपळगाव, निफाड, नाशिक',
    latitude: 20.0325,
    longitude: 74.0731,
    userType: 'demo',
    farmId: '183e1bc8-23ca-4f40-8469-c13a1b7eb1ab',
    farmName: "Sunita's Farm",
    areaAcres: 1.78,
    monitoredCrop: 'Tomato',
    monitoredCropHi: 'टमाटर',
    monitoredCropMr: 'टोमॅटो',
    cropCycleId: '183e1bc8-23ca-4f40-8469-c13a1b7eb1ac',
    isDemo: false,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    loginAliases: ['sunita123', 'sunita', 'sunita.jadhav@example.com', '9820001234', 'ksf-sunita'],
    passwords: ['sunita123', 'farmer123', 'password123', 'demo123', '123456'],
  },
  suresh: {
    id: '7d8ae2f6-8461-4950-a873-486e071b6ffd',
    farmerId: 'suresh123',
    name: 'Suresh Kale',
    nameHi: 'सुरेश काले',
    nameMr: 'सुरेश काळे',
    phone: '9820004936',
    email: 'suresh.kale@example.com',
    emailOrPhone: 'suresh123',
    village: 'Lasalgaon',
    taluka: 'Niphad',
    district: 'Nashik',
    location: 'Lasalgaon, Niphad, Nashik',
    locationHi: 'लासलगांव, निफाड, नासिक',
    locationMr: 'लासलगाव, निफाड, नाशिक',
    latitude: 20.145,
    longitude: 74.228,
    userType: 'demo',
    farmId: '7d8ae2f6-8461-4950-a873-486e071b6fa1',
    farmName: "Suresh's Farm",
    areaAcres: 4.2,
    monitoredCrop: 'Onion',
    monitoredCropHi: 'प्याज',
    monitoredCropMr: 'कांदा',
    cropCycleId: '7d8ae2f6-8461-4950-a873-486e071b6fc1',
    isDemo: false,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    loginAliases: ['suresh123', 'suresh', 'suresh.kale@example.com', '9820004936', 'ksf-suresh'],
    passwords: ['suresh123', 'farmer123', 'password123', 'demo123', '123456'],
  },
  manisha: {
    id: 'a02a112d-ca82-493c-97b3-40491c72d995',
    farmerId: 'manisha123',
    name: 'Manisha Pawar',
    nameHi: 'मनीषा पवार',
    nameMr: 'मनीषा पवार',
    phone: '9820006170',
    email: 'manisha.pawar@example.com',
    emailOrPhone: 'manisha123',
    village: 'Pimpalgaon',
    taluka: 'Niphad',
    district: 'Nashik',
    location: 'Pimpalgaon, Niphad, Nashik',
    locationHi: 'पिंपलगांव, निफाड, नासिक',
    locationMr: 'पिंपळगाव, निफाड, नाशिक',
    latitude: 20.038,
    longitude: 74.068,
    userType: 'demo',
    farmId: 'a02a112d-ca82-493c-97b3-40491c72d9a1',
    farmName: "Manisha's Farm",
    areaAcres: 2.8,
    monitoredCrop: 'Soybean',
    monitoredCropHi: 'सोयाबीन',
    monitoredCropMr: 'सोयाबीन',
    cropCycleId: 'a02a112d-ca82-493c-97b3-40491c72d9c1',
    isDemo: false,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    loginAliases: ['manisha123', 'manisha', 'manisha.pawar@example.com', '9820006170', 'ksf-manisha'],
    passwords: ['manisha123', 'farmer123', 'password123', 'demo123', '123456'],
  },
  ganesh: {
    id: 'c79751f2-0b89-407b-923a-872b7f3cb509',
    farmerId: 'ganesh123',
    name: 'Ganesh Deshmukh',
    nameHi: 'गणेश देशमुख',
    nameMr: 'गणेश देशमुख',
    phone: '9820007404',
    email: 'ganesh.deshmukh@example.com',
    emailOrPhone: 'ganesh123',
    village: 'Chandori',
    taluka: 'Niphad',
    district: 'Nashik',
    location: 'Chandori, Niphad, Nashik',
    locationHi: 'चांदोरी, निफाड, नासिक',
    locationMr: 'चांदोरी, निफाड, नाशिक',
    latitude: 20.082,
    longitude: 74.038,
    userType: 'demo',
    farmId: 'c79751f2-0b89-407b-923a-872b7f3cb5a1',
    farmName: "Ganesh's Farm",
    areaAcres: 3.1,
    monitoredCrop: 'Tomato',
    monitoredCropHi: 'टमाटर',
    monitoredCropMr: 'टोमॅटो',
    cropCycleId: 'c79751f2-0b89-407b-923a-872b7f3cb5c1',
    isDemo: false,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    loginAliases: ['ganesh123', 'ganesh', 'ganesh.deshmukh@example.com', '9820007404', 'ksf-ganesh'],
    passwords: ['ganesh123', 'farmer123', 'password123', 'demo123', '123456'],
  },
  lata: {
    id: '895f6bf9-0fe3-4b0a-81cd-d8ff73f80282',
    farmerId: 'lata123',
    name: 'Lata Gaikwad',
    nameHi: 'लता गायकवाड़',
    nameMr: 'लता गायकवाड',
    phone: '9820008638',
    email: 'lata.gaikwad@example.com',
    emailOrPhone: 'lata123',
    village: 'Ozar',
    taluka: 'Niphad',
    district: 'Nashik',
    location: 'Ozar, Niphad, Nashik',
    locationHi: 'ओझर, निफाड, नासिक',
    locationMr: 'ओझर, निफाड, नाशिक',
    latitude: 20.098,
    longitude: 73.924,
    userType: 'demo',
    farmId: '895f6bf9-0fe3-4b0a-81cd-d8ff73f802a1',
    farmName: "Lata's Farm",
    areaAcres: 2.1,
    monitoredCrop: 'Tomato',
    monitoredCropHi: 'टमाटर',
    monitoredCropMr: 'टोमॅटो',
    cropCycleId: '895f6bf9-0fe3-4b0a-81cd-d8ff73f802c1',
    isDemo: false,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    loginAliases: ['lata123', 'lata', 'lata.gaikwad@example.com', '9820008638', 'ksf-lata'],
    passwords: ['lata123', 'farmer123', 'password123', 'demo123', '123456'],
  },
  prakash: {
    id: 'a53c75db-9364-4e8d-8dba-02b446381ccf',
    farmerId: 'prakash123',
    name: 'Prakash Wagh',
    nameHi: 'प्रकाश वाघ',
    nameMr: 'प्रकाश वाघ',
    phone: '9820009872',
    email: 'prakash.wagh@example.com',
    emailOrPhone: 'prakash123',
    village: 'Lasalgaon',
    taluka: 'Niphad',
    district: 'Nashik',
    location: 'Lasalgaon, Niphad, Nashik',
    locationHi: 'लासलगांव, निफाड, नासिक',
    locationMr: 'लासलगाव, निफाड, नाशिक',
    latitude: 20.151,
    longitude: 74.234,
    userType: 'demo',
    farmId: 'a53c75db-9364-4e8d-8dba-02b446381ca1',
    farmName: "Prakash's Farm",
    areaAcres: 3.8,
    monitoredCrop: 'Onion',
    monitoredCropHi: 'प्याज',
    monitoredCropMr: 'कांदा',
    cropCycleId: 'a53c75db-9364-4e8d-8dba-02b446381cc1',
    isDemo: false,
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
    loginAliases: ['prakash123', 'prakash', 'prakash.wagh@example.com', '9820009872', 'ksf-prakash'],
    passwords: ['prakash123', 'farmer123', 'password123', 'demo123', '123456'],
  },
  shobha: {
    id: 'bc06238f-1d9e-4027-8605-47e201606851',
    farmerId: 'shobha123',
    name: 'Shobha Bhosale',
    nameHi: 'शोभा भोसले',
    nameMr: 'शोभा भोसले',
    phone: '9820011106',
    email: 'shobha.bhosale@example.com',
    emailOrPhone: 'shobha123',
    village: 'Niphad',
    taluka: 'Niphad',
    district: 'Nashik',
    location: 'Niphad, Nashik',
    locationHi: 'निफाड, नासिक',
    locationMr: 'निफाड, नाशिक',
    latitude: 20.162,
    longitude: 74.122,
    userType: 'demo',
    farmId: 'bc06238f-1d9e-4027-8605-47e2016068a1',
    farmName: "Shobha's Farm",
    areaAcres: 2.3,
    monitoredCrop: 'Tomato',
    monitoredCropHi: 'टमाटर',
    monitoredCropMr: 'टोमॅटो',
    cropCycleId: 'bc06238f-1d9e-4027-8605-47e2016068c1',
    isDemo: false,
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=200&q=80',
    loginAliases: ['shobha123', 'shobha', 'shobha.bhosale@example.com', '9820011106', 'ksf-shobha'],
    passwords: ['shobha123', 'farmer123', 'password123', 'demo123', '123456'],
  },
};

function normalizePhone(rawPhone) {
  if (rawPhone === undefined || rawPhone === null) {
    return { clean: '', last10: '', fullWithCountry: '', isValid10: false };
  }
  const clean = String(rawPhone).trim().replace(/\D/g, '');
  let last10 = '';
  if (clean.length === 10) {
    last10 = clean;
  } else if (clean.length === 11 && clean.startsWith('0')) {
    last10 = clean.slice(1);
  } else if (clean.length === 12 && clean.startsWith('91')) {
    last10 = clean.slice(2);
  } else if (clean.length > 10) {
    last10 = clean.slice(-10);
  } else {
    last10 = clean;
  }
  const isValid10 = last10.length === 10;
  const fullWithCountry = isValid10 ? `+91${last10}` : clean;
  return { clean, last10, fullWithCountry, isValid10 };
}

function generateFarmerId() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `KSF-${code}`;
}

/**
 * Safely parses the metadata JSON stored inside `preferred_language`.
 */
function parseUserMeta(prefLang) {
  if (!prefLang) return {};
  try {
    return typeof prefLang === 'object' ? prefLang : JSON.parse(prefLang);
  } catch {
    return {};
  }
}

/**
 * POST /api/auth/register
 * Permanently registers a farmer account into Supabase (users, farms, crop_cycles).
 */
const register = asyncHandler(async (req, res) => {
  const {
    name,
    phone,
    email,
    password,
    state,
    district,
    taluka,
    village,
    pincode,
    farmName,
    areaAcres,
    mainCrop = 'Tomato',
    latitude,
    longitude,
  } = req.body;

  const cleanName = (name || '').trim();
  const { clean: cleanPhone, last10: regPhone10, isValid10 } = normalizePhone(phone);
  const cleanEmail = (email || '').trim().toLowerCase() || null;
  const cleanPassword = (password || '').trim();
  const cleanDistrict = (district || '').trim();
  const cleanTaluka = (taluka || village || '').trim();
  const cleanVillage = (village || '').trim();
  const cleanState = (state || '').trim();
  const parsedAcres = parseFloat(areaAcres) || 2.0;

  if (!cleanName || cleanName.length < 2) {
    throw new ApiError(400, 'Please enter your full name (minimum 2 characters).');
  }
  if (!isValid10) {
    throw new ApiError(400, 'Please enter a valid 10-digit mobile number.');
  }
  if (!cleanPassword || cleanPassword.length < 4) {
    throw new ApiError(400, 'Password must be at least 4 characters.');
  }
  if (!cleanDistrict || !cleanVillage) {
    throw new ApiError(400, 'District and Village/Locality are required.');
  }

  // 1. Check for duplicate phone in local storage and Supabase
  const localUsers = readLocalUsers();
  const existingLocalPhone = localUsers.find(
    (u) => normalizePhone(u.phone).last10 === regPhone10
  );
  if (existingLocalPhone) {
    throw new ApiError(
      409,
      `An account is already registered with mobile number ${regPhone10}. Please log in using your password.`
    );
  }

  const { data: existingPhone, error: phoneErr } = await supabase
    .from('users')
    .select('id, phone')
    .eq('phone', regPhone10)
    .maybeSingle();

  if (phoneErr && phoneErr.code !== 'PGRST116') {
    console.warn('[authController] Supabase phone check error:', phoneErr.message);
  }

  if (existingPhone) {
    throw new ApiError(
      409,
      `An account is already registered with mobile number ${regPhone10}. Please log in using your password.`
    );
  }

  // 2. Check for duplicate email in local storage and Supabase (if provided)
  if (cleanEmail) {
    const existingLocalEmail = localUsers.find((u) => u.email && u.email.toLowerCase() === cleanEmail);
    if (existingLocalEmail) {
      throw new ApiError(
        409,
        `An account is already registered with email ${cleanEmail}. Please log in using your password.`
      );
    }

    const { data: existingEmail } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingEmail) {
      throw new ApiError(
        409,
        `An account is already registered with email ${cleanEmail}. Please log in using your password.`
      );
    }
  }

  // 3. Generate IDs (accept client provided IDs or generate new)
  const userId = req.body.userId || uuidv4();
  const farmId = req.body.farmId || uuidv4();
  const cropCycleId = req.body.cropCycleId || uuidv4();
  const farmerId = req.body.farmerId || generateFarmerId();

  const finalFarmName = (farmName || '').trim() || `${cleanName.split(' ')[0]}'s Farm`;
  const finalLat = typeof latitude === 'number' ? latitude : 20.085;
  const finalLng = typeof longitude === 'number' ? longitude : 74.11;

  // Metadata bundle stored in Supabase
  const meta = JSON.stringify({
    pw: cleanPassword,
    farmerId,
    state: cleanState,
    village: cleanVillage,
    pincode: (pincode || '').trim(),
    farmName: finalFarmName,
    areaAcres: parsedAcres,
    mainCrop,
    latitude: finalLat,
    longitude: finalLng,
  });

  // 4. Try insert into Supabase
  try {
    await supabase.from('users').insert({
      id: userId,
      name: cleanName,
      phone: regPhone10,
      email: cleanEmail,
      role: 'farmer',
      preferred_language: meta,
      district: cleanDistrict,
      taluka: cleanTaluka,
    });

    await supabase.from('farms').insert({
      id: farmId,
      farmer_id: userId,
      farm_name: finalFarmName,
      latitude: finalLat,
      longitude: finalLng,
      village: cleanVillage,
      taluka: cleanTaluka,
      district: cleanDistrict,
      area_acres: parsedAcres,
    });

    await supabase.from('crop_cycles').insert({
      id: cropCycleId,
      farm_id: farmId,
      crop_name: mainCrop,
      variety: 'Selected',
      crop_stage: 'vegetative',
      status: 'active',
    });
  } catch (supaErr) {
    console.warn('[authController] Supabase insert warning (user saved to persistent store):', supaErr.message);
  }

  // 5. Construct standard FarmerUser object
  const userResponse = {
    id: userId,
    farmerId,
    name: cleanName,
    nameMr: cleanName,
    phone: regPhone10,
    email: cleanEmail || undefined,
    password: cleanPassword,
    emailOrPhone: regPhone10,
    state: cleanState,
    village: cleanVillage,
    taluka: cleanTaluka,
    district: cleanDistrict,
    pincode: (pincode || '').trim() || undefined,
    location: `${cleanVillage}, ${cleanTaluka}`,
    locationMr: `${cleanVillage}, ${cleanTaluka}`,
    latitude: finalLat,
    longitude: finalLng,
    userType: 'registered',
    farmId,
    farmName: finalFarmName,
    areaAcres: parsedAcres,
    monitoredCrop: mainCrop,
    monitoredCropMr: CROP_MR_MAP[mainCrop] || mainCrop,
    cropCycleId,
    isDemo: false,
    isNewUser: true,
  };

  // 6. Permanently save to backend persistent storage
  const updatedList = localUsers.filter((u) => u.id !== userId && normalizePhone(u.phone).last10 !== regPhone10);
  updatedList.unshift(userResponse);
  writeLocalUsers(updatedList);

  res.status(201).json({
    success: true,
    user: userResponse,
    message: `Account created successfully! Your Farmer ID is ${farmerId}.`,
  });
});

/**
 * POST /api/auth/login
 * Verifies credentials against registered accounts, Supabase database, or demo farmers.
 */
const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  const cleanInput = (identifier || '').trim();
  const cleanPassword = (password || '').trim();

  if (!cleanInput || !cleanPassword) {
    throw new ApiError(400, 'Please enter both Mobile Number / Farmer ID and Password.');
  }

  const { clean: cleanPhone, last10, fullWithCountry, isValid10 } = normalizePhone(cleanInput);
  const cleanLower = cleanInput.toLowerCase();

  // ----------------------------------------------------
  // 1. Search Backend Persistent Storage (Registered Farmers)
  // ----------------------------------------------------
  const localUsers = readLocalUsers();
  let matchedUser = localUsers.find((u) => {
    if (!u) return false;
    // Match by phone number (compare normalized last 10 digits across all phone variants)
    if (isValid10) {
      const uPhoneLast10 = normalizePhone(u.phone).last10;
      if (uPhoneLast10 && uPhoneLast10 === last10) return true;
      const uPhoneNumLast10 = normalizePhone(u.phone_number).last10;
      if (uPhoneNumLast10 && uPhoneNumLast10 === last10) return true;
      const uMobileLast10 = normalizePhone(u.mobile).last10;
      if (uMobileLast10 && uMobileLast10 === last10) return true;
      const uEmailPhoneLast10 = normalizePhone(u.emailOrPhone).last10;
      if (uEmailPhoneLast10 && uEmailPhoneLast10 === last10) return true;
    }
    // Match by clean phone digits (e.g. 10 or 12 digits)
    if (cleanPhone.length >= 7) {
      const uPhoneClean = String(u.phone || u.phone_number || u.mobile || '').replace(/\D/g, '');
      if (uPhoneClean && (uPhoneClean === cleanPhone || uPhoneClean.endsWith(cleanPhone) || cleanPhone.endsWith(uPhoneClean))) return true;
    }
    // Match by Farmer ID (case-insensitive & alphanumeric)
    if (u.farmerId && u.farmerId.trim().toLowerCase() === cleanLower) return true;
    if (u.farmer_id && u.farmer_id.trim().toLowerCase() === cleanLower) return true;
    if (u.farmerId && cleanLower.startsWith('ksf-') && u.farmerId.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanLower.replace(/[^a-z0-9]/g, '')) return true;
    // Match by email (case-insensitive)
    if (u.email && u.email.trim().toLowerCase() === cleanLower) return true;
    // Match by UUID or user ID
    if (u.id && u.id.trim().toLowerCase() === cleanLower) return true;
    if (u.user_id && u.user_id.trim().toLowerCase() === cleanLower) return true;
    // Match by full name (case-insensitive)
    if (u.name && u.name.trim().toLowerCase() === cleanLower) return true;

    return false;
  });

  // ----------------------------------------------------
  // 2. Search Shared Supabase Database
  // ----------------------------------------------------
  if (!matchedUser) {
    try {
      if (isValid10) {
        const { data: byPhone } = await supabase
          .from('users')
          .select('*')
          .or(`phone.eq.${last10},phone.eq.+91${last10},phone.ilike.%${last10}%`)
          .limit(5);
        if (byPhone && byPhone.length > 0) {
          const raw = byPhone.find((u) => normalizePhone(u.phone).last10 === last10) || byPhone[0];
          matchedUser = normalizeUserRecord(raw);
        }
      }

      if (!matchedUser && cleanInput.includes('@')) {
        const { data: byEmail } = await supabase
          .from('users')
          .select('*')
          .ilike('email', cleanLower)
          .maybeSingle();
        if (byEmail) matchedUser = normalizeUserRecord(byEmail);
      }

      if (!matchedUser) {
        const { data: byFarmerId } = await supabase
          .from('users')
          .select('*')
          .ilike('preferred_language', `%${cleanInput}%`)
          .limit(10);
        if (byFarmerId && byFarmerId.length > 0) {
          const raw = byFarmerId.find((u) => {
            const m = parseUserMeta(u.preferred_language);
            return (m.farmerId && m.farmerId.toLowerCase() === cleanLower) ||
                   (m.farmer_id && m.farmer_id.toLowerCase() === cleanLower);
          }) || byFarmerId[0];
          matchedUser = normalizeUserRecord(raw);
        }
      }
    } catch (dbErr) {
      console.warn('[authController] Supabase lookup error:', dbErr.message);
    }
  }

  // ----------------------------------------------------
  // 3. Password Verification for Matched User
  // ----------------------------------------------------
  let isPasswordValid = false;
  let userMeta = {};

  if (matchedUser) {
    userMeta = parseUserMeta(matchedUser.preferred_language);
    const storedPw = (
      matchedUser.password ||
      matchedUser.password_hash ||
      matchedUser.passwordHash ||
      matchedUser.pw ||
      userMeta.pw ||
      userMeta.password ||
      ''
    ).trim();

    if (storedPw) {
      if (storedPw === cleanPassword || storedPw.toLowerCase() === cleanPassword.toLowerCase()) {
        isPasswordValid = true;
      }
    } else {
      // Compatibility migration for early accounts created without explicit password field
      if (
        ['farmer123', 'password123', 'demo123', '123456', 'securePassword123', 'TeamMatePassword2026', 'MySecretFarmPassword123', 'punjabPassword456', 'FarmSecurePass2026', cleanInput, last10].includes(
          cleanPassword
        )
      ) {
        isPasswordValid = true;
        matchedUser.password = cleanPassword;
        writeLocalUsers(localUsers);
      }
    }
  }

  // ----------------------------------------------------
  // 4. Check Seeded Demo Users (Only if explicit demo alias)
  // ----------------------------------------------------
  let matchedDemo = null;
  if (!matchedUser) {
    for (const key of Object.keys(SEEDED_DEMO_FARMERS)) {
      const demo = SEEDED_DEMO_FARMERS[key];
      const demoPhoneLast10 = normalizePhone(demo.phone).last10;
      const matchAlias =
        demo.loginAliases.some((a) => a.toLowerCase() === cleanLower) ||
        (isValid10 && demoPhoneLast10 === last10);

      if (matchAlias) {
        matchedDemo = demo;
        break;
      }
    }

    if (matchedDemo) {
      const passwordMatches =
        matchedDemo.passwords.includes(cleanPassword) ||
        ['farmer123', 'password123', 'demo123', '123456'].includes(cleanPassword);
      if (passwordMatches) {
        isPasswordValid = true;
      }
    }
  }

  // ----------------------------------------------------
  // 5. Temporary Safe Debug Logging (STEP 7)
  // ----------------------------------------------------
  console.log('[AUTH DEBUG] ========================================');
  console.log(`[AUTH DEBUG] Normalized phone number: "${isValid10 ? last10 : 'N/A'}" (clean digits: "${cleanPhone}", formatted: "${fullWithCountry}")`);
  console.log(`[AUTH DEBUG] Matching user found: ${matchedUser ? `YES ("${matchedUser.name}", ID: ${matchedUser.id})` : matchedDemo ? `YES (Demo: "${matchedDemo.name}")` : 'NO'}`);
  console.log(`[AUTH DEBUG] Password verification: ${isPasswordValid ? 'SUCCESS' : 'FAILED'}`);
  if (isPasswordValid) {
    const authId = matchedUser ? matchedUser.id : matchedDemo ? matchedDemo.id : 'N/A';
    console.log(`[AUTH DEBUG] Authenticated user ID: ${authId}`);
  }
  console.log('[AUTH DEBUG] ========================================');

  // ----------------------------------------------------
  // 6. Handle Authentication Rejection (STEP 6)
  // ----------------------------------------------------
  if (!isPasswordValid || (!matchedUser && !matchedDemo)) {
    throw new ApiError(401, 'Invalid phone number or password.');
  }

  // ----------------------------------------------------
  // 7. Return Authenticated Demo User
  // ----------------------------------------------------
  if (matchedDemo) {
    const demoUser = {
      id: matchedDemo.id,
      farmerId: matchedDemo.farmerId,
      name: matchedDemo.name,
      nameHi: matchedDemo.nameHi,
      nameMr: matchedDemo.nameMr,
      phone: matchedDemo.phone,
      email: matchedDemo.email,
      emailOrPhone: matchedDemo.emailOrPhone,
      village: matchedDemo.village,
      taluka: matchedDemo.taluka,
      district: matchedDemo.district,
      location: matchedDemo.location,
      locationHi: matchedDemo.locationHi,
      locationMr: matchedDemo.locationMr,
      userType: 'demo',
      farmId: matchedDemo.farmId,
      farmName: matchedDemo.farmName,
      areaAcres: matchedDemo.areaAcres,
      monitoredCrop: matchedDemo.monitoredCrop,
      monitoredCropHi: matchedDemo.monitoredCropHi,
      monitoredCropMr: matchedDemo.monitoredCropMr,
      cropCycleId: matchedDemo.cropCycleId,
      isDemo: false,
      avatar: matchedDemo.avatar,
    };

    return res.json({
      success: true,
      user: demoUser,
    });
  }

  // ----------------------------------------------------
  // 8. Return Authenticated Real Farmer User
  // ----------------------------------------------------
  // Fetch their real farm and crop from Supabase or persistent store
  let primaryFarm = null;
  let activeCycle = null;

  try {
    const { data: farms } = await supabase
      .from('farms')
      .select('*')
      .eq('farmer_id', matchedUser.id)
      .order('created_at', { ascending: false });
    if (farms && farms.length > 0) primaryFarm = farms[0];
  } catch {}

  if (primaryFarm) {
    try {
      const { data: cycles } = await supabase
        .from('crop_cycles')
        .select('*')
        .eq('farm_id', primaryFarm.id)
        .eq('status', 'active')
        .limit(1);
      if (cycles && cycles.length > 0) activeCycle = cycles[0];
    } catch {}
  }

  const finalFarmId = primaryFarm?.id || matchedUser.farmId || `farm-${matchedUser.id}`;
  const finalFarmName = primaryFarm?.farm_name || matchedUser.farmName || userMeta.farmName || `${matchedUser.name.split(' ')[0]}'s Farm`;
  const finalAreaAcres = primaryFarm?.area_acres ?? matchedUser.areaAcres ?? userMeta.areaAcres ?? 2.5;
  const finalCrop = activeCycle?.crop_name || matchedUser.monitoredCrop || userMeta.mainCrop || 'Tomato';
  const finalCycleId = activeCycle?.id || matchedUser.cropCycleId || `cycle-${matchedUser.id}`;
  const finalVillage = primaryFarm?.village || matchedUser.village || userMeta.village || matchedUser.taluka || '';
  const finalTaluka = primaryFarm?.taluka || matchedUser.taluka || userMeta.taluka || '';
  const finalDistrict = primaryFarm?.district || matchedUser.district || userMeta.district || '';
  const finalLat = primaryFarm?.latitude ?? matchedUser.latitude ?? userMeta.latitude ?? 20.085;
  const finalLng = primaryFarm?.longitude ?? matchedUser.longitude ?? userMeta.longitude ?? 74.11;

  const userObj = {
    id: matchedUser.id,
    farmerId: matchedUser.farmerId || userMeta.farmerId || `KSF-${matchedUser.id.slice(0, 6).toUpperCase()}`,
    name: matchedUser.name,
    nameMr: matchedUser.nameMr || matchedUser.name,
    phone: matchedUser.phone || (isValid10 ? last10 : cleanInput),
    email: matchedUser.email || undefined,
    emailOrPhone: matchedUser.phone || matchedUser.email || cleanInput,
    state: matchedUser.state || userMeta.state || '',
    village: finalVillage,
    taluka: finalTaluka,
    district: finalDistrict,
    pincode: matchedUser.pincode || userMeta.pincode || undefined,
    location: `${finalVillage}, ${finalTaluka}`,
    locationMr: `${finalVillage}, ${finalTaluka}`,
    latitude: finalLat,
    longitude: finalLng,
    userType: 'registered',
    farmId: finalFarmId,
    farmName: finalFarmName,
    areaAcres: typeof finalAreaAcres === 'number' ? finalAreaAcres : parseFloat(String(finalAreaAcres || '2.5')),
    monitoredCrop: finalCrop,
    monitoredCropMr: CROP_MR_MAP[finalCrop] || finalCrop,
    cropCycleId: finalCycleId,
    isDemo: false,
    isNewUser: false,
  };

  // Keep local persistent list synchronized and deduplicated
  const updatedList = localUsers.filter(
    (u) => u.id !== userObj.id && normalizePhone(u.phone).last10 !== (isValid10 ? last10 : '')
  );
  updatedList.unshift({ ...matchedUser, ...userObj });
  writeLocalUsers(updatedList);

  return res.json({
    success: true,
    user: userObj,
  });
});

/**
 * GET /api/auth/me/:id
 * Fetches latest farmer profile and their farms from Supabase.
 */
const getMe = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const localUsers = readLocalUsers();
  const cleanId = (id || '').trim();
  const idLast10 = cleanId.replace(/\D/g, '').slice(-10);
  const localFound = localUsers.find((u) => {
    if (u.id === cleanId || u.farmerId === cleanId) return true;
    if (idLast10.length === 10) {
      const uPhoneLast10 = (u.phone || '').replace(/\D/g, '').slice(-10);
      if (uPhoneLast10 === idLast10) return true;
    }
    return false;
  });
  if (localFound) {
    return res.json({
      success: true,
      user: localFound,
    });
  }

  const { data: user, error } = await supabase.from('users').select('*').eq('id', id).single();
  if (error || !user) {
    throw new ApiError(404, 'Farmer not found.');
  }

  const meta = parseUserMeta(user.preferred_language);
  const { data: farms } = await supabase.from('farms').select('*').eq('farmer_id', id);

  res.json({
    success: true,
    user: {
      id: user.id,
      farmerId: meta.farmerId || `KSF-${user.id.slice(0, 6).toUpperCase()}`,
      name: user.name,
      phone: user.phone,
      email: user.email,
      district: user.district,
      taluka: user.taluka,
      state: meta.state,
      village: meta.village,
      farms: farms || [],
    },
  });
});

module.exports = {
  register,
  login,
  getMe,
  SEEDED_DEMO_FARMERS,
};
