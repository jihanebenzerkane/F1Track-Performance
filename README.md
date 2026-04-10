# F1Track Performance

Full-stack Formula 1 analytics app:
- **Backend:** Java + Spring Boot + SQLite
- **Frontend:** React + Vite

## Project Structure

- `backend/F1Track`: REST API server
- `frontend`: React web app

## Prerequisites

- Java 17+ (Java 25 works)
- Node.js + npm
- Apache Maven 3.9+

### Windows: Install Maven (if `mvn` is missing)

```powershell
winget install Apache.Maven
```

Then reopen PowerShell and verify:

```powershell
mvn -v
```

## Run the App

Open **two terminals**.

### 1) Start Backend

```powershell
cd backend/F1Track
mvn spring-boot:run
```

Backend runs on:
- `http://localhost:8081`

Quick API check:

```powershell
curl http://localhost:8081/api/standings/2023
```

### 2) Start Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs on:
- `http://localhost:5173`

## Common Issues

- **No data in UI**
  - Backend is not running, or API URL unreachable.
  - Confirm `http://localhost:8081/api/standings/2023` returns JSON.

- **`mvn` not recognized**
  - Maven is not installed or not in PATH.
  - Install with `winget install Apache.Maven`, then restart terminal.

- **Port mismatch**
  - Backend is configured for port `8081` in `backend/F1Track/src/main/resources/application.properties`.
  - Frontend API base is `http://localhost:8081` in `frontend/src/api/f1api.js`.

## Frontend Logo Customization

To replace the text logo with an image:

1. Add image file to `frontend/public` (example: `frontend/public/f1-logo.png`)
2. In `frontend/src/App.jsx`, replace the header logo text block with an `<img src="/f1-logo.png" />` and keep `Track` text if desired.

## License

MIT
