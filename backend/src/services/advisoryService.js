// =========================================================
// Pashu Sarthak - Livestock Veterinary Advisory Service
// =========================================================
// Builds structured Veterinary Care Advisory for diagnosed livestock diseases
// following clinical veterinary hierarchy:
//   1. WHAT TO DO TODAY (Immediate Quarantine & Biosecurity + Antiseptic Care)
//   2. MONITORING (Temperature, Rumination, Lesions, Milk Drop)
//   3. SUPPORTIVE CARE & NUTRITION (Electrolytes, Soft Mash, Vitamins)
//   4. VETERINARY INTERVENTION & RING VACCINATION (Govt. Schemes, NADCP, 1962)
//   5. OUTBREAK ESCALATION (Village/Panchayat Alert & Ring Biosecurity)
// =========================================================

const { findDisease } = require('../data/diseaseKnowledgeBase');

function severityToStatus(severityBand) {
  if (!severityBand) return 'LOW';
  const band = (severityBand || '').toLowerCase();
  if (band === 'severe' || band === 'high') return 'HIGH';
  if (band === 'moderate') return 'MODERATE';
  return 'LOW';
}

/**
 * Builds structured veterinary advisory for a diagnosis case.
 * @param {object} diagnosisCase - row from diagnosis_cases or diagnosis result object
 * @param {string} [species] - animal species (e.g. "Cattle", "Buffalo", "Goat")
 */
