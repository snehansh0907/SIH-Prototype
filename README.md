# 🐄 Pashu Sarthak (पशु सार्थक)

> **SIH26128** — Smart India Hackathon 2026  
> **Unified Mobile-First Progressive Web App (PWA) for Livestock Disease Early-Warning & Veterinary Surveillance**

[![MIT License](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-green.svg)](https://pashu-sarthak.vercel.app)
[![React 19](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-teal.svg)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Backend-Express.js-black.svg)](backend)

---

## 📌 Problem & Solution

### The Challenge
In rural India, livestock diseases like **Lumpy Skin Disease (LSD)** and **Foot-and-Mouth Disease (FMD)** spread rapidly through vector bites and community contact. Smallholder livestock farmers often lack immediate veterinary access, leading to delayed disease reporting, secondary bacterial complications, and uncontained epidemic outbreaks. Meanwhile, state veterinary officers face severe gaps in real-time syndromic field telemetry.

### The Solution: Pashu Sarthak
**Pashu Sarthak** bridges the rural veterinary gap with a **single, unified mobile Progressive Web App** serving two interconnected user roles:
1. **🐄 Livestock Owners**: Early symptom detection, AI photo triage, herd tracking, vaccination schedules, bioclimatic vector risk forecasts, and instant veterinary guidance.
2. **🧑‍⚕️ Veterinary Officers**: Taluka-level syndromic surveillance, automated outbreak threshold detection, spatial disease hotspot heatmaps, laboratory triage queues, and rapid containment ring broadcasts.

---

--

## 🔑 Demo Access (Prototype Testing)

You can explore both roles instantly using the built-in demo credentials or one-click demo login:

### 🧑‍⚕️ Veterinary Officer Demo
- **Email / ID**: `vet_niphad@gov.in`
- **Password**: `vet123`
- **Jurisdiction**: Taluka Veterinary Dispensary, Niphad, Nashik District (134 Gram Panchayats)
- **Features**: Active triage queue, 48 surveillance cases, Niphad LSD outbreak ring containment, laboratory triage flags.

### 🐄 Livestock Owner Demo
- **Account 1 (Cattle & Buffalo)**: `farmer123` / password `farmer123` (Ramesh Patil, Niphad)
- **Account 2 (Dairy Herd)**: `vikas123` / password `vikas123` (Vikas More, Chandori)
- **Account 3 (Goat & Sheep)**: `suresh123` / password `suresh123` (Suresh Jadhav, Ozar)
- **Guest Explorer**: Click **"Continue as Demo"** on the login screen to explore without entering credentials.

---

## 🚀 Key Innovations & Features

### 1. Transparent Multi-Stage AI Pathology Pipeline
- **Client-Side Image Relevance Gate**: Uses lightweight TensorFlow.js MobileNet in-browser to verify animal tissue presence (skin nodules, muzzle, hooves, udder) before consuming bandwidth or server compute. Rejects non-animal objects (vehicles, text documents, scenery) immediately with supportive user feedback.
- **Multi-Species Disease Detection**: Evaluates Cattle, Buffalo, Goat, Sheep, and Poultry conditions including Lumpy Skin Disease (LSD), Foot-and-Mouth Disease (FMD), Bovine Mastitis, Blackleg, Bloat, PPR, and Newcastle disease.
- **Healthy Baseline & Low-Confidence Guard**: Recognizes healthy livestock without forcing false positives; returns explicit low-confidence guidance (`< 0.60`) recommending daylight photo retakes or veterinary officer escalation.

### 2. Bioclimatic Vector Risk Scoring
- Combines live Open-Meteo meteorological telemetry (ambient temperature, relative humidity, precipitation, wind speed) with local disease case density.
- Predicts vector breeding pressure (Stomoxys biting flies, Culicoides midges, ticks) and heat stress indices for dairy cattle.

### 3. Automated Epidemic Triage & Ring Containment
- Evaluates incoming community health reports against spatial-temporal threshold rules (e.g. `≥ 5` active cases of a contagious viral disease in a 3 km radius within 48 hours).
- Automatically triggers a **Taluka Outbreak Alert**, flags cases for laboratory swab dispatch, and provides 5 km ring vaccination and quarantine advisories.

### 4. Natural Voice Narration & Trilingual Support
- Built-in multi-lingual voice guidance in **Marathi (मराठी)**, **Hindi (हिंदी)**, and **English**.
- Same-origin audio streaming proxy (`/api/tts`) provides studio-quality voice playback for rural dairy farmers.

### 5. Installable Single-PWA Architecture
- Unified manifest (`manifest.webmanifest`) and service worker (`sw.js`).
- Seamless offline caching for core assets, cached herd records, emergency helpline access (1962), and first-aid guidelines.

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                      PASHU SARTHAK PWA CLIENT                           │
│  React 19 • TypeScript • TailwindCSS • Leaflet • TensorFlow.js          │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                  HTTPS / REST API / Form-Data
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      EXPRESS.JS BACKEND ENGINE                          │
│                                                                         │
│  ┌───────────────────────┐  ┌───────────────────┐  ┌─────────────────┐  │
│  │ Disease Detection API │  │ Bioclimatic Risk  │  │ Epidemic Triage │  │
│  │ (Multi-Species AI)    │  │ (Open-Meteo Live) │  │ (Spatial Clust) │  │
│  └──────────┬────────────┘  └─────────┬─────────┘  └────────┬────────┘  │
└─────────────┼─────────────────────────┼─────────────────────┼───────────┘
              ▼                         ▼                     ▼
