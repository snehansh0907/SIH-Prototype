// =========================================================
// Advisory Service
// =========================================================
// Builds a farmer-friendly IPM advisory response for a given
// diagnosis case, using the disease knowledge base.
//
// Recommendation order always follows:
//   1. Cultural practices
//   2. Mechanical controls
//   3. Biological controls
//   4. Chemical intervention (only when necessary)
// =========================================================

const { findDisease } = require('../data/diseaseKnowledgeBase');

function severityToStatus(severityBand) {
  if (!severityBand) return 'LOW';
  const band = severityBand.toLowerCase();
  if (band === 'severe' || band === 'high') return band === 'severe' ? 'HIGH' : 'HIGH';
  if (band === 'moderate') return 'MODERATE';
  return 'LOW';
}

/**
 * Build the advisory payload for a diagnosis case.
 * @param {object} diagnosisCase - row from diagnosis_cases
 * @param {string} cropName - crop name from the linked crop cycle
 */
function buildAdvisory(diagnosisCase, cropName) {
  const disease = findDisease(cropName, diagnosisCase.predicted_disease);

  const status = severityToStatus(diagnosisCase.severity_band);
  const expertHelpRequired =
    status === 'HIGH' || diagnosisCase.status === 'expert_review_pending';

  if (!disease) {
    // Fallback advisory when the disease isn't in the knowledge base yet
    return {
      status,
      what_to_do_today: [
        'Isolate and closely inspect the affected plants',
        'Take clear photos of both sides of affected leaves for expert review',
        'Avoid applying any pesticide until the disease is confirmed',
      ],
      what_to_monitor: [
        'Spread of symptoms to nearby plants',
        'Any change in leaf color, spotting, or wilting',
      ],
      prevention: [
        'Maintain field hygiene and remove crop debris',
        'Avoid overhead irrigation where possible',
      ],
      expert_help_required: true,
    };
  }

  // Order remedy steps to follow cultural -> mechanical -> biological -> chemical
  const whatToDoToday = [...disease.remedy_steps];

  // For low/moderate severity, drop chemical suggestions from "today" list
  // and move them into monitoring guidance instead, to avoid pesticide-first behaviour.
  let todayFiltered = whatToDoToday;
  let monitorExtra = [];
  if (status !== 'HIGH') {
    todayFiltered = whatToDoToday.filter((step) => !step.toLowerCase().startsWith('chemical'));
    const chemicalSteps = whatToDoToday.filter((step) => step.toLowerCase().startsWith('chemical'));
    monitorExtra = chemicalSteps.map(
      (step) => `${step} (only if condition worsens despite the above steps)`
    );
  }

  return {
    status,
    what_to_do_today: todayFiltered,
    what_to_monitor: [
      'Whether symptoms spread to new leaves or plants over the next 3-5 days',
      'Weather changes (rain/humidity) that could accelerate spread',
      ...monitorExtra,
    ],
    prevention: disease.prevention_steps,
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

module.exports = { buildAdvisory };
