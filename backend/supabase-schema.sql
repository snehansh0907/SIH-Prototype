-- =========================================================
-- Pashu Sarthak (पशु सार्थक) - Supabase PostgreSQL Schema
-- SIH26128: Early Detection, Prevention & Management of Livestock Diseases
-- Govt. of Maharashtra - Animal Husbandry Department
-- =========================================================
-- Run this entire file in the Supabase SQL editor:
-- (Project > SQL Editor > New Query > paste > Run)
-- =========================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- =========================================================
-- 1. USERS (Livestock Owners, Veterinarians, Officials)
-- =========================================================
create table if not exists users (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    phone text unique,
    email text,
    role text not null default 'owner' check (role in ('owner', 'farmer', 'veterinarian', 'expert', 'official')),
    preferred_language text default 'mr',
    district text,
    taluka text,
    village text,
    created_at timestamptz not null default now()
);

-- =========================================================
-- 2. HERDS / ANIMAL SHEDS (Replaces Farms)
-- =========================================================
create table if not exists herds (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid references users(id) on delete cascade,
    shed_name text not null,
    species text not null default 'Cattle' check (
        species in ('Cattle', 'Buffalo', 'Goat', 'Sheep', 'Poultry', 'Mixed')
    ),
    breed text,
    total_animals integer not null default 4,
    age_range text, -- e.g. "2 calves, 3 lactating adults, 1 dry"
    vaccination_history jsonb default '[]'::jsonb, -- e.g. ["LSD Goat Pox 2026", "FMD NADCP 2026"]
    latitude double precision not null,
    longitude double precision not null,
    village text,
    taluka text,
    district text,
    state text default 'Maharashtra',
    shed_area_sqft numeric,
    created_at timestamptz not null default now()
);

create index if not exists idx_herds_owner_id on herds(owner_id);
create index if not exists idx_herds_location on herds(latitude, longitude);
create index if not exists idx_herds_species on herds(species);

-- =========================================================
-- 3. ANIMAL UNITS (Individual animals or batches)
-- =========================================================
create table if not exists animal_units (
    id uuid primary key default gen_random_uuid(),
    herd_id uuid references herds(id) on delete cascade,
    tag_number text, -- INAPH / Pashu Aadhaar 12-digit ear tag
    species text not null default 'Cattle',
    breed text,
    gender text default 'female' check (gender in ('female', 'male')),
    age_months integer,
    lactation_status text default 'lactating' check (
        lactation_status in ('calf', 'heifer', 'lactating', 'dry', 'breeding_bull', 'working_ox')
    ),
    health_status text default 'healthy' check (
        health_status in ('healthy', 'suspected', 'quarantined', 'recovered', 'deceased')
    ),
    vaccination_records jsonb default '[]'::jsonb,
    created_at timestamptz not null default now()
);

create index if not exists idx_animal_units_herd_id on animal_units(herd_id);
create index if not exists idx_animal_units_tag on animal_units(tag_number);

-- =========================================================
-- 4. LIVESTOCK DISEASES (Knowledge Base)
-- =========================================================
create table if not exists diseases (
    id uuid primary key default gen_random_uuid(),
    species text not null, -- 'Cattle', 'Buffalo', 'Goat', 'Sheep'
    disease_name text not null, -- 'Lumpy Skin Disease (LSD)', 'Foot-and-Mouth Disease (FMD)'
    disease_name_hi text,
    disease_name_mr text,
    scientific_name text, -- 'Capripoxvirus', 'Aphthovirus'
    description text,
    visual_symptoms jsonb default '[]'::jsonb,
    transmission_vectors jsonb default '[]'::jsonb,
    how_it_spreads jsonb default '[]'::jsonb,
    prevention_steps jsonb default '[]'::jsonb,
    remedy_steps jsonb default '[]'::jsonb,
    treatment_protocol jsonb default '[]'::jsonb,
    veterinary_priority_order jsonb default '["isolation", "antiseptic_care", "supportive_therapy", "veterinary_vaccination"]'::jsonb,
    is_notifiable boolean default true,
    created_at timestamptz not null default now()
);

create index if not exists idx_diseases_species on diseases(species);
create index if not exists idx_diseases_name on diseases(disease_name);

-- =========================================================
-- 5. ANIMAL DIAGNOSIS CASES
-- =========================================================
create table if not exists diagnosis_cases (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid references users(id) on delete set null,
    herd_id uuid references herds(id) on delete set null,
    animal_unit_id uuid references animal_units(id) on delete set null,

    species text not null default 'Cattle',
    image_url text,

    predicted_disease text not null,
    confidence numeric not null,

    severity_band text check (severity_band in ('Low', 'Moderate', 'High', 'Severe')),
    severity_percent numeric,

    affected_body_part text, -- 'skin_nodules', 'mouth_tongue', 'hoof_coronet', 'generalized'
    symptoms_observed jsonb default '[]'::jsonb,

    latitude double precision,
    longitude double precision,

    status text not null default 'suspected' check (
        status in ('suspected', 'expert_review_pending', 'confirmed', 'corrected', 'resolved')
    ),

    created_at timestamptz not null default now()
);

create index if not exists idx_diagnosis_cases_status on diagnosis_cases(status);
create index if not exists idx_diagnosis_cases_location on diagnosis_cases(latitude, longitude);
create index if not exists idx_diagnosis_cases_herd_id on diagnosis_cases(herd_id);
create index if not exists idx_diagnosis_cases_created_at on diagnosis_cases(created_at);

