// =========================================================
// Pashu Sarthak - Livestock Disease Knowledge Base
// SIH26128: Early Detection, Prevention & Management of Livestock Diseases
// Govt. of Maharashtra - Animal Husbandry Department
// =========================================================
// Authoritative clinical veterinary guidance for:
//   1. Lumpy Skin Disease (LSD) - Capripoxvirus
//   2. Foot-and-Mouth Disease (FMD) - Aphthovirus
//   3. Black Quarter (BQ) - Clostridium chauvoei
//   4. Hemorrhagic Septicemia (HS / Galghotu) - Pasteurella multocida
//   5. Bovine Mastitis - Bacterial Udder Infection
//   6. Healthy Animal / Baseline
//
// VETERINARY PROTOCOL HIERARCHY:
//   1. Immediate Quarantine & Physical Isolation
//   2. Biosecurity & Vector Control (Flies, Mosquitoes, Ticks)
//   3. Supportive & Antiseptic Care (Lesion washes, hydration, soft feeding)
//   4. Veterinary Escalation & Ring Vaccination (Govt. Dispensary / NADCP)
// =========================================================

const VET_PROTOCOL_ORDER = [
  'isolation_quarantine',
  'biosecurity_vector_control',
  'supportive_antiseptic_care',
  'veterinary_escalation_vaccination',
];

