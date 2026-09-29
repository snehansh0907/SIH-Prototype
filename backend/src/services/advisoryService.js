// =========================================================
// Advisory Service (IPM Engine)
// =========================================================
// Builds structured Integrated Pest Management (IPM) advisory
// following strict agronomic hierarchy:
//   1. WHAT TO DO NOW (Immediate cultural & sanitation actions)
//   2. MONITORING (Recheck intervals, humidity spread checks)
//   3. BIOLOGICAL OPTIONS (Bio-fungicides, Trichoderma, neem)
//   4. CHEMICAL INTERVENTION (Only validated, label-compliant last resort)
//   5. EXPERT ESCALATION (Thresholds for agronomist consultation)
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
 * Build structured IPM advisory for a diagnosis.
 * @param {object} diagnosisCase - row from diagnosis_cases or diagnosis result object
 * @param {string} cropName - crop name (e.g. "Onion", "Tomato")
 */
function buildAdvisory(diagnosisCase, cropName = 'Onion') {
  const predictedDisease = diagnosisCase.predicted_disease || diagnosisCase.disease;
  const disease = findDisease(cropName, predictedDisease);

  const status = severityToStatus(diagnosisCase.severity_band || diagnosisCase.severity);
  const expertHelpRequired =
    status === 'HIGH' ||
    diagnosisCase.status === 'expert_review_pending' ||
    diagnosisCase.isUncertain;

  // Unknown or low-confidence disease fallback
  if (!disease) {
    const immediateActions = [
      'Isolate and closely inspect adjacent plants for early lesion development',
      'Take clear, well-lit photos of both upper and lower leaf surfaces',
      'Avoid applying synthetic pesticides until disease identity is confirmed by an agronomist',
      'Ensure proper drainage to prevent root moisture stagnation',
    ];
    const monitoring = [
      'Recheck crop in 48 hours for symptom spread or color alterations',
      'Monitor relative humidity and morning dew duration on foliage',
    ];
    const biologicalOptions = [
      'Apply preventive bio-control spray of Trichoderma viride @ 5g/L on lower canopy if conditions are wet',
      'Maintain field sanitation and organic mulch cleanliness',
    ];
    const chemicalIntervention = [
      'Chemical treatment is NOT recommended without certified expert diagnosis',
      'Consult nearest Krishi Vigyan Kendra (KVK) or local agronomist before spraying',
    ];
    const expertEscalation = [
      'Contact local agricultural extension officer or request verification in the app',
      'Escalate immediately if symptoms spread across more than 5% of field canopy',
    ];

    return {
      status,
      what_to_do_today: immediateActions,
      what_to_monitor: monitoring,
      prevention: [
        'Maintain field hygiene and rogue out suspicious debris',
        'Avoid late-evening overhead sprinkler irrigation',
      ],
      immediateActions,
      monitoring,
      biologicalOptions,
      chemicalIntervention,
      expertEscalation,
      expert_help_required: true,
      disease_info: {
        disease_name: predictedDisease || 'Undetermined Plant Issue',
        scientific_name: 'Pathogen not yet confirmed',
        description: 'Plant symptoms require clear daylight re-scanning or manual agronomic verification.',
      },
    };
  }

  // Parse remedy steps into IPM hierarchy
  const culturalSteps = [];
  const mechanicalSteps = [];
  const biologicalSteps = [];
  const chemicalSteps = [];

  (disease.remedy_steps || []).forEach((step) => {
    const lower = step.toLowerCase();
    if (lower.startsWith('cultural')) {
      culturalSteps.push(step.replace(/^cultural:\s*/i, ''));
    } else if (lower.startsWith('mechanical')) {
      mechanicalSteps.push(step.replace(/^mechanical:\s*/i, ''));
    } else if (lower.startsWith('biological')) {
      biologicalSteps.push(step.replace(/^biological:\s*/i, ''));
    } else if (lower.startsWith('chemical')) {
      chemicalSteps.push(step.replace(/^chemical(\s*\(.*?\))?:\s*/i, ''));
    } else {
      culturalSteps.push(step);
    }
  });

  // Immediate Actions: Cultural + Mechanical
  const immediateActions = [
    ...culturalSteps,
    ...mechanicalSteps,
  ];
  if (immediateActions.length === 0) {
    immediateActions.push(
      'Inspect nearby crop rows to map lesion perimeter',
      'Improve furrow drainage and restrict overhead irrigation'
    );
  }

  // Biological Options
  const biologicalOptions = biologicalSteps.length > 0 ? biologicalSteps : [
    'Apply Trichoderma viride or Pseudomonas fluorescens @ 5 g/litre as preventive foliar spray',
    'Spray 5% Neem Seed Kernel Extract (NSKE) to deter secondary pest vectors',
  ];

  // Monitoring Steps
  const monitoring = [
    'Recheck the crop after 48-72 hours to evaluate if lesions are dry or expanding',
    'Monitor weather forecasts for impending rainfall and high relative humidity (>80%)',
    'Track lower leaf canopy where micro-climate humidity remains highest',
  ];

  // Chemical Intervention (Validated & label-compliant)
  const chemicalIntervention = [];
  if (disease.safe_dosage && disease.safe_dosage.length > 0) {
    chemicalIntervention.push(...disease.safe_dosage);
  } else if (chemicalSteps.length > 0) {
    chemicalIntervention.push(...chemicalSteps);
  } else {
    chemicalIntervention.push('Consult local Krishi Kendra for registered, label-approved fungicide dosage');
  }

  // If severity is Low/Moderate, highlight that chemicals are last resort
  if (status !== 'HIGH') {
    chemicalIntervention.unshift(
      'Synthetic chemical sprays are currently NOT recommended at this mild stage. Rely on biological and cultural controls first.'
    );
  }

  // Expert Escalation
  const expertEscalation = [
    status === 'HIGH'
      ? 'High severity detected: Submit case for expert verification immediately to prevent widespread yield loss'
      : 'Contact a certified agricultural expert if symptoms persist or expand after 4 days of cultural treatment',
    'Bring affected leaf sample inside an aerated paper bag to local Krishi Vigyan Kendra (KVK) if unsure',
  ];

  // Flat what_to_do_today for UI cards
  const whatToDoToday = status === 'HIGH'
    ? [...immediateActions, ...biologicalOptions, ...chemicalIntervention.slice(0, 1)]
    : [...immediateActions, ...biologicalOptions];

  return {
    status,
    what_to_do_today: whatToDoToday,
    what_to_monitor: monitoring,
    prevention: disease.prevention_steps || [],
    immediateActions,
    monitoring,
    biologicalOptions,
    chemicalIntervention,
    expertEscalation,
    expert_help_required: expertHelpRequired,
    disease_info: {
      disease_name: disease.disease_name,
      scientific_name: disease.scientific_name,
      description: disease.description,
      how_it_spreads: disease.how_it_spreads,
      safe_dosage: disease.safe_dosage,
      ipm_priority_order: disease.ipm_priority_order,
    },
  };
}

module.exports = { buildAdvisory, severityToStatus };
