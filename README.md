# F1Track — Performance Analytics

A full-stack Formula 1 data platform focused on historical standings, technical car specifications, and real-time telemetry extraction.

## Tech Stack
- **Backend:** Java 17+, Spring Boot 3.2.5, **SQLite** (`backend/f1db.db`) via JDBC
- **Frontend:** React, Vite, Three.js (3D Car Viewer), Recharts
- **Telemetry:** **Database mode** (historical races / summaries) or **OpenF1** (live sessions, requires internet)

## Core Features
- **3D Car Viewer:** Interactive technical breakdown of F1 constructor cars with live season statistics.
- **Standings:** Full historical driver and constructor standings (1950–2025).
- **Telemetry Dashboard:** Live lap timing and sector analysis powered by the OpenF1 API.
- **Race Predictions:** Monte Carlo simulation engine for strategic forecasting.

## Getting Started

### Prerequisites
- Java 17+ (Java 25 works)
- Node.js & npm
- Maven (`mvn`) or use a local Maven install

### Backend Configuration
1. Ensure `backend/f1db.db` is present (SQLite dataset).
2. From the `backend` directory, run:
   ```bash
   mvn spring-boot:run
   ```
3. Optional: set a custom DB path with JVM flag `-Df1track.db=C:/path/to/f1db.db`.

### Frontend Configuration
1. Navigate to the `frontend` directory.
2. Install dependencies and start the development server:
   ```bash
   npm install
   ```
   ```bash
   npm run dev
   ```

## API Architecture
The DAO layer targets the **SQLite** Ergast-style schema bundled as `f1db.db`. Pit strategy and telemetry (database mode) read from `race_data` / `race` / `circuit`. OpenF1 endpoints remain available when you select **OpenF1 (live)** in the Telemetry UI.

## License
MIT

<img width="2989" height="1999" alt="image" src="https://github.com/user-attachments/assets/bbc70784-4023-4173-a954-f10bd7686f8c" />
<img width="3000" height="2000" alt="image" src="https://github.com/user-attachments/assets/96aa3b35-504c-4ec0-9c6f-4dad3e1227c7" />
<img width="2998" height="1995" alt="image" src="https://github.com/user-attachments/assets/42b958e2-305c-4d97-a1e9-4183c1de6d9f" />

