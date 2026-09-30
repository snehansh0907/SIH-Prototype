import { apiClient } from './apiClient';
import type { VeterinaryCaseRecord, OutbreakAlert, CaseStatus } from '../types';

export interface RegionalDiseaseSignal {
  id: string;
  type: 'cluster' | 'climate' | 'vaccination' | 'vector' | 'mortality';
  title: string;
  titleHi: string;
  titleMr: string;
  description: string;
  descriptionHi: string;
  descriptionMr: string;
  riskLevel: 'high' | 'medium' | 'low';
  location: string;
  timestamp: string;
  actionRequired?: string;
}

export interface OperationalMetrics {
  totalCases: number;
  openCases: number;
  underReview: number;
  sampleTaken: number;
  escalated: number;
  resolved: number;
  mortality: number;
  highRisk: number;
  activeOutbreaks: number;
}

const LOCAL_STORAGE_VET_CASES_KEY = 'pashu_sarthak_vet_cases';

const SEEDED_VET_CASES: VeterinaryCaseRecord[] = [
  {
    id: 'CASE-MH-NPH-024',
    case_id: 'CASE-MH-NPH-024',
    report_type: 'symptom',
    farmer_id: 'farmer123',
    farmer_name: 'Ramesh Patil',
    farmer_phone: '+91 98200 00000',
    village: 'Niphad Central',
    taluka: 'Niphad',
    district: 'Nashik',
    latitude: 20.0825,
    longitude: 74.1112,
    species: 'Cattle (Cow)',
    disease_name: 'Lumpy Skin Disease',
    disease_name_hi: 'लम्पी त्वचा रोग',
    disease_name_mr: 'लम्पी त्वचा रोग',
    severity: 'high',
    confidence: 0.89,
    status: 'New',
    is_outbreak_flagged: true,
    outbreak_id: 'OUT-LSD-NIP-01',
    created_at: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    image_url: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=400&q=80',
    notes: 'Firm circular cutaneous nodules of 2-5 cm across neck, brisket and flank. High fever (104.5°F) for 2 days. Reduced milk yield from 12L to 4L.',
    status_history: [
      {
        from_status: undefined,
        to_status: 'New',
        timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
        updated_by: 'Livestock Owner Report',
        notes: 'Initial symptom upload via Pashu Sarthak mobile PWA',
      },
    ],
  },
  {
    id: 'CASE-MH-NPH-021',
    case_id: 'CASE-MH-NPH-021',
    report_type: 'symptom',
    farmer_id: 'vikas123',
    farmer_name: 'Vikas More',
    farmer_phone: '+91 98200 24680',
    village: 'Chandori',
    taluka: 'Niphad',
    district: 'Nashik',
    latitude: 20.0797,
    longitude: 74.0322,
    species: 'Buffalo',
    disease_name: 'Foot and Mouth Disease (FMD)',
    disease_name_hi: 'खुरपका और मुंहपका रोग',
    disease_name_mr: 'लाळ्या खुरकूत',
    severity: 'high',
    confidence: 0.86,
    status: 'Under Review',
    is_outbreak_flagged: true,
    outbreak_id: 'OUT-FMD-CHD-02',
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    image_url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=400&q=80',
    notes: 'Vesicular lesions observed on interdigital space and tongue. Excessive salivation, refusal to eat, severe lameness.',
    status_history: [
      {
        from_status: undefined,
        to_status: 'New',
        timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        updated_by: 'Livestock Owner Report',
      },
      {
        from_status: 'New',
        to_status: 'Under Review',
        timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
        updated_by: 'Dr. Rajesh Kadam (Taluka Veterinary Officer)',
        notes: 'Clinical triage initiated. Field team assigned for quarantine protocol.',
      },
    ],
  },
  {
    id: 'CASE-MH-NPH-018',
    case_id: 'CASE-MH-NPH-018',
    report_type: 'symptom',
    farmer_id: 'suresh123',
    farmer_name: 'Suresh Jadhav',
    farmer_phone: '+91 98200 49360',
    village: 'Lasalgaon',
    taluka: 'Niphad',
    district: 'Nashik',
    latitude: 20.145,
    longitude: 74.228,
    species: 'Goat',
    disease_name: 'Peste des Petits Ruminants (PPR)',
    disease_name_hi: 'पीपीआर (बकरी प्लेग)',
    disease_name_mr: 'शेळी प्लेग (पीपीआर)',
    severity: 'moderate',
    confidence: 0.82,
    status: 'Sample Collected',
    sample_id: 'MH-NIP-2026-S4081',
    created_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    image_url: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=400&q=80',
    notes: 'Nasal discharge, erosive stomatitis and mild diarrhea. Nasal swab & blood sample collected for confirmatory RT-PCR.',
    status_history: [
      {
        from_status: 'New',
        to_status: 'Under Review',
        timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        updated_by: 'Dr. Rajesh Kadam',
      },
      {
        from_status: 'Under Review',
        to_status: 'Sample Collected',
        timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        updated_by: 'Dr. Rajesh Kadam',
        sample_id: 'MH-NIP-2026-S4081',
        notes: 'Specimen collected and packaged in cold-chain transport container.',
      },
    ],
  },
  {
    id: 'CASE-MH-NPH-015',
    case_id: 'CASE-MH-NPH-015',
    report_type: 'symptom',
    farmer_id: 'anita123',
    farmer_name: 'Anita Shinde',
    farmer_phone: '+91 98200 37020',
    village: 'Ozar',
    taluka: 'Niphad',
    district: 'Nashik',
    latitude: 20.0927,
    longitude: 73.9189,
    species: 'Cattle (Cow)',
    disease_name: 'Bovine Babesiosis (Tick Fever)',
    disease_name_hi: 'बवेसिओसिस (टिक फीवर)',
    disease_name_mr: 'गोचीड ताप (बॅबेसियोसिस)',
    severity: 'high',
    confidence: 0.91,
    status: 'Escalated',
    sample_id: 'MH-NIP-2026-S3912',
    lab_referral: 'District Disease Diagnostic Laboratory (DDDL), Nashik',
    created_at: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    image_url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=400&q=80',
    notes: 'High fever, hemoglobinuria (coffee-colored urine), severe pale mucous membranes and tick infestation. Referred urgently for Giemsa stained blood smear confirmation.',
    status_history: [
      {
        from_status: 'Sample Collected',
        to_status: 'Escalated',
        timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
        updated_by: 'Dr. Rajesh Kadam',
        lab_referral: 'District Disease Diagnostic Laboratory (DDDL), Nashik',
        notes: 'Escalated to DDDL Nashik for urgent protozoan identification.',
      },
    ],
  },
  {
    id: 'CASE-MH-NPH-012',
    case_id: 'CASE-MH-NPH-012',
    report_type: 'mortality',
    farmer_id: 'sunita123',
    farmer_name: 'Sunita Jadhav',
    farmer_phone: '+91 98200 12340',
    village: 'Pimpalgaon',
    taluka: 'Niphad',
    district: 'Nashik',
    latitude: 20.0325,
    longitude: 74.0731,
    species: 'Goat',
    disease_name: 'Suspected Enterotoxemia',
    suspected_cause: 'Acute Enterotoxemia (Pulpy Kidney)',
    severity: 'high',
    status: 'Resolved',
    date_of_death: '2026-09-28',
    approximate_age: '8 Months',
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    notes: 'Sudden death post lush green grazing. Post-mortem findings consistent with acute enterotoxemia. Flock ring-vaccinated with Enterotoxemia bacterin toxoid.',
    status_history: [
      {
        from_status: 'Under Review',
        to_status: 'Resolved',
        timestamp: new Date(Date.now() - 16 * 3600 * 1000).toISOString(),
        updated_by: 'Dr. Rajesh Kadam',
        notes: 'Carcass deep burial completed. Herd preventive booster completed.',
      },
    ],
  },
  {
    id: 'CASE-MH-NPH-009',
    case_id: 'CASE-MH-NPH-009',
    report_type: 'symptom',
    farmer_id: 'manisha123',
    farmer_name: 'Manisha Pawar',
    farmer_phone: '+91 98200 61700',
    village: 'Vinchur',
    taluka: 'Niphad',
    district: 'Nashik',
    latitude: 20.112,
    longitude: 74.254,
    species: 'Cattle (Cow)',
    disease_name: 'Clinical Mastitis',
    disease_name_hi: 'थनैला रोग',
    disease_name_mr: 'स्तनदाह (मस्तितीस)',
    severity: 'moderate',
    confidence: 0.88,
    status: 'Resolved',
    created_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    notes: 'Swollen left-hind quarter, clot-filled watery secretion. Treated with intramammary cephalosporin and anti-inflammatory course. Quarter cleared.',
    status_history: [
      {
        from_status: 'Under Review',
        to_status: 'Resolved',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        updated_by: 'Dr. Rajesh Kadam',
        notes: 'Somatic cell count normalized. Milk secretion returned to normal.',
      },
    ],
  },
];

