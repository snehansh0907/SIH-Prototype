import { locationService } from '../src/services/locationService.ts';

async function testGeolocationAndSearch() {
  console.log('=== 1. TESTING REVERSE GEOCODING ACROSS MULTIPLE INDIAN REGIONS ===');
  
  const testCoords = [
    { name: 'Delhi', lat: 28.6139, lon: 77.2090 },
    { name: 'Bengaluru (Karnataka)', lat: 12.9716, lon: 77.5946 },
    { name: 'Jaipur (Rajasthan)', lat: 26.9124, lon: 75.7873 },
    { name: 'Nashik (Maharashtra)', lat: 20.0797, lon: 74.1071 }
  ];

  for (const c of testCoords) {
    const res = await locationService.reverseGeocode(c.lat, c.lon);
    console.log(`[${c.name}] => State: ${res.state} | District: ${res.district} | Taluka: ${res.taluka} | Village/City: ${res.village}`);
    if (!res.state) {
      throw new Error(`Failed to resolve state for ${c.name}`);
    }
  }

  console.log('\n=== 2. TESTING INDIA-WIDE SEARCH ===');
  const searchQueries = ['Niphad', '422303', 'Jaipur', 'Varanasi'];
  for (const q of searchQueries) {
    const results = await locationService.searchLocation(q);
    console.log(`Query "${q}" => ${results.length} results found`);
    if (results.length > 0) {
      console.log(`   Top result: ${results[0].displayName} (${results[0].latitude}, ${results[0].longitude})`);
    } else {
      throw new Error(`No results for "${q}"`);
    }
  }

  console.log('\n=== 3. TESTING GEOLOCATION ERROR CODE MAPPINGS ===');
  // Mock navigator.geolocation error scenarios
  const errorScenarios = [
    { code: 1, name: 'PERMISSION_DENIED', expected: 'Location permission was denied. Please allow location access in your browser settings.' },
    { code: 2, name: 'POSITION_UNAVAILABLE', expected: 'Your current location could not be determined. Please search for your location manually.' },
    { code: 3, name: 'TIMEOUT', expected: 'Location detection took too long. Please try again or search manually.' },
    { code: 99, name: 'UNKNOWN', expected: 'Unable to detect your location. Please search manually.' }
  ];

  for (const scenario of errorScenarios) {
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        geolocation: {
          getCurrentPosition: (_success, errorCallback) => {
            errorCallback({ code: scenario.code, message: 'Mock error message', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 });
          }
        }
      },
      configurable: true,
      writable: true,
    });

    try {
      await locationService.getCurrentCoordinates();
      throw new Error('Should have thrown error');
    } catch (err) {
      if (err.message === scenario.expected) {
        console.log(`✅ [${scenario.name}] correctly produced: "${err.message}"`);
      } else {
        throw new Error(`Expected "${scenario.expected}" but got "${err.message}"`);
      }
    }
  }

  console.log('\n=== 4. TESTING GEOLOCATION SUCCESS WITH HIGH ACCURACY OFF & PROPER TIMEOUT ===');
  let capturedOptions = null;
  Object.defineProperty(globalThis, 'navigator', {
    value: {
      geolocation: {
        getCurrentPosition: (successCallback, _errorCallback, options) => {
          capturedOptions = options;
          successCallback({
            coords: {
              latitude: 19.0760,
              longitude: 72.8777
            }
          });
        }
      }
    },
    configurable: true,
    writable: true,
  });

  const successCoords = await locationService.getCurrentCoordinates();
  console.log(`Coordinates received: ${successCoords.latitude}, ${successCoords.longitude}`);
  console.log('Captured Options:', capturedOptions);

  if (capturedOptions.enableHighAccuracy !== false) {
    throw new Error('enableHighAccuracy must be false');
  }
  if (capturedOptions.timeout !== 15000) {
    throw new Error('timeout must be 15000');
  }
  if (capturedOptions.maximumAge !== 60000) {
    throw new Error('maximumAge must be 60000');
  }
  console.log('✅ Geolocation options verified (enableHighAccuracy: false, timeout: 15000, maximumAge: 60000)');

  console.log('\n🎉 ALL GEOLOCATION TESTS PASSED PERFECTLY!');
}

testGeolocationAndSearch().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
