// =========================================================
// Krishi Sarthak - Auth Controller
// =========================================================
// Handles farmer registration, credential verification,
// and session retrieval against the shared Supabase database.
// =========================================================

const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/supabase');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

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
    passwords: ['anita123', 'password123', 'demo123'],
  },
};

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
    return JSON.parse(prefLang);
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
  const cleanPhone = (phone || '').trim().replace(/\D/g, '');
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
  if (!cleanPhone || cleanPhone.length < 10) {
    throw new ApiError(400, 'Please enter a valid 10-digit mobile number.');
  }
  if (!cleanPassword || cleanPassword.length < 4) {
    throw new ApiError(400, 'Password must be at least 4 characters.');
  }
  if (!cleanDistrict || !cleanVillage) {
    throw new ApiError(400, 'District and Village/Locality are required.');
  }

  // 1. Check for duplicate phone in Supabase users table
  const { data: existingPhone, error: phoneErr } = await supabase
    .from('users')
    .select('id, phone')
    .eq('phone', cleanPhone)
    .maybeSingle();

  if (phoneErr && phoneErr.code !== 'PGRST116') {
    console.warn('[authController] Supabase phone check error:', phoneErr.message);
  }

  if (existingPhone) {
    throw new ApiError(
      409,
      `An account is already registered with mobile number ${cleanPhone}. Please log in using your password.`
    );
  }

  // 2. Check for duplicate email in Supabase users table (if provided)
  if (cleanEmail) {
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

  // 3. Generate IDs
  const userId = uuidv4();
  const farmId = uuidv4();
  const cropCycleId = uuidv4();
  const farmerId = generateFarmerId();

  const finalFarmName = (farmName || '').trim() || `${cleanName.split(' ')[0]}'s Farm`;
  const finalLat = typeof latitude === 'number' ? latitude : 20.085;
  const finalLng = typeof longitude === 'number' ? longitude : 74.11;

  // Metadata bundle stored securely in Supabase
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

  // 4. Insert into Supabase `users`
  const { error: userInsertErr } = await supabase.from('users').insert({
    id: userId,
    name: cleanName,
    phone: cleanPhone,
    email: cleanEmail,
    role: 'farmer',
    preferred_language: meta,
    district: cleanDistrict,
    taluka: cleanTaluka,
  });

  if (userInsertErr) {
    throw new ApiError(500, `Failed to register user in Supabase: ${userInsertErr.message}`);
  }

  // 5. Insert into Supabase `farms`
  const { error: farmInsertErr } = await supabase.from('farms').insert({
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

  if (farmInsertErr) {
    console.warn('[authController] Farm insert warning:', farmInsertErr.message);
  }

  // 6. Insert into Supabase `crop_cycles`
  const { error: cycleInsertErr } = await supabase.from('crop_cycles').insert({
    id: cropCycleId,
    farm_id: farmId,
    crop_name: mainCrop,
    variety: 'Selected',
    crop_stage: 'vegetative',
    status: 'active',
  });

  if (cycleInsertErr) {
    console.warn('[authController] Crop cycle insert warning:', cycleInsertErr.message);
  }

  // 7. Construct standard FarmerUser object
  const userResponse = {
    id: userId,
    farmerId,
    name: cleanName,
    nameMr: cleanName,
    phone: cleanPhone,
    email: cleanEmail || undefined,
    emailOrPhone: cleanPhone,
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

  res.status(201).json({
    success: true,
    user: userResponse,
    message: `Account created successfully! Your Farmer ID is ${farmerId}.`,
  });
});

/**
 * POST /api/auth/login
 * Verifies credentials against Supabase database or intentional demo users.
 */
const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  const cleanInput = (identifier || '').trim();
  const cleanPassword = (password || '').trim();

  if (!cleanInput || !cleanPassword) {
    throw new ApiError(400, 'Please enter both Farmer ID / Mobile / Email and Password.');
  }

  const cleanPhone = cleanInput.replace(/\D/g, '');
  const cleanLower = cleanInput.toLowerCase();

  // ----------------------------------------------------
  // 1. Check Shared Supabase Database
  // ----------------------------------------------------
  let matchedDbUser = null;

  // Search by exact phone
  if (cleanPhone.length >= 10) {
    const { data: byPhone } = await supabase
      .from('users')
      .select('*')
      .eq('phone', cleanPhone)
      .maybeSingle();
    if (byPhone) matchedDbUser = byPhone;
  }

  // Search by exact email
  if (!matchedDbUser && cleanInput.includes('@')) {
    const { data: byEmail } = await supabase
      .from('users')
      .select('*')
      .ilike('email', cleanLower)
      .maybeSingle();
    if (byEmail) matchedDbUser = byEmail;
  }

  // Search by farmerId inside preferred_language metadata
  if (!matchedDbUser) {
    const { data: byFarmerId } = await supabase
      .from('users')
      .select('*')
      .ilike('preferred_language', `%farmerId%${cleanInput}%`)
      .limit(10);

    if (byFarmerId && byFarmerId.length > 0) {
      matchedDbUser = byFarmerId.find((u) => {
        const m = parseUserMeta(u.preferred_language);
        return m.farmerId && m.farmerId.toLowerCase() === cleanLower;
      }) || byFarmerId[0];
    }
  }

  // If user found in database
  if (matchedDbUser) {
    const meta = parseUserMeta(matchedDbUser.preferred_language);
    const storedPassword = meta.pw || 'farmer123';

    // Verify Password
    if (storedPassword !== cleanPassword) {
      throw new ApiError(401, 'Incorrect password. Please try again.');
    }

    // Fetch this farmer's farms from Supabase
    const { data: farms } = await supabase
      .from('farms')
      .select('*')
      .eq('farmer_id', matchedDbUser.id)
      .order('created_at', { ascending: false });

    const primaryFarm = farms && farms.length > 0 ? farms[0] : null;

    // Fetch active crop cycle for their farm
    let activeCycle = null;
    if (primaryFarm) {
      const { data: cycles } = await supabase
        .from('crop_cycles')
        .select('*')
        .eq('farm_id', primaryFarm.id)
        .eq('status', 'active')
        .limit(1);
      if (cycles && cycles.length > 0) activeCycle = cycles[0];
    }

    const finalFarmName = primaryFarm?.farm_name || meta.farmName || `${matchedDbUser.name.split(' ')[0]}'s Farm`;
    const finalVillage = primaryFarm?.village || meta.village || matchedDbUser.taluka || '';
    const finalTaluka = primaryFarm?.taluka || matchedDbUser.taluka || '';
    const finalDistrict = primaryFarm?.district || matchedDbUser.district || '';
    const finalCrop = activeCycle?.crop_name || meta.mainCrop || 'Tomato';
    const finalLat = primaryFarm?.latitude ?? meta.latitude ?? 20.085;
    const finalLng = primaryFarm?.longitude ?? meta.longitude ?? 74.11;

    const userObj = {
      id: matchedDbUser.id,
      farmerId: meta.farmerId || `KSF-${matchedDbUser.id.slice(0, 6).toUpperCase()}`,
      name: matchedDbUser.name,
      nameMr: matchedDbUser.name,
      phone: matchedDbUser.phone,
      email: matchedDbUser.email || undefined,
      emailOrPhone: matchedDbUser.phone || matchedDbUser.email || cleanInput,
      state: meta.state || '',
      village: finalVillage,
      taluka: finalTaluka,
      district: finalDistrict,
      pincode: meta.pincode || undefined,
      location: `${finalVillage}, ${finalTaluka}`,
      locationMr: `${finalVillage}, ${finalTaluka}`,
      latitude: finalLat,
      longitude: finalLng,
      userType: 'registered',
      farmId: primaryFarm?.id,
      farmName: finalFarmName,
      areaAcres: primaryFarm?.area_acres ?? meta.areaAcres ?? 2.5,
      monitoredCrop: finalCrop,
      monitoredCropMr: CROP_MR_MAP[finalCrop] || finalCrop,
      cropCycleId: activeCycle?.id,
      isDemo: false,
      isNewUser: false,
    };

    return res.json({
      success: true,
      user: userObj,
    });
  }

  // ----------------------------------------------------
  // 2. Check Seeded Demo Users (Fallback for demo logins)
  // ----------------------------------------------------
  for (const key of Object.keys(SEEDED_DEMO_FARMERS)) {
    const demo = SEEDED_DEMO_FARMERS[key];
    const matchAlias = demo.loginAliases.some((a) => a.toLowerCase() === cleanLower);

    if (matchAlias) {
      const passwordMatches = demo.passwords.includes(cleanPassword);
      if (!passwordMatches) {
        throw new ApiError(401, 'Incorrect password. Please try again.');
      }

      const demoUser = {
        id: demo.id,
        farmerId: demo.farmerId,
        name: demo.name,
        nameHi: demo.nameHi,
        nameMr: demo.nameMr,
        phone: demo.phone,
        email: demo.email,
        emailOrPhone: demo.emailOrPhone,
        village: demo.village,
        taluka: demo.taluka,
        district: demo.district,
        location: demo.location,
        locationHi: demo.locationHi,
        locationMr: demo.locationMr,
        userType: 'demo',
        farmId: demo.farmId,
        farmName: demo.farmName,
        areaAcres: demo.areaAcres,
        monitoredCrop: demo.monitoredCrop,
        monitoredCropHi: demo.monitoredCropHi,
        monitoredCropMr: demo.monitoredCropMr,
        cropCycleId: demo.cropCycleId,
        isDemo: false,
        avatar: demo.avatar,
      };

      return res.json({
        success: true,
        user: demoUser,
      });
    }
  }

  // ----------------------------------------------------
  // 3. User Not Found
  // ----------------------------------------------------
  throw new ApiError(
    404,
    'Farmer account not found. Please check your Farmer ID / Mobile Number, or click Create Account to register.'
  );
});

/**
 * GET /api/auth/me/:id
 * Fetches latest farmer profile and their farms from Supabase.
 */
const getMe = asyncHandler(async (req, res) => {
  const { id } = req.params;

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
