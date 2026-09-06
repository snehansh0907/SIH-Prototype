-- =========================================================
-- Krishi Sarthak - Supabase PostgreSQL Schema
-- =========================================================
-- Run this entire file in the Supabase SQL editor
-- (Project > SQL Editor > New Query > paste > Run)
-- =========================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- =========================================================
-- 1. USERS
-- =========================================================
create table if not exists users (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    phone text unique,
    email text,
    role text not null default 'farmer' check (role in ('farmer', 'expert', 'official')),
    preferred_language text default 'mr',
    district text,
    taluka text,
    created_at timestamptz not null default now()
);

-- =========================================================
-- 2. FARMS
-- =========================================================
create table if not exists farms (
    id uuid primary key default gen_random_uuid(),
    farmer_id uuid references users(id) on delete cascade,
    farm_name text not null,
    latitude double precision not null,
    longitude double precision not null,
    village text,
    taluka text,
    district text,
    area_acres numeric,
    created_at timestamptz not null default now()
);

create index if not exists idx_farms_farmer_id on farms(farmer_id);
create index if not exists idx_farms_location on farms(latitude, longitude);

-- =========================================================
-- 3. CROP CYCLES
-- =========================================================
create table if not exists crop_cycles (
    id uuid primary key default gen_random_uuid(),
    farm_id uuid references farms(id) on delete cascade,
    crop_name text not null,
    variety text,
    sowing_date date,
    crop_stage text default 'vegetative' check (
        crop_stage in ('sowing', 'seedling', 'vegetative', 'flowering', 'fruiting', 'maturity', 'harvested')
    ),
    status text default 'active' check (status in ('active', 'completed', 'abandoned')),
    created_at timestamptz not null default now()
);

create index if not exists idx_crop_cycles_farm_id on crop_cycles(farm_id);

-- =========================================================
-- 4. DISEASES (Knowledge Base)
-- =========================================================
create table if not exists diseases (
    id uuid primary key default gen_random_uuid(),
    crop_name text not null,
    disease_name text not null,
    scientific_name text,
    description text,
    how_it_spreads jsonb default '[]'::jsonb,
    prevention_steps jsonb default '[]'::jsonb,
    remedy_steps jsonb default '[]'::jsonb,
    safe_dosage jsonb default '[]'::jsonb,
    ipm_priority_order jsonb default '["cultural", "mechanical", "biological", "chemical"]'::jsonb,
    created_at timestamptz not null default now()
);

create index if not exists idx_diseases_crop_name on diseases(crop_name);

-- =========================================================
-- 5. DIAGNOSIS CASES
-- =========================================================
create table if not exists diagnosis_cases (
    id uuid primary key default gen_random_uuid(),
    farmer_id uuid references users(id) on delete set null,
    farm_id uuid references farms(id) on delete set null,
    crop_cycle_id uuid references crop_cycles(id) on delete set null,

    image_url text,

    predicted_disease text,
    confidence numeric,

    severity_band text check (severity_band in ('Low', 'Moderate', 'High', 'Severe')),
    severity_percent numeric,

    latitude double precision,
    longitude double precision,

    status text not null default 'suspected' check (
        status in ('suspected', 'expert_review_pending', 'confirmed', 'corrected', 'resolved')
    ),

    created_at timestamptz not null default now()
);

create index if not exists idx_diagnosis_cases_status on diagnosis_cases(status);
create index if not exists idx_diagnosis_cases_location on diagnosis_cases(latitude, longitude);
create index if not exists idx_diagnosis_cases_farm_id on diagnosis_cases(farm_id);
create index if not exists idx_diagnosis_cases_created_at on diagnosis_cases(created_at);

-- =========================================================
-- 6. EXPERT REVIEWS
-- =========================================================
create table if not exists expert_reviews (
    id uuid primary key default gen_random_uuid(),
    case_id uuid references diagnosis_cases(id) on delete cascade,
    expert_id uuid references users(id) on delete set null,

    ai_prediction text,
    expert_diagnosis text,

    review_status text not null default 'pending' check (
        review_status in ('pending', 'confirmed', 'corrected', 'rejected')
    ),
    remarks text,

    reviewed_at timestamptz,
    created_at timestamptz not null default now()
);

create index if not exists idx_expert_reviews_case_id on expert_reviews(case_id);

-- =========================================================
-- 7. RISK FORECASTS
-- =========================================================
create table if not exists risk_forecasts (
    id uuid primary key default gen_random_uuid(),
    farm_id uuid references farms(id) on delete cascade,
    crop_cycle_id uuid references crop_cycles(id) on delete set null,
    forecast_date date not null default current_date,

    risk_score numeric not null,
    risk_level text not null check (risk_level in ('LOW', 'MODERATE', 'HIGH')),

    humidity_factor numeric default 0,
    rain_factor numeric default 0,
    crop_stage_factor numeric default 0,
    nearby_cases_factor numeric default 0,

    explanation jsonb default '[]'::jsonb,

    created_at timestamptz not null default now()
);

create index if not exists idx_risk_forecasts_farm_id on risk_forecasts(farm_id);

-- =========================================================
-- 8. FOLLOW UPS
-- =========================================================
create table if not exists follow_ups (
    id uuid primary key default gen_random_uuid(),
    case_id uuid references diagnosis_cases(id) on delete cascade,
    farmer_id uuid references users(id) on delete set null,

    status text not null check (status in ('better', 'same', 'worse')),
    notes text,
    new_image_url text,

    created_at timestamptz not null default now()
);

create index if not exists idx_follow_ups_case_id on follow_ups(case_id);

-- =========================================================
-- Done. Next step: run seed.js to populate demo data.
-- =========================================================
