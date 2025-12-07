# Emissions Dashboard – Stride Labs: HackForward 2025

Live dashboard: https://emission-dashboard-chi.vercel.app/  
Backend API: https://emission-dashboard.onrender.com  

## Overview

This project is a web-based dashboard to explore emissions from different industries and sectors, with an integrated chat assistant that can explain the data and enrich it with real-time internet-based insights.

It was built as part of **Stride Labs: HackForward 2025**.

## Tech Stack

- **Frontend:** React (Vite), Recharts, Axios
- **Backend:** Node.js, Express, Axios
- **Hosting:** Frontend on Vercel, Backend on Render
- **Data:** Sample emissions dataset (country, sector, year, emissions)
- **Real-time API:** UK National Grid Carbon Intensity API (for live grid carbon intensity in Great Britain)

## Features

- Interactive filters:
  - Country
  - Sector
  - Year range
- KPI cards:
  - Total emissions (for current filters)
  - Live grid carbon intensity (gCO₂/kWh) with qualitative index (`low`, `moderate`, `high`)
- Visualizations:
  - Bar chart of emissions by sector
- Data table:
  - Detailed breakdown by country, sector, year, and emissions
- Chat panel:
  - Accepts natural language questions about the current view
  - Uses the filtered emissions data as context
  - Enriches answers with real-time information from the UK Carbon Intensity API

## Architecture

- The **frontend** calls the backend via a REST API.
- The **backend**:
  - Serves filtered emissions data (`/api/data`)
  - Exposes live UK carbon intensity (`/api/realtime`)
  - Provides a chat endpoint (`/api/chat`) that:
    - Summarizes the current filtered dataset
    - Fetches real-time carbon intensity
    - Combines everything into a human-readable answer

## Running Locally

### Backend
cd server
npm install
node index.js
Backend runs on: http://localhost:4000

### Frontend
cd client
npm install
npm run dev
Frontend runs on: http://localhost:5173

The frontend uses:

VITE_API_BASE_URL env variable in production (Vercel)

Defaults to http://localhost:4000 for local development