const DISEASE_KNOWLEDGE_BASE = [
  // -------------------------------------------------------------------------
  // 1. LUMPY SKIN DISEASE (LSD) - लंपी त्वचा रोग / लंपी चर्मरोग
  // -------------------------------------------------------------------------
  {
    species: 'Cattle',
    crop_name: 'Cattle', // Compatibility alias
    disease_name: 'Lumpy Skin Disease (LSD)',
    disease_name_hi: 'लंपी त्वचा रोग (LSD)',
    disease_name_mr: 'लंपी चर्मरोग (LSD)',
    scientific_name: 'Capripoxvirus (Poxviridae family)',
    severity_typical: 'high',
    affected_organs: 'Cutaneous skin nodules, superficial lymph nodes, muzzle, udder',
    description:
      'A viral transboundary infectious disease affecting cattle and water buffaloes, characterized by high fever, enlarged superficial lymph nodes, and multiple circumscribed firm cutaneous nodules (2-5 cm diameter) all over the body.',
    visual_symptoms: [
      'Firm, round, raised skin nodules (2 to 5 cm) on neck, back, head, udder, and limbs',
      'Nodules become necrotic, ulcerate forming deep "sitfast" scabs susceptible to fly maggots',
      'Enlarged prescapular and precrural lymph nodes palpable as firm swellings',
      'High pyrexia (fever 40-41.5°C / 104-106°F) lasting 1-3 days',
      'Copious bilateral serous to purulent nasal and ocular discharge',
      'Sudden drop in daily milk yield by 50-80% and rapid body emaciation',
      'Edema/swelling of the dewlap, brisket, and ventral abdomen',
    ],
    how_it_spreads: [
      'Primary transmission via hematophagous vector insects: biting flies (Stomoxys calcitrans), mosquitoes (Aedes, Culex), and hard ticks (Rhipicephalus appendiculatus)',
      'Direct contact with saliva, nasal secretions, and weeping skin scabs of infected animals',
      'Sharing contaminated community water troughs, feed mangers, and milking equipment',
      'Movement of cattle across inter-state animal markets and shared grazing pastures',
      'Iatrogenic transmission via repeated needle and syringe reuse during mass injections',
    ],
    prevention_steps: [
      'Strict vector control: Install fine insect netting in cattle sheds, eliminate stagnant slurry pools, and burn neem/camphor leaves for herbal smoke repellent',
      'Isolate all newly purchased or returned livestock for minimum 28 days before herd mixing',
      'Prohibit common grazing on village pastures during active regional outbreak alerts',
      'Annual vaccination with Heterologous Live Attenuated Goat Pox Vaccine (Uttarkashi strain) @ 3 ml S/C or Lumpi-ProVacInd under Animal Husbandry Department guidelines',
      'Disinfect shed premises twice weekly with 2% Virkon-S, 2-3% Sodium Hypochlorite, or 1% Formalin',
    ],
    remedy_steps: [
      'Quarantine: Immediately isolate the affected animal inside a separate, well-ventilated, fly-proof shed at least 50 meters away from healthy stock',
      'Antiseptic Wash: Clean ulcerated nodules twice daily with a dilute Potassium Permanganate (KMnO4) solution (1:1000 ratio, faint pink color) or cooled neem leaf decoction',
      'Wound Protection: Apply fly-repellent antiseptic ointment (Gamma benzene hexachloride + zinc oxide or Charma-Gel / Lorexane) on broken nodules to prevent secondary fly-strike and maggot infestation',
      'Supportive Nutrition: Provide easily digestible green fodder, soft mash with jaggery, electrolyte water, and oral multivitamins (Zinc, Vitamin A, E & H / Biotin) to boost epithelial repair',
      'Veterinary Escalation: Promptly report to the nearest Taluka Veterinary Dispensary or call Maharashtra Animal Husbandry Helpline 1962 for NSAIDs (Meloxicam/Paracetamol) and secondary broad-spectrum antibiotic cover',
    ],
    safe_dosage: [
      'Potassium Permanganate (KMnO4): 1 gram in 10 liters clean water (faint pink) for external skin wash twice daily',
      'Neem oil + Camphor: Topically applied over closed lumps as natural repellent against biting stable flies',
      'Meloxicam + Paracetamol (Melonex Plus): 0.5 mg/kg body weight under registered Veterinary Officer prescription only',
      'Goat Pox Vaccine (Preventive only for healthy in-contact herd): 3 ml S/C in neck region as per Govt. ring vaccination protocol',
    ],
    ipm_priority_order: VET_PROTOCOL_ORDER,
  },

  // -------------------------------------------------------------------------
  // 2. FOOT-AND-MOUTH DISEASE (FMD) - लाळ्या खुरकूत / खुरपका-मुंहपका
  // -------------------------------------------------------------------------
  {
    species: 'Cattle',
    crop_name: 'Cattle',
    disease_name: 'Foot-and-Mouth Disease (FMD)',
    disease_name_hi: 'खुरपका-मुंहपका रोग (FMD)',
    disease_name_mr: 'लाळ्या खुरकूत (FMD)',
    scientific_name: 'Aphthovirus (Picornaviridae family) - Serotypes O, A, Asia-1',
    severity_typical: 'high',
    affected_organs: 'Oral mucosa, dental pad, tongue, interdigital space, coronet band, teats',
    description:
      'A highly contagious acute viral disease of cloven-hoofed domestic animals (cattle, buffaloes, goats, sheep, pigs). Characterized by high fever, severe lameness, and painful vesicular eruptions that rupture into erosions on the mouth, tongue, dental pad, and feet.',
    visual_symptoms: [
      'Profuse ropy, stringy, frothy salivation hanging from mouth with characteristic lip smacking sound',
      'Painful vesicles and blanched blisters on tongue, dental pad, gums, inner cheeks, and muzzle',
      'Ruptured blisters leaving raw, bleeding, red erosive ulcers making eating impossible',
      'Severe lameness and reluctance to stand; animal shifts weight from foot to foot or stays recumbent',
      'Ulcers and raw lesions in the interdigital cleft and coronet band of hooves with foul smell',
      'High pyrexia (fever 40-41°C / 104-106°F) and extreme lethargy',
      'Vesicles on teats causing painful milking and acute secondary mastitis',
    ],
    how_it_spreads: [
      'Extremely contagious through aerosol inhalation; virus carried on wind over kilometers in humid air',
      'Direct contact with infectious saliva, vesicular fluid, milk, urine, and dung',
      'Indirect transmission via contaminated stock footwear, vehicle tires, milk cans, and fodder',
      'Spread through shared grazing paths, village water bodies, and livestock haats/fairs',
      'Calves consuming unboiled colostrum or milk from infected dams (causes fatal myocarditis / "tiger heart")',
    ],
    prevention_steps: [
      'Strict biannual vaccination under National Animal Disease Control Programme (NADCP) using oil-adjuvant trivalent FMD vaccine (O, A, Asia-1 strains)',
      'Install foot-dip at shed entry filled with 4% Sodium Carbonate (washing soda) or 2% Copper Sulphate',
      'Quarantine newly inducted cattle/buffaloes for 21 days with separate watering buckets',
      'Immediately halt movement of animals and ban milk collection vans from entering infected premises',
      'Boil all farm-produced milk prior to feeding newborn calves or home consumption',
    ],
    remedy_steps: [
      'Immediate Isolation: Confine affected animal to dry, clean, soft bedded stall (rice straw or sand). Restrict all animal movement off-premises',
      'Oral Lesion Care: Gently flush the mouth 2-3 times daily with a mild 1% to 2% Sodium Bicarbonate (baking soda) solution or 0.1% KMnO4 wash to soothe ulcers',
      'Foot-Bath & Hoof Dressing: Make the animal walk through a 2% Copper Sulphate or 1% Potassium Permanganate foot-bath. Clean interdigital cleft and apply fly-repellent antiseptic paste',
      'Soft Diet Management: Feed lukewarm liquid/semi-solid gruel (boiled rice kanji, ragi porridge, jaggery water, fine green wheatgrass) since the animal cannot chew coarse fodder',
      'Veterinary Escalation & Ring Vaccination: Immediately alert the Taluka Veterinary Officer. Establish emergency ring vaccination within 5-10 km radius to contain the outbreak',
    ],
    safe_dosage: [
      'Sodium Bicarbonate (Baking Soda): 15-20 grams per liter of lukewarm water for oral cavity mouth rinse 3 times daily',
      'Copper Sulphate (Morchut): 20 grams per liter of water (2% solution) for hoof foot-baths and interdigital cleaning',
      'Boro-Glycerine paste: Glycerine (90 ml) + Boric acid (10 g) gently swabbed on tongue and dental pad for pain relief',
      'Trivalent FMD Vaccine (NADCP): 2 ml S/C or 3 ml I/M for healthy livestock in 5 km ring containment zone',
    ],
    ipm_priority_order: VET_PROTOCOL_ORDER,
  },

  // -------------------------------------------------------------------------
  // 3. BLACK QUARTER (BQ) - एकटांग्या / सुजवा रोग
  // -------------------------------------------------------------------------
  {
    species: 'Cattle',
    crop_name: 'Cattle',
    disease_name: 'Black Quarter (BQ)',
    disease_name_hi: 'ब्लैक क्वार्टर / लंगड़ा बुखार (BQ)',
    disease_name_mr: 'एकटांग्या / सुजवा रोग (BQ)',
    scientific_name: 'Clostridium chauvoei (Spore-forming Anaerobe)',
    severity_typical: 'high',
    affected_organs: 'Heavy muscle groups (shoulder, thigh, rump), systemic toxemia',
    description:
      'An acute, highly fatal, soil-borne infectious bacterial disease primarily affecting young healthy cattle (6 to 24 months). Characterized by severe acute lameness, high fever, and hot painful crepitant swellings over heavy skeletal muscles that quickly turn cold and painless.',
    visual_symptoms: [
      'Sudden onset severe lameness; animal unable to walk on affected hindleg or foreleg',
      'Hot, tense, painful swelling over thighs, rump, shoulder, or neck',
      'Crepitus (crackling parchment-like sound) when pressing the swelling due to subcutaneous gas accumulation',
      'High fever (105-107°F / 41°C), shivering, dry muzzle, and fast shallow breathing',
      'Skin over the swollen muscle turns dark blackish-purple, dry, cold, and insensitive',
      'Rapid recumbency, depression, and death within 12-48 hours if untreated',
    ],
    how_it_spreads: [
      'Spores persist in soil and pasture for decades and enter animal body through ingestion or deep skin abrasions',
      'Spike in incidence after heavy monsoon rains when earth is dug up or washed by runoff',
      'Non-contagious from animal to animal, but multiple animals in herd ingest spores simultaneously from pasture',
    ],
    prevention_steps: [
      'Annual pre-monsoon vaccination (May-June) of all young cattle (above 3 months) with Polyvalent / BQ Vaccine',
      'Deep burial of deceased animals with quicklime (chuna) to prevent soil spore contamination; never skin or open carcasses in the open',
      'Avoid grazing young stock on waterlogged or newly ploughed fields prone to historical BQ cases',
    ],
    remedy_steps: [
      'Emergency Vet Call: BQ is a hyper-acute emergency. Call Veterinary Officer immediately within first hours of fever/lameness',
      'Penicillin Therapy: High-dose Crystalline Penicillin + Procaine Penicillin given parenterally and infiltrated around muscle lesion by vet',
      'Strict Confinement: Keep animal calm in a shaded, well-bedded stall to prevent muscle strain',
      'Herd Prophylaxis: Check temperatures of all remaining in-contact cattle twice daily and administer prophylactic antibiotics if advised',
    ],
    safe_dosage: [
      'Procaine Penicillin G: 10,000-20,000 IU/kg body weight I/M every 12 hours for 5 days (strictly Veterinary Officer prescription)',
      'Alum-precipitated BQ Vaccine: 5 ml S/C in neck region annually before monsoon onset',
    ],
    ipm_priority_order: VET_PROTOCOL_ORDER,
  },

  // -------------------------------------------------------------------------
  // 4. HEMORRHAGIC SEPTICEMIA (HS) - घटसर्प / गलघोंटू
  // -------------------------------------------------------------------------
  {
    species: 'Buffalo',
    crop_name: 'Buffalo',
    disease_name: 'Hemorrhagic Septicemia (HS)',
    disease_name_hi: 'गलघोंटू रोग (HS)',
    disease_name_mr: 'घटसर्प रोग (HS)',
    scientific_name: 'Pasteurella multocida (Serotypes B:2 and E:2)',
    severity_typical: 'high',
    affected_organs: 'Submandibular throat region, brisket, respiratory tract, bloodstream',
    description:
      'A hyper-acute, fatal bacterial disease of cattle and particularly water buffaloes. Triggered by stress, monsoon exhaustion, and high humidity. Characterized by high fever, painful swelling of the throat and neck, stertorous gasping respiration, and septicemia.',
    visual_symptoms: [
      'Hot, painful, firm, diffuse inflammatory edema/swelling under jaw (submandibular), extending down neck to brisket',
      'Severe respiratory distress: open-mouth breathing, extended neck, protruding cyanotic swollen tongue',
      'Loud stertorous, grunting, wheezing breath sounds due to tracheal compression',
      'High continuous fever (104-107°F / 40-41.5°C) with glassy, bloodshot eyes',
      'Profuse frothy salivation, nasal discharge, and rapid collapse within 24 hours',
    ],
    how_it_spreads: [
      'Latent carrier animals harbor bacteria in upper respiratory tract and shed pathogen under weather/work stress',
      'Inhalation of infected aerosols and ingestion of feed/water contaminated by nasal secretions',
      'Peaks during monsoon season (June to September) with high humidity, rain chill, and drafty housing',
    ],
    prevention_steps: [
      'Mandatory annual pre-monsoon vaccination of all cattle and buffaloes with Alum-precipitated or Oil-adjuvant HS vaccine',
      'Provide warm, dry, draft-free shelter during heavy monsoon downpours and avoid working draught bullocks in torrential rain',
      'Keep buffaloes away from stagnant, shared village ponds where infected animals bathe',
    ],
    remedy_steps: [
      'Emergency Action: Administer immediate systemic antimicrobial therapy at the earliest rise of fever, before throat swelling hardens',
      'Veterinary Therapy: Oxytetracycline or Sulfadimidine given intravenously by registered veterinarian',
      'Airway Maintenance: Prop up head and neck on padded straw bales to ease tracheal obstruction and prevent asphyxia',
      'Emergency Disinfection: Spray shed with 2% Bleaching Powder solution and isolate in-contact herd',
    ],
    safe_dosage: [
      'Oxytetracycline: 10 mg/kg body weight slow I/V or deep I/M daily (under certified vet administration only)',
      'Sulfadimidine 33.3%: 100 mg/kg body weight slow I/V on day 1 followed by oral maintenance',
      'Oil Adjuvant HS Vaccine: 3 ml I/M annually in May-June for long-lasting herd immunity',
    ],
    ipm_priority_order: VET_PROTOCOL_ORDER,
  },

  // -------------------------------------------------------------------------
  // 5. BOVINE MASTITIS - कासदाह / दगडी रोग
  // -------------------------------------------------------------------------
  {
    species: 'Cattle',
    crop_name: 'Cattle',
    disease_name: 'Bovine Mastitis',
    disease_name_hi: 'थनैला रोग (Mastitis)',
    disease_name_mr: 'कासदाह / दगडी रोग (Mastitis)',
    scientific_name: 'Staphylococcus aureus / Streptococcus agalactiae / E. coli',
    severity_typical: 'moderate',
    affected_organs: 'Mammary gland, udder quarters, teat canal, milk composition',
    description:
      'Inflammation of the mammary gland and udder tissue, predominantly bacterial in origin. Results in physical, chemical, and microbiological changes in milk, along with pathological changes in glandular udder tissue.',
    visual_symptoms: [
      'Hot, swollen, red, painful udder quarter; cow kicks and resists touch during milking',
      'Altered milk appearance: watery, yellowish serous fluid, containing white curd-like flakes, clots, or blood streaks',
      'Udder quarter hardens into firm fibrous tissue ("dagdi / stone udder") with permanent loss of quarter',
      'Drop in daily milk production and elevated somatic cell count (California Mastitis Test positive)',
      'Systemic signs (in acute toxemic mastitis): fever, anorexia, depression, recumbency',
    ],
    how_it_spreads: [
      'Contagious transmission during milking through milkers hands, common udder cloths, and teat cups',
      'Environmental transmission: unhygienic, wet, dung-soiled shed floors entering open teat sphincter post-milking',
      'Teat skin cracks, wounds, tick bites, and incomplete milking leaving residual milk',
    ],
    prevention_steps: [
      'Post-milking teat dipping: Dip all 4 teats immediately after milking in 0.5% Povidone-Iodine solution',
      'Keep cows standing for 45 minutes post-milking by providing fresh green feed, allowing the teat sphincter to close tightly',
      'Clean shed flooring daily; ensure dry bedded stalls free of pooled slurry and sharp stones',
      'Practice clean milk production: wash hands, use separate clean towels for each animal, and milk infected quarters last',
      'Dry Cow Therapy (DCT) at the end of lactation using approved long-acting intramammary infusion',
    ],
    remedy_steps: [
      'Stripping & Cold Fermentation: Frequent complete hand-milking/stripping of the affected quarter every 2 hours to remove bacterial toxins',
      'Cold Water Compress: Apply cold water splash or ice packs to the hot inflamed udder quarter during acute swelling',
      'Intramammary Infusion: Administer veterinary-prescribed intramammary antibiotic tube strictly under aseptic cannula insertion',
      'Supportive Anti-inflammatory: Administer systemic anti-inflammatory (Meloxicam) to alleviate udder pain and fever',
      'Proper Disposal: Never discard mastitic milk onto the shed floor or feed raw to calves; boil or safely bury with disinfectant',
    ],
    safe_dosage: [
      'Povidone-Iodine Teat Dip (0.5% active iodine): Dip 2 cm of each teat immediately post-milking daily',
      'Trisodium Citrate (Oral): 12-15 grams daily mixed in jaggery for 7 days to restore milk pH and udder defense',
      'Cloxacillin + Ampicillin intramammary infusion: 1 tube infused per quarter after full evacuation (veterinary advice)',
    ],
    ipm_priority_order: VET_PROTOCOL_ORDER,
  },

  // -------------------------------------------------------------------------
  // 6. HEALTHY ANIMAL (BASELINE HEALTH) - निरोगी प्राणी / स्वस्थ पशु
  // -------------------------------------------------------------------------
  {
    species: 'Cattle',
    crop_name: 'Cattle',
    disease_name: 'Healthy Animal',
    disease_name_hi: 'स्वस्थ पशु',
    disease_name_mr: 'निरोगी प्राणी',
    scientific_name: 'Physiologically Normal Bovine',
    severity_typical: 'low',
    affected_organs: 'None - normal physiological equilibrium',
    description:
      'Normal, healthy livestock demonstrating active rumination, bright clear eyes, moist cool muzzle with normal perspiration droplets, smooth pliable skin coat, normal rectal temperature (38.3-38.8°C / 101-102°F), and steady milk production.',
    visual_symptoms: [
      'Moist, cool, clean muzzle with fine clear water beads',
      'Bright alert eyes without excess tear staining, redness, or discharge',
      'Smooth, lustrous, pliable skin coat free from lumps, nodular swellings, or sores',
      'Steady, rhythmic chewing of cud (rumination 40-60 chews per bolus)',
      'Clean, even hooves with firm gait and weight distributed equally on all four limbs',
      'Normal rectal temperature: 101.5°F (38.6°C) and respiratory rate: 15-30 breaths/min',
    ],
    how_it_spreads: [
      'Non-infectious: Normal physiological health status',
    ],
    prevention_steps: [
      'Maintain regular vaccination schedule (FMD every 6 months, LSD, BQ, HS annually)',
      'Supply balanced total mixed ration (TMR), daily mineral mixture @ 50g/day, and ad libitum clean drinking water',
      'Quarterly deworming with broad-spectrum anthelmintics (Albendazole / Fenbendazole / Ivermectin)',
      'Provide well-ventilated, dry, clean shed with comfortable rubber cow mats or dry straw bedding',
    ],
    remedy_steps: [
      'Maintain standard hygienic dairy management and daily yield recording',
      'Inspect animals each morning during milking for early signs of skin lumps or foot soreness',
      'Ensure adequate shade, cooling fans, and misting during peak summer heat (THI > 72)',
    ],
    safe_dosage: [
      'Commercial Chelated Mineral Mixture: 50 grams per adult animal mixed in daily concentrate feed',
      'Clean Drinking Water: 60-100 liters per day per adult dairy cow/buffalo',
    ],
    ipm_priority_order: VET_PROTOCOL_ORDER,
  },
];