function buildAdvisory(diagnosisCase, species = 'Cattle') {
  const predictedDisease = diagnosisCase.predicted_disease || diagnosisCase.disease;
  const resolvedSpecies = diagnosisCase.species || species || 'Cattle';
  const disease = findDisease(resolvedSpecies, predictedDisease);

  const status = severityToStatus(diagnosisCase.severity_band || diagnosisCase.severity);
  const expertHelpRequired =
    status === 'HIGH' ||
    diagnosisCase.status === 'expert_review_pending' ||
    diagnosisCase.isUncertain;

  // Healthy Animal outcome (Bug #3 fix)
  const isHealthy = Boolean(
    diagnosisCase.type === 'healthy' ||
    diagnosisCase.is_healthy ||
    (predictedDisease && predictedDisease.toLowerCase().includes('healthy'))
  );

  if (isHealthy) {
    const immediateActions = [
      'Maintain Balanced Nutrition Ration: Provide high-quality green fodder, dry roughage, and mineral mixture (50g/day) to sustain strong natural immunity.',
      'Fresh Clean Water Access: Ensure continuous access to cool, unpolluted drinking water in regularly disinfected troughs.',
      'Shed Hygiene & Ventilation: Keep cattle shed floor dry with lime powder dusting and clean bedding to prevent pathogen reservoirs.',
    ];
    const monitoring = [
      'Observe daily rumination cycles (normal healthy rate: 45-60 chews per cud).',
      'Track daily feed intake and milk yield consistency for subtle early changes.',
      'Inspect skin coat sheen, alert eye expression, and normal gait during daily morning turnout.',
    ];
    const supportiveCare = [
      'Provide mineral block licks and adequate electrolytes during warm summer periods.',
      'Maintain vector protection with non-toxic citronella or neem oil spray against flies and ticks.',
    ];
    const veterinaryEscalation = [
      'Maintain regular state vaccination schedule (FMD, LSD, HS/BQ).',
      'Administer periodic broad-spectrum deworming every 3-4 months under veterinary guidance.',
      'Consult nearest Government Veterinary Dispensary or call 1962 for routine herd health checks.',
    ];

    return {
      status: 'HEALTHY',
      what_to_do_today: immediateActions,
      what_to_monitor: monitoring,
      prevention: [
        'Follow mandatory state livestock vaccination calendar (FMD twice yearly, LSD annual, HS/BQ pre-monsoon).',
        'Quarantine newly purchased livestock for at least 14 days before introducing into the general herd.',
      ],
      immediateActions,
      monitoring,
      supportiveCare,
      veterinaryEscalation,
      expert_help_required: false,
      disease_info: {
        disease_name: 'Healthy Animal — No Disease Detected (रोगमुक्त)',
        scientific_name: 'Physiologically Normal / Disease-Free',
        description: 'No cutaneous nodules, oral blisters, or abnormal discharges detected. The animal exhibits healthy rumination, active posture, and clean tissue condition.',
      },
    };
  }

  // Unknown or low-confidence disease fallback
  if (!disease) {
    const immediateActions = [
      'Quarantine the animal immediately in a clean, isolated shed separate from healthy livestock.',
      'Take clear, well-lit photographs of the skin nodules, oral cavity, or hooves in natural daylight.',
      'Clean affected areas gently with warm saline solution or mild potassium permanganate (1:1000).',
      'Provide soft green fodder, warm gruel, and clean drinking water ad libitum.',
    ];
    const monitoring = [
      'Record rectal body temperature twice daily (normal bovine temp is 101.5°F / 38.6°C).',
      'Observe daily rumination frequency, feed intake, and milk production levels.',
      'Check for spreading nodules, oral blistering, or lameness.',
    ];
    const supportiveCare = [
      'Provide electrolyte-enriched warm water with 50g jaggery and mineral mixture.',
      'Keep shed floor dry with lime powder and install mosquito/fly repellents.',
    ];
    const veterinaryEscalation = [
      'Alert nearest Government Veterinary Dispensary / Taluka Veterinary Officer.',
      'Call National Animal Disease Toll-Free Helpline: 1962 for on-farm emergency assistance.',
      'Do not administer unprescribed antibiotics or hormonal injections without veterinary guidance.',
    ];

    return {
      status,
      what_to_do_today: immediateActions,
      what_to_monitor: monitoring,
      prevention: [
        'Maintain strict herd biosecurity and restrict animal entry from outside markets.',
        'Ensure seasonal vaccination schedule (FMD, LSD, HS/BQ) is up to date.',
      ],
      immediateActions,
      monitoring,
      supportiveCare,
      veterinaryEscalation,
      expert_help_required: true,
      disease_info: {
        disease_name: predictedDisease || 'Undetermined Livestock Condition',
        scientific_name: 'Pathological agent unconfirmed',
        description: 'Livestock symptoms require clear daylight re-scanning or clinical veterinary officer verification.',
      },
    };
  }

  // Parse clinical steps into Veterinary Protocol Hierarchy
  const quarantineSteps = [];
  const antisepticSteps = [];
  const supportiveSteps = [];
  const vetRxSteps = [];

  (disease.remedy_steps || []).forEach((step) => {
    const lower = step.toLowerCase();
    if (lower.startsWith('quarantine') || lower.startsWith('isolation') || lower.startsWith('biosecurity')) {
      quarantineSteps.push(step.replace(/^(quarantine|isolation|biosecurity):\s*/i, ''));
    } else if (lower.startsWith('supportive') || lower.startsWith('antiseptic') || lower.startsWith('mechanical')) {
      antisepticSteps.push(step.replace(/^(supportive|antiseptic|mechanical):\s*/i, ''));
    } else if (lower.startsWith('nutrition') || lower.startsWith('diet') || lower.startsWith('biological')) {
      supportiveSteps.push(step.replace(/^(nutrition|diet|biological):\s*/i, ''));
    } else if (lower.startsWith('veterinary') || lower.startsWith('treatment') || lower.startsWith('chemical')) {
      vetRxSteps.push(step.replace(/^(veterinary|treatment|chemical(\s*\(.*?\))?):\s*/i, ''));
    } else {
      quarantineSteps.push(step);
    }
  });

  // Immediate Actions: Quarantine + Antiseptic wound/oral wash
  const immediateActions = [
    ...quarantineSteps,
    ...antisepticSteps,
  ];
  if (immediateActions.length === 0) {
    immediateActions.push(
      'Isolate affected livestock in a segregated fly-proof pen immediately',
      'Wash lesion sites with mild antiseptic solution (KMnO4 1:1000 or 1% soda)'
    );
  }

  // Supportive Care & Nutrition
  const supportiveCare = supportiveSteps.length > 0 ? supportiveSteps : [
    'Feed soft, easily digestible boiled mash (rice/ragi gruel with 50g jaggery and salt)',
    'Provide fresh tender green fodder and ad libitum clean drinking water with electrolytes',
  ];

  // Clinical Monitoring
  const monitoring = [
    'Measure and record rectal body temperature twice daily using a veterinary thermometer',
    'Track rumination chews per minute (normal 45-60) and observe water intake',
    'Inspect lesion margins for secondary bacterial pus or maggot infestation',
    'Monitor milk yield volume to track systemic recovery timeline',
  ];

  // Veterinary Intervention & Prescription Protocol
  const veterinaryEscalation = [];
  if (disease.safe_dosage && disease.safe_dosage.length > 0) {
    veterinaryEscalation.push(...disease.safe_dosage);
  } else if (vetRxSteps.length > 0) {
    veterinaryEscalation.push(...vetRxSteps);
  } else {
    veterinaryEscalation.push('Contact local Veterinary Officer for prescription antipyretics and wound ointments');
  }

  veterinaryEscalation.push(
    'Contact Maharashtra Department of Animal Husbandry Toll-Free Helpline: 1962 for doorstep veterinary support',
    status === 'HIGH'
      ? 'High severity detected: Mandatory notification to Taluka Veterinary Officer for ring vaccination protocol'
      : 'Consult nearest Veterinary Dispensary if fever or lesions persist beyond 3 days'
  );

  // Flat what_to_do_today for UI cards
  const whatToDoToday = status === 'HIGH'
    ? [...immediateActions, ...supportiveCare, ...veterinaryEscalation.slice(0, 1)]
    : [...immediateActions, ...supportiveCare];

  return {
    status,
    what_to_do_today: whatToDoToday,
    what_to_monitor: monitoring,
    prevention: disease.prevention_steps || [],
    immediateActions,
    monitoring,
    supportiveCare,
    veterinaryEscalation,
    expert_help_required: expertHelpRequired,
    disease_info: {
      disease_name: disease.disease_name,
      scientific_name: disease.scientific_name,
      description: disease.description,
      how_it_spreads: disease.how_it_spreads,
      safe_dosage: disease.safe_dosage,
      vet_protocol_order: disease.vet_protocol_order || [
        'Quarantine & Shed Biosecurity',
        'Antiseptic Wash & Fly Repellent',
        'Supportive Mash Feeding',
        'Veterinary Medical Treatment',
        'Ring Vaccination in 5km Zone',
      ],
    },
  };
}

module.exports = { buildAdvisory, severityToStatus };
