# 🌾 Krishi Sarthak

> **Smart Crop Care for Every Farmer**

Krishi Sarthak is an AI-powered digital agriculture platform designed to
help farmers identify crop health problems, understand disease risks,
monitor nearby agricultural activity, and access agricultural guidance
through a simple, farmer-friendly interface.

Built as a prototype for **Smart India Hackathon (SIH)**, Krishi Sarthak
brings crop monitoring, AI-assisted diagnosis, weather-based risk
intelligence, location awareness, and expert guidance together in one
platform.

------------------------------------------------------------------------

## 🚀 Live Demo

🌐 **Web App:** https://sih-prototype-seven-red.vercel.app/

⚙️ **Backend API:** https://krishi-sarthak-api.onrender.com/

------------------------------------------------------------------------

# 📌 The Problem

Farmers often face several challenges when managing crop health:

-   Difficulty identifying plant diseases and pests at an early stage
-   Lack of immediate, accessible agricultural guidance
-   Weather conditions can increase disease risk without farmers
    realizing it
-   Limited awareness of disease activity in nearby areas
-   Difficulty connecting with agricultural experts
-   Agricultural information is often not available in simple,
    accessible formats

A small delay in identifying a crop disease can lead to significant crop
damage and financial loss.

## 💡 Our Solution

**Krishi Sarthak acts as a digital crop health companion for farmers.**

The platform combines farmer and farm information with crop monitoring,
weather intelligence, location-based awareness, and agricultural
guidance to help farmers make better and faster decisions.

Instead of searching through multiple sources, farmers can access
important crop-health information from one unified platform.

------------------------------------------------------------------------

# ✨ Key Features

## 🌱 Farmer & Farm Profiles

Farmers can create and manage their agricultural profile, including:

-   Farmer details
-   Farm information
-   Location
-   Active crop
-   Farm area
-   Agricultural monitoring information

The application ensures that crop-related information is connected to
the farmer's actual profile and farm.

------------------------------------------------------------------------

## 📸 Check My Crop --- AI-Assisted Crop Diagnosis

Farmers can upload or capture an image of an affected crop or leaf.

The system is designed to help identify potential crop health problems
and provide useful information such as:

-   Possible disease or issue
-   Severity indication
-   Crop-health guidance
-   Recommended next steps

The goal is to make early crop disease detection more accessible and
convenient.

------------------------------------------------------------------------

## 🌦️ Weather & Risk Intelligence

Krishi Sarthak uses weather conditions to provide agricultural risk
awareness.

The platform considers factors such as:

-   Temperature
-   Humidity
-   Rain probability
-   Current environmental conditions

These conditions can be used to identify situations where crop disease
risk may increase and provide farmers with early warnings.

------------------------------------------------------------------------

## 📍 My Area --- Local Agricultural Awareness

The **My Area** section helps farmers understand agricultural activity
and potential disease situations around their actual location.

It focuses on:

-   Nearby regions
-   Disease activity
-   Agricultural hotspots
-   Community-level risk awareness
-   Location-based monitoring

This helps farmers understand whether a crop issue may be isolated or
part of a larger local pattern.

------------------------------------------------------------------------

## 👨‍🌾 Talk to an Expert

Farmers can interact with the agricultural guidance system through the
**Expert** section.

The platform provides:

-   Crop-related questions and answers
-   Agricultural guidance
-   Quick questions
-   Context-aware crop information
-   Expert consultation interface

The system is designed to make agricultural knowledge easier to access.

------------------------------------------------------------------------

## 🔊 Listen to Advice

Krishi Sarthak includes an audio-based advice experience to make
agricultural information more accessible.

This is especially useful for users who may prefer listening to guidance
instead of reading long blocks of text.

------------------------------------------------------------------------

## 🌐 Multilingual & Farmer-Friendly Interface

The interface is designed to be simple and accessible, with support for
multiple language experiences.

The goal is to reduce the complexity often associated with agricultural
technology and make the platform easier for farmers to use.

------------------------------------------------------------------------

## 📱 Progressive Web App (PWA)

Krishi Sarthak is built as a **Progressive Web App**.

This allows users to:

-   Open the application on mobile devices
-   Install it like an app on supported devices
-   Access a responsive mobile-friendly interface
-   Experience an app-like workflow without requiring a traditional
    app-store installation

------------------------------------------------------------------------

# 🛠️ Tech Stack

## 🎨 Frontend

-   React
-   TypeScript
-   Vite
-   CSS / Responsive UI
-   PWA support

## ⚙️ Backend

-   Node.js
-   Express.js
-   REST APIs

## 🗄️ Database & Cloud Services

