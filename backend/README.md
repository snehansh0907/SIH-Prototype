# Pashu Sarthak — Backend API (SIH26128)

Smart Livestock Disease Early-Warning & Veterinary Surveillance Backend API for Maharashtra, India. Built for Smart India Hackathon.

## Table of Contents

- [Overview](#overview)
- [Core Architecture & Workflow](#core-architecture--workflow)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [API Endpoints Reference](#api-endpoints-reference)
- [Epidemic Triage & Bioclimatic Risk Engine](#epidemic-triage--bioclimatic-risk-engine)

---

## Overview

**Pashu Sarthak** provides a connected backend infrastructure for:
1. **Livestock Owners**: AI-assisted clinical photo triage (LSD, FMD, Mastitis, Blackleg), bioclimatic vector risk scores, mortality reporting, and AI veterinary consultation.
2. **Veterinary Officers**: Real-time syndromic surveillance, outbreak cluster detection, laboratory triage queues, and taluka-level containment management.

## Core Architecture & Workflow

```text
Livestock Owner / Officer
       │
       ▼
[Image Upload + Clinical Observation]
       │
       ▼
[MobileNet Relevance Gate & Pathology Classifier]
       │
       ▼
[Severity & Bioclimatic Vector Risk Engine]
       │
       ▼
[Outbreak Triage & Cluster Flagging] ──────► [Veterinary Officer Surveillance Queue]
       │
       ▼
[Actionable Veterinary First-Aid Advisory]
       │
       ▼
[Follow-Up & Mortality Surveillance]
```

## Features

- **Multi-Species Disease Detection**: Cattle, Buffalo, Goat, Sheep, and Poultry.
- **Bioclimatic Disease Risk Scoring**: Combines real-time Open-Meteo temperature, relative humidity, wind speed, precipitation, and spatial case density.
- **Epidemic Triage Service**: Automatic clustering and severity escalation when case clusters exceed localized containment thresholds.
- **Mortality Reporting**: Structured livestock mortality reporting with necropsy and disposal guidelines.
- **Voice TTS Streaming**: Same-origin streaming endpoint for natural Hindi and Marathi speech synthesis.

## Tech Stack

- **Runtime**: Node.js (>= 18.0.0)
- **Framework**: Express.js
- **Database / Auth**: Supabase (PostgreSQL) with resilient local JSON fallback
- **ML / Inference**: ONNX Runtime Node (`onnxruntime-node`), Sharp image processing
- **Weather Intelligence**: Open-Meteo API (geospatial bioclimatic telemetry)

## Project Structure

```
backend/
├── src/
│   ├── app.js                   # Express app with CORS & root routing
│   ├── config/
│   │   └── supabase.js          # Supabase client initialization
│   ├── controllers/
│   │   ├── authController.js     # User registration & verification
│   │   ├── diagnosisController.js# Pathology inference & triage
│   │   ├── expertController.js   # Veterinary advisory & chat
│   │   ├── farmController.js     # Herd & shed management
│   │   ├── followUpController.js # Recovery monitoring
│   │   ├── hotspotController.js  # Geospatial disease clusters
│   │   ├── mortalityController.js# Mortality reporting
│   │   └── riskController.js     # Bioclimatic risk scoring
│   ├── data/
│   │   ├── diseaseKnowledgeBase.js # Veterinary disease registry
│   │   └── districtCoordinates.js  # Maharashtra districts & talukas
│   ├── middleware/
│   │   └── errorHandler.js      # Centralized error handling
│   ├── routes/                  # Express route definitions
│   └── services/
│       ├── advisoryService.js   # Structured veterinary advisory
│       ├── diseaseDetectionService.js # Livestock diagnosis engine
│       ├── hotspotService.js    # Cluster mapping & spatial density
│       ├── locationService.js   # Reverse-geocoding
│       ├── mlInferenceService.js# Real ONNX neural pipeline
│       ├── riskEngine.js        # Bioclimatic mathematical risk model
│       ├── triageService.js     # Outbreak threshold analyzer
│       └── weatherService.js    # Open-Meteo integration
├── package.json
├── server.js                    # Server startup script
└── supabase-migration-pashu-sarthak.sql # SQL database schema
```

## Installation & Setup

```bash
cd backend
npm install
```

## Environment Variables

Create `.env` using `.env.example`:

```env
PORT=5001
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
OPEN_METEO_BASE_URL=https://api.open-meteo.com
FRONTEND_URL=http://localhost:5173
```

## Running Locally

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

## API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API status & health pointers |
| `GET` | `/api/health` | Service health check |
| `POST` | `/api/diagnosis` | Upload photo & run livestock disease diagnosis |
| `GET` | `/api/risk` | Get bioclimatic risk assessment for location |
| `GET` | `/api/hotspots` | Regional hotspot disease map & clusters |
| `POST` | `/api/expert/chat` | AI Veterinary Assistant consultation |
| `POST` | `/api/mortality` | Submit animal mortality report |
| `GET` | `/api/outbreaks` | Active outbreak alerts for Veterinary Officers |
| `GET` | `/api/tts` | Trilingual voice synthesis streaming |

---

*Pashu Sarthak — Smart India Hackathon 2026 (SIH26128)*
