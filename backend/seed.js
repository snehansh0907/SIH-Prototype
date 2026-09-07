// =========================================================
// Krishi Sarthak - Demo Seed Script
// =========================================================
// Populates Supabase with realistic demo data:
//   - Demo farmers, experts
//   - Demo farms (clustered around Niphad taluka, Nashik district, Maharashtra)
//   - Tomato, Cotton, Soybean crop cycles
//   - 20-30 diagnosis cases (confirmed, suspected, different diseases/dates)
//   - The disease knowledge base
//
// Run with: npm run seed
// (Requires SUPABASE_URL and SUPABASE_ANON_KEY to be set in .env)
// =========================================================

require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const supabase = require('./src/config/supabase');
const { DISEASE_KNOWLEDGE_BASE } = require('./src/data/diseaseKnowledgeBase');

// Base coordinates: Niphad taluka, Nashik district, Maharashtra (real, demo-safe area)
const BASE_LAT = 20.0850;
const BASE_LNG = 74.1100;

// Small random offset (roughly within a few km) so points look like real farm spread
function jitter(base, maxKm = 8) {
  const kmToDeg = maxKm / 111; // ~111km per degree latitude
  return base + (Math.random() * 2 - 1) * kmToDeg;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

async function seed() {
  console.log('🌱 Seeding Krishi Sarthak demo data...\n');

  // ---------------- 1. Disease Knowledge Base ----------------
  console.log('-> Inserting disease knowledge base...');
  const diseaseRows = DISEASE_KNOWLEDGE_BASE.map((d) => ({ id: uuidv4(), ...d }));
  const { error: diseaseErr } = await supabase.from('diseases').insert(diseaseRows);
  if (diseaseErr) console.warn('   Warning:', diseaseErr.message);
  else console.log(`   Inserted ${diseaseRows.length} diseases.`);

  // ---------------- 2. Users (farmers + experts + officials) ----------------
  console.log('-> Inserting demo users...');
  const farmerNames = [
    'Ramesh Patil', 'Sunita Jadhav', 'Vikas More', 'Anita Shinde', 'Suresh Kale',
    'Manisha Pawar', 'Ganesh Deshmukh', 'Lata Gaikwad', 'Prakash Wagh', 'Shobha Bhosale',
  ];
  const villages = ['Niphad', 'Pimpalgaon', 'Chandori', 'Ozar', 'Lasalgaon', 'Vinchur', 'Sonewadi', 'Nandgaon'];

  const farmers = farmerNames.map((name, i) => ({
    id: uuidv4(),
    name,
    phone: `98${(20000000 + i * 1234).toString().slice(0, 8)}`,
    email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    role: 'farmer',
    preferred_language: 'mr',
    district: 'Nashik',
    taluka: 'Niphad',
  }));

  const experts = [
    { id: uuidv4(), name: 'Dr. Ashok Kulkarni', phone: '9811111111', email: 'ashok.kulkarni@krishi.gov.in', role: 'expert', preferred_language: 'mr', district: 'Nashik', taluka: 'Niphad' },
    { id: uuidv4(), name: 'Dr. Meena Joshi', phone: '9822222222', email: 'meena.joshi@krishi.gov.in', role: 'expert', preferred_language: 'en', district: 'Nashik', taluka: 'Niphad' },
  ];

  const officials = [
    { id: uuidv4(), name: 'Krishi Adhikari Nashik', phone: '9833333333', email: 'official@krishi.gov.in', role: 'official', preferred_language: 'mr', district: 'Nashik', taluka: 'Niphad' },
  ];

  const allUsers = [...farmers, ...experts, ...officials];
  const { error: userErr } = await supabase.from('users').insert(allUsers);
  if (userErr) console.warn('   Warning:', userErr.message);
  else console.log(`   Inserted ${allUsers.length} users (${farmers.length} farmers, ${experts.length} experts, ${officials.length} official).`);

  // ---------------- 3. Farms ----------------
  console.log('-> Inserting demo farms...');
  const farms = farmers.map((farmer, i) => ({
    id: uuidv4(),
    farmer_id: farmer.id,
    farm_name: `${farmer.name.split(' ')[0]}'s Farm`,
    latitude: jitter(BASE_LAT),
    longitude: jitter(BASE_LNG),
    village: villages[i % villages.length],
    taluka: 'Niphad',
    district: 'Nashik',
    area_acres: (Math.random() * 4 + 0.5).toFixed(2),
  }));

  const { error: farmErr } = await supabase.from('farms').insert(farms);
  if (farmErr) console.warn('   Warning:', farmErr.message);
  else console.log(`   Inserted ${farms.length} farms.`);

  // ---------------- 4. Crop Cycles ----------------
  console.log('-> Inserting crop cycles...');
  const cropOptions = [
    { crop_name: 'Tomato', variety: 'Abhinav' },
    { crop_name: 'Cotton', variety: 'Bt Cotton' },
    { crop_name: 'Soybean', variety: 'JS-335' },
  ];
  const stages = ['seedling', 'vegetative', 'flowering', 'fruiting'];

  const cropCycles = farms.map((farm, i) => {
    const crop = cropOptions[i % cropOptions.length];
    return {
      id: uuidv4(),
      farm_id: farm.id,
      crop_name: crop.crop_name,
      variety: crop.variety,
      sowing_date: daysAgo(45 + i).slice(0, 10),
      crop_stage: stages[i % stages.length],
      status: 'active',
    };
  });

  const { error: cycleErr } = await supabase.from('crop_cycles').insert(cropCycles);
  if (cycleErr) console.warn('   Warning:', cycleErr.message);
  else console.log(`   Inserted ${cropCycles.length} crop cycles.`);

  // ---------------- 5. Diagnosis Cases ----------------
  console.log('-> Inserting demo diagnosis cases (with a visible hotspot cluster)...');

  const diseasesByCrop = {
    Tomato: ['Early Blight', 'Late Blight', 'Leaf Mold'],
    Cotton: ['Leaf Curl Disease', 'Bollworm Related Damage'],
    Soybean: ['Rust', 'Leaf Spot'],
  };

  const cases = [];

  // A) General scattered cases across all farms/crop cycles (mix of statuses)
  cropCycles.forEach((cycle, i) => {
    const farm = farms.find((f) => f.id === cycle.farm_id);
    const farmer = farmers.find((f) => f.id === farm.farmer_id) || farmers[i % farmers.length];
    const diseaseList = diseasesByCrop[cycle.crop_name] || ['Healthy Leaf'];
    const disease = diseaseList[i % diseaseList.length];

    const severityPercent = Math.floor(Math.random() * 80) + 10;
    let severityBand = 'Low';
    if (severityPercent > 65) severityBand = 'Severe';
    else if (severityPercent > 40) severityBand = 'High';
    else if (severityPercent > 20) severityBand = 'Moderate';

    // Mix of statuses: roughly half confirmed, some suspected, some pending review
    const statusPool = ['confirmed', 'confirmed', 'suspected', 'expert_review_pending', 'corrected'];
    const status = statusPool[i % statusPool.length];

    cases.push({
      id: uuidv4(),
      farmer_id: farmer.id,
      farm_id: farm.id,
      crop_cycle_id: cycle.id,
      image_url: `/uploads/demo_${cycle.crop_name.toLowerCase()}_${i}.jpg`,
      predicted_disease: disease,
      confidence: Math.floor(Math.random() * 20) + 78,
      severity_band: severityBand,
      severity_percent: severityPercent,
      latitude: farm.latitude,
      longitude: farm.longitude,
      status,
      created_at: daysAgo(Math.floor(Math.random() * 30)),
    });
  });

  // B) A tight geographic cluster of CONFIRMED Tomato Early Blight cases near
  //    tomato farms, so the hotspot heatmap visibly clusters on the demo map.
  const clusterCenterLat = jitter(BASE_LAT, 2);
  const clusterCenterLng = jitter(BASE_LNG, 2);

  const tomatoCycles = cropCycles.filter((c) => c.crop_name === 'Tomato');
  const tomatoFarms = farms.filter((f) => tomatoCycles.some((c) => c.farm_id === f.id));

  for (let i = 0; i < 8; i++) {
    const cycle = tomatoCycles[i % tomatoCycles.length];
    const farm = tomatoFarms.find((f) => f.id === cycle.farm_id) || tomatoFarms[0];
    const farmer = farmers.find((f) => f.id === farm.farmer_id) || farmers[0];
    cases.push({
      id: uuidv4(),
      farmer_id: farmer.id,
      farm_id: farm.id,
      crop_cycle_id: cycle.id,
      image_url: `/uploads/demo_cluster_${i}.jpg`,
      predicted_disease: 'Early Blight',
      confidence: Math.floor(Math.random() * 15) + 82,
      severity_band: i % 2 === 0 ? 'High' : 'Moderate',
      severity_percent: i % 2 === 0 ? 55 + i : 35 + i,
      // Small offset within ~1.5km of the cluster center for a visible heatmap cluster
      latitude: clusterCenterLat + (Math.random() * 0.02 - 0.01),
      longitude: clusterCenterLng + (Math.random() * 0.02 - 0.01),
      status: 'confirmed',
      created_at: daysAgo(Math.floor(Math.random() * 10)), // recent, so it affects live risk scores
    });
  }

  const { error: caseErr } = await supabase.from('diagnosis_cases').insert(cases);
  if (caseErr) console.warn('   Warning:', caseErr.message);
  else console.log(`   Inserted ${cases.length} diagnosis cases (including an 8-case confirmed hotspot cluster).`);

  // ---------------- 6. A couple of expert reviews for confirmed cases ----------------
  console.log('-> Inserting sample expert reviews...');
  const confirmedCases = cases.filter((c) => c.status === 'confirmed').slice(0, 5);
  const reviews = confirmedCases.map((c) => ({
    id: uuidv4(),
    case_id: c.id,
    expert_id: experts[0].id,
    ai_prediction: c.predicted_disease,
    expert_diagnosis: c.predicted_disease,
    review_status: 'confirmed',
    remarks: 'Symptoms match field inspection. Confirmed.',
    reviewed_at: daysAgo(1),
  }));

  if (reviews.length > 0) {
    const { error: reviewErr } = await supabase.from('expert_reviews').insert(reviews);
    if (reviewErr) console.warn('   Warning:', reviewErr.message);
    else console.log(`   Inserted ${reviews.length} expert reviews.`);
  }

  console.log('\n✅ Seeding complete!');
  console.log(`   Farmers: ${farmers.length} | Experts: ${experts.length} | Farms: ${farms.length}`);
  console.log(`   Crop Cycles: ${cropCycles.length} | Diagnosis Cases: ${cases.length}`);
  console.log(`   Hotspot cluster centered near: ${clusterCenterLat.toFixed(4)}, ${clusterCenterLng.toFixed(4)}`);
  console.log('\nTry these after seeding:');
  console.log('   GET /api/hotspots');
  console.log(`   GET /api/risk/${farms[0]?.id}`);
  console.log(`   GET /api/farms/farmer/${farmers[0]?.id}`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  });
