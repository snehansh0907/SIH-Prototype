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

const SPECIES_MR_MAP = {
  Cattle: 'गाय (गोवंश)',
  Buffalo: 'म्हैस',
  Goat: 'शेळी',
  Sheep: 'मेंढी',
  Poultry: 'कुक्कुटपालन (कोंबडी)',
  Cow: 'गाय',
};

const SPECIES_HI_MAP = {
  Cattle: 'गाय (गोवंश)',
  Buffalo: 'भैंस',
  Goat: 'बकरी',
  Sheep: 'भेड़',
  Poultry: 'मुर्गीपालन',
  Cow: 'गाय',
};

function isFakeAutoFarmer(user) {
  if (!user) return false;
  const name = user.name || '';
  const farm = user.farmName || user.shedName || '';
  return /^Farmer\s*\(\d+\)$/i.test(name) || /^Farm\s*\d+$/i.test(farm) || /^शेतकरी\s*\(\d+\)$/i.test(name);
}

function normalizeUserRecord(u) {
  if (!u) return null;
  // If wrapped inside { user: {...}, password: "..." }
  const base = u.user && typeof u.user === 'object' ? u.user : u;
  const pw = (u.password || base.password || base.password_hash || base.passwordHash || base.pw || '').trim();
  const phone = base.phone || base.phone_number || base.phoneNumber || base.mobile || base.mobile_number || '';
  const farmerId = base.farmerId || base.farmer_id || (base.id ? `PSF-${String(base.id).slice(0, 6).toUpperCase()}` : '');
  const id = base.id || base.user_id || base.userId || uuidv4();
  const farmId = base.farmId || base.farm_id || base.shedId || base.shed_id || `shed-${id}`;
  const shedName = base.shedName || base.shed_name || base.farmName || base.farm_name || `${(base.name || 'Owner').split(' ')[0]}'s Dairy Shed`;
  const areaAcres = typeof base.areaAcres === 'number' ? base.areaAcres : parseFloat(String(base.areaAcres || base.area_acres || '2.5')) || 2.5;
  const species = base.species || base.monitoredAnimal || base.monitoredCrop || 'Cattle';
  const breed = base.breed || 'Gir';
  const totalAnimals = typeof base.totalAnimals === 'number' ? base.totalAnimals : parseInt(String(base.totalAnimals || base.herdSize || base.animalsCount || '6'), 10) || 6;
  const ageRange = base.ageRange || base.age_range || '2 calves, 3 lactating adults, 1 dry';
  const vaccinationHistory = base.vaccinationHistory || base.vaccination_history || ['LSD Goat Pox 2026', 'FMD NADCP 2026'];
  const cropCycleId = base.cropCycleId || base.crop_cycle_id || base.unitId || `unit-${farmId}`;

  return {
    ...base,
    id,
    farmerId,
    ownerId: farmerId,
    name: base.name || 'Livestock Owner',
    nameMr: base.nameMr || base.name || 'पशुपालक',
    phone: String(phone).trim(),
    email: base.email || undefined,
    password: pw,
    emailOrPhone: base.emailOrPhone || phone || base.email,
    state: base.state || 'Maharashtra',
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
    shedId: farmId,
    farmName: shedName,
    shedName,
    areaAcres,
    species,
    breed,
    totalAnimals,
    ageRange,
    vaccinationHistory,
    monitoredAnimal: species,
    monitoredAnimalHi: SPECIES_HI_MAP[species] || species,
    monitoredAnimalMr: SPECIES_MR_MAP[species] || species,
    monitoredCrop: species,
    monitoredCropHi: SPECIES_HI_MAP[species] || species,
    monitoredCropMr: SPECIES_MR_MAP[species] || species,
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

// Seeded demo livestock owner credentials (accessible intentionally as demo)
const SEEDED_DEMO_FARMERS = {
  ramesh: {
    id: '542d3fbc-f0f7-4e82-84b9-f8394659b61b',
    farmerId: 'farmer123',
    ownerId: 'farmer123',
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
    shedId: '17e5475b-6ec1-4473-9c56-9e7de02d63d9',
    farmName: 'Patil Dairy Gotha',
    shedName: 'Patil Dairy Gotha',
    areaAcres: 3.29,
    species: 'Cattle',
    breed: 'Gir Cow',
    totalAnimals: 6,
    ageRange: '4 lactating cows, 2 heifers',
    vaccinationHistory: ['FMD NADCP Sep 2026', 'LSD Goat Pox Jun 2026'],
    monitoredAnimal: 'Cattle',
    monitoredAnimalHi: 'गाय (गीर)',
    monitoredAnimalMr: 'गाय (गीर गोवंश)',
    monitoredCrop: 'Cattle',
    monitoredCropHi: 'गाय (गीर)',
    monitoredCropMr: 'गाय (गीर गोवंश)',
    cropCycleId: '30dd71a7-0230-4492-8fd8-42d7a53af3a1',
    isDemo: false,
    avatar: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=200&q=80',
    loginAliases: ['farmer123', 'ramesh', 'ramesh.patil@example.com', '9820000000', 'psf-ramesh', 'ksf-ramesh'],
    passwords: ['farmer123', 'password123', 'demo123', '123456'],
  },
  suresh: {
    id: '7d8ae2f6-8461-4950-a873-486e071b6ffd',
    farmerId: 'suresh123',
    ownerId: 'suresh123',
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
    shedId: '7d8ae2f6-8461-4950-a873-486e071b6fa1',
    farmName: 'Kale Cattle Dairy Shed',
    shedName: 'Kale Cattle Dairy Shed',
    areaAcres: 4.2,
    species: 'Cattle',
    breed: 'Gir & Sahiwal',
    totalAnimals: 8,
    ageRange: '5 milch cows, 3 heifers',
    vaccinationHistory: ['LSD Goat Pox 2026', 'FMD NADCP 2026', 'HS/BQ Dual Vaccine'],
    monitoredAnimal: 'Cattle',
    monitoredAnimalHi: 'गाय (गीर व साहिवाल)',
    monitoredAnimalMr: 'गाय (गीर व साहिवाल)',
    monitoredCrop: 'Cattle',
    monitoredCropHi: 'गाय (गीर व साहिवाल)',
    monitoredCropMr: 'गाय (गीर व साहिवाल)',
    cropCycleId: '7d8ae2f6-8461-4950-a873-486e071b6fc1',
    isDemo: false,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    loginAliases: ['suresh123', 'suresh', 'suresh.kale@example.com', '9820004936', 'psf-suresh', 'ksf-suresh'],
    passwords: ['suresh123', 'farmer123', 'password123', 'demo123', '123456'],
  },
  vikas: {
    id: 'd53fc6d1-cca3-4c91-8c61-b32029cc231e',
    farmerId: 'vikas123',
    ownerId: 'vikas123',
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
    shedId: '46b37fe5-aedb-4e2c-bb26-a4e8b1dae26a',
    farmName: 'More Buffalo Dairy Farm',
    shedName: 'More Buffalo Dairy Farm',
    areaAcres: 3.51,
    species: 'Buffalo',
    breed: 'Murrah',
    totalAnimals: 5,
    ageRange: '3 milch buffaloes, 2 calves',
    vaccinationHistory: ['FMD NADCP 2026', 'HS Vaccine 2026'],
    monitoredAnimal: 'Buffalo',
    monitoredAnimalHi: 'भैंस (मुर्रा)',
    monitoredAnimalMr: 'म्हैस (मुरा)',
    monitoredCrop: 'Buffalo',
    monitoredCropHi: 'भैंस (मुर्रा)',
    monitoredCropMr: 'म्हैस (मुरा)',
    cropCycleId: '576451d2-2927-49b8-a623-ff2b0114720d',
    isDemo: false,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    loginAliases: ['vikas123', 'vikas', 'vikas.more@example.com', '9820002468', 'psf-vikas', 'ksf-vikas'],
    passwords: ['vikas123', 'farmer123', 'password123', 'demo123', '123456'],
  },
  anita: {
    id: '6ecf18a7-f888-4ba6-9b7c-c43253a0409c',
    farmerId: 'anita123',
    ownerId: 'anita123',
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
    shedId: '6e5c646e-53f8-4be4-a731-13ed3de4f3d0',
    farmName: 'Shinde Goat Farm',
    shedName: 'Shinde Goat Farm',
    areaAcres: 2.45,
    species: 'Goat',
    breed: 'Osmanabadi',
    totalAnimals: 14,
    ageRange: '10 does, 3 kids, 1 buck',
    vaccinationHistory: ['PPR Vaccine 2026', 'Enterotoxaemia (ET) 2026'],
    monitoredAnimal: 'Goat',
    monitoredAnimalHi: 'बकरी (उस्मानाबादी)',
    monitoredAnimalMr: 'शेळी (उस्मानाबादी)',
    monitoredCrop: 'Goat',
    monitoredCropHi: 'बकरी (उस्मानाबादी)',
    monitoredCropMr: 'शेळी (उस्मानाबादी)',
    cropCycleId: '6918ec13-ed28-4598-bdb4-3f994f35cbed',
    isDemo: false,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    loginAliases: ['anita123', 'anita', 'anita.shinde@example.com', '9820003702', 'psf-anita', 'ksf-anita'],
    passwords: ['anita123', 'farmer123', 'password123', 'demo123', '123456'],
  },
  sunita: {
    id: 'cf00ab2b-df0f-4382-9a25-6e3cb19d4e8c',
    farmerId: 'sunita123',
    ownerId: 'sunita123',
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
    shedId: '183e1bc8-23ca-4f40-8469-c13a1b7eb1ab',
    farmName: 'Jadhav Cattle Shed',
    shedName: 'Jadhav Cattle Shed',
    areaAcres: 1.78,
    species: 'Cattle',
    breed: 'HF Cross',
    totalAnimals: 4,
    ageRange: '3 cows, 1 calf',
    vaccinationHistory: ['LSD Goat Pox 2026', 'FMD NADCP 2026'],
    monitoredAnimal: 'Cattle',
    monitoredAnimalHi: 'गाय (एचएफ क्रॉस)',
    monitoredAnimalMr: 'गाय (एचएफ क्रॉस)',
    monitoredCrop: 'Cattle',
    monitoredCropHi: 'गाय (एचएफ क्रॉस)',
    monitoredCropMr: 'गाय (एचएफ क्रॉस)',
    cropCycleId: '183e1bc8-23ca-4f40-8469-c13a1b7eb1ac',
    isDemo: false,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    loginAliases: ['sunita123', 'sunita', 'sunita.jadhav@example.com', '9820001234', 'psf-sunita', 'ksf-sunita'],
    passwords: ['sunita123', 'farmer123', 'password123', 'demo123', '123456'],
  },
  manisha: {
    id: 'a02a112d-ca82-493c-97b3-40491c72d995',
    farmerId: 'manisha123',
    ownerId: 'manisha123',
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
    shedId: 'a02a112d-ca82-493c-97b3-40491c72d9a1',
    farmName: 'Pawar Indigenous Cattle Gotha',
    shedName: 'Pawar Indigenous Cattle Gotha',
    areaAcres: 2.8,
    species: 'Cattle',
    breed: 'Khillari',
    totalAnimals: 7,
    ageRange: '4 adults, 3 heifers',
    vaccinationHistory: ['FMD NADCP 2026', 'LSD Goat Pox 2026'],
    monitoredAnimal: 'Cattle',
    monitoredAnimalHi: 'गाय (खिल्लारी)',
    monitoredAnimalMr: 'गाय (खिल्लारी गोवंश)',
    monitoredCrop: 'Cattle',
    monitoredCropHi: 'गाय (खिल्लारी)',
    monitoredCropMr: 'गाय (खिल्लारी गोवंश)',
    cropCycleId: 'a02a112d-ca82-493c-97b3-40491c72d9c1',
    isDemo: false,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    loginAliases: ['manisha123', 'manisha', 'manisha.pawar@example.com', '9820006170', 'psf-manisha', 'ksf-manisha'],
    passwords: ['manisha123', 'farmer123', 'password123', 'demo123', '123456'],
  },
  ganesh: {
    id: 'c79751f2-0b89-407b-923a-872b7f3cb509',
    farmerId: 'ganesh123',
    ownerId: 'ganesh123',
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
    shedId: 'c79751f2-0b89-407b-923a-872b7f3cb5a1',
    farmName: 'Deshmukh Buffalo Farm',
    shedName: 'Deshmukh Buffalo Farm',
    areaAcres: 3.1,
    species: 'Buffalo',
    breed: 'Jaffrabadi',
    totalAnimals: 6,
    ageRange: '4 milch, 2 calves',
    vaccinationHistory: ['FMD NADCP 2026', 'HS 2026'],
    monitoredAnimal: 'Buffalo',
    monitoredAnimalHi: 'भैंस (जाफराबादी)',
    monitoredAnimalMr: 'म्हैस (जाफराबादी)',
    monitoredCrop: 'Buffalo',
    monitoredCropHi: 'भैंस (जाफराबादी)',
    monitoredCropMr: 'म्हैस (जाफराबादी)',
    cropCycleId: 'c79751f2-0b89-407b-923a-872b7f3cb5c1',
    isDemo: false,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    loginAliases: ['ganesh123', 'ganesh', 'ganesh.deshmukh@example.com', '9820007404', 'psf-ganesh', 'ksf-ganesh'],
    passwords: ['ganesh123', 'farmer123', 'password123', 'demo123', '123456'],
  },
  lata: {
    id: '895f6bf9-0fe3-4b0a-81cd-d8ff73f80282',
    farmerId: 'lata123',
    ownerId: 'lata123',
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
    shedId: '895f6bf9-0fe3-4b0a-81cd-d8ff73f802a1',
    farmName: 'Gaikwad Dairy Shed',
    shedName: 'Gaikwad Dairy Shed',
    areaAcres: 2.1,
    species: 'Cattle',
    breed: 'Deoni',
    totalAnimals: 5,
    ageRange: '3 cows, 2 calves',
    vaccinationHistory: ['FMD NADCP 2026', 'LSD Goat Pox 2026'],
    monitoredAnimal: 'Cattle',
    monitoredAnimalHi: 'गाय (देवणी)',
    monitoredAnimalMr: 'गाय (देवणी गोवंश)',
    monitoredCrop: 'Cattle',
    monitoredCropHi: 'गाय (देवणी)',
    monitoredCropMr: 'गाय (देवणी गोवंश)',
    cropCycleId: '895f6bf9-0fe3-4b0a-81cd-d8ff73f802c1',
    isDemo: false,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    loginAliases: ['lata123', 'lata', 'lata.gaikwad@example.com', '9820008638', 'psf-lata', 'ksf-lata'],
    passwords: ['lata123', 'farmer123', 'password123', 'demo123', '123456'],
  },
  prakash: {
    id: 'a53c75db-9364-4e8d-8dba-02b446381ccf',
    farmerId: 'prakash123',
    ownerId: 'prakash123',
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
    shedId: 'a53c75db-9364-4e8d-8dba-02b446381ca1',
    farmName: 'Wagh Livestock Gotha',
    shedName: 'Wagh Livestock Gotha',
    areaAcres: 3.8,
    species: 'Cattle',
    breed: 'Dangi & Gir',
    totalAnimals: 8,
    ageRange: '5 cows, 3 calves',
    vaccinationHistory: ['FMD NADCP 2026', 'LSD Goat Pox 2026'],
    monitoredAnimal: 'Cattle',
    monitoredAnimalHi: 'गाय (दांगी व गीर)',
    monitoredAnimalMr: 'गाय (दांगी व गीर)',
    monitoredCrop: 'Cattle',
    monitoredCropHi: 'गाय (दांगी व गीर)',
    monitoredCropMr: 'गाय (दांगी व गीर)',
    cropCycleId: 'a53c75db-9364-4e8d-8dba-02b446381cc1',
    isDemo: false,
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
    loginAliases: ['prakash123', 'prakash', 'prakash.wagh@example.com', '9820009872', 'psf-prakash', 'ksf-prakash'],
    passwords: ['prakash123', 'farmer123', 'password123', 'demo123', '123456'],
  },
  shobha: {
    id: 'bc06238f-1d9e-4027-8605-47e201606851',
    farmerId: 'shobha123',
    ownerId: 'shobha123',
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
    shedId: 'bc06238f-1d9e-4027-8605-47e2016068a1',
    farmName: 'Bhosale Goat Shed',
    shedName: 'Bhosale Goat Shed',
    areaAcres: 2.3,
    species: 'Goat',
    breed: 'Sangamneri',
    totalAnimals: 12,
    ageRange: '8 does, 3 kids, 1 buck',
    vaccinationHistory: ['PPR Vaccine 2026', 'Enterotoxaemia 2026'],
    monitoredAnimal: 'Goat',
    monitoredAnimalHi: 'बकरी (संगमनेरी)',
    monitoredAnimalMr: 'शेळी (संगमनेरी)',
    monitoredCrop: 'Goat',
    monitoredCropHi: 'बकरी (संगमनेरी)',
    monitoredCropMr: 'शेळी (संगमनेरी)',
    cropCycleId: 'bc06238f-1d9e-4027-8605-47e2016068c1',
    isDemo: false,
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=200&q=80',
    loginAliases: ['shobha123', 'shobha', 'shobha.bhosale@example.com', '9820011106', 'psf-shobha', 'ksf-shobha'],
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
  return `PSF-${code}`;
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
 * Permanently registers a livestock owner account into Supabase (users, herds/farms, animal_units/crop_cycles).
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
    shedName,
    areaAcres,
    species = 'Cattle',
    breed = 'Gir',
    totalAnimals = 6,
    ageRange = '2 calves, 3 lactating adults, 1 dry',
    vaccinationHistory = ['LSD Goat Pox 2026', 'FMD NADCP 2026'],
    mainCrop,
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
  const finalSpecies = species || mainCrop || 'Cattle';
  const finalBreed = breed || 'Gir';
  const parsedAnimals = parseInt(String(totalAnimals || '6'), 10) || 6;
  const finalShedName = (shedName || farmName || '').trim() || `${cleanName.split(' ')[0]}'s Dairy Shed`;
  const finalAgeRange = ageRange || '2 calves, 3 lactating adults, 1 dry';
  const finalVaccinationHistory = Array.isArray(vaccinationHistory) ? vaccinationHistory : ['LSD Goat Pox 2026', 'FMD NADCP 2026'];

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
  const farmId = req.body.farmId || req.body.shedId || uuidv4();
  const cropCycleId = req.body.cropCycleId || req.body.unitId || uuidv4();
  const farmerId = req.body.farmerId || req.body.ownerId || generateFarmerId();

  const finalLat = typeof latitude === 'number' ? latitude : 20.085;
  const finalLng = typeof longitude === 'number' ? longitude : 74.11;

  // Metadata bundle stored in Supabase
  const meta = JSON.stringify({
    pw: cleanPassword,
    farmerId,
    ownerId: farmerId,
    state: cleanState,
    village: cleanVillage,
    pincode: (pincode || '').trim(),
    shedName: finalShedName,
    farmName: finalShedName,
    areaAcres: parsedAcres,
    species: finalSpecies,
    breed: finalBreed,
    totalAnimals: parsedAnimals,
    ageRange: finalAgeRange,
    vaccinationHistory: finalVaccinationHistory,
    mainCrop: finalSpecies,
    latitude: finalLat,
    longitude: finalLng,
  });

  // 4. Try insert into Supabase (supporting both herds and farms view)
  try {
    await supabase.from('users').insert({
      id: userId,
      name: cleanName,
      phone: regPhone10,
      email: cleanEmail,
      role: 'owner',
      preferred_language: meta,
      district: cleanDistrict,
      taluka: cleanTaluka,
    });

    try {
      await supabase.from('herds').insert({
        id: farmId,
        owner_id: userId,
        farmer_id: userId,
        shed_name: finalShedName,
        farm_name: finalShedName,
        species: finalSpecies,
        breed: finalBreed,
        total_animals: parsedAnimals,
        age_range: finalAgeRange,
        vaccination_history: finalVaccinationHistory,
        latitude: finalLat,
        longitude: finalLng,
        village: cleanVillage,
        taluka: cleanTaluka,
        district: cleanDistrict,
        area_acres: parsedAcres,
      });
    } catch {
      await supabase.from('farms').insert({
        id: farmId,
        farmer_id: userId,
        farm_name: finalShedName,
        latitude: finalLat,
        longitude: finalLng,
        village: cleanVillage,
        taluka: cleanTaluka,
        district: cleanDistrict,
        area_acres: parsedAcres,
      });
    }

    try {
      await supabase.from('animal_units').insert({
        id: cropCycleId,
        herd_id: farmId,
        farm_id: farmId,
        species: finalSpecies,
        breed: finalBreed,
        status: 'active',
      });
    } catch {
      await supabase.from('crop_cycles').insert({
        id: cropCycleId,
        farm_id: farmId,
        crop_name: finalSpecies,
        variety: finalBreed,
        crop_stage: 'active',
        status: 'active',
      });
    }
  } catch (supaErr) {
    console.warn('[authController] Supabase insert warning (user saved to persistent store):', supaErr.message);
  }

  // 5. Construct standard LivestockOwnerUser object
  const userResponse = {
    id: userId,
    farmerId,
    ownerId: farmerId,
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
    shedId: farmId,
    farmName: finalShedName,
    shedName: finalShedName,
    areaAcres: parsedAcres,
    species: finalSpecies,
    breed: finalBreed,
    totalAnimals: parsedAnimals,
    ageRange: finalAgeRange,
    vaccinationHistory: finalVaccinationHistory,
    monitoredAnimal: finalSpecies,
    monitoredAnimalHi: SPECIES_HI_MAP[finalSpecies] || finalSpecies,
    monitoredAnimalMr: SPECIES_MR_MAP[finalSpecies] || finalSpecies,
    monitoredCrop: finalSpecies,
    monitoredCropHi: SPECIES_HI_MAP[finalSpecies] || finalSpecies,
    monitoredCropMr: SPECIES_MR_MAP[finalSpecies] || finalSpecies,
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
    message: `Account created successfully! Your Owner ID is ${farmerId}.`,
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
      ownerId: matchedDemo.ownerId || matchedDemo.farmerId,
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
      shedId: matchedDemo.shedId || matchedDemo.farmId,
      farmName: matchedDemo.shedName || matchedDemo.farmName,
      shedName: matchedDemo.shedName || matchedDemo.farmName,
      areaAcres: matchedDemo.areaAcres,
      species: matchedDemo.species || 'Cattle',
      breed: matchedDemo.breed || 'Gir',
      totalAnimals: matchedDemo.totalAnimals || 6,
      ageRange: matchedDemo.ageRange || 'Adults and Calves',
      vaccinationHistory: matchedDemo.vaccinationHistory || ['LSD Goat Pox 2026', 'FMD NADCP 2026'],
      monitoredAnimal: matchedDemo.monitoredAnimal || matchedDemo.species || 'Cattle',
      monitoredAnimalHi: matchedDemo.monitoredAnimalHi || SPECIES_HI_MAP[matchedDemo.species] || matchedDemo.species,
      monitoredAnimalMr: matchedDemo.monitoredAnimalMr || SPECIES_MR_MAP[matchedDemo.species] || matchedDemo.species,
      monitoredCrop: matchedDemo.monitoredAnimal || matchedDemo.species || 'Cattle',
      monitoredCropHi: matchedDemo.monitoredCropHi || SPECIES_HI_MAP[matchedDemo.species] || matchedDemo.species,
      monitoredCropMr: matchedDemo.monitoredCropMr || SPECIES_MR_MAP[matchedDemo.species] || matchedDemo.species,
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
  // 8. Return Authenticated Real Livestock Owner User
  // ----------------------------------------------------
  let primaryFarm = null;
  let activeCycle = null;

  try {
    const { data: herds } = await supabase
      .from('herds')
      .select('*')
      .or(`owner_id.eq.${matchedUser.id},farmer_id.eq.${matchedUser.id}`)
      .order('created_at', { ascending: false });
    if (herds && herds.length > 0) primaryFarm = herds[0];
  } catch {}

  if (!primaryFarm) {
    try {
      const { data: farms } = await supabase
        .from('farms')
        .select('*')
        .eq('farmer_id', matchedUser.id)
        .order('created_at', { ascending: false });
      if (farms && farms.length > 0) primaryFarm = farms[0];
    } catch {}
  }

  if (primaryFarm) {
    try {
      const { data: units } = await supabase
        .from('animal_units')
        .select('*')
        .or(`herd_id.eq.${primaryFarm.id},farm_id.eq.${primaryFarm.id}`)
        .eq('status', 'active')
        .limit(1);
      if (units && units.length > 0) activeCycle = units[0];
    } catch {}

    if (!activeCycle) {
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
  }

  const finalFarmId = primaryFarm?.id || matchedUser.farmId || `shed-${matchedUser.id}`;
  const finalShedName = primaryFarm?.shed_name || primaryFarm?.farm_name || matchedUser.shedName || matchedUser.farmName || userMeta.shedName || userMeta.farmName || `${matchedUser.name.split(' ')[0]}'s Dairy Shed`;
  const finalAreaAcres = primaryFarm?.area_acres ?? matchedUser.areaAcres ?? userMeta.areaAcres ?? 2.5;
  const finalSpecies = activeCycle?.species || primaryFarm?.species || matchedUser.species || matchedUser.monitoredAnimal || matchedUser.monitoredCrop || userMeta.species || userMeta.mainCrop || 'Cattle';
  const finalBreed = activeCycle?.breed || primaryFarm?.breed || matchedUser.breed || userMeta.breed || 'Gir';
  const finalTotalAnimals = primaryFarm?.total_animals ?? matchedUser.totalAnimals ?? userMeta.totalAnimals ?? 6;
  const finalAgeRange = primaryFarm?.age_range || matchedUser.ageRange || userMeta.ageRange || 'Adults and Calves';
  const finalVaccinationHistory = primaryFarm?.vaccination_history || matchedUser.vaccinationHistory || userMeta.vaccinationHistory || ['LSD Goat Pox 2026', 'FMD NADCP 2026'];
  const finalCycleId = activeCycle?.id || matchedUser.cropCycleId || `unit-${matchedUser.id}`;
  const finalVillage = primaryFarm?.village || matchedUser.village || userMeta.village || matchedUser.taluka || '';
  const finalTaluka = primaryFarm?.taluka || matchedUser.taluka || userMeta.taluka || '';
  const finalDistrict = primaryFarm?.district || matchedUser.district || userMeta.district || '';
  const finalLat = primaryFarm?.latitude ?? matchedUser.latitude ?? userMeta.latitude ?? 20.085;
  const finalLng = primaryFarm?.longitude ?? matchedUser.longitude ?? userMeta.longitude ?? 74.11;

  const userObj = {
    id: matchedUser.id,
    farmerId: matchedUser.farmerId || userMeta.farmerId || userMeta.ownerId || `PSF-${matchedUser.id.slice(0, 6).toUpperCase()}`,
    ownerId: matchedUser.farmerId || userMeta.farmerId || userMeta.ownerId || `PSF-${matchedUser.id.slice(0, 6).toUpperCase()}`,
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
    shedId: finalFarmId,
    farmName: finalShedName,
    shedName: finalShedName,
    areaAcres: typeof finalAreaAcres === 'number' ? finalAreaAcres : parseFloat(String(finalAreaAcres || '2.5')),
    species: finalSpecies,
    breed: finalBreed,
    totalAnimals: finalTotalAnimals,
    ageRange: finalAgeRange,
    vaccinationHistory: finalVaccinationHistory,
    monitoredAnimal: finalSpecies,
    monitoredAnimalHi: SPECIES_HI_MAP[finalSpecies] || finalSpecies,
    monitoredAnimalMr: SPECIES_MR_MAP[finalSpecies] || finalSpecies,
    monitoredCrop: finalSpecies,
    monitoredCropHi: SPECIES_HI_MAP[finalSpecies] || finalSpecies,
    monitoredCropMr: SPECIES_MR_MAP[finalSpecies] || finalSpecies,
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