-- =========================================================
-- 6. VETERINARY REVIEWS (Expert Consultations)
-- =========================================================
create table if not exists veterinary_reviews (
    id uuid primary key default gen_random_uuid(),
    case_id uuid references diagnosis_cases(id) on delete cascade,
    vet_id uuid references users(id) on delete set null,

    ai_prediction text,
    vet_diagnosis text,

    review_status text not null default 'pending' check (
        review_status in ('pending', 'confirmed', 'corrected', 'rejected')
    ),
    prescriptions jsonb default '[]'::jsonb,
    remarks text,

    reviewed_at timestamptz,
    created_at timestamptz not null default now()
);

create index if not exists idx_veterinary_reviews_case_id on veterinary_reviews(case_id);

-- =========================================================
-- 7. LIVESTOCK RISK FORECASTS (Bioclimatic & Vector Intelligence)
-- =========================================================
create table if not exists risk_forecasts (
    id uuid primary key default gen_random_uuid(),
    herd_id uuid references herds(id) on delete cascade,
    forecast_date date not null default current_date,

    risk_score numeric not null,
    risk_level text not null check (risk_level in ('LOW', 'MODERATE', 'HIGH')),

    -- Livestock-specific bioclimatic indicators
    thi_index numeric, -- Temperature-Humidity Index
    heat_stress_level text check (heat_stress_level in ('Normal', 'Mild', 'Moderate', 'Severe')),
    vector_risk_factor numeric default 0, -- LSD fly/mosquito proliferation index
    fmd_risk_factor numeric default 0, -- FMD environmental transmission index
    nearby_cases_factor numeric default 0, -- Localized outbreak radius pressure

    explanation jsonb default '[]'::jsonb,

    created_at timestamptz not null default now()
);

create index if not exists idx_risk_forecasts_herd_id on risk_forecasts(herd_id);

-- =========================================================
-- 8. FOLLOW UPS (Animal Recovery Tracking)
-- =========================================================
create table if not exists follow_ups (
    id uuid primary key default gen_random_uuid(),
    case_id uuid references diagnosis_cases(id) on delete cascade,
    owner_id uuid references users(id) on delete set null,

    status text not null check (status in ('better', 'same', 'worse')),
    notes text,
    new_image_url text,
    temperature_c numeric,
    appetite_status text check (appetite_status in ('normal', 'reduced', 'anorexic')),
    milk_yield_liters numeric,

    created_at timestamptz not null default now()
);

create index if not exists idx_follow_ups_case_id on follow_ups(case_id);

-- =========================================================
-- 9. WEATHER RECORDS
-- =========================================================
create table if not exists weather_records (
    id uuid primary key default gen_random_uuid(),
    herd_id uuid references herds(id) on delete cascade,
    latitude double precision,
    longitude double precision,
    temperature numeric,
    humidity numeric,
    thi numeric,
    rainfall_mm numeric,
    rain_probability numeric,
    weather_condition text,
    recorded_at timestamptz not null default now()
);

create index if not exists idx_weather_records_herd_id on weather_records(herd_id);

-- =========================================================
-- 10. BACKWARD COMPATIBILITY VIEWS
-- =========================================================
-- Compatibility view: 'farms' maps to 'herds'
create or replace view farms as
select
    id,
    owner_id as farmer_id,
    shed_name as farm_name,
    latitude,
    longitude,
    village,
    taluka,
    district,
    coalesce(shed_area_sqft, total_animals * 40) as area_acres,
    created_at
from herds;

-- Compatibility view: 'crop_cycles' maps to 'animal_units'
create or replace view crop_cycles as
select
    id,
    herd_id as farm_id,
    species as crop_name,
    coalesce(breed, 'Indigenous') as variety,
    created_at::date as sowing_date,
    case
        when lactation_status = 'calf' then 'seedling'
        when lactation_status = 'heifer' then 'vegetative'
        when lactation_status = 'lactating' then 'flowering'
        else 'maturity'
    end as crop_stage,
    'active' as status,
    created_at
from animal_units;

-- Compatibility view: 'farmers' maps to 'users'
create or replace view farmers as
select
    id,
    id as farmer_id,
    name,
    preferred_language as language,
    district,
    taluka,
    village,
    coalesce(district, 'Nashik') || ', Maharashtra' as state,
    coalesce(taluka, 'Niphad') || ', ' || coalesce(district, 'Nashik') as location,
    created_at
from users
where role in ('owner', 'farmer');

-- Compatibility view: 'expert_reviews' maps to 'veterinary_reviews'
create or replace view expert_reviews as
select
    id,
    case_id,
    vet_id as expert_id,
    ai_prediction,
    vet_diagnosis as expert_diagnosis,
    review_status,
    remarks,
    reviewed_at,
    created_at
from veterinary_reviews;

-- Compatibility view: 'crop_diagnoses' maps to 'diagnosis_cases'
create or replace view crop_diagnoses as
select
    dc.id,
    dc.owner_id as farmer_id,
    dc.herd_id as farm_id,
    dc.image_url,
    dc.species as crop,
    dc.predicted_disease as disease,
    dc.confidence,
    dc.severity_band as severity,
    coalesce(rf.risk_score, 75) as risk_score,
    dc.latitude,
    dc.longitude,
    dc.status,
    dc.created_at
from diagnosis_cases dc
left join lateral (
    select risk_score from risk_forecasts
    where herd_id = dc.herd_id
    order by created_at desc limit 1
) rf on true;

-- Compatibility view: 'followups' maps to 'follow_ups'
create or replace view followups as
select * from follow_ups;
