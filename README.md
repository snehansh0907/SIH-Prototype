# 🐄 Pashu Sarthak (पशु सार्थक)

> **Early Detection, Prevention & Management of Livestock Diseases**  
> *Smart India Hackathon 2024 — Problem Statement SIH26128 (Govt. of Maharashtra, Dept. of Animal Husbandry)*  
> **"सही समय पर सही सलाह — Smarter Livestock Care"**

Pashu Sarthak is an AI-powered veterinary intelligence and herd management platform engineered for rural livestock owners, dairy farmers, and animal husbandry field officers in Maharashtra. The platform brings together **early clinical visual diagnosis** (Lumpy Skin Disease & Foot-and-Mouth Disease), **bioclimatic risk intelligence** (NRC Temperature-Humidity Index & vector proliferation models), **community outbreak surveillance with 10 km ring containment**, and **direct veterinary tele-advisory** linked to the national **Pashu Sanjeevani 1962 Helpline**.

---

## 🚀 Live Demonstrations

- 🌐 **Web App (PWA):** [https://sih-prototype-seven-red.vercel.app/](https://sih-prototype-seven-red.vercel.app/)
- ⚙️ **Backend API:** [https://krishi-sarthak-api.onrender.com/](https://krishi-sarthak-api.onrender.com/)

---

## 📌 Problem Statement (SIH26128)

Livestock diseases such as **Lumpy Skin Disease (LSD)** and **Foot-and-Mouth Disease (FMD)** cause catastrophic economic losses to smallholder dairy and cattle farmers across Maharashtra:
- **Delayed Outbreak Detection:** Visual lesions and nodules are often reported only after systemic spread, leading to high morbidity and drastic drops in milk yield.
- **Bioclimatic Blindness:** Vector proliferation (biting flies *Stomoxys calcitrans* and mosquitoes transmitting LSD) and high Temperature-Humidity Index (THI) heat stress weaken herd immunity without early warning.
- **Absence of Ring Surveillance:** Contagious outbreaks propagate across villages before official 3 km infected and 10 km surveillance rings can be mobilized.
- **Linguistic & Geographical Gaps:** Rural livestock owners lack direct, rapid access to Veterinary Officers (LDO / DIS) in Marathi and Hindi with actionable antiseptic and biosecurity protocols.

---

## 💡 Solution Architecture & Key Modules

### 1. 🐄 Livestock Owner & Herd Profiles
- Replaced crop field profiles with **Livestock Owner & Herd Registry** (`herds`, `animal_units`).
- Tracks species (**Cattle, Buffalo, Goat, Poultry**), breeds (Gir, Sahiwal, Murrah, Osmanabadi), herd head count, lactating status, and vaccination records (Goat Pox vaccine, NADCP FMD vaccine).
- Dual cloud synchronization with **Supabase PostgreSQL** and offline resilient local fallback.

### 2. 🩺 "Check My Animal" — Clinical AI Diagnosis
- High-precision clinical diagnosis scoped to visually distinct, critical livestock diseases:
  1. **Lumpy Skin Disease (LSD - लंपी चर्मरोग):** Detects circumscribed firm cutaneous nodules (2–5 cm) on cow/buffalo hides (*Capripoxvirus*).
  2. **Foot-and-Mouth Disease (FMD - लाळ्या खुरकूत):** Detects erosive mouth vesicles, excessive salivation, and interdigital hoof ulcers (*Aphthovirus*).
  3. **Healthy Animal Baseline:** Verifies normal skin coat and absence of cutaneous lesions.
- **Transparent AI Thresholding:** Confidences below **0.60** trigger an honest indeterminate state recommending prompt Veterinary Officer review via Toll-Free 1962.
- **Veterinary Protocol Hierarchy:** Every result synthesizes 4 actionable layers:
  1. *Immediate Biosecurity & Herd Quarantine*
  2. *Antiseptic Lesion Wash (1:1000 Potassium Permanganate / 1% Sodium Bicarbonate rinse)*
  3. *Supportive Care & Hydration*
  4. *Veterinary Prescription & Toll-Free 1962 Alert*

### 3. 🌦️ Bioclimatic Risk & Heat Stress Intelligence
- **National Research Council (NRC) THI Formula:**
  $$\text{THI} = 0.8 \times T + \left(\frac{\text{RH}}{100}\right) \times (T - 14.4) + 46.4$$
  Classifies heat stress for crossbred and indigenous dairy cattle: Mild (72–78), Moderate (79–88), Severe (>88).
- **Vector Proliferation Index (LSD Transmission):** Evaluates biting fly (*Stomoxys*) and mosquito activity based on sustained relative humidity (>75%) and temperatures between 24°C–34°C.
- **Seasonal FMD Outbreak Factor:** Flags heightened transmission risks during post-monsoon damp conditions and seasonal livestock fairs.
- Real-time weather integration powered by **Open-Meteo API**.

### 4. 📍 "My Area" — Outbreak Radar & Ring Surveillance
- Live community radar tracking confirmed LSD and FMD clusters around the owner's shed.
- Implements official **Department of Animal Husbandry Ring Surveillance**:
  - **Infected Zone (0–3 km):** Strict quarantine, movement restrictions, mandatory disinfections.
  - **Surveillance Ring (3–10 km):** Ring vaccination radius (Goat Pox Uttarkashi strain / FMD trivalent vaccine).
- Fully anonymized geo-coordinates to safeguard livestock owners' privacy.

### 5. 👨‍⚕️ "Talk to a Vet" — Veterinary Tele-Advisory
- Real-time chat with regional **Veterinary Officers (Live Stock Development Officer - LDO / DIS)**.
- Integrated quick queries: LSD herd quarantine, FMD mouth wash, boiling milk safety guidelines, and vaccination timings.
- Direct 1-tap dialer for Maharashtra **Pashu Sanjeevani Helpline: Toll-Free 1962**.

### 6. 🔊 Multilingual Voice Guidance ("Listen to Advice")
- Web Speech API text-to-speech rendering complete clinical advisories in **Marathi (मराठी)**, **Hindi (हिन्दी)**, and **English**.
- Formatted specifically for rural listening with clear dosages and precautions.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS / Vanilla CSS, Lucide Icons, Canvas Confetti |
| **PWA** | Vite PWA Plugin, Web App Manifest, Service Worker offline caching |
| **Backend** | Node.js, Express.js, REST API, CORS |
| **Database** | Supabase (PostgreSQL) with Resilient Local JSON file fallback |
| **Bioclimatic API** | Open-Meteo Weather API (Temperature, Humidity, Rain Probability) |
| **AI Vision Engine** | Client-side MobileNet species validation + Server-side heuristic & visual feature classifier |
| **Deployment** | Vercel (Frontend SPA) + Render (Node.js API) |

---

## 🏗️ System Architecture

```text
                    ┌────────────────────────────────────────┐
                    │      Livestock Owner / Field Vet       │
                    │      Mobile / Desktop PWA Interface    │
                    └───────────────────┬────────────────────┘
                                        │
                                        ▼
                    ┌────────────────────────────────────────┐
                    │     React 18 + TypeScript + Vite       │
                    │  (Multilingual: Marathi / Hindi / En)  │
                    │               (Vercel)                 │
                    └───────────────────┬────────────────────┘
                                        │
                           REST API Calls / FormData
                                        │
                                        ▼
                    ┌────────────────────────────────────────┐
                    │      Node.js + Express Backend         │
                    │  • Disease Detection Service (LSD/FMD) │
                    │  • NRC THI & Vector Risk Engine        │
                    │  • Hotspot & Ring Surveillance Engine  │
                    │  • Veterinary Advisory Generator       │
                    │               (Render)                 │
                    └───────────┬────────────────┬───────────┘
                                │                │
                 ┌──────────────┘                └──────────────┐
                 ▼                                              ▼
    ┌─────────────────────────┐                    ┌─────────────────────────┐
    │   Supabase PostgreSQL   │                    │     Open-Meteo API      │
    │  (Herds, Animal Units,  │                    │  (Live Temp, Humidity,  │
    │   Cases, Vet Reviews)   │                    │   Rain Probability)     │
    └─────────────────────────┘                    └─────────────────────────┘
```

---

## 📂 Repository Structure

```text
SIH-Prototype/
├── backend/
│   ├── src/
│   │   ├── controllers/         # authController, farmController, diagnosisController
│   │   ├── services/            # diseaseDetectionService, riskEngine, advisoryService, hotspotService
│   │   ├── data/                # diseaseKnowledgeBase.js, registered_users.json
│   │   └── app.js               # Express application routes & health checks
│   ├── supabase-schema.sql      # PostgreSQL schema for herds, animal units, diagnosis cases
│   ├── seed.js                  # Database seed script for Maharashtra livestock
│   └── package.json
│
├── src/                         # Frontend React + TypeScript application
│   ├── components/
│   │   ├── auth/                # LoginScreen, FarmerProfileCard, FarmerLoginModal
│   │   ├── check-crop/          # ImageUploader, ProcessingModal (Animal Check)
│   │   ├── diagnosis/           # DiagnosisResultView, ActionTodayCard, DiagnosisHeader
│   │   ├── risk/                # RiskForecastView (THI index & vector trajectories)
│   │   ├── area/                # AreaHotspotView (10km ring surveillance & clusters)
│   │   ├── expert/              # ExpertConsultView (Veterinary Officer & 1962 Helpline)
│   │   ├── home/                # CropStatusHero, QuickActionGrid, WeatherAlertCard
│   │   └── layout/              # AppHeader, BottomNavigation
│   ├── context/                 # AuthContext, CropContext, LanguageContext
│   ├── services/                # diseaseDetection, riskService, weatherService, expertService
│   ├── i18n/                    # translations.ts (Full EN, HI, MR dictionaries)
│   └── types/                   # TypeScript interfaces (FarmerUser, DiagnosisResult, RiskForecast)
│
├── index.html                   # PWA entry point with Devanagari typography
├── vite.config.ts               # Vite configuration and PWA manifest
└── README.md
```

---

## ⚡ Local Setup & Installation

### Prerequisites
- Node.js 18+ and npm installed

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/snehansh0907/SIH-Prototype.git
cd SIH-Prototype

# Install Frontend dependencies
npm install

# Install Backend dependencies
cd backend && npm install && cd ..
```

### 2. Configure Environment
**Backend (`backend/.env`):**
```env
PORT=5001
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
OPEN_METEO_BASE_URL=https://api.open-meteo.com
FRONTEND_URL=http://localhost:5173
```

**Frontend (`.env` or `.env.local`):**
```env
VITE_API_URL=http://localhost:5001/api
```

### 3. Run the Development Servers
```bash
# Terminal 1 - Backend API:
cd backend
npm run dev

# Terminal 2 - Frontend Application:
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 👥 Team Cypher (Smart India Hackathon)

- **Lakshya Vadera**
- **Snehansh Tripathy**
- **Lau Kumar Singh**
- **Maahi Arora**
- **Utsav Kumar**
- **Parth Upadhyay**

---

## 📄 License

This project is licensed under the **MIT License**.