const SEEDED_OUTBREAKS: OutbreakAlert[] = [
  {
    id: 'OUT-LSD-NIP-01',
    disease_name: 'Lumpy Skin Disease (LSD)',
    species: 'cattle',
    total_case_count: 5,
    symptom_case_count: 5,
    mortality_case_count: 0,
    radius_km: 5.0,
    time_window_days: 7,
    threshold_crossed: 3,
    case_ids: ['CASE-MH-NPH-024', 'CASE-MH-NPH-021'],
    flagged_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    status: 'ACTIVE',
    notes: '5km ring surveillance and goat pox vaccine booster deployed across Niphad central & Lasalgaon corridor.',
    cluster_center: {
      latitude: 20.0825,
      longitude: 74.1112,
      village: 'Niphad Central',
      taluka: 'Niphad',
      district: 'Nashik',
    },
  },
  {
    id: 'OUT-FMD-CHD-02',
    disease_name: 'Foot and Mouth Disease (FMD)',
    species: 'buffalo',
    total_case_count: 3,
    symptom_case_count: 3,
    mortality_case_count: 0,
    radius_km: 3.5,
    time_window_days: 5,
    threshold_crossed: 3,
    case_ids: ['CASE-MH-NPH-021', 'CASE-MH-NPH-018'],
    flagged_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    status: 'ACTIVE',
    notes: 'Movement restriction on livestock transport vehicles across Godavari river belt in Chandori.',
    cluster_center: {
      latitude: 20.0797,
      longitude: 74.0322,
      village: 'Chandori',
      taluka: 'Niphad',
      district: 'Nashik',
    },
  },
];

