# F1Track — F1 2026 Driver Performance Tracker

A Java console application to track Formula 1 drivers, races, results, and standings for the 2026 season. Built from scratch as a learning project covering Java, SQLite, JDBC, DAO architecture, and basic prediction algorithms.

---

## Features

### 1. View Drivers
- List all drivers in the database
- Filter by team or nationality using SQL `WHERE` clauses

### 2. View Races
- List all races
- Filter by season or circuit

### 3. Manage Race Results *(CRUD)*
- Add a race result for a driver
- Update an existing result
- Delete a result
- View all results per race
- Automatic points calculation based on finishing position

### 4. Statistics
- **Driver standings** — total points per driver, ranked
- **Team standings** — aggregate driver points per constructor
- **Season dominance** — top driver and top team per season
- **Extra stats** — wins, DNFs, fastest lap counts

### 5. Predictions *(Rule-based model)*
Drivers are scored using:
```
score = (total_points × 0.6) + (wins × 0.2) + (fastest_laps × 0.1) − (dnfs × 0.1)
```
Outputs a ranked prediction for Top 3 / Top 10 finishers.

---

## F1 Points System (2026)

| Position | Points |
|----------|--------|
| 1st | 25 |
| 2nd | 18 |
| 3rd | 15 |
| 4th | 12 |
| 5th | 10 |
| 6th | 8 |
| 7th | 6 |
| 8th | 4 |
| 9th | 2 |
| 10th | 1 |
| Fastest Lap bonus | +1 |
| DNF | 0 |

---

## Project Architecture

```
src/
└── main/java/org/Formula1/
    ├── models/         # Pure data classes (Driver, Race, RaceResult)
    ├── dao/            # Data Access Objects (CRUD operations)
    ├── db/             # Database connection and table creation
    ├── service/        # Business logic (StandingsService, predictions)
    ├── ui/             # Console menu system
    └── Main.java       # Entry point
```

**Layered architecture:**
- **Data layer** — models + DAOs + DatabaseManager
- **Business logic layer** — StandingsService, PointsCalculator
- **Presentation layer** — Console menus

---

## Tech Stack

| Technology | Role |
|------------|------|
| Java 26 | Core language |
| SQLite | Embedded database |
| JDBC | Database connectivity |
| Maven | Dependency management |

---

## Database Schema

**driver** — id, name, team, nationality, carNumber, points  
**race** — id, grandPrix, circuit, country, season, raceDate  
**race_result** — id, driverId (FK), raceId (FK), finishPosition, gridPosition, pointsEarned, fastestLap, dnf, dnfReason

---

## How to Run

1. Clone the repository
2. Open in IntelliJ IDEA
3. Make sure Maven dependencies are synced (`pom.xml`)
4. Run `Main.java`

No server setup required — SQLite creates the database file automatically on first run.

---

## Roadmap

- [x] Phase 1 — Console app with SQLite
- [ ] Phase 2 — Spring Boot REST API migration
- [ ] Phase 3 — Java Swing desktop UI
- [ ] Phase 4 — GenAI race prediction (LangChain4j + OCI GenAI)

---

## Author

**Jihane Benzerkane** — First-year Digital Transformation & AI Engineering student at ENSAH  
Built as a self-directed learning project to master Java fundamentals and layered architecture.
