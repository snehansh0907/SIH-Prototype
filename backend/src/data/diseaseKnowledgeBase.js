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

  // -------------------------------------------------------------------------
  // 7. BLOAT / RUMINAL TYMPANY (अफ़रा / पोटफुगी)
  // -------------------------------------------------------------------------
  {
    species: 'Cattle',
    crop_name: 'Cattle',
    disease_name: 'Ruminal Tympany / Bloat',
    disease_name_hi: 'अफरा रोग / पेट फूलना (Bloat)',
    disease_name_mr: 'पोटफुगी / अफ़रा (Bloat)',
    scientific_name: 'Acute Ruminal Tympany (Frothy or Free-gas Bloat)',
    severity_typical: 'high',
    affected_organs: 'Rumen, left paralumbar fossa, thoracic respiratory capacity',
    description:
      'Sudden accumulation of fermentation gases in the rumen that the animal is unable to eructate (belch). Causes rapid distension of the left flank, acute pain, respiratory distress from diaphragm compression, and potential asphyxiation if untreated.',
    visual_symptoms: [
      'Severe, drum-like ballooning and swelling of the left flank (paralumbar fossa)',
      'Animal kicks at belly, stamps feet, grunts in pain, and frequently lies down and rises',
      'Open-mouth breathing with extended tongue, laboured wheezing, and nostrils dilated',
      'Complete cessation of rumination and off-feed condition',
      'Frequent straining to urinate and defecate; rapid weak pulse',
    ],
    how_it_spreads: [
      'Non-contagious digestive metabolic disorder',
      'Ingestion of excess succulent young legumes (lucerne, clover, berseem) causing frothy stable foam in rumen',
      'Sudden gorging on easily fermentable cereal grains (wheat, maize, rice bran) or frosted greens',
      'Physical obstruction of esophagus by whole potato, turnip, or cloth rags preventing gas belching',
    ],
    prevention_steps: [
      'Feed dry coarse roughage (sorghum straw, wheat straw) before allowing animals onto succulent lush green legume pasture',
      'Never allow sudden unlimited access to concentrates or grain heaps',
      'Cut lush legumes and wilt in sun for 4-6 hours before offering to cattle and buffaloes',
      'Avoid sudden drastic changes in daily feed ration; transition feeds gradually over 7-10 days',
    ],
    remedy_steps: [
      'Emergency Posture: Walk the animal slowly uphill or elevate front legs to shift rumen weight off diaphragm',
      'Gag Placement: Place a smooth wooden stick/gag horizontally in mouth tied behind ears to induce continuous chewing and salivation',
      'Anti-bloat Administration: Drench with vegetable oil (peanut/mustard oil) + Turpentine oil to break stable foam bubbles',
      'Veterinary Escalation: Call local veterinary dispensary immediately. In acute life-threatening bloat, a registered vet performs emergency trocharization on the left flank',
    ],
    safe_dosage: [
      'Sweet / Mustard oil: 300-500 ml mixed with 20-30 ml Oil of Turpentine as an oral drench (ensure head is not raised too high to avoid lung aspiration)',
      'Tympanol / Bloatosil (Commercial Simethicone): 100 ml orally diluted in 500 ml water',
      'Hing (Asafoetida): 10 grams dissolved in lukewarm water with 50g ginger powder for mild gas relief',
    ],
    ipm_priority_order: VET_PROTOCOL_ORDER,
  },

  // -------------------------------------------------------------------------
  // 8. PESTE DES PETITS RUMINANTS (PPR) - बकरी प्लेग
  // -------------------------------------------------------------------------
  {
    species: 'Goat',
    crop_name: 'Goat',
    disease_name: 'Peste des Petits Ruminants (PPR)',
    disease_name_hi: 'बकरी प्लेग (PPR)',
    disease_name_mr: 'शेळी प्लेग / पीपीआर (PPR)',
    scientific_name: 'Small Ruminant Morbillivirus (Paramyxoviridae)',
    severity_typical: 'high',
    affected_organs: 'Oral mucosa, respiratory tract, gastrointestinal tract, lymphoid tissues',
    description:
      'A highly contagious and severe viral disease of goats and sheep ("Goat Plague"). Characterized by high fever, necrotizing erosive stomatitis (mouth sores), mucopurulent oculonasal discharge, severe watery diarrhea, and bronchopneumonia with high mortality.',
    visual_symptoms: [
      'Sudden high fever (104-106°F / 40-41°C) with dry muzzle and shivering',
      'Copious mucopurulent yellow crusty discharge from eyes and nose matted on face',
      'Painful necrotic erosions and whitish cheesy deposits on gums, dental pad, tongue, and lips with foul halitosis',
      'Severe foul-smelling, profuse watery to bloody diarrhea causing dehydration and emaciation',
      'Dyspnea, coughing, and harsh chest crackles due to secondary pneumonia',
    ],
    how_it_spreads: [
      'Close contact inhalation of infected aerosol droplets from coughing and sneezing',
      'Direct contact with tears, nasal mucus, saliva, and infectious diarrhea feces',
      'Introduction of unquarantined carrier goats purchased from livestock markets',
      'Sharing grazing grounds, water troughs, and night holding pens with infected flocks',
    ],
    prevention_steps: [
      'Mandatory annual vaccination with Live Attenuated PPR Vaccine (Sungri 96 strain) @ 1 ml S/C for all goats and sheep above 3 months of age',
      'Isolate newly purchased goats for at least 21 days before joining flock',
      'Maintain strict shed disinfection with 2% Bleaching Powder or 1% Sodium Hydroxide during regional alerts',
      'Halt movement of small ruminants to live animal weekly bazaars when outbreaks are reported in taluka',
    ],
    remedy_steps: [
      'Strict Flock Isolation: Separate all sick goats immediately into an isolated, draft-free sick pen at least 30 meters away',
      'Oral Lesion Care: Gently swab ulcerated lips and mouth with 1% Potassium Permanganate (KMnO4) or 5% Boro-Glycerine 3 times daily',
      'Rehydration Therapy: Provide frequent oral electrolyte solutions (ORS), lukewarm rice kanji, and electrolyte water with jaggery to combat fatal dehydration',
      'Veterinary Treatment: Prompt veterinary referral for broad-spectrum antibiotics (Enrofloxacin or Oxytetracycline) to prevent secondary bacterial pneumonia',
    ],
    safe_dosage: [
      'Boro-Glycerine: 10g Boric Acid in 90g Glycerine swabbed over oral erosions 2-3 times daily',
      'Oral Electrolyte Solution (ORS): 1 sachet in 1 liter clean water, drench 200-500 ml twice daily depending on body weight',
      'PPR Vaccine (Govt. Campaign): 1 ml S/C in lateral neck region (single dose provides 3-year immunity)',
    ],
    ipm_priority_order: VET_PROTOCOL_ORDER,
  },

  // -------------------------------------------------------------------------
  // 9. GOAT POX & SHEEP POX (बकरी व मेंढी देवी)
  // -------------------------------------------------------------------------
  {
    species: 'Goat',
    crop_name: 'Goat',
    disease_name: 'Goat Pox / Sheep Pox',
    disease_name_hi: 'बकरी व भेड़ चेचक (Goat Pox)',
    disease_name_mr: 'शेळी व मेंढी देवी रोग (Goat Pox)',
    scientific_name: 'Capripoxvirus (Poxviridae)',
    severity_typical: 'high',
    affected_organs: 'Unwoolled skin (groin, axilla, muzzle, ears), lungs, systemic mucosa',
    description:
      'A severe, contagious viral disease of small ruminants characterized by fever, generalized papules, vesicles, and pustules on unwoolled skin and mucous membranes, often complicated by fatal nodular lung lesions.',
    visual_symptoms: [
      'High fever (104-106°F) and extreme dullness',
      'Circular reddish macules and firm papules (0.5 to 1.5 cm) on face, eyelids, muzzle, groin, axilla, and under-tail',
      'Papules develop into necrotic scabs that peel off leaving deep scars',
      'Swollen eyelids, conjunctivitis, and purulent nasal crusts',
      'Respiratory distress with rapid breathing if internal lung nodules develop',
    ],
    how_it_spreads: [
      'Aerosol inhalation and direct contact with weeping skin scabs, saliva, or secretions',
      'Mechanical transmission by biting insects, ticks, and contaminated shed bedding',
      'Movement of infected herds across district grazing corridors',
    ],
    prevention_steps: [
      'Annual vaccination with Goat Pox / Sheep Pox Vaccine before winter season',
      'Strict quarantine of incoming stock for 21 days',
      'Disinfect small ruminant sheds weekly with 2% Virkon-S or 1% formalin spray',
    ],
    remedy_steps: [
      'Isolate all affected animals in a dry, warm, well-ventilated enclosure',
      'Wash cutaneous pustules and scabs with dilute potassium permanganate solution (1:1000)',
      'Apply neem-oil or zinc oxide antiseptic ointment over broken skin scabs to prevent fly maggots',
      'Consult veterinary dispensary for supportive antibiotic cover and NSAIDs',
    ],
    safe_dosage: [
      'Potassium Permanganate: 0.1% external wash solution applied twice daily',
      'Neem Oil + Turmeric paste applied locally on skin scabs',
      'Goat Pox Vaccine: 0.5 ml S/C annually as per state animal husbandry campaign',
    ],
    ipm_priority_order: VET_PROTOCOL_ORDER,
  },

  // -------------------------------------------------------------------------
  // 10. CONTAGIOUS ECTHYMA / ORF (लाळरोग / तोंडावरील फोड)
  // -------------------------------------------------------------------------
  {
    species: 'Goat',
    crop_name: 'Goat',
    disease_name: 'Contagious Ecthyma (Orf)',
    disease_name_hi: 'मुंह के छाले / ओरफ रोग (Orf)',
    disease_name_mr: 'लाळरोग / तोंडावर फोड (Orf)',
    scientific_name: 'Parapoxvirus (Poxviridae)',
    severity_typical: 'moderate',
    affected_organs: 'Lips, muzzle, oral commissures, gums, teats of nursing dams',
    description:
      'A common, debilitating viral skin disease of sheep and goats (especially kids and lambs 3-6 months). Causes proliferative, cauliflower-like crusted scabs around the mouth and lips, preventing suckling and feeding.',
    visual_symptoms: [
      'Erythematous papules and vesicles on lips and oral corners turning into thick, dry, crusted brown scabs',
      'Severe pain when attempting to graze or suckle milk; rapid weight loss',
      'Scabs may spread to eyelids, feet, and teats of nursing does/ewes',
      'Zoonotic potential: can cause localized painful skin lesions in humans handling scabs with bare hands',
    ],
    how_it_spreads: [
      'Virus enters through minor skin scratches caused by thorny shrubs, dry grass awns, or coarse feed',
      'Direct contact with infected scabs and sharing contaminated troughs',
      'Persistence of viral scabs in shed soil and wooden posts for months',
    ],
    prevention_steps: [
      'Inspect kid herds weekly for early lip lesions',
      'Avoid grazing young kids on dry, spiny, thorny brushwood pastures',
      'Wear protective gloves when dressing affected animal scabs to avoid human transmission',
    ],
    remedy_steps: [
      'Isolate affected kids and lambs; feed lukewarm milk or fine gruel with a bottle or soft bowl',
      'Never forcefully peel off thick dry scabs (causes bleeding and spreading)',
      'Softly apply 5% Boro-Glycerine or Betadine ointment on lip crusts twice daily',
      'Treat dam teats with antiseptic ointment if lesions appear on mammary skin',
    ],
    safe_dosage: [
      'Betadine (Povidone-Iodine 5%) Ointment: Applied topically on lips twice daily',
      'Boric Acid Powder: Mixed in pure glycerine (1:10) for oral commissure softening',
    ],
    ipm_priority_order: VET_PROTOCOL_ORDER,
  },

  // -------------------------------------------------------------------------
  // 11. RANIKHET DISEASE / NEWCASTLE DISEASE (रानीखेत / राणीखेत रोग)
  // -------------------------------------------------------------------------
  {
    species: 'Poultry',
    crop_name: 'Poultry',
    disease_name: 'Ranikhet / Newcastle Disease (ND)',
    disease_name_hi: 'रानीखेत रोग (Newcastle Disease)',
    disease_name_mr: 'राणीखेत रोग (Newcastle Disease)',
    scientific_name: 'Avian Orthoavulavirus 1 (Paramyxoviridae)',
    severity_typical: 'high',
    affected_organs: 'Respiratory system, digestive tract, central nervous system in birds',
    description:
      'An acute, highly contagious, fatal viral disease of domestic poultry and other avian species. Characterized by severe respiratory distress (gasping), bright greenish-white diarrhea, twisted neck (torticollis), and flock mortality reaching up to 90-100%.',
    visual_symptoms: [
      'Severe respiratory gasping, sneezing, rattling gargling sounds, and open-beak breathing',
      'Profuse watery, bright emerald-green or whitish diarrhea',
      'Nervous signs: torticollis (twisted neck held backwards or downward), tremor, circling, paralysis of legs and wings',
      'Cyanosis (dark purplish-blue discoloration) of the comb and wattles',
      'Sudden complete drop in egg production with thin-shelled, deformed eggs',
    ],
    how_it_spreads: [
      'Direct inhalation of airborne viral droplets shed by infected birds',
      'Ingestion of feed and water contaminated with bird droppings and ocular/nasal discharges',
      'Mechanical carriage by wild birds, rodents, footwear, egg crates, and feed gunny bags',
      'Movement of live poultry across village weekly markets and live-bird wholesale mandis',
    ],
    prevention_steps: [
      'Strict vaccination protocol: F1 / Lasota strain eye-drop vaccine at Day 5-7, booster R2B / Mukteswar vaccine at 8-10 weeks',
      'Strict poultry biosecurity: Install footbaths with potassium permanganate or Virkon-S at coop entrance',
      'Prohibit wild birds (crows, sparrows, pigeons) from accessing poultry feed and water drinkers',
      'Immediate safe disposal (deep burial with quicklime) of dead birds; never discard near village water streams',
    ],
    remedy_steps: [
      'Quarantine: Immediately separate all birds showing respiratory distress or twisted necks into an isolated pen',
      'Electrolyte & Vitamin Boost: Add multivitamins (AD3E + Vitamin B Complex) and electrolytes to drinking water to support flock vigor',
      'Veterinary Escalation: Immediately notify local Veterinary Assistant Surgeon / Animal Husbandry Dept to implement ring biosecurity',
      'Disinfection: Spray 2% Bleaching Powder or Virkon-S solution inside empty coop sections',
    ],
    safe_dosage: [
      'Lasota ND Vaccine (Preventive): 1 drop in one eye of chick at 5-7 days of age',
      'Vitamin AD3E + B-Complex (e.g. Vimeral): 5-10 ml per 100 birds in morning drinking water for 5-7 days',
      'Electrolyte powder: 1 gram per liter drinking water during acute distress',
    ],
    ipm_priority_order: VET_PROTOCOL_ORDER,
  },

  // -------------------------------------------------------------------------
  // 12. INFECTIOUS BURSAL DISEASE / GUMBORO (गुम्बोरो रोग)
  // -------------------------------------------------------------------------
  {
    species: 'Poultry',
    crop_name: 'Poultry',
    disease_name: 'Infectious Bursal Disease (Gumboro)',
    disease_name_hi: 'गुम्बोरो रोग (IBD)',
    disease_name_mr: 'गुम्बोरो आजार (IBD)',
    scientific_name: 'Avian Birnavirus (Birnaviridae)',
    severity_typical: 'high',
    affected_organs: 'Bursa of Fabricius, immune lymphoid system, kidneys',
    description:
      'A highly infectious viral immunosuppressive disease primarily affecting young growing chickens (3 to 6 weeks). Causes inflammation and atrophy of the Bursa of Fabricius, severe watery whitish vent diarrhea, vent-pecking, and extreme flock depression.',
    visual_symptoms: [
      'Severe flock depression, trembling, ruffled feathers, and huddling together near walls',
      'Watery yellowish-white diarrhea with urates staining vent feathers ("chalky vent")',
      'Birds persistently peck at their own vents; reluctance to move or feed',
      'Dehydration, darkened dry comb, and rapid spike in flock mortality over 3-5 days',
    ],
    how_it_spreads: [
      'Direct ingestion of feces-contaminated feed, water, and poultry litter',
      'Virus is extremely resistant in the environment and persists in sheds for months',
    ],
    prevention_steps: [
      'Timely vaccination with live IBD vaccine (Intermediate / Georgia strain) via drinking water at 14 and 24 days of age',
      'Thorough shed cleanout, flame-gunning, and 3-week downtime between broiler batches',
    ],
    remedy_steps: [
      'Immediate supportive care: Provide kidney supportive tonics and electrolytes in drinking water',
      'Avoid high-protein feed during acute outbreak to reduce kidney stress',
      'Consult poultry veterinarian for flock management and prophylactic antimicrobial cover',
    ],
    safe_dosage: [
      'Jaggery water (Gud pani): 20 grams per liter clean drinking water for quick energy',
      'Kidney flushing tonic (e.g. Nefrotec / Renalka): 5-10 ml per 100 birds in drinking water for 5 days',
    ],
    ipm_priority_order: VET_PROTOCOL_ORDER,
  },

  // -------------------------------------------------------------------------
  // 13. COCCIDIOSIS (रक्तहगवण)
  // -------------------------------------------------------------------------
  {
    species: 'Poultry',
    crop_name: 'Poultry',
    disease_name: 'Coccidiosis',
    disease_name_hi: 'खूनी दस्त / कॉक्सीडियोसिस (Coccidiosis)',
    disease_name_mr: 'रक्तहगवण / कॉक्सिडिओसिस (Coccidiosis)',
    scientific_name: 'Eimeria tenella / E. necatrix (Protozoan Parasite)',
    severity_typical: 'moderate',
    affected_organs: 'Intestinal mucosa, ceca, digestive tract of birds',
    description:
      'A common parasitic disease of poultry caused by protozoan parasites multiplying in the intestinal tract. Causes damaged gut epithelium, bloody or mucous droppings, pale combs, and high mortality in growing broilers.',
    visual_symptoms: [
      'Bloody, reddish-brown, or mucous droppings in litter',
      'Birds appear hunched up with drooping wings, ruffled feathers, and closed eyes',
      'Pale, blanched comb and wattles due to acute internal intestinal blood loss',
      'Sharp drop in feed consumption and water intake with stunted flock growth',
    ],
    how_it_spreads: [
      'Ingestion of sporulated protozoan oocysts in wet, warm, cakey poultry litter',
      'Leaking nipple drinkers and high humidity accelerating oocyst sporulation',
    ],
    prevention_steps: [
      'Keep shed litter strictly dry and friable; rake litter daily and replace wet patches immediately',
      'Use coccidiostats in broiler feed rations as per approved schedule',
    ],
    remedy_steps: [
      'Immediate anticoccidial water medication (Amprolium or Toltrazuril) for all birds',
      'Rake and add dry hydrated lime or dry husk over wet litter spots',
      'Administer Vitamin K to assist blood clotting and epithelial gut repair',
    ],
    safe_dosage: [
      'Amprolium 20% powder: 1-2 grams per liter drinking water for 5-7 days',
      'Vitamin K3: 2-5 mg per liter drinking water to control gut hemorrhage',
    ],
    ipm_priority_order: VET_PROTOCOL_ORDER,
  },

  // -------------------------------------------------------------------------
  // 14. HEALTHY GOAT / SHEEP (निरोगी शेळी / मेंढी)
  // -------------------------------------------------------------------------
  {
    species: 'Goat',
    crop_name: 'Goat',
    disease_name: 'Healthy Goat / Sheep',
    disease_name_hi: 'स्वस्थ बकरी / भेड़',
    disease_name_mr: 'निरोगी शेळी / मेंढी',
    scientific_name: 'Physiologically Normal Small Ruminant',
    severity_typical: 'low',
    affected_organs: 'None - healthy equilibrium',
    description:
      'Healthy goat or sheep demonstrating alert posture, shiny coat, active rumination, clean dry muzzle, clear pink oral mucosa, firm dark fecal pellets, and normal temperature (102.5-103.5°F).',
    visual_symptoms: [
      'Bright alert eyes without excess tears, discharge, or pale conjunctiva',
      'Clean muzzle and lips free of scabs, ulcers, or excessive saliva',
      'Smooth, lustrous coat free from pustules, ticks, or lice',
      'Active foraging and chewing cud with energetic, brisk gait',
      'Normal, firm, pelleted feces without watery diarrhea or blood',
    ],
    how_it_spreads: ['Non-infectious: Normal healthy animal'],
    prevention_steps: [
      'Maintain annual PPR, Goat Pox, and Enterotoxemia (ET) vaccination calendar',
      'Quarterly deworming with Albendazole or Ivermectin',
      'Provide clean, dry, elevated slatted flooring to prevent foot rot',
    ],
    remedy_steps: [
      'Maintain good quality tree loppings (Subabul, Neem, Melia) and balanced concentrate',
      'Inspect flock daily at release for any limping or sluggishness',
    ],
    safe_dosage: [
      'Mineral Mixture for Goats: 10-15 grams daily mixed in grain concentrate',
    ],
    ipm_priority_order: VET_PROTOCOL_ORDER,
  },

  // -------------------------------------------------------------------------
  // 15. HEALTHY POULTRY (निरोगी कुक्कुट)
  // -------------------------------------------------------------------------
  {
    species: 'Poultry',
    crop_name: 'Poultry',
    disease_name: 'Healthy Poultry',
    disease_name_hi: 'स्वस्थ कुक्कुट / मुर्गी',
    disease_name_mr: 'निरोगी कुक्कुट / पक्षी',
    scientific_name: 'Physiologically Normal Avian Species',
    severity_typical: 'low',
    affected_organs: 'None - normal health',
    description:
      'Healthy poultry bird exhibiting bright red comb and wattles, smooth clean plumage, active foraging, normal vocalization, alert eyes, and steady egg laying or growth rate.',
    visual_symptoms: [
      'Bright red, fleshy, warm comb and wattles without crusts or discoloration',
      'Smooth, shiny, tight feathering without ruffled or soiled vent plumage',
      'Bright round clear eyes and clean open nostrils without discharge or swelling',
      'Active walking, scratching, and alert foraging behavior',
      'Normal firm droppings with white urate cap',
    ],
    how_it_spreads: ['Non-infectious: Healthy flock status'],
    prevention_steps: [
      'Strict adherence to Ranikhet (Lasota) and Gumboro (IBD) vaccination protocols',
      'Maintain dry, friable litter and continuous fresh drinking water',
    ],
    remedy_steps: [
      'Supply balanced crumble/mash feed with adequate vitamins and trace minerals',
      'Ensure adequate cross-ventilation and clean biosecurity barrier',
    ],
    safe_dosage: [
      'Poultry Multivitamin tonic: 5 ml per 100 birds in drinking water twice weekly',
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
      const itemSpecies = item.species.toLowerCase();
      const matchSpecies =
        itemSpecies === s ||
        item.crop_name.toLowerCase() === s ||
        (s.includes('cattle') && itemSpecies === 'cattle') ||
        (s.includes('buffalo') && (itemSpecies === 'buffalo' || itemSpecies === 'cattle')) ||
        (s.includes('cow') && itemSpecies === 'cattle') ||
        (s.includes('goat') && itemSpecies === 'goat') ||
        (s.includes('sheep') && (itemSpecies === 'sheep' || itemSpecies === 'goat')) ||
        (s.includes('poultry') && itemSpecies === 'poultry') ||
        (s.includes('chicken') && itemSpecies === 'poultry');

      const matchDisease =
        item.disease_name.toLowerCase().includes(d) ||
        d.includes(item.disease_name.toLowerCase()) ||
        (d.includes('lumpy') && item.disease_name.includes('LSD')) ||
        (d.includes('lsd') && item.disease_name.includes('LSD')) ||
        (d.includes('fmd') && item.disease_name.includes('FMD')) ||
        (d.includes('foot') && item.disease_name.includes('FMD')) ||
        (d.includes('mouth') && item.disease_name.includes('FMD')) ||
        (d.includes('mastitis') && item.disease_name.includes('Mastitis')) ||
        (d.includes('bloat') && item.disease_name.includes('Bloat')) ||
        (d.includes('tympany') && item.disease_name.includes('Bloat')) ||
        (d.includes('ppr') && item.disease_name.includes('PPR')) ||
        (d.includes('ranikhet') && item.disease_name.includes('Ranikhet')) ||
        (d.includes('newcastle') && item.disease_name.includes('Ranikhet')) ||
        (d.includes('gumboro') && item.disease_name.includes('Gumboro')) ||
        (d.includes('coccidiosis') && item.disease_name.includes('Coccidiosis')) ||
        (d.includes('healthy') && item.disease_name.includes('Healthy'));

      return matchSpecies && matchDisease;
    }) ||
    DISEASE_KNOWLEDGE_BASE.find((item) => {
      return (
        item.disease_name.toLowerCase().includes(d) ||
        d.includes(item.disease_name.toLowerCase()) ||
        (d.includes('lumpy') && item.disease_name.includes('LSD')) ||
        (d.includes('fmd') && item.disease_name.includes('FMD')) ||
        (d.includes('mastitis') && item.disease_name.includes('Mastitis')) ||
        (d.includes('bloat') && item.disease_name.includes('Bloat')) ||
        (d.includes('ppr') && item.disease_name.includes('PPR')) ||
        (d.includes('ranikhet') && item.disease_name.includes('Ranikhet')) ||
        (d.includes('healthy') && item.disease_name.includes('Healthy'))
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
    (d) => {
      const itemSpecies = d.species.toLowerCase();
      return (
        itemSpecies === s ||
        d.crop_name.toLowerCase() === s ||
        (s.includes('cattle') && itemSpecies === 'cattle') ||
        (s.includes('buffalo') && (itemSpecies === 'buffalo' || itemSpecies === 'cattle')) ||
        (s.includes('cow') && itemSpecies === 'cattle') ||
        (s.includes('goat') && itemSpecies === 'goat') ||
        (s.includes('sheep') && (itemSpecies === 'sheep' || itemSpecies === 'goat')) ||
        (s.includes('poultry') && itemSpecies === 'poultry')
      );
    }
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