┌───────────────────────────┐ ┌──────────────────┐ ┌─────────────────────┐
│    Supabase PostgreSQL    │ │  Open-Meteo API  │ │ ONNX Neural Runtime │
│ (Herd, Cases, Survellance)│ │ (Weather Telemet)│ │ (Offline In-Memory) │
└───────────────────────────┘ └──────────────────┘ └─────────────────────┘
```

---

## 📂 Repository Structure

```
SIH-Prototype/
├── backend/                         # Node.js Express Backend Service
│   ├── src/
│   │   ├── app.js                   # Express app with CORS & root routing
│   │   ├── config/supabase.js       # Supabase client initialization
│   │   ├── controllers/             # Pathology, auth, risk, triage controllers
│   │   ├── data/                    # Disease knowledge base & district coordinates
│   │   ├── middleware/              # Centralized error & async handlers
│   │   ├── routes/                  # REST endpoint definitions
│   │   └── services/                # Diagnosis, risk, hotspot, triage services
│   ├── .env.example                 # Backend environment variable template
│   ├── package.json                 # Backend dependencies & scripts
│   ├── server.js                    # Server startup script
│   └── supabase-migration-pashu-sarthak.sql # Database schema & tables
│
├── docs/                            # Documentation screenshots
│   ├── check-animal.png
│   ├── outbreak-alerts.png
│   ├── owner-home.png
│   ├── surveillance-map.png
│   └── veterinary-dashboard.png
│
├── ml/                              # Neural Network Models & Training Scripts
│   ├── models/                      # Dual-stage ONNX models (< 10 MB each)
│   ├── training/                    # PyTorch training & ONNX export pipelines
│   └── inference/                   # Python standalone inference tester
│
├── public/                          # PWA Icons & Web Manifest
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-maskable-512.png
│   ├── apple-touch-icon.png
│   └── favicon.svg
│
├── src/                             # Frontend React 19 Application
│   ├── components/
│   │   ├── area/                    # Geospatial map & radar surveillance
│   │   ├── auth/                    # Unified dual-role login & registration
│   │   ├── check-crop/              # Animal health check & symptom observation
│   │   ├── common/                  # Reusable badges, voice buttons, selects
│   │   ├── diagnosis/               # Clinical triage result & advisory views
│   │   ├── expert/                  # Dr. Ashok Kulkarni AI Veterinary Assistant
│   │   ├── herd/                    # Herd register & vaccination records
│   │   ├── home/                    # Owner dashboard & quick action grid
│   │   ├── layout/                  # Mobile container, headers & bottom nav
│   │   ├── mortality/               # Animal death reporting & disposal guidelines
│   │   ├── officer/                 # Veterinary officer mobile surveillance portal
│   │   ├── risk/                    # Bioclimatic vector risk forecast
│   │   └── vet/                     # Veterinary case verification modal
│   ├── context/                     # Auth, Livestock, and Language providers
│   ├── data/                        # Maharashtra cascading administrative hierarchy
│   ├── i18n/                        # Trilingual dictionary (EN, HI, MR)
│   ├── services/                    # API client, offline mock data & business logic
│   ├── types/                       # TypeScript models & domain interfaces
│   ├── utils/                       # Speech synthesis & audio helpers
│   ├── App.tsx                      # Root role-gated application router
│   ├── main.tsx                     # Entry point & PWA service worker registration
│   └── index.css                    # Design tokens, typography & liquid styling
│
├── .env.example                     # Frontend environment variable template
├── index.html                       # HTML5 Shell with viewport-fit & PWA headers
├── LICENSE                          # MIT License
├── package.json                     # Frontend dependencies & build scripts
├── tailwind.config.js               # Theme configuration & color palette
├── tsconfig.json                    # TypeScript compiler configuration
├── vercel.json                      # Vercel deployment routing & headers
└── vite.config.ts                   # Vite build & VitePWA configuration
```

---

## 💻 Local Setup & Development

### Prerequisites
- **Node.js**: v18.0.0 or later
- **npm**: v9.0.0 or later

### 1. Clone Repository
```bash
git clone https://github.com/snehansh0907/SIH-Prototype.git
cd SIH-Prototype
```

### 2. Frontend Setup
```bash
# Install frontend dependencies
npm install

# Create local environment config
cp .env.example .env

# Run Vite dev server
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 3. Backend Setup
```bash
cd backend

# Install backend dependencies
npm install

# Create backend environment config
cp .env.example .env

# Start Express API server
npm run dev
```
Backend will start on **`http://localhost:5001`** (Health check: `http://localhost:5001/api/health`).

---

## 🛠️ Production Build & Verification

```bash
# Type check and build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🌐 Deployment Configuration

- **Frontend Hosting**: Vercel (`sih-prototype.vercel.app`)
- **Database & Storage**: Supabase PostgreSQL

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

*Pashu Sarthak • Smart India Hackathon 2026 (Problem Statement: SIH26128)*  
*Developed with ❤️ for the Department of Animal Husbandry & Rural Livestock Keepers.*
