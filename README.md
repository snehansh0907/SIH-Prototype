# 🐄 Pashu Sarthak

> **Smart Livestock Health for Every Farmer**

Pashu Sarthak is an AI-powered digital livestock health platform designed to help livestock owners identify animal health problems, understand disease risks, monitor nearby livestock disease activity, maintain herd health information, and access veterinary guidance through a simple, farmer-friendly interface.

Built as a prototype for **Smart India Hackathon (SIH)** under **SIH26128**, Pashu Sarthak brings livestock health monitoring, AI-assisted symptom analysis, weather-based risk intelligence, location-aware disease awareness, herd records, vaccination tracking, and veterinary guidance together in one platform.

The solution is designed around the need for an efficient system for the **early detection, prevention, and management of livestock diseases and animal health issues**, including faster reporting, risk assessment, preventive action, referral, and coordinated response.

---

## 🚀 Live Demo

🌐 **Web App:** https://sih-prototype-seven-red.vercel.app/

⚙️ **Backend API:** https://krishi-sarthak-api.onrender.com/

---

# 📌 The Problem

Livestock owners and field workers often face several challenges when managing animal health:

* Difficulty identifying animal diseases at an early stage
* Symptoms may be reported only after the condition becomes serious
* Limited access to nearby veterinary expertise and diagnostic facilities
* Incomplete vaccination and treatment histories
* Limited awareness of livestock disease activity in nearby areas
* Weather and environmental conditions can increase disease risk
* Animal-health information may remain fragmented across farms, veterinary services, and records
* Limited access to simple, multilingual animal-health guidance

Delayed identification and reporting of livestock diseases can increase animal mortality, reduce productivity, increase treatment costs, and affect farmers' incomes.

The official SIH26128 problem statement specifically highlights the need for unified and realtime mechanisms for animal-health risk identification, rapid reporting, risk assessment, preventive action, referral, and coordinated response, including in low-connectivity environments.

---

# 💡 Our Solution

**Pashu Sarthak acts as a digital livestock health companion for farmers.**

The platform combines livestock owner information, herd details, animal symptom monitoring, AI-assisted analysis, weather intelligence, location-based disease awareness, vaccination history, and veterinary guidance to help farmers make faster and more informed animal-health decisions.

Instead of relying on multiple disconnected sources, livestock owners can access important animal-health information from one unified platform.

The system is designed to support both **animal-level and herd-level health management**, while providing early warnings and guidance that can help farmers report potential health problems sooner.

---

# ✨ Key Features

## 🐄 Livestock Owner & Herd Profiles

Farmers can create and manage their livestock profile, including:

* Livestock owner details
* Location
* Livestock species
* Breed information
* Herd size
* Animal age information
* Vaccination history
* Health and disease case information

The application connects livestock-health information with the farmer's actual herd and profile, helping create a structured digital health record.

---

## 📸 Check My Animal — AI-Assisted Animal Health Diagnosis

Livestock owners can upload or capture an image of an animal showing visible symptoms.

The system is designed to assist with identifying potential animal-health conditions and provide useful information such as:

* Possible disease or health condition
* Symptom-based assessment
* Risk/severity indication
* Recommended preventive steps
* Suggested next actions
* Veterinary consultation guidance

The prototype focuses on visually identifiable livestock-health conditions and AI-assisted triage rather than claiming to replace professional veterinary diagnosis.

The goal is to make early animal-health assessment more accessible and convenient for livestock owners.

---

## 🩺 Animal Health Records

Pashu Sarthak helps maintain important livestock-health information in a structured manner.

Farmers can keep track of:

* Animal and herd information
* Previous health cases
* Vaccination history
* Treatment information
* Reported symptoms
* Disease-related observations

Maintaining these records can help farmers and veterinary professionals understand an animal's health history and make better-informed decisions.

---

## 🌦️ Weather & Livestock Risk Intelligence

Pashu Sarthak uses environmental conditions to provide livestock-health risk awareness.

The platform considers factors such as:

* Temperature
* Humidity
* Rain probability
* Current weather conditions
* Seasonal conditions
* Environmental risk factors

These conditions can be used to identify situations where livestock health risks may increase and provide farmers with preventive awareness.

The risk system can also be extended to incorporate historical disease trends and environmental correlations.

---

## 📍 My Area — Local Livestock Disease Awareness

