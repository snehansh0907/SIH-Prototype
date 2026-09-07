import { generateIntelligentExpertResponse, expertService, type ExpertChatContext } from '../src/services/expertService';

console.log('=== TEST SUITE: EXPERT CHAT INTELLIGENCE ===\n');

// 1. Sugarcane Context (e.g. Snehansh Tripathy, Jaipur)
const sugarcaneContext: ExpertChatContext = {
  farmerName: 'Snehansh Tripathy',
  farmName: 'Tripathy Farms',
  cropName: 'Sugarcane',
  cropNameEn: 'Sugarcane',
  diseaseName: 'Red Rot',
  diseaseNameEn: 'Red Rot',
  severity: 'moderate',
  village: 'Amer',
  district: 'Jaipur',
  state: 'Rajasthan',
  humidity: 45,
  rainChance: 20,
  temperature: 31,
  language: 'en',
};

// 2. Wheat Context (e.g. Gurpreet Singh, Ludhiana)
const wheatContext: ExpertChatContext = {
  farmerName: 'Gurpreet Singh',
  farmName: 'Singh Krishi Farm',
  cropName: 'Wheat',
  cropNameEn: 'Wheat',
  diseaseName: 'Yellow Rust',
  diseaseNameEn: 'Yellow Rust',
  severity: 'high',
  village: 'Khanna',
  district: 'Ludhiana',
  state: 'Punjab',
  humidity: 70,
  rainChance: 40,
  temperature: 22,
  language: 'en',
};

// 3. Tomato Context (e.g. Ramesh Patil, Niphad)
const tomatoContext: ExpertChatContext = {
  farmerName: 'Ramesh Patil',
  farmName: 'Patil Farm',
  cropName: 'Tomato',
  cropNameEn: 'Tomato',
  diseaseName: 'Early Blight',
  diseaseNameEn: 'Early Blight',
  severity: 'moderate',
  village: 'Niphad',
  district: 'Nashik',
  state: 'Maharashtra',
  humidity: 78,
  rainChance: 60,
  temperature: 27,
  language: 'en',
};

const testQueries = [
  'Hello',
  'How are you?',
  'Who are you?',
  'Thank you',
  'What can you help me with?',
  'What should I do about my disease?',
  'What fungicide should I use?',
  'What is the meaning of quantum physics?',
  '?',
  'Can I spray before rain?',
  'Any organic alternative?',
];

let failures = 0;

console.log('--- TESTING SUGARCANE (RED ROT) ---');
for (const q of testQueries) {
  const res = generateIntelligentExpertResponse(q, sugarcaneContext);
  console.log(`\nUSER: "${q}"`);
  console.log(`EXPERT: "${res.text}"`);

  if (res.text.includes('temporarily offline')) {
    console.error(`FAIL: Triggered offline message for "${q}"!`);
    failures++;
  }
  if (q.includes('fungicide') && !res.text.toLowerCase().includes('carbendazim') && !res.text.toLowerCase().includes('thiophanate')) {
    console.error(`FAIL: Did not recommend Sugarcane specific treatment!`);
    failures++;
  }
  if (q.includes('What should I do') && !res.text.toLowerCase().includes('sugarcane')) {
    console.error(`FAIL: Sugarcane context missing in action steps!`);
    failures++;
  }
}

console.log('\n--- TESTING WHEAT (YELLOW RUST) ---');
const wheatAction = generateIntelligentExpertResponse('What should I do about my disease?', wheatContext);
console.log(`USER: "What should I do about my disease?"`);
console.log(`EXPERT: "${wheatAction.text}"`);
if (!wheatAction.text.toLowerCase().includes('wheat') || !wheatAction.text.toLowerCase().includes('propiconazole')) {
  console.error(`FAIL: Wheat yellow rust specific recommendation missing!`);
  failures++;
}

const wheatFungicide = generateIntelligentExpertResponse('What fungicide should I use?', wheatContext);
console.log(`USER: "What fungicide should I use?"`);
console.log(`EXPERT: "${wheatFungicide.text}"`);
if (!wheatFungicide.text.toLowerCase().includes('propiconazole') && !wheatFungicide.text.toLowerCase().includes('tebuconazole')) {
  console.error(`FAIL: Wheat fungicide recommendation missing!`);
  failures++;
}

console.log('\n--- TESTING TOMATO (EARLY BLIGHT) ---');
const tomatoAction = generateIntelligentExpertResponse('What should I do about my disease?', tomatoContext);
console.log(`USER: "What should I do about my disease?"`);
console.log(`EXPERT: "${tomatoAction.text}"`);
if (!tomatoAction.text.toLowerCase().includes('tomato')) {
  console.error(`FAIL: Tomato context missing!`);
  failures++;
}

// Test Session Isolation
console.log('\n--- TESTING SESSION ISOLATION ---');
const snehanshSession = expertService.getMessagesForUser('snehansh-id', sugarcaneContext);
const rameshSession = expertService.getMessagesForUser('ramesh-id', tomatoContext);

console.log('Snehansh initial greeting:', snehanshSession[0]?.text);
console.log('Ramesh initial greeting:', rameshSession[0]?.text);

if (!snehanshSession[0]?.text.includes('Sugarcane') || !snehanshSession[0]?.text.includes('Red Rot')) {
  console.error('FAIL: Snehansh session does not have Sugarcane / Red Rot!');
  failures++;
}

if (!rameshSession[0]?.text.includes('Tomato') || !rameshSession[0]?.text.includes('Early Blight')) {
  console.error('FAIL: Ramesh session does not have Tomato / Early Blight!');
  failures++;
}

if (failures === 0) {
  console.log('\n>>> ALL EXPERT CHAT TESTS PASSED WITH ZERO FAILURES! <<<');
} else {
  console.error(`\n>>> COMPLETED WITH ${failures} FAILURES <<<`);
  process.exit(1);
}
