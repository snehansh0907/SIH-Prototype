// =========================================================
// Disease Knowledge Base
// =========================================================
// Static IPM (Integrated Pest Management) knowledge used by:
//   - the mock diagnosis layer (diagnosisController)
//   - the advisory service (advisoryService)
//   - the seed script (seed.js)
//
// This same data is also inserted into the `diseases` table
// in Supabase so it can be queried/edited from the DB later.
//
// IPM PRIORITY ORDER (always followed):
//   1. Cultural practices
//   2. Mechanical controls
//   3. Biological controls
//   4. Chemical intervention (only when necessary, last resort)
// =========================================================

const IPM_PRIORITY_ORDER = ['cultural', 'mechanical', 'biological', 'chemical'];

const DISEASE_KNOWLEDGE_BASE = [
  // ---------------------- TOMATO ----------------------
  {
    crop_name: 'Tomato',
    disease_name: 'Early Blight',
    scientific_name: 'Alternaria solani',
    description:
      'A fungal disease causing dark concentric-ring spots on older leaves, which can spread to stems and fruit if untreated.',
    how_it_spreads: [
      'Fungal spores splash from soil onto lower leaves during rain or overhead irrigation',
      'Spreads faster in warm, humid weather (24-29°C)',
      'Survives in infected plant debris left in the field',
    ],
    prevention_steps: [
      'Rotate crops - avoid planting tomato/potato in the same field for 2 seasons',
      'Remove and destroy infected plant debris after harvest',
      'Use drip irrigation instead of overhead sprinklers to keep leaves dry',
      'Maintain proper plant spacing for airflow',
    ],
    remedy_steps: [
      'Cultural: Remove and destroy infected lower leaves immediately',
      'Mechanical: Prune for better air circulation; avoid working in fields when plants are wet',
      'Biological: Apply Trichoderma viride or Bacillus subtilis based bio-fungicides',
      'Chemical (only if severity is high): Apply a copper oxychloride or Mancozeb based fungicide as per label dosage',
    ],
    safe_dosage: [
      'Copper oxychloride 50% WP: 2.5 g/litre of water (only under high severity, consult local Krishi Kendra)',
      'Always follow pre-harvest interval mentioned on the product label',
    ],
    ipm_priority_order: IPM_PRIORITY_ORDER,
  },
  {
    crop_name: 'Tomato',
    disease_name: 'Late Blight',
    scientific_name: 'Phytophthora infestans',
    description:
      'A fast-spreading and destructive disease causing water-soaked patches on leaves that turn brown/black, often with white fungal growth on the underside.',
    how_it_spreads: [
      'Spreads rapidly in cool, wet, and humid conditions',
      'Airborne spores travel long distances with wind and rain',
      'Can destroy an entire field within days if unmanaged',
    ],
    prevention_steps: [
      'Use certified disease-free seedlings',
      'Avoid overhead irrigation, especially in the evening',
      'Ensure good field drainage to avoid waterlogging',
      'Monitor fields daily during cool, humid weather',
    ],
    remedy_steps: [
      'Cultural: Remove and bury/destroy infected plants immediately to stop spread',
      'Mechanical: Improve field drainage and spacing between plants',
      'Biological: Use Bacillus subtilis or Pseudomonas fluorescens based bio-agents preventively',
      'Chemical (only if spreading fast): Apply Metalaxyl + Mancozeb combination fungicide as per label',
    ],
    safe_dosage: [
      'Metalaxyl 8% + Mancozeb 64% WP: 2 g/litre of water (use only under expert guidance)',
    ],
    ipm_priority_order: IPM_PRIORITY_ORDER,
  },
  {
    crop_name: 'Tomato',
    disease_name: 'Leaf Mold',
    scientific_name: 'Passalora fulva',
    description:
      'A fungal disease common in humid/greenhouse conditions, causing pale yellow spots on the upper leaf surface with olive-green mold underneath.',
    how_it_spreads: [
      'Thrives in high humidity (above 85%) and poor ventilation',
      'Spreads through air currents and water splash',
      'Common in polyhouse/greenhouse tomato cultivation',
    ],
    prevention_steps: [
      'Improve ventilation in greenhouses/polyhouses',
      'Avoid excess humidity by controlled watering',
      'Use resistant tomato varieties where available',
    ],
    remedy_steps: [
      'Cultural: Increase spacing and ventilation, reduce humidity',
      'Mechanical: Remove and destroy affected leaves',
      'Biological: Apply Trichoderma-based bio-fungicide',
      'Chemical (last resort): Chlorothalonil-based fungicide as per label dosage',
    ],
    safe_dosage: ['Chlorothalonil 75% WP: 2 g/litre of water (only if biological control fails)'],
    ipm_priority_order: IPM_PRIORITY_ORDER,
  },

  // ---------------------- COTTON ----------------------
  {
    crop_name: 'Cotton',
    disease_name: 'Leaf Curl Disease',
    scientific_name: 'Cotton Leaf Curl Virus (CLCuV)',
    description:
      'A viral disease transmitted by whiteflies causing upward/downward curling of leaves, thickened veins, and stunted growth.',
    how_it_spreads: [
      'Transmitted primarily by whitefly (Bemisia tabaci)',
      'Spreads faster in warm weather with high whitefly populations',
      'Can spread from infected weeds/host plants nearby',
    ],
    prevention_steps: [
      'Use virus-resistant/tolerant cotton varieties',
      'Control whitefly population through yellow sticky traps',
      'Remove weed hosts around the field',
      'Avoid late sowing which increases whitefly exposure',
    ],
    remedy_steps: [
      'Cultural: Remove and destroy severely infected plants to reduce virus source',
      'Mechanical: Install yellow sticky traps to monitor/reduce whitefly population',
      'Biological: Encourage natural predators like ladybird beetles; use neem-based formulations',
      'Chemical (only for severe whitefly outbreaks): Use recommended systemic insecticide as per label, rotating chemical groups to avoid resistance',
    ],
    safe_dosage: [
      'Neem oil (1500 ppm): 3-5 ml/litre of water as a preventive spray',
      'Consult local agriculture officer before using systemic insecticides for whitefly control',
    ],
    ipm_priority_order: IPM_PRIORITY_ORDER,
  },
  {
    crop_name: 'Cotton',
    disease_name: 'Bollworm Related Damage',
    scientific_name: 'Helicoverpa armigera / Pectinophora gossypiella',
    description:
      'Damage caused by bollworm larvae boring into cotton bolls and squares, leading to boll drop and reduced fiber quality.',
    how_it_spreads: [
      'Adult moths lay eggs on leaves/squares; larvae bore into bolls after hatching',
      'Population increases rapidly in warm weather with continuous cotton cultivation',
      'Spreads across fields as moths migrate',
    ],
    prevention_steps: [
      'Practice crop rotation and destroy crop residue after harvest',
      'Use pheromone traps to monitor moth activity early',
      'Grow trap crops like marigold around the field border',
      'Avoid excessive nitrogen fertilizer which encourages lush growth attractive to pests',
    ],
    remedy_steps: [
      'Cultural: Remove and destroy damaged bolls/squares regularly',
      'Mechanical: Hand-pick larvae in small fields; use pheromone traps (5/acre)',
      'Biological: Release Trichogramma parasitoids or apply Bt (Bacillus thuringiensis) based bio-pesticide',
      'Chemical (only above economic threshold level): Use recommended insecticide as per label, rotating modes of action',
    ],
    safe_dosage: [
      'Bt (Bacillus thuringiensis) formulation: 1-2 g/litre of water in the evening',
      'Chemical sprays only after confirming pest crosses Economic Threshold Level (ETL) - consult local Krishi Kendra',
    ],
    ipm_priority_order: IPM_PRIORITY_ORDER,
  },

  // ---------------------- SOYBEAN ----------------------
  {
    crop_name: 'Soybean',
    disease_name: 'Rust',
    scientific_name: 'Phakopsora pachyrhizi',
    description:
      'A fungal disease producing small reddish-brown to tan pustules mainly on the underside of leaves, causing premature leaf drop.',
    how_it_spreads: [
      'Spores spread through wind over long distances',
      'Favoured by high humidity, leaf wetness, and moderate temperatures (20-28°C)',
      'Can spread quickly during monsoon season',
    ],
    prevention_steps: [
      'Use early-maturing and rust-tolerant varieties where available',
      'Avoid very close plant spacing to allow airflow',
      'Monitor fields regularly during the flowering to pod-filling stage',
    ],
    remedy_steps: [
      'Cultural: Remove volunteer/self-sown soybean plants that can carry infection between seasons',
      'Mechanical: Ensure proper drainage and spacing to reduce leaf wetness duration',
      'Biological: Apply Trichoderma-based seed treatment/soil application preventively',
      'Chemical (if rust is spreading rapidly): Apply a triazole or strobilurin based fungicide as per label',
    ],
    safe_dosage: [
      'Hexaconazole 5% EC: 2 ml/litre of water (only if rust is confirmed and spreading, consult expert)',
    ],
    ipm_priority_order: IPM_PRIORITY_ORDER,
  },
  {
    crop_name: 'Soybean',
    disease_name: 'Leaf Spot',
    scientific_name: 'Cercospora sojina / Septoria glycines',
    description:
      'A fungal disease causing small brown/grey angular spots on leaves that can merge, leading to premature defoliation.',
    how_it_spreads: [
      'Spreads through infected seed and crop residue',
      'Favoured by warm, humid weather with frequent rainfall',
      'Splashes from soil to lower leaves during rain',
    ],
    prevention_steps: [
      'Use certified, disease-free seed',
      'Practice crop rotation with non-host crops',
      'Remove and destroy infected crop residue after harvest',
    ],
    remedy_steps: [
      'Cultural: Remove severely infected lower leaves and residue',
      'Mechanical: Improve field drainage and airflow through proper spacing',
      'Biological: Apply Trichoderma viride based seed/soil treatment',
      'Chemical (only when infection is severe): Apply Mancozeb or Carbendazim based fungicide as per label',
    ],
    safe_dosage: ['Mancozeb 75% WP: 2.5 g/litre of water (only under high severity)'],
    ipm_priority_order: IPM_PRIORITY_ORDER,
  },
];

// Helper: look up a disease record by crop + disease name (case-insensitive)
function findDisease(cropName, diseaseName) {
  if (!cropName || !diseaseName) return null;
  return (
    DISEASE_KNOWLEDGE_BASE.find(
      (d) =>
        d.crop_name.toLowerCase() === cropName.toLowerCase() &&
        d.disease_name.toLowerCase() === diseaseName.toLowerCase()
    ) || null
  );
}

// Helper: get all diseases for a given crop
function getDiseasesByCrop(cropName) {
  if (!cropName) return [];
  return DISEASE_KNOWLEDGE_BASE.filter(
    (d) => d.crop_name.toLowerCase() === cropName.toLowerCase()
  );
}

module.exports = {
  DISEASE_KNOWLEDGE_BASE,
  IPM_PRIORITY_ORDER,
  findDisease,
  getDiseasesByCrop,
};