The **My Area** section helps livestock owners understand animal-health activity around their location.

It focuses on:

* Nearby regions
* Livestock disease activity
* Potential outbreak zones
* Community-level risk awareness
* Location-based disease monitoring
* Geographic disease hotspots

This helps farmers understand whether an animal-health issue may be isolated or could be part of a larger local pattern.

Geospatial risk mapping and historical disease information are important components of the broader SIH26128 expected solution.

---

## 👨‍⚕️ Talk to a Vet

Farmers can access veterinary guidance through the **Talk to a Vet** section.

The platform provides:

* Animal-health questions and answers
* Veterinary guidance
* Quick questions
* Context-aware livestock information
* Symptom-related guidance
* Consultation interface

The system is designed to make animal-health knowledge and veterinary guidance easier to access, especially for livestock owners who may have difficulty reaching veterinary services immediately.

---

## 🔊 Listen to Advice

Pashu Sarthak includes an audio-based advice experience to make livestock-health information more accessible.

This is especially useful for users who may prefer listening to guidance instead of reading long blocks of text.

Audio-based guidance can help improve accessibility for farmers in rural environments and support easier consumption of important health advisories.

---

## 🌐 Multilingual & Farmer-Friendly Interface

The interface is designed to be simple, accessible, and farmer-friendly.

Pashu Sarthak supports a multilingual experience to reduce language barriers and make livestock-health information easier to understand.

The platform aims to reduce the complexity often associated with digital healthcare and livestock-management systems.

---

## 📱 Progressive Web App (PWA)

Pashu Sarthak is built as a **Progressive Web App**.

This allows users to:

* Open the application on mobile devices
* Install it like an app on supported devices
* Access a responsive mobile-friendly interface
* Experience an app-like workflow without requiring a traditional app-store installation
* Use the platform through a lightweight web-based experience

The architecture can also be extended toward offline and low-connectivity workflows, which are part of the expected direction of SIH26128.

---

# 🛠️ Tech Stack

## 🎨 Frontend

* React
* TypeScript
* Vite
* CSS / Responsive UI
* Progressive Web App (PWA)

## ⚙️ Backend

* Node.js
* Express.js
* REST APIs

## 🤖 AI / Machine Learning

* Python
* Computer Vision
* AI-assisted livestock symptom analysis
* Image-based disease/condition classification
* ONNX-based model integration

The AI component is designed as an **assisted triage system** to identify potential livestock-health conditions from visible symptoms and support early reporting.

---

## 🗄️ Database & Cloud Services

* Supabase
* PostgreSQL

Used for cloud-based application data and backend integration.

The database stores information such as:

* Livestock owner profiles
* Herd information
* Species and breed
* Animal health records
* Vaccination history
* Disease case history
* Location-related information

---

## 🌦️ External Data

* Open-Meteo API

Used for weather-related intelligence and environmental risk analysis.

Weather information can be combined with livestock-health observations and seasonal patterns to provide risk awareness.

---

## 🚀 Deployment

* **Vercel** — Frontend deployment
* **Render** — Backend API deployment
* **Supabase** — Database and backend services

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │   Livestock Owner    │
                    │   Mobile / Web App   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ React + Vite + PWA   │
                    │      Frontend        │
                    │       (Vercel)       │
                    └──────────┬───────────┘
                               │
                         REST API Requests
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Node.js + Express   │
                    │       Backend        │
                    │       (Render)       │
                    └───────┬─────┬────────┘
                            │     │
             ┌──────────────┘     └──────────────┐
             ▼                                   ▼
   ┌──────────────────┐                ┌──────────────────┐
   │    Supabase      │                │   Open-Meteo     │
   │ Database / Data  │                │ Weather Data     │
   └──────────────────┘                └──────────────────┘
             │
             ▼
   ┌──────────────────────────────┐
   │ AI / ML Animal Health Engine │
   │ Image & Symptom Analysis     │
   └──────────────────────────────┘
             │
             ▼
   ┌──────────────────────────────┐
   │ Livestock Risk & Disease     │
   │ Awareness / Triage Layer     │
   └──────────────────────────────┘
