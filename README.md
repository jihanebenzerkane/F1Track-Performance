# F1Track

Full-stack Formula 1 data and predictions platform built around the 2026 season.

**🔴 Live Demo: [https://f1track.duckdns.org](https://f1track.duckdns.org)**

![React](https://img.shields.io/badge/React-Vite-61DAFB?style=flat&logo=react)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.5-6DB33F?style=flat&logo=springboot)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=flat&logo=sqlite)
![Three.js](https://img.shields.io/badge/3D-Three.js-black?style=flat&logo=threedotjs)
![OCI](https://img.shields.io/badge/Deployed-Oracle_Cloud-F80000?style=flat&logo=oracle)

## What it does

F1Track combines historical F1 data (1950–2026), live standings, real-time telemetry,
and a Monte Carlo race prediction engine into a single web application.

## Stack

**Frontend**
- React 18 + Vite
- Three.js / React Three Fiber  3D interactive car viewer
- Recharts telemetry and lap data visualization
- Custom design system
  
**Backend**
- Spring Boot 3.2.5 REST API  20+ endpoints
- SQLite  relational dataset with historical F1 data (1950–2026)
- DAO pattern with complex SQL joins across race, driver, and circuit tables
- Monte Carlo simulation engine for race predictions (50,000 iterations)

**Data pipelines**

Historical data (f1db.db)
→ Local SQLite database (1950–2026)
→ Structured relational schema (drivers, races, constructors, circuits, results)
→ Used as the main input for analysis and simulation
→ Queried via DAO layer with multi-table joins

Real-time telemetry (OpenF1)
→ Live ingestion from OpenF1 API
→ Streams: speed, RPM, throttle, brake
→ Normalization layer for inconsistent inputs
→ Downsampling (1/800) for frontend performance
→ Ingestion → transform → API → visualization flow

**Infrastructure**
- Deployed on Oracle Cloud Infrastructure (OCI)  VM.Standard.A1.Flex, Casablanca region
- Dockerized frontend (Nginx) and backend (eclipse-temurin:21)
- Nginx reverse proxy with SSL via Let's Encrypt

**External APIs**
- OpenF1 API  live session telemetry, lap data, driver rosters

## Features

- **Race Predictions**  Monte Carlo simulation using historical results,
  driver standings, and circuit-specific performance history
- **Telemetry Cockpit**  Live speed, RPM, throttle and brake data
  streamed via OpenF1, sampled and visualized per driver per session
- **3D Car Viewer**  Interactive component explorer with specs and
  upgrade timelines across 6 teams × 8 components
- **Championship Standings**  Drivers and constructors, 1950–2026
- **Head-to-Head**  Driver comparison across shared seasons
- **Pit Strategy**  Stop analysis and undercut modeling
- **FIA 2026 Regulations**  Technical breakdown with data impact
  notes connected to each feature in the app

## Architecture notes

The prediction engine uses Monte Carlo simulation.
50,000 iterations per prediction, weighted by historical win rates,
driver standings, and circuit-specific performance history.

The telemetry pipeline samples raw OpenF1 car data at 1/800 rate
to keep render performance stable while preserving the signal shape
across speed, RPM, throttle and brake channels.

## Deployment

Deployed on Oracle Cloud Infrastructure Always Free tier:
- VM.Standard.A1.Flex (1 OCPU, 6GB RAM, Ubuntu 22.04, Casablanca region)
- Frontend: React build served by Nginx in Docker
- Backend: Spring Boot JAR running in Docker on eclipse-temurin:21
- Reverse proxy routes `/api/*` to backend, all other routes to React SPA
- SSL certificate via Let's Encrypt (auto-renewing)

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
## Demo
video demo : <br>
[![F1Track Demo](https://img.youtube.com/vi/kdbN6AMriW0/0.jpg)](https://youtu.be/kdbN6AMriW0)<br>
<img width="2999" height="1999" alt="image" src="https://github.com/user-attachments/assets/0f362b3b-06cf-4b29-978d-17327aade6f9" /><br>
<img width="2999" height="1997" alt="image" src="https://github.com/user-attachments/assets/bb71a9c9-2ca0-43ad-b4d9-5c3a9b6c785c" /><br>
<img width="2999" height="1999" alt="image" src="https://github.com/user-attachments/assets/0c4ef7bd-a657-41c8-b087-0f37a5275e89" /><br>
<img width="2999" height="1999" alt="image" src="https://github.com/user-attachments/assets/4499dfdf-7fae-4408-a888-1e3e095d2602" />


---

Built by [Jihane Benzerkane](https://www.linkedin.com/in/jihanebenzerkane) with ❤️ and ☕
