// =========================================================
// Pashu Sarthak - Livestock Demo Seed Script
// SIH26128: Early Detection, Prevention & Management of Livestock Diseases
// Govt. of Maharashtra - Animal Husbandry Department
// =========================================================
// Populates Supabase / local data with realistic livestock demo data:
//   - Demo dairy farmers / livestock owners, veterinary officers
//   - Demo cattle sheds / herds (Niphad, Lasalgaon, Nashik district, Maharashtra)
//   - Cattle (Gir, Sahiwal, Crossbred), Buffalo (Murrah), Goat (Osmanabadi)
//   - Lumpy Skin Disease (LSD) and Foot-and-Mouth Disease (FMD) cases
//   - Livestock disease knowledge base
// =========================================================

require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const supabase = require('./src/config/supabase');
const { DISEASE_KNOWLEDGE_BASE } = require('./src/data/diseaseKnowledgeBase');

// Base coordinates: Niphad taluka, Nashik district, Maharashtra
const BASE_LAT = 20.0850;
const BASE_LNG = 74.1100;

function jitter(base, maxKm = 6) {
  const kmToDeg = maxKm / 111;
  return base + (Math.random() * 2 - 1) * kmToDeg;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

async function seed() {
  console.log('🐄 Seeding Pashu Sarthak livestock demo data...\n');

  // 1. Livestock Disease Knowledge Base
  console.log('-> Inserting livestock disease knowledge base...');
  const diseaseRows = DISEASE_KNOWLEDGE_BASE.map((d) => ({ id: uuidv4(), ...d }));
  const { error: diseaseErr } = await supabase.from('diseases').insert(diseaseRows);
  if (diseaseErr) console.warn('   Warning (DB insert):', diseaseErr.message);
  else console.log(`   Inserted ${diseaseRows.length} livestock diseases.`);

  // 2. Users (Livestock Owners + Veterinary Officers)
  console.log('-> Inserting livestock owners and veterinarians...');
  const ownerNames = [
    'Suresh Kale', 'Ramesh Patil', 'Sunita Jadhav', 'Vikas More', 'Anita Shinde',
    'Manisha Pawar', 'Ganesh Deshmukh', 'Lata Gaikwad', 'Prakash Wagh', 'Shobha Bhosale',
  ];
  const villages = ['Lasalgaon', 'Niphad', 'Pimpalgaon', 'Chandori', 'Ozar', 'Vinchur', 'Sonewadi', 'Nandgaon'];

  const owners = ownerNames.map((name, i) => ({
    id: uuidv4(),
    name,
    phone: `98${(20000000 + i * 1234).toString().slice(0, 8)}`,
    email: `${name.toLowerCase().replace(/\s+/g, '.')}@dairy.mahagov.in`,
    role: 'owner',
    preferred_language: 'mr',
    district: 'Nashik',
    taluka: 'Niphad',
    village: villages[i % villages.length],
  }));

  const veterinarians = [
    {
      id: uuidv4(),
      name: 'Dr. Ashok Kulkarni (B.V.Sc & A.H.)',
      phone: '9811111111',
      email: 'dr.kulkarni@ahd.maharashtra.gov.in',
      role: 'veterinarian',
      preferred_language: 'mr',
      district: 'Nashik',
      taluka: 'Niphad',
      village: 'Niphad',
    },
    {
      id: uuidv4(),
      name: 'Dr. Anjali Deshmukh (M.V.Sc Veterinary Medicine)',
      phone: '9822222222',
      email: 'dr.anjali@ahd.maharashtra.gov.in',
      role: 'veterinarian',
      preferred_language: 'mr',
      district: 'Nashik',
      taluka: 'Niphad',
      village: 'Lasalgaon',
    },
  ];

  const officials = [
    {
      id: uuidv4(),
      name: 'Assistant Commissioner Animal Husbandry, Nashik',
      phone: '9833333333',
      email: 'acah.nashik@maharashtra.gov.in',
      role: 'official',
      preferred_language: 'mr',
      district: 'Nashik',
      taluka: 'Niphad',
      village: 'Nashik',
    },
  ];

  const allUsers = [...owners, ...veterinarians, ...officials];
  const { error: userErr } = await supabase.from('users').insert(allUsers);
  if (userErr) console.warn('   Warning:', userErr.message);
  else console.log(`   Inserted ${allUsers.length} users (${owners.length} owners, ${veterinarians.length} vets, 1 official).`);

  // 3. Animal Sheds / Herds
  console.log('-> Inserting animal sheds / herds...');
  const speciesList = ['Cattle', 'Cattle', 'Buffalo', 'Cattle', 'Goat', 'Cattle', 'Buffalo', 'Cattle', 'Cattle', 'Buffalo'];
  const breedList = ['Gir', 'HF Cross', 'Murrah', 'Sahiwal', 'Osmanabadi', 'Khillari', 'Jaffarabadi', 'Deoni', 'Gir', 'Murrah'];

  const herds = owners.map((owner, i) => ({
    id: uuidv4(),
    owner_id: owner.id,
    shed_name: `${owner.name.split(' ')[0]}'s Dairy Shed`,
    species: speciesList[i % speciesList.length],
    breed: breedList[i % breedList.length],
    total_animals: Math.floor(Math.random() * 8) + 4,
    age_range: '2 calves, 3 lactating adults, 1 dry',
    vaccination_history: ['LSD Goat Pox 2026', 'FMD NADCP Round-II'],
    latitude: jitter(BASE_LAT),
    longitude: jitter(BASE_LNG),
    village: owner.village,
    taluka: 'Niphad',
    district: 'Nashik',
    shed_area_sqft: 1200,
  }));

  const { error: herdErr } = await supabase.from('herds').insert(herds);
  if (herdErr) console.warn('   Warning (herds insert):', herdErr.message);
  else console.log(`   Inserted ${herds.length} herds/sheds.`);

  // 4. Animal Disease Diagnosis Cases (LSD and FMD)
  console.log('-> Inserting animal disease diagnosis cases...');
  const caseTemplates = [
    {
      species: 'Cattle',
      predicted_disease: 'Lumpy Skin Disease (LSD)',
      confidence: 93,
      severity_band: 'Moderate',
      severity_percent: 45,
      affected_body_part: 'skin_nodules',
      status: 'confirmed',
    },
    {
      species: 'Cattle',
      predicted_disease: 'Lumpy Skin Disease (LSD)',
      confidence: 88,
      severity_band: 'High',
      severity_percent: 75,
      affected_body_part: 'skin_nodules',
      status: 'confirmed',
    },
    {
      species: 'Cattle',
      predicted_disease: 'Foot-and-Mouth Disease (FMD)',
      confidence: 91,
      severity_band: 'High',
      severity_percent: 70,
      affected_body_part: 'mouth_tongue',
      status: 'confirmed',
    },
    {
      species: 'Buffalo',
      predicted_disease: 'Foot-and-Mouth Disease (FMD)',
      confidence: 89,
      severity_band: 'Moderate',
      severity_percent: 48,
      affected_body_part: 'hoof_coronet',
      status: 'confirmed',
    },
    {
      species: 'Cattle',
      predicted_disease: 'Lumpy Skin Disease (LSD)',
      confidence: 90,
      severity_band: 'Moderate',
      severity_percent: 40,
      affected_body_part: 'skin_nodules',
      status: 'suspected',
    },
    {
      species: 'Cattle',
      predicted_disease: 'Foot-and-Mouth Disease (FMD)',
      confidence: 87,
      severity_band: 'Moderate',
      severity_percent: 42,
      affected_body_part: 'mouth_tongue',
      status: 'expert_review_pending',
    },
    {
      species: 'Cattle',
      predicted_disease: 'Healthy Animal',
      confidence: 95,
      severity_band: 'Low',
      severity_percent: 5,
      affected_body_part: 'generalized',
      status: 'resolved',
    },
  ];

  const cases = [];
  for (let i = 0; i < 20; i++) {
    const tmpl = caseTemplates[i % caseTemplates.length];
    const herd = herds[i % herds.length];
    cases.push({
      id: uuidv4(),
      owner_id: herd.owner_id,
      herd_id: herd.id,
      species: tmpl.species,
      image_url: `/uploads/livestock_case_${(i % 3) + 1}.jpg`,
      predicted_disease: tmpl.predicted_disease,
      confidence: tmpl.confidence,
      severity_band: tmpl.severity_band,
      severity_percent: tmpl.severity_percent,
      affected_body_part: tmpl.affected_body_part,
      latitude: jitter(herd.latitude, 2),
      longitude: jitter(herd.longitude, 2),
      status: tmpl.status,
      created_at: daysAgo(i % 14),
    });
  }

  const { error: caseErr } = await supabase.from('diagnosis_cases').insert(cases);
  if (caseErr) console.warn('   Warning (cases insert):', caseErr.message);
  else console.log(`   Inserted ${cases.length} animal disease diagnosis cases.`);

  console.log('\n✅ Pashu Sarthak livestock seeding complete!');
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