```

---

# 📂 Project Structure

```text
SIH-Prototype/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── context/
│   │   ├── i18n/
│   │   ├── assets/
│   │   └── ...
│   │
│   ├── public/
│   ├── vite.config.ts
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── config/
│   │   ├── routes/
│   │   ├── services/
│   │   └── ...
│   │
│   ├── server.js
│   └── package.json
│
├── ml/
│   ├── models/
│   ├── scripts/
│   └── ...
│
└── README.md
```

---

# ⚡ Getting Started

## Prerequisites

Make sure you have:

* Node.js 18 or above
* npm
* Python 3.x
* A Supabase project

---

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/snehansh0907/SIH-Prototype.git
cd SIH-Prototype
```

---

## 2️⃣ Setup the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
PORT=5000

SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

OPEN_METEO_BASE_URL=https://api.open-meteo.com

FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
npm start
```

The backend will run on:

```text
http://localhost:5000
```

---

## 3️⃣ Setup the Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env.local` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open the local URL shown by Vite.

---

## 4️⃣ Setup the AI / ML Environment

If the AI diagnosis module is being run locally, install the required Python dependencies from the ML directory/environment.

```bash
cd ml
pip install -r requirements.txt
```

The AI module can then be integrated with the backend diagnosis workflow.

---

# 🔐 Environment Variables

## Backend

| Variable              | Description                   |
| --------------------- | ----------------------------- |
| `PORT`                | Backend server port           |
| `SUPABASE_URL`        | Supabase project URL          |
| `SUPABASE_ANON_KEY`   | Supabase API key              |
| `OPEN_METEO_BASE_URL` | Open-Meteo API base URL       |
| `FRONTEND_URL`        | Allowed frontend URL for CORS |

## Frontend

| Variable       | Description     |
| -------------- | --------------- |
| `VITE_API_URL` | Backend API URL |

For production:

```env
VITE_API_URL=https://krishi-sarthak-api.onrender.com/api
```

---

# 🎯 Project Objectives

Pashu Sarthak aims to:

* Improve early awareness of livestock health problems
* Enable faster reporting of animal-health symptoms
* Support AI-assisted livestock disease triage
* Maintain animal and herd health information
* Track vaccination and treatment history
* Provide weather-based livestock-health risk awareness
* Enable location-aware disease and outbreak monitoring
* Improve access to veterinary guidance
* Provide multilingual and farmer-friendly health information
* Support better preventive action and disease awareness
* Create a unified digital livestock-health experience
* Make animal-health technology more accessible to rural livestock owners

These objectives align with the broader SIH26128 requirement for early warning, rapid reporting, risk assessment, preventive action, referral, and coordinated management of livestock diseases and animal-health issues.

---

# 🔮 Future Scope

Pashu Sarthak can be expanded with:

* 🤖 More advanced livestock disease detection models
* 📷 Real-time camera-based animal health assessment
* 🐄 Animal-level digital health passports
* 🏷️ QR/RFID-based livestock identification
* 🗺️ Live geospatial livestock disease heatmaps
* 🔔 Push notifications and disease alerts
* 💉 Automated vaccination reminders
* 🧑‍⚕️ Direct connection with verified veterinarians
* 🧪 Laboratory sample collection and referral workflows
* 📊 Veterinary department dashboards
* 📈 Advanced herd health analytics
* 🌦️ Disease prediction using weather and historical trends
* 🦠 Outbreak detection and containment intelligence
* 🗣️ Expanded regional language support
* 📡 Offline-first functionality for low-connectivity rural areas
* 📱 Native Android/iOS applications
* 🔊 IVR and voice-based livestock-health assistance

The SIH26128 expected solution also envisions symptom and mortality reporting, AI/rule-based triage, geospatial risk mapping, weather and historical disease trends, multilingual alerts, laboratory referral, case escalation, veterinary dashboards, and mobile/web/IVR/offline channels.

---

# 👥 Team

**TEAM CYPHER**
Smart India Hackathon (SIH) Prototype

* **Lakshya Vadera**
* **Snehansh Tripathy**
* **Lau Kumar Singh**
* **Maahi Arora**
* **Utsav Kumar**
* **Parth Upadhyay**

Built with the goal of making **smart livestock health more accessible to every farmer**. 🐄

---

# 📄 License

This project is licensed under the **MIT License**.

---

::: {align="center"}

### 🐄 Pashu Sarthak

**"सही समय पर सही सलाह — Smarter Livestock Health"**

Made with ❤️ for farmers, healthier livestock, and smarter animal-health management.
