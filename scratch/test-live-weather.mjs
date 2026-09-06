// scratch/test-live-weather.mjs
const coords = [
  { name: 'Niphad', lat: 20.156556, lng: 74.117339 },
  { name: 'Chandori', lat: 20.0797, lng: 74.0322 },
  { name: 'Ozar', lat: 20.0927, lng: 73.9189 },
];

async function run() {
  for (const c of coords) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lng}&current=temperature_2m,relative_humidity_2m,precipitation,rain&daily=precipitation_probability_max,temperature_2m_max,temperature_2m_min&timezone=auto`;
    const res = await fetch(url);
    const data = await res.json();
    console.log(`=== ${c.name} (${c.lat}, ${c.lng}) ===`);
    console.log(`Temp: ${data.current?.temperature_2m}°C`);
    console.log(`Humidity: ${data.current?.relative_humidity_2m}%`);
    console.log(`Rain Probability Max: ${data.daily?.precipitation_probability_max?.[0]}%`);
    console.log(`Precipitation: ${data.current?.precipitation} mm`);
    console.log('');
  }
}

run().catch(console.error);