const SEEDED_REGIONAL_SIGNALS: RegionalDiseaseSignal[] = [
  {
    id: 'SIG-001',
    type: 'cluster',
    title: 'Lumpy Skin Disease Spatial Cluster',
    titleHi: 'लम्पी स्किन डिजीज स्थानिक क्लस्टर',
    titleMr: 'लम्पी त्वचा रोग स्थानिक क्लस्टर',
    description: '3 suspected cases detected within 3.8 km radius in Niphad over 48 hours.',
    descriptionHi: 'निफाड में 48 घंटों में 3.8 किमी के दायरे में 3 संदिग्ध मामले सामने आए।',
    descriptionMr: 'निफाड परिसरात गेल्या ४८ तासांत ३.८ किमी क्षेत्रात ३ संशयित प्रकरणे आढळली.',
    riskLevel: 'high',
    location: 'Niphad Taluka Central',
    timestamp: '32 min ago',
    actionRequired: 'Initiate 5km ring vaccination protocol & vector fogging.',
  },
  {
    id: 'SIG-002',
    type: 'vector',
    title: 'High Humidity Vector Activity Risk',
    titleHi: 'उच्च आर्द्रता वेक्टर (मच्छर/मक्खी) सक्रियता जोखिम',
    titleMr: 'उच्च आर्द्रता कीटक/डास वाढीचा धोका',
    description: 'Current relative humidity (84%) creates favorable multiplication window for Stomoxys calcitrans and Aedes mosquitoes.',
    descriptionHi: 'वर्तमान आर्द्रता (84%) से मक्खी व मच्छरों के प्रजनन में वृद्धि की संभावना।',
    descriptionMr: 'सध्याच्या हवेतील दमटपणामुळे (८४%) गोचीड, डास व चावणाऱ्या माश्यांचा प्रादुर्भाव वाढण्याची शक्यता.',
    riskLevel: 'medium',
    location: 'Godavari River Basin, Niphad',
    timestamp: '2 hours ago',
    actionRequired: 'Advise livestock owners to apply deltamethrin/cypermethrin shed spray.',
  },
  {
    id: 'SIG-003',
    type: 'vaccination',
    title: 'FMD Booster Coverage Gap',
    titleHi: 'खुरपका-मुंहपका (FMD) बूस्टर कवरेज अंतराल',
    titleMr: 'लाळ्या खुरकूत (FMD) लस बूस्टर अंतर',
    description: '18% dairy herds in Vinchur & Lasalgaon zone due for bi-annual FMD booster.',
    descriptionHi: 'विंचुर एवं लासलगांव क्षेत्र के 18% पशुओं का FMD बूस्टर लंबित।',
    descriptionMr: 'विंचूर व लासलगाव भागातील १८% जनावरांचे ६ महिन्यांचे लस बूस्टर देणे बाकी आहे.',
    riskLevel: 'medium',
    location: 'Vinchur & Lasalgaon Circle',
    timestamp: '5 hours ago',
    actionRequired: 'Schedule mobile veterinary dispensary vaccination camp.',
  },
];

