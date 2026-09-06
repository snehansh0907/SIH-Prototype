# Krishi Sarthak — Backend API

AI-powered crop health detection, risk forecasting, hotspot monitoring, and expert
validation system for farmers in Maharashtra, India. Built for Smart India Hackathon.

## Table of Contents

- [Overview](#overview)
- [Core Flow](#core-flow)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Supabase Setup](#supabase-setup)
- [Database Setup](#database-setup)
- [Seeding Demo Data](#seeding-demo-data)
- [Running Locally](#running-locally)
- [API Endpoints](#api-endpoints)
- [How the Risk System Works](#how-the-risk-system-works)
- [How Hotspot Detection Works](#how-hotspot-detection-works)
- [Replacing the Mock ML Model](#replacing-the-mock-ml-model)

---

## Overview

Krishi Sarthak helps farmers detect crop diseases early from a photo, understand the
severity, get actionable IPM (Integrated Pest Management) advice, see a weather-based
risk forecast for their farm, and stay aware of nearby disease outbreaks — with an
optional expert-in-the-loop validation step.

## Core Flow

```text
Farmer
   ↓
Upload Crop Image
   ↓
AI Disease Diagnosis (mock layer, swappable for real ML)
   ↓
Severity Detection
   ↓
Actionable IPM Advisory
   ↓
Weather-Based Risk Forecast
   ↓
Nearby Disease/Hotspot Context
   ↓
Optional Expert Validation
   ↓
Follow-Up Monitoring
```

The system is wired end-to-end: when an expert **confirms** a diagnosis case, it
immediately becomes part of the **hotspot map**, and the next time a **nearby farm**
requests its **risk score**, that confirmed case raises the score and appears in the
explanation.

## Features

- 📸 Crop image upload + mock AI diagnosis (easily swappable for a real ML API)
- 🩺 Severity banding (Low / Moderate / High / Severe)
- 🌱 Farm & crop-cycle management
- 🌦️ Live weather data via Open-Meteo (no API key needed)
- 📈 Transparent, rule-based risk scoring with a 5-day forecast
- 🗺️ Geographic hotspot detection (Haversine distance) for a Leaflet heatmap
- 👨‍🌾 Expert review workflow (confirm / correct / reject)
- 📋 IPM-first advisory system (cultural → mechanical → biological → chemical)
- 🔁 Farmer follow-up / re-check monitoring
- 🌱 Ready-to-run seed script with a realistic demo dataset

## Tech Stack

- Node.js + Express.js (plain JavaScript)
- Supabase (PostgreSQL) via `@supabase/supabase-js`
- Open-Meteo API for weather
- Multer for image uploads
- dotenv, cors

No Docker, Redis, Kafka, or auth frameworks — kept intentionally simple for a
hackathon prototype.

## Project Structure

```text
backend/
├── src/
│   ├── config/supabase.js              # Supabase client
│   ├── controllers/                    # Request handlers
│   ├── routes/                         # Express routers
│   ├── services/                       # Business logic (weather, risk, hotspot, advisory)
│   ├── middleware/                     # errorHandler.js, upload.js
│   ├── data/diseaseKnowledgeBase.js    # Static IPM knowledge base
│   └── app.js                          # Express app wiring
├── uploads/                            # Uploaded crop images (served statically)
├── server.js                           # Entry point
├── seed.js                             # Demo data seeder
├── package.json
├── .env.example
├── .gitignore
├── README.md
└── supabase-schema.sql                 # Run this in Supabase SQL editor
```

## Installation

```bash
cd backend
npm install
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

```env
PORT=5000

SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_ANON_KEY

OPEN_METEO_BASE_URL=https://api.open-meteo.com

FRONTEND_URL=http://localhost:5173
```

## Supabase Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **Project Settings → API** and copy the **Project URL** and **anon public key**
   into your `.env` as `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
3. Go to **SQL Editor → New Query**.

## Database Setup

1. Open `supabase-schema.sql` from this repo.
2. Paste its entire contents into the Supabase SQL Editor and run it.
3. This creates all 8 tables (`users`, `farms`, `crop_cycles`, `diagnosis_cases`,
   `diseases`, `expert_reviews`, `risk_forecasts`, `follow_ups`) with indexes and
   check constraints.

> Tip: Row Level Security (RLS) is left disabled by default for hackathon simplicity
> (the tables are created without RLS policies). Enable and configure RLS before
> using this in production.

## Seeding Demo Data

Once the schema is created and `.env` is filled in:

```bash
npm run seed
```

This inserts:
- The full disease knowledge base (Tomato, Cotton, Soybean diseases)
- 10 demo farmers, 2 experts, 1 official
- 10 farms clustered around **Niphad taluka, Nashik district, Maharashtra**
- 10 active crop cycles (Tomato / Cotton / Soybean)
- ~28 diagnosis cases with a mix of statuses and dates, including an **8-case tight
  geographic cluster of confirmed Tomato Early Blight** so the hotspot heatmap
  visibly clusters on the map
- A few sample expert reviews

## Running Locally

```bash
npm run dev     # with nodemon (auto-restart)
# or
npm start       # plain node
```

The server starts on `http://localhost:5000` (or your configured `PORT`).

Check it's alive:

```bash
curl http://localhost:5000/api/health
```

## API Endpoints

All responses follow:

```json
{ "success": true, "data": {} }
```
```json
{ "success": false, "message": "Error description" }
```

### Health
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |

### Diagnosis
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/diagnosis` | Upload crop image (`multipart/form-data`: `image`, `farmer_id`, `farm_id`, `crop_cycle_id`) → mock AI diagnosis, stored in DB |
| GET | `/api/diagnosis/:caseId` | Get a diagnosis case by id |

### Farms
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/farms` | Create a farm |
| GET | `/api/farms/:id` | Get farm by id |
| GET | `/api/farms/farmer/:farmerId` | Get all farms for a farmer |
| PUT | `/api/farms/:id` | Update a farm |

### Crop Cycles
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/crop-cycles` | Create a crop cycle |
| GET | `/api/crop-cycles/farm/:farmId` | Get crop cycles for a farm |
| PUT | `/api/crop-cycles/:id` | Update a crop cycle |

### Weather
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/weather?lat=&lng=` | Clean current + 5-day weather (Open-Meteo) |

### Risk Forecast
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/risk/:farmId` | Full risk score, level, explanation, and 5-day forecast for a farm |

### Hotspots
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/hotspots?disease=&crop=&taluka=` | Confirmed + suspected cases for the map (no private farmer data) |

### Expert Review
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/expert/cases/pending` | Cases awaiting expert review |
| GET | `/api/expert/cases/:caseId` | Case detail + review history |
| POST | `/api/expert/review` | Submit a review (`case_id`, `expert_id`, `review_status`: confirm/corrected/rejected, `expert_diagnosis`, `remarks`) |

### Follow-Up
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/follow-ups` | Log a follow-up (`case_id`, `farmer_id`, `status`: better/same/worse, `notes`) |
| GET | `/api/follow-ups/:caseId` | Get follow-up history for a case |

### Advisory
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/advisory/:caseId` | IPM-first advisory for a diagnosis case |

## How the Risk System Works

`GET /api/risk/:farmId` runs a simple, transparent, rule-based model:

```text
riskScore = humidityFactor + rainFactor + cropStageFactor + nearbyCasesFactor
```

| Factor | Max points | Based on |
|---|---|---|
| Humidity | 25 | Current relative humidity from Open-Meteo |
| Rain | 25 | Forecast rainfall amount + rain probability |
| Crop Stage | 20 | How vulnerable the crop's current growth stage is (flowering is most vulnerable) |
| Nearby Cases | 30 | Number & recency of **confirmed** disease cases within 10 km (Haversine distance), with recent (≤14 days) and closer cases weighted more heavily |

The total score (0–100) maps to:

- **0–30** → `LOW`
- **31–60** → `MODERATE`
- **61–100** → `HIGH`

A plain-language `explanation` array is generated alongside the score, and a simple
5-day forecast is produced by re-running the same weather-based factors against each
day's forecast.

Every computed forecast is also stored in `risk_forecasts` for later analysis.

## How Hotspot Detection Works

`GET /api/hotspots` returns two arrays — `confirmed_cases` and `suspected_cases` —
each containing only `latitude`, `longitude`, `disease`, `crop`, `status`, and
`created_at` (no farmer names, phone numbers, or ids are exposed).

Distance-based logic (`findNearbyCases` in `hotspotService.js`) uses the **Haversine
formula** to compute great-circle distance between two lat/lng points, and is reused
by the risk engine to find confirmed cases within a 10 km radius of a farm. Only
confirmed cases from the last 14 days are weighted heavily in the risk score; older
confirmed cases still show on the map but contribute less.

**The critical connection**: when an expert confirms or corrects a case via
`POST /api/expert/review`, that case's `status` changes to `confirmed`/`corrected` —
which means it now shows up in `/api/hotspots` and is picked up by
`findNearbyCases()` the next time any nearby farm calls `/api/risk/:farmId`.

## Replacing the Mock ML Model

The ML model is mocked in `src/controllers/diagnosisController.js` inside the
`runMockDiagnosis()` function. It's clearly marked with:

```js
// >>> ML INTEGRATION POINT <<<
```

To integrate a real model, replace the body of `runMockDiagnosis()` with a call to
your ML API (e.g. via `fetch`), keeping the same return shape:

```js
{ disease: string, confidence: number, severity_band: string, severity_percent: number }
```

No other file needs to change.
