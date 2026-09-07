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

  // ---------------------- SUGARCANE ----------------------
  {
    crop_name: 'Sugarcane',
    disease_name: 'Red Rot',
    scientific_name: 'Colletotrichum falcatum',
    description:
      'A destructive fungal disease of sugarcane causing internal reddening of the stalk with characteristic white cross-bands, leaf yellowing, and drying of crowns.',
    how_it_spreads: [
      'Primarily through infected seed setts used for planting',
      'Fungal spores spread via irrigation water and rainwater runoff',
      'Survives in crop residue and infected soil for multiple seasons',
    ],
    prevention_steps: [
      'Use certified disease-free and heat-treated seed setts',
      'Grow red-rot resistant varieties recommended for the region',
      'Ensure proper field drainage and avoid water stagnation',
      'Practice crop rotation with non-host crops like paddy or legumes',
    ],
    remedy_steps: [
      'Cultural: Uproot and burn infected clumps immediately to prevent spread; avoid ratooning infected fields',
      'Mechanical: Maintain clean irrigation channels and avoid using runoff water from affected fields',
      'Biological: Treat setts with Trichoderma viride or Trichoderma harzianum formulation before planting',
      'Chemical (preventive/sett treatment): Dip seed setts in Carbendazim 50% WP or Thiophanate methyl solution prior to planting',
    ],
    safe_dosage: [
      'Carbendazim 50% WP: 1 g/litre of water for sett soaking for 15-20 minutes before planting',
      'Always follow label instructions and observe recommended safety intervals',
    ],
    ipm_priority_order: IPM_PRIORITY_ORDER,
  },
  {
    crop_name: 'Sugarcane',
    disease_name: 'Wilt',
    scientific_name: 'Fusarium sacchari',
    description:
      'A fungal vascular disease causing gradual yellowing and withering of crown leaves, pith drying, and hollow stems with reddish-purple discoloration.',
    how_it_spreads: [
      'Soil-borne and sett-borne fungal pathogen',
      'Enters plants through root injuries, nematode wounds, or borer entry holes',
      'Accelerated by drought stress followed by waterlogging conditions',
    ],
    prevention_steps: [
      'Select healthy, disease-free seed cane from certified nurseries',
      'Avoid planting in wilt-sick soils or rotate with green manure crops',
      'Manage root borers and nematodes that facilitate fungal entry',
      'Avoid moisture stress during peak formative growth stages',
    ],
    remedy_steps: [
      'Cultural: Rogue out and destroy affected clumps early; practice 2-3 year crop rotation',
      'Mechanical: Prevent root damage during intercultural operations and cultivation',
      'Biological: Apply Trichoderma viride enriched in well-decomposed farmyard manure (FYM) to soil',
      'Chemical: Dip setts in Carbendazim 50% WP solution before planting; drench root zone in early stages if infection is localized',
    ],
    safe_dosage: [
      'Carbendazim 50% WP: 1-2 g/litre of water for sett treatment (consult local Krishi Vigyan Kendra)',
    ],
    ipm_priority_order: IPM_PRIORITY_ORDER,
  },

  // ---------------------- MAIZE ----------------------
  {
    crop_name: 'Maize',
    disease_name: 'Turcicum Leaf Blight',
    scientific_name: 'Exserohilum turcicum',
    description:
      'A major fungal leaf blight producing long, elliptical, spindle-shaped greyish-green to tan lesions that coalesce and cause extensive leaf scorching.',
    how_it_spreads: [
      'Airborne conidia carried by wind and splashing rain',
      'Thrives in cool to moderate temperatures (18-27°C) with high relative humidity and heavy dew',
      'Survives in infected maize residue on the soil surface',
    ],
    prevention_steps: [
      'Plant resistant or tolerant maize hybrids recommended for the zone',
      'Practice deep summer plowing to bury crop residues',
      'Avoid high plant density to improve canopy aeration',
      'Follow balanced fertilization and avoid excessive nitrogen application',
    ],
    remedy_steps: [
      'Cultural: Collect and destroy crop residues after harvest; rogue severely blighted lower leaves',
      'Mechanical: Maintain optimum plant spacing to reduce leaf wetness duration',
      'Biological: Apply Pseudomonas fluorescens or Trichoderma viride based bio-fungicide foliar spray',
      'Chemical (at symptom onset): Spray Mancozeb or Azoxystrobin + Difenoconazole if lesions appear before silking',
    ],
    safe_dosage: [
      'Mancozeb 75% WP: 2-2.5 g/litre of water; or Azoxystrobin 18.2% + Difenoconazole 11.4% SC: 1 ml/litre',
      'Apply at first sign of disease and repeat after 10-14 days if humid conditions persist',
    ],
    ipm_priority_order: IPM_PRIORITY_ORDER,
  },
  {
    crop_name: 'Maize',
    disease_name: 'Maydis Leaf Blight',
    scientific_name: 'Bipolaris maydis',
    description:
      'A fungal disease producing small, elongated rectangular or diamond-shaped lesions between leaf veins, causing premature leaf drying and lodging.',
    how_it_spreads: [
      'Wind-borne spores and rain splash from lower leaves to upper canopy',
      'Favoured by warm (20-32°C) and humid weather conditions',
      'Overwinters on infected maize stubble and volunteer host grasses',
    ],
    prevention_steps: [
      'Use certified disease-resistant hybrid seeds',
      'Rotate crops with pulses or oilseeds for at least one season',
      'Destroy previous crop stubble by plowing into the soil',
      'Ensure balanced soil nutrition with adequate potassium',
    ],
    remedy_steps: [
      'Cultural: Remove and burn infected lower leaves in smallholder plots',
      'Mechanical: Keep field borders free from wild grasses and weed hosts',
      'Biological: Treat seed with Trichoderma harzianum @ 4 g/kg seed before sowing',
      'Chemical (only if disease pressure is high): Spray Mancozeb 75% WP or Zineb 75% WP at early lesion formation',
    ],
    safe_dosage: [
      'Mancozeb 75% WP: 2.5 g/litre of water as foliar spray (consult local agriculture officer)',
    ],
    ipm_priority_order: IPM_PRIORITY_ORDER,
  },

  // ---------------------- ONION ----------------------
  {
    crop_name: 'Onion',
    disease_name: 'Purple Blotch',
    scientific_name: 'Alternaria porri',
    description:
      'A common foliar fungal disease causing small water-soaked lesions that turn brown to purplish with distinct yellow halos, blighting leaves and reducing bulb yield.',
    how_it_spreads: [
      'Spores spread by wind and rain splash during warm, humid weather',
      'Requires prolonged leaf wetness (dew or rain) and 21-30°C temperature',
      'Survives in crop debris and infected onion seed or sets',
    ],
    prevention_steps: [
      'Use certified disease-free seeds or sets from reliable nurseries',
      'Adopt a 2-3 year crop rotation without allium crops (onion, garlic, leek)',
      'Avoid excessive overhead irrigation; prefer drip or furrow irrigation',
      'Maintain proper plant spacing for sunlight penetration and fast foliage drying',
    ],
    remedy_steps: [
      'Cultural: Avoid late-evening irrigations; destroy infected crop residue post harvest',
      'Mechanical: Hand-pick and remove severely infected leaf tips early in the morning',
      'Biological: Foliar application of Trichoderma viride or Pseudomonas fluorescens @ 5 g/litre',
      'Chemical: Foliar spray of Mancozeb 75% WP or Difenoconazole 25% EC with a sticker/spreader agent',
    ],
    safe_dosage: [
      'Mancozeb 75% WP: 2.5 g/litre of water + sticker (0.5 ml/L); or Difenoconazole 25% EC: 1 ml/litre',
      'Spray at 10-15 day intervals upon first appearance of purple lesions',
    ],
    ipm_priority_order: IPM_PRIORITY_ORDER,
  },
  {
    crop_name: 'Onion',
    disease_name: 'Stemphylium Blight',
    scientific_name: 'Stemphylium vesicarium',
    description:
      'A fungal foliage disease forming small yellow-to-orange flecks that expand into elongated light brown to dark blighted patches, causing leaf dieback from tips downwards.',
    how_it_spreads: [
      'Airborne spores carried by wind during cool to warm humid spells',
      'Frequently attacks leaves already weakened by thrips injury or purple blotch',
      'Overwinters on infected plant debris and volunteer allium plants',
    ],
    prevention_steps: [
      'Control thrips infestations early, as feeding injuries predispose leaves to infection',
      'Practice crop rotation and avoid planting contiguous onion fields',
      'Maintain good soil drainage and avoid waterlogging conditions',
      'Avoid excess nitrogenous fertilizers which promote soft, susceptible leaf growth',
    ],
    remedy_steps: [
      'Cultural: Rogue out and bury severely blighted foliage; avoid working in wet fields',
      'Mechanical: Maintain wider spacing between beds to improve airflow',
      'Biological: Dip seedling roots in Trichoderma viride suspension prior to transplanting',
      'Chemical: Apply Tebuconazole + Trifloxystrobin or Mancozeb as foliar spray with adhesive sticker',
    ],
    safe_dosage: [
      'Tebuconazole 50% + Trifloxystrobin 25% WG: 0.6-0.8 g/litre of water with agricultural wetting agent',
    ],
    ipm_priority_order: IPM_PRIORITY_ORDER,
  },

  // ---------------------- RICE ----------------------
  {
    crop_name: 'Rice',
    disease_name: 'Rice Blast',
    scientific_name: 'Magnaporthe oryzae',
    description:
      'A highly destructive fungal disease producing spindle-shaped lesions with greyish-white centres and brown margins on leaves, collars, nodes, and panicle necks.',
    how_it_spreads: [
      'Airborne fungal spores distributed widely by wind and rain',
      'Favoured by high relative humidity (>90%), dew, cloudy skies, and cool night temperatures (18-24°C)',
      'Heavily promoted by excessive nitrogen fertilizer application',
    ],
    prevention_steps: [
      'Cultivate blast-resistant or tolerant paddy varieties',
      'Treat seeds with bio-agent or fungicide before nursery sowing',
      'Apply nitrogen fertilizer in split doses rather than large single applications',
      'Maintain proper water depth in the paddy field; avoid letting the soil dry out',
    ],
    remedy_steps: [
      'Cultural: Avoid excessive urea top-dressing; apply balanced potash to enhance resistance',
      'Mechanical: Clean field bunds of alternate weed hosts (e.g. Echinochloa grass)',
      'Biological: Seed treatment and nursery spray with Pseudomonas fluorescens @ 10 g/kg seed',
      'Chemical (on appearance of lesions): Spray Tricyclazole 75% WP or Isoprothiolane 40% EC at early tillering or panicle emergence',
    ],
    safe_dosage: [
      'Tricyclazole 75% WP: 0.6 g/litre of water (first spray at initial tillering, repeat at boot-leaf stage if needed)',
    ],
    ipm_priority_order: IPM_PRIORITY_ORDER,
  },
  {
    crop_name: 'Rice',
    disease_name: 'Bacterial Leaf Blight',
    scientific_name: 'Xanthomonas oryzae pv. oryzae',
    description:
      'A devastating bacterial disease causing water-soaked to yellowish-white wavy stripes along leaf margins progressing downwards, causing leaf wilting and "kresek" in early stages.',
    how_it_spreads: [
      'Bacterial cells spread via irrigation water, rain splash, wind, and typhoons',
      'Enters plants through hydathodes (leaf margin pores) or wounds caused during transplanting',
      'Thrives in warm temperatures (25-34°C) and high humidity with severe winds',
    ],
    prevention_steps: [
      'Plant certified disease-free seed and resistant paddy cultivars',
      'Avoid clipping seedling leaf tips during transplanting',
      'Ensure proper water management; avoid deep continuous flooding',
      'Avoid excess nitrogen; ensure split applications along with recommended potassium',
    ],
    remedy_steps: [
      'Cultural: Drain water from the field temporarily for 3-4 days to arrest bacterial spread; stop nitrogen top-dressing during active blight',
      'Mechanical: Eradicate weed hosts on bunds that harbour the bacterial pathogen',
      'Biological: Foliar spray of bio-agent Bacillus amyloliquefaciens or Pseudomonas fluorescens',
      'Chemical: Spray Copper oxychloride 50% WP combined with Streptocycline (or Plantomycin) as per local expert recommendations',
    ],
    safe_dosage: [
      'Copper oxychloride 50% WP (2 g/litre) + Streptocycline (0.1 g/litre of water); spray twice at 10-12 day intervals',
    ],
    ipm_priority_order: IPM_PRIORITY_ORDER,
  },

  // ---------------------- WHEAT ----------------------
  {
    crop_name: 'Wheat',
    disease_name: 'Stripe Rust (Yellow Rust)',
    scientific_name: 'Puccinia striiformis f. sp. tritici',
    description:
      'A major fungal rust forming vivid yellow-orange powdery pustules arranged in prominent linear stripes along leaf blades and sheaths, reducing grain filling.',
    how_it_spreads: [
      'Wind-borne urediniospores carried over hundreds of kilometres from Himalayan foothills or cooler zones',
      'Favoured by cool temperatures (10-15°C), high humidity, intermittent rains, and morning dew',
      'Rapidly spreads in dense canopies during winter months (December to February)',
    ],
    prevention_steps: [
      'Sow recommended yellow rust-resistant wheat varieties (e.g. DBW / HD series)',
      'Complete timely sowing before mid-November to avoid peak rust weather at heading stage',
      'Avoid excessive vegetative growth by balancing nitrogen with adequate phosphorus and potassium',
      'Scout fields weekly during winter, focusing on shady and humid field edges',
    ],
    remedy_steps: [
      'Cultural: Destroy volunteer wheat plants and alternate grass hosts in surrounding areas',
      'Mechanical: Monitor microclimates and mark initial foci patches for localized intervention',
      'Biological: Soil and seed application of Trichoderma viride enriched organic manure',
      'Chemical (immediately upon detecting yellow stripes): Spray Propiconazole 25% EC or Tebuconazole 25.9% EC on foliage',
    ],
    safe_dosage: [
      'Propiconazole 25% EC: 1 ml/litre of water (approx 200 ml in 200 L water per acre; spray immediately on spotting yellow pustule stripes)',
    ],
    ipm_priority_order: IPM_PRIORITY_ORDER,
  },
  {
    crop_name: 'Wheat',
    disease_name: 'Loose Smut',
    scientific_name: 'Ustilago tritici',
    description:
      'A seed-borne fungal disease that completely converts wheat earheads into a black powdery mass of smut spores covered by a delicate membrane that ruptures, leaving a bare rachis.',
    how_it_spreads: [
      'Internally seed-borne pathogen dormant inside the seed embryo',
      'Wind carries smut spores from infected heads to open florets of healthy wheat during flowering',
      'Infected seeds appear completely normal and cannot be distinguished visually from healthy seeds',
    ],
    prevention_steps: [
      'Sow only certified smut-free seed procured from recognized agricultural agencies',
      'Mandatory seed dressing with systemic fungicide before sowing',
      'Practice solar heat seed treatment: soak seed in water for 4 hours then spread in blazing sun in May-June',
      'Rogue out smutted heads early before spores disperse',
    ],
    remedy_steps: [
      'Cultural: Practice solar heat or hot water seed treatment (52°C for 10-15 minutes) prior to planting season',
      'Mechanical: Rogue out infected smutted earheads inside paper or polythene bags early in the morning and burn them to prevent spore release',
      'Biological: Treat seeds with Trichoderma viride formulation @ 4-5 g/kg seed before sowing',
      'Chemical (seed treatment - curative only before planting): Mandatory seed dressing with Carboxin 75% WP or Tebuconazole 2% DS',
    ],
    safe_dosage: [
      'Carboxin 37.5% + Thiram 37.5% WS @ 2.5 g/kg seed; or Tebuconazole 2% DS @ 1.5 g/kg seed (strictly seed treatment, no standing crop foliar spray)',
    ],
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
