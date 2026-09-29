-- =========================================================
-- Pashu Sarthak (पशु सार्थक) - Supabase Database Migration
-- SIH Problem Statement SIH26128: Livestock Health Management
-- =========================================================
-- Non-destructive migration script.
-- Preserves existing tables and users while adding livestock tables,
-- vaccination records, and veterinary review structures.
-- =========================================================

-- Enable UUID extension if not already enabled
create extension if not exists "pgcrypto";

-- =========================================================
-- 1. LIVESTOCK HERD TABLE
-- =========================================================
create table if not exists livestock (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid references users(id) on delete cascade,
    tag_id text,
    name text,
    species text not null check (species in ('cattle', 'buffalo', 'goat', 'sheep', 'poultry', 'other')),
    breed text,
    age_months numeric,
    gender text check (gender in ('female', 'male')),
    herd_count integer not null default 1,
    health_status text not null default 'healthy' check (
        health_status in ('healthy', 'under_treatment', 'critical', 'recovered')
    ),
    photo_url text,
    notes text,
    last_check_date timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_livestock_owner_id on livestock(owner_id);
create index if not exists idx_livestock_species on livestock(species);
create index if not exists idx_livestock_tag_id on livestock(tag_id);

-- =========================================================
-- 2. VACCINATION RECORDS TABLE
-- =========================================================
create table if not exists vaccination_records (
    id uuid primary key default gen_random_uuid(),
    animal_id uuid references livestock(id) on delete cascade,
    owner_id uuid references users(id) on delete cascade,
    species text not null,
    vaccine_name text not null,
    administered_date date not null,
    next_due_date date not null,
    batch_number text,
    veterinarian_name text,
    status text not null default 'completed' check (
        status in ('completed', 'due_soon', 'overdue')
    ),
    notes text,
    created_at timestamptz not null default now()
);

create index if not exists idx_vaccination_animal_id on vaccination_records(animal_id);
create index if not exists idx_vaccination_owner_id on vaccination_records(owner_id);
create index if not exists idx_vaccination_next_due on vaccination_records(next_due_date);

-- =========================================================
-- 3. EXTEND DIAGNOSIS CASES FOR LIVESTOCK TRIAGE
-- =========================================================
-- Add columns if they don't exist yet to support animal health cases
alter table diagnosis_cases add column if not exists animal_id uuid references livestock(id) on delete set null;
alter table diagnosis_cases add column if not exists species text;
alter table diagnosis_cases add column if not exists affected_body_area text;
alter table diagnosis_cases add column if not exists symptoms jsonb default '[]'::jsonb;
alter table diagnosis_cases add column if not exists symptom_duration text;
alter table diagnosis_cases add column if not exists appetite_change text;
alter table diagnosis_cases add column if not exists veterinary_escalated boolean default false;
alter table diagnosis_cases add column if not exists triage_summary text;

-- =========================================================
-- 4. LIVESTOCK DISEASES & SYMPTOM KNOWLEDGE BASE
-- =========================================================
create table if not exists livestock_diseases (
    id uuid primary key default gen_random_uuid(),
    species text not null,
    disease_name text not null,
    hindi_name text,
    marathi_name text,
    affected_body_area text,
    severity text default 'Moderate' check (severity in ('Low', 'Moderate', 'High', 'Critical')),
    description text,
    symptoms jsonb default '[]'::jsonb,
    first_aid_steps jsonb default '[]'::jsonb,
    isolation_required boolean default true,
    veterinary_action text,
    vaccine_available text,
    created_at timestamptz not null default now()
);

create index if not exists idx_livestock_diseases_species on livestock_diseases(species);

-- =========================================================
-- 5. SEED CORE LIVESTOCK DISEASES INTO KNOWLEDGE BASE
-- =========================================================
insert into livestock_diseases (
    species, disease_name, hindi_name, marathi_name, affected_body_area, severity, description, symptoms, first_aid_steps, isolation_required, veterinary_action, vaccine_available
) values
(
    'cattle',
    'Lumpy Skin Disease (LSD)',
    'लंपी त्वचा रोग (LSD)',
    'लम्पी त्वचा रोग (LSD)',
    'skin',
    'High',
    'Viral disease causing firm nodules on skin, high fever, nasal discharge, and reduced milk yield.',
    '["Firm skin nodules (2-5 cm)", "High fever (104-106°F)", "Enlarged superficial lymph nodes", "Sudden drop in milk yield", "Watery eye and nasal discharge"]'::jsonb,
    '["Isolate infected animal immediately in a dry, shaded shed", "Apply neem leaf decoction or povidone-iodine on ruptured skin lesions", "Provide soft green fodder, fresh clean water and oral rehydration electrolyte solution", "Use mosquito and fly repellents to prevent vector transmission"]'::jsonb,
    true,
    'Call local Veterinary Officer (LDO) immediately. Lumpi-ProVacInd / Goat Pox vaccine required for ring-fencing nearby herd.',
    'Goat Pox / Lumpi-ProVacInd'
),
(
    'cattle',
    'Bovine Mastitis',
    'थनैला रोग (मैस्टाइटिस)',
    'स्तनदाह (मॅस्टायटिस)',
    'udder',
    'High',
    'Inflammation and infection of mammary gland causing hot, swollen quarter, pain, and abnormal watery/clotted milk.',
    '["Swollen, warm and painful udder quarter", "Watery, yellowish or clot-bearing milk", "Reluctance to be milked or let down milk", "Fever and loss of appetite in acute cases"]'::jsonb,
    '["Perform thorough hand milking and strip out infected quarter multiple times daily into disinfectant container", "Apply cold compress on acutely inflamed udder, followed by warm compress in chronic stage", "Maintain immaculate floor hygiene with dry lime powder"]'::jsonb,
    false,
    'Veterinary intramammary antibiotic infusion and anti-inflammatory injection (Flunixin / Meloxicam) required within 12-24 hours.',
    'Good Milking Hygiene Protocols'
),
(
    'cattle',
    'Foot and Mouth Disease (FMD)',
    'खुरपका-मुँहपका (FMD)',
    'लाळ्या खुरकूत (FMD)',
    'hooves',
    'Critical',
    'Highly contagious picornaviral disease causing painful blisters on tongue, gums, interdigital cleft of feet, and profuse salivation.',
    '["Excessive ropy salivation and drooling", "Painful blisters/erosions on tongue, dental pad and lips", "Severe lameness and lesions between hooves", "High fever followed by acute drop in lactation"]'::jsonb,
    '["Wash mouth with mild 1% potassium permanganate or alum solution", "Clean foot lesions with 4% sodium carbonate or mild antiseptic and dress with protective fly-repellent paste", "Provide soft gruel (congee) and easily digestible greens"]'::jsonb,
    true,
    'Urgent veterinary notification mandatory under National Animal Disease Control Programme (NADCP). Administer bi-annual FMD vaccination.',
    'Raksha-Trivac / FMD Oil Adjuvant Vaccine'
),
(
    'goat',
    'Peste des Petits Ruminants (PPR)',
    'बकरी प्लेग (PPR)',
    'शेळी प्लेग (PPR)',
    'digestive',
    'Critical',
    'Contagious viral disease of sheep and goats causing fever, mouth ulcerations, pneumonia, and severe fetid diarrhea.',
    '["Sudden high fever and dullness", "Erosive sores inside mouth and crusty nose discharge", "Severe foul-smelling diarrhea leading to rapid dehydration", "Pneumonia with rapid labored breathing"]'::jsonb,
    '["Strictly isolate all sick goats from the flock", "Administer Oral Rehydration Salts (ORS) solution continuously to prevent dehydration", "Keep animals in clean, dry shelter away from cold drafts"]'::jsonb,
    true,
    'Veterinary symptomatic treatment with broad-spectrum antibiotics and supportive fluid therapy. Single-shot lifetime PPR vaccination mandatory.',
    'Live Attenuated PPR Vaccine'
)
on conflict do nothing;

-- =========================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================
alter table livestock enable row level security;
alter table vaccination_records enable row level security;
alter table livestock_diseases enable row level security;

-- Livestock Herd: Owners can view and modify their own animals
drop policy if exists "Owners can view their own livestock" on livestock;
create policy "Owners can view their own livestock"
    on livestock for select
    using (auth.uid() = owner_id or owner_id is null);

drop policy if exists "Owners can insert their own livestock" on livestock;
create policy "Owners can insert their own livestock"
    on livestock for insert
    with check (auth.uid() = owner_id or owner_id is null);

drop policy if exists "Owners can update their own livestock" on livestock;
create policy "Owners can update their own livestock"
    on livestock for update
    using (auth.uid() = owner_id or owner_id is null);

-- Vaccination Records: Owners can view and manage their vaccinations
drop policy if exists "Owners can view their own vaccination records" on vaccination_records;
create policy "Owners can view their own vaccination records"
    on vaccination_records for select
    using (auth.uid() = owner_id or owner_id is null);

drop policy if exists "Owners can manage their vaccination records" on vaccination_records;
create policy "Owners can manage their vaccination records"
    on vaccination_records for all
    using (auth.uid() = owner_id or owner_id is null);

-- Livestock Diseases Knowledge Base: Public read-only
drop policy if exists "Public can read livestock diseases knowledge base" on livestock_diseases;
create policy "Public can read livestock diseases knowledge base"
    on livestock_diseases for select
    using (true);

-- =========================================================
-- End of Pashu Sarthak Migration
-- =========================================================