// Helper: look up a disease record by species + disease name (case-insensitive)
function findDisease(speciesName, diseaseName) {
  if (!speciesName || !diseaseName) return null;
  const s = speciesName.toLowerCase().trim();
  const d = diseaseName.toLowerCase().trim();

  return (
    DISEASE_KNOWLEDGE_BASE.find((item) => {
      const matchSpecies =
        item.species.toLowerCase() === s ||
        item.crop_name.toLowerCase() === s ||
        (s.includes('cattle') && item.species === 'Cattle') ||
        (s.includes('buffalo') && (item.species === 'Buffalo' || item.species === 'Cattle')) ||
        (s.includes('cow') && item.species === 'Cattle') ||
        (s.includes('goat') && (item.species === 'Goat' || item.species === 'Cattle'));

      const matchDisease =
        item.disease_name.toLowerCase().includes(d) ||
        d.includes(item.disease_name.toLowerCase()) ||
        (d.includes('lumpy') && item.disease_name.includes('LSD')) ||
        (d.includes('lsd') && item.disease_name.includes('LSD')) ||
        (d.includes('fmd') && item.disease_name.includes('FMD')) ||
        (d.includes('foot') && item.disease_name.includes('FMD')) ||
        (d.includes('mouth') && item.disease_name.includes('FMD')) ||
        (d.includes('healthy') && item.disease_name.includes('Healthy'));

      return matchSpecies && matchDisease;
    }) ||
    DISEASE_KNOWLEDGE_BASE.find((item) => {
      return (
        item.disease_name.toLowerCase().includes(d) ||
        d.includes(item.disease_name.toLowerCase()) ||
        (d.includes('lumpy') && item.disease_name.includes('LSD')) ||
        (d.includes('fmd') && item.disease_name.includes('FMD'))
      );
    }) ||
    null
  );
}

// Helper: get all diseases for a given livestock species
function getDiseasesBySpecies(speciesName) {
  if (!speciesName) return DISEASE_KNOWLEDGE_BASE;
  const s = speciesName.toLowerCase().trim();
  const matched = DISEASE_KNOWLEDGE_BASE.filter(
    (d) =>
      d.species.toLowerCase() === s ||
      d.crop_name.toLowerCase() === s ||
      (s.includes('cattle') && d.species === 'Cattle') ||
      (s.includes('buffalo') && (d.species === 'Buffalo' || d.species === 'Cattle')) ||
      (s.includes('goat') && (d.species === 'Goat' || d.species === 'Cattle'))
  );
  return matched.length > 0 ? matched : DISEASE_KNOWLEDGE_BASE;
}

// Backward compatibility alias
const getDiseasesByCrop = getDiseasesBySpecies;
const IPM_PRIORITY_ORDER = VET_PROTOCOL_ORDER;

module.exports = {
  DISEASE_KNOWLEDGE_BASE,
  VET_PROTOCOL_ORDER,
  IPM_PRIORITY_ORDER,
  findDisease,
  getDiseasesBySpecies,
  getDiseasesByCrop,
};
