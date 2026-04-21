# F1Track

Full-stack Formula 1 data and predictions platform built around the 2026 season.

![React](https://img.shields.io/badge/React-Vite-61DAFB?style=flat&logo=react)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.5-6DB33F?style=flat&logo=springboot)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=flat&logo=sqlite)
![Three.js](https://img.shields.io/badge/3D-Three.js-black?style=flat&logo=threedotjs)

## What it does

F1Track combines historical F1 data (1950–2026), live standings, real-time telemetry,
and a Monte Carlo race prediction engine into a single web application.

## Stack

**Frontend**
- React 18 + Vite
- Three.js / React Three Fiber — 3D interactive car viewer
- Recharts — telemetry and lap data visualization
- Custom design system (Inter + IBM Plex Mono, black/crimson palette)

**Backend**
- Spring Boot 3.2.5 REST API — 20+ endpoints
- SQLite — relational dataset with historical F1 data (1950–2026)
- DAO pattern with complex SQL joins across race, driver, and circuit tables
- Monte Carlo simulation engine for race predictions (50,000 iterations)

**External APIs**
- OpenF1 API — live session telemetry, lap data, driver rosters

## Features

- **Race Predictions** — Monte Carlo simulation using historical results,
  driver standings, and circuit-specific performance history
- **Telemetry Cockpit** — Live speed, RPM, throttle and brake data
  streamed via OpenF1, sampled and visualized per driver per session
- **3D Car Viewer** — Interactive component explorer with specs and
  upgrade timelines across 6 teams × 8 components
- **Championship Standings** — Drivers and constructors, 1950–2026
- **Head-to-Head** — Driver comparison across shared seasons
- **Pit Strategy** — Stop analysis and undercut modeling
- **FIA 2026 Regulations** — Technical breakdown with data impact
  notes connected to each feature in the app

## Architecture notes

The prediction engine uses Monte Carlo simulation rather than ML —
a deliberate choice to keep the math transparent and explainable.
50,000 iterations per prediction, weighted by historical win rates,
driver standings, and circuit-specific performance history.

The telemetry pipeline samples raw OpenF1 car data at 1/800 rate
to keep render performance stable while preserving the signal shape
across speed, RPM, throttle and brake channels.

## Run locally

**Backend**
```bash
cd backend
mvn spring-boot:run
# Runs on port 8085
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

## Recording

![F1Track Homepage](screenshots/)

---

Built by [Jihane Benzerkane](https://www.linkedin.com/in/jihanebenzerkane)
