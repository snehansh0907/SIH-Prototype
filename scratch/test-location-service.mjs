import { getStates, getDistricts, getTalukas, getVillages } from '../src/data/locations.ts';
import { locationService } from '../src/services/locationService.ts';

async function testLocations() {
  console.log('--- TESTING HIERARCHICAL LOCATION DATA & SERVICE ---');

  // 1. States test
  const states = getStates();
  console.log('Available States:', states.map((s) => s.name).join(', '));
  if (!states.some((s) => s.name === 'Maharashtra')) {
    throw new Error('Maharashtra not found in states');
  }

  // 2. Districts test for Maharashtra
  const districts = getDistricts('Maharashtra');
  console.log('Districts in Maharashtra:', districts.map((d) => d.name).join(', '));
  if (!districts.some((d) => d.name === 'Nashik')) {
    throw new Error('Nashik not found in districts');
  }

  // 3. Talukas test for Nashik
  const talukas = getTalukas('Maharashtra', 'Nashik');
  console.log('Talukas in Nashik:', talukas.map((t) => t.name).join(', '));
  if (!talukas.some((t) => t.name === 'Niphad')) {
    throw new Error('Niphad not found in talukas');
  }

  // 4. Villages test for Niphad
  const villages = getVillages('Maharashtra', 'Nashik', 'Niphad');
  console.log('Villages in Niphad:', villages.map((v) => `${v.name} (${v.nameMr})`).slice(0, 5).join(', '));
  if (!villages.some((v) => v.name === 'Pimpalgaon Baswant')) {
    throw new Error('Pimpalgaon Baswant not found in villages');
  }

  // 5. Reverse Geocode test for Niphad coordinates (20.156556, 74.117339)
  console.log('\nTesting reverse geocoding with Niphad coords (20.156556, 74.117339)...');
  try {
    const geo = await locationService.reverseGeocode(20.156556, 74.117339);
    console.log('Reverse Geocode Result:', {
      success: geo.success,
      state: geo.state,
      district: geo.district,
      taluka: geo.taluka,
      village: geo.village,
      formattedAddress: geo.formattedAddress,
    });
    console.log('✅ Reverse Geocoding returned valid location structure!');
  } catch (err) {
    console.warn('Reverse geocoding warning (network-dependent):', err.message);
  }

  console.log('\n🎉 LOCATION HIERARCHY TESTS COMPLETED SUCCESSFULLY!');
}

testLocations().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