function getStoredLocalCases(): VeterinaryCaseRecord[] {
  if (typeof localStorage === 'undefined') return SEEDED_VET_CASES;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_VET_CASES_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_VET_CASES_KEY, JSON.stringify(SEEDED_VET_CASES));
      return SEEDED_VET_CASES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return SEEDED_VET_CASES;
  } catch {
    return SEEDED_VET_CASES;
  }
}

function saveStoredLocalCases(cases: VeterinaryCaseRecord[]) {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_VET_CASES_KEY, JSON.stringify(cases));
    } catch {}
  }
}

export const veterinaryOfficerService = {
  /**
   * Fetch all regional surveillance cases
   */
  async getSurveillanceCases(): Promise<{ success: boolean; data: VeterinaryCaseRecord[]; source: 'api' | 'local' }> {
    try {
      const res = await apiClient<{ success: boolean; data: VeterinaryCaseRecord[]; count: number }>('/diagnosis/cases', {
        method: 'GET',
        timeout: 6000,
      });
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        saveStoredLocalCases(res.data);
        return { success: true, data: res.data, source: 'api' };
      }
    } catch (err) {
      // Fallback cleanly to local storage
    }
    const local = getStoredLocalCases();
    return { success: true, data: local, source: 'local' };
  },

  /**
   * Fetch active outbreak clusters
   */
  async getOutbreakAlerts(): Promise<{ success: boolean; data: OutbreakAlert[]; source: 'api' | 'local' }> {
    try {
      const res = await apiClient<{ success: boolean; data: OutbreakAlert[]; count: number }>('/outbreaks', {
        method: 'GET',
        timeout: 6000,
      });
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        return { success: true, data: res.data, source: 'api' };
      }
    } catch (err) {}
    return { success: true, data: SEEDED_OUTBREAKS, source: 'local' };
  },

  /**
   * Get operational disease and bioclimatic risk signals
   */
  getRegionalDiseaseSignals(): RegionalDiseaseSignal[] {
    return SEEDED_REGIONAL_SIGNALS;
  },

  /**
   * Calculate operational KPI metrics
   */
  calculateMetrics(cases: VeterinaryCaseRecord[], outbreaks: OutbreakAlert[]): OperationalMetrics {
    const totalCases = cases.length;
    const openCases = cases.filter((c) => (c.status || 'New') === 'New').length;
    const underReview = cases.filter((c) => c.status === 'Under Review').length;
    const sampleTaken = cases.filter((c) => c.status === 'Sample Collected').length;
    const escalated = cases.filter((c) => c.status === 'Escalated').length;
    const resolved = cases.filter((c) => c.status === 'Resolved').length;
    const mortality = cases.filter((c) => c.report_type === 'mortality').length;
    const highRisk = cases.filter((c) => c.severity === 'high' || c.is_outbreak_flagged).length;
    const activeOutbreaks = outbreaks.filter((o) => (o.status || 'ACTIVE').toUpperCase() === 'ACTIVE').length;

    return {
      totalCases,
      openCases,
      underReview,
      sampleTaken,
      escalated,
      resolved,
      mortality,
      highRisk,
      activeOutbreaks,
    };
  },

  /**
   * Update case status with notes, sample ID, and lab referral
   */
  async updateCaseStatus(
    caseId: string,
    targetStatus: CaseStatus,
    officerNotes?: string,
    sampleId?: string,
    labReferral?: string
  ): Promise<{ success: boolean; data: VeterinaryCaseRecord; message?: string }> {
    const timestamp = new Date().toISOString();
    const cleanNotes = (officerNotes || '').trim() || `Status updated to ${targetStatus}`;

    // 1. Try updating backend API
    try {
      const res = await apiClient<{ success: boolean; data: VeterinaryCaseRecord; message?: string }>(
        `/diagnosis/${encodeURIComponent(caseId)}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            status: targetStatus,
            notes: cleanNotes,
            sample_id: sampleId?.trim() || undefined,
            lab_referral: targetStatus === 'Escalated' ? labReferral?.trim() : undefined,
            updated_by: 'Dr. Rajesh Kadam (Taluka Veterinary Officer)',
          }),
          timeout: 6000,
        }
      );
      if (res.success && res.data) {
        // Synchronize local cache
        const local = getStoredLocalCases();
        const updatedList = local.map((c) => (c.id === caseId || c.case_id === caseId ? res.data : c));
        saveStoredLocalCases(updatedList);
        return { success: true, data: res.data, message: res.message || `Case updated to ${targetStatus}` };
      }
    } catch {}

    // 2. Offline / Local fallback update
    const local = getStoredLocalCases();
    let targetCase = local.find((c) => c.id === caseId || c.case_id === caseId);

    if (!targetCase) {
      targetCase = {
        id: caseId,
        case_id: caseId,
        status: targetStatus,
        created_at: timestamp,
      };
    }

    const updatedCase: VeterinaryCaseRecord = {
      ...targetCase,
      status: targetStatus,
      sample_id: sampleId?.trim() || targetCase.sample_id,
      lab_referral: targetStatus === 'Escalated' ? labReferral?.trim() : targetCase.lab_referral,
      vet_notes: cleanNotes,
      updated_at: timestamp,
      status_history: [
        ...(targetCase.status_history || []),
        {
          from_status: targetCase.status,
          to_status: targetStatus,
          timestamp,
          updated_by: 'Dr. Rajesh Kadam (Taluka Veterinary Officer)',
          notes: cleanNotes,
          sample_id: sampleId?.trim() || undefined,
          lab_referral: targetStatus === 'Escalated' ? labReferral?.trim() : undefined,
        },
      ],
    };

    const nextList = local.map((c) => (c.id === caseId || c.case_id === caseId ? updatedCase : c));
    if (!local.some((c) => c.id === caseId || c.case_id === caseId)) {
      nextList.unshift(updatedCase);
    }
    saveStoredLocalCases(nextList);

    return {
      success: true,
      data: updatedCase,
      message: `Status updated to ${targetStatus} (Recorded in local surveillance ledger)`,
    };
  },
};
