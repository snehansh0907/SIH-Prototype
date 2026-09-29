// =========================================================
// Pashu Sarthak - Epidemic Triage & Outbreak Configuration
// Problem Statement 26128 - Govt. of Maharashtra
// =========================================================

module.exports = {
  // Spatio-temporal cluster evaluation parameters
  OUTBREAK_RADIUS_KM: 5.0, // Radius in kilometers to cluster nearby animal health cases
  OUTBREAK_TIME_WINDOW_DAYS: 7, // Temporal lookback window in days

  // Thresholds to automatically declare a "Suspected Outbreak"
  SYMPTOM_CASE_THRESHOLD: 3, // 3+ symptom cases of the same disease within 5km & 7 days
  MORTALITY_CASE_THRESHOLD: 2, // 2+ mortality reports (mortality is weighted higher as a fatal outbreak signal)
  COMBINED_WEIGHTED_THRESHOLD: 3.0, // Weighted sum: 1 mortality (1.5) + 2 symptoms (1.0 each) = 3.5

  // Weight multipliers
  MORTALITY_WEIGHT: 1.5,
  SYMPTOM_WEIGHT: 1.0,

  // Default coordinate center (Niphad Taluka Central, Nashik District)
  DEFAULT_LATITUDE: 20.0825,
  DEFAULT_LONGITUDE: 74.1112,

  // Contagious diseases that trigger immediate high-priority alerts
  HIGH_PRIORITY_EPI_DISEASES: [
    'lumpy skin disease',
    'anthrax',
    'hemorrhagic septicemia',
    'hs',
    'black quarter',
    'bq',
    'foot and mouth disease',
    'fmd',
    'peste des petits ruminants',
    'ppr',
    'avian influenza',
    'bird flu',
  ],
};