-   Supabase

Used for cloud-based application data and backend integration.

## 🌦️ External Data

-   Open-Meteo API

Used for weather-related intelligence and environmental data.

## 🚀 Deployment

-   **Vercel** --- Frontend deployment
-   **Render** --- Backend API deployment
-   **Supabase** --- Database and backend services

------------------------------------------------------------------------

# 🏗️ System Architecture

``` text
                    ┌─────────────────────┐
                    │   Farmer / User     │
                    │   Mobile / Web App  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ React + Vite + PWA  │
                    │     Frontend        │
                    │      (Vercel)       │
                    └──────────┬──────────┘
                               │
                         REST API Requests
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Node.js + Express  │
                    │      Backend        │
                    │      (Render)       │
                    └───────┬─────┬───────┘
                            │     │
                ┌───────────┘     └────────────┐
                ▼                              ▼
      ┌──────────────────┐           ┌──────────────────┐
      │    Supabase      │           │   Open-Meteo     │
      │ Database / Data  │           │ Weather Data     │
      └──────────────────┘           └──────────────────┘
```

------------------------------------------------------------------------

# 📂 Project Structure

``` text
SIH-Prototype/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── assets/
│   │   └── ...
│   │
│   ├── public/
│   ├── vite.config.ts
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── routes/
│   │   ├── services/
│   │   └── ...
│   │
│   ├── server.js
│   └── package.json
│
└── README.md
```

------------------------------------------------------------------------

# ⚡ Getting Started

## Prerequisites

Make sure you have:

-   Node.js 18 or above
-   npm
-   A Supabase project

------------------------------------------------------------------------

## 1️⃣ Clone the Repository

``` bash
git clone https://github.com/snehansh0907/SIH-Prototype.git
cd SIH-Prototype
```

------------------------------------------------------------------------

## 2️⃣ Setup the Backend

``` bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

``` env
PORT=5000

SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

OPEN_METEO_BASE_URL=https://api.open-meteo.com

FRONTEND_URL=http://localhost:5173
```

Start the backend:

``` bash
npm start
```

The backend will run on:

``` text
http://localhost:5000
```

------------------------------------------------------------------------

## 3️⃣ Setup the Frontend

Open another terminal:

``` bash
cd frontend
npm install
```

Create a `.env.local` file:

``` env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

``` bash
npm run dev
```

Open the local URL shown by Vite.

------------------------------------------------------------------------

# 🔐 Environment Variables

## Backend

  Variable                Description
  ----------------------- -------------------------------
  `PORT`                  Backend server port
  `SUPABASE_URL`          Supabase project URL
  `SUPABASE_ANON_KEY`     Supabase API key
  `OPEN_METEO_BASE_URL`   Open-Meteo API base URL
  `FRONTEND_URL`          Allowed frontend URL for CORS

## Frontend

  Variable         Description
  ---------------- -----------------
  `VITE_API_URL`   Backend API URL

For production:

``` env
VITE_API_URL=https://krishi-sarthak-api.onrender.com/api
```

------------------------------------------------------------------------

# 🎯 Project Objectives

Krishi Sarthak aims to:

-   Improve early awareness of crop health problems
-   Make crop monitoring easier for farmers
-   Provide weather-based agricultural risk awareness
-   Improve access to agricultural guidance
-   Enable location-aware disease and hotspot monitoring
-   Create a simple digital agriculture experience
-   Make agricultural technology more accessible through a
    mobile-friendly platform

------------------------------------------------------------------------

# 🔮 Future Scope

Krishi Sarthak can be expanded with:

-   🤖 More advanced crop disease models
-   📷 Real-time camera-based diagnosis
-   🗺️ Live geospatial disease heatmaps
-   🔔 Push notifications and disease alerts
-   📱 Native Android/iOS applications
-   🌾 Crop-specific advisory engines
-   👨‍🌾 Direct connection with verified agricultural experts
-   🛰️ Satellite and remote-sensing integration
-   📊 Advanced farm analytics
-   🗣️ Expanded regional language support
-   📡 Better offline functionality for rural areas

------------------------------------------------------------------------

# 👥 Team

**Krishi Sarthak Team**\
Smart India Hackathon (SIH) Prototype

Built with the goal of making **smart crop care more accessible to every
farmer**. 🌾

------------------------------------------------------------------------

# 📄 License

This project is licensed under the **MIT License**.

------------------------------------------------------------------------

::: {align="center"}
### 🌾 Krishi Sarthak

**"सही समय पर सही सलाह --- Smarter Crop Care"**

Made with ❤️ for farmers and smarter agriculture.
:::
