# 🏎️ F1Track: Formula 1 Historical Data Explorer

[![Java Version](https://img.shields.io/badge/Java-25-orange.svg)](https://www.oracle.com/java/)
[![Database](https://img.shields.io/badge/Database-SQLite-blue.svg)](https://www.sqlite.org/)
[![Build](https://img.shields.io/badge/Build-Maven-red.svg)](https://maven.apache.org/)

**F1Track** is a professional-grade, high-performance command-line interface (CLI) application designed for exploring and analyzing over 70 years of Formula 1 history. Powered by a robust SQLite dataset, it transforms complex relational data into premium, readable terminal visualizations.

---

## 🌟 Key Features

### 🏁 Historical Exploration
*   **Season-Specific Grids**: Instantly retrieve and view full driver lineups for any season from 1950 to the present.
*   **Deep Driver Directory**: Search for any driver in F1 history by name, nationality, or permanent number.
*   **Team Analysis**: Explore constructor history and identify standout drivers for every team on the grid.

### ⏱️ Race & Result Analytics
*   **Grand Prix Archive**: Search and filter through thousands of historical races by year or event name.
*   **Live-Style Results**: View detailed race results including finishing positions, grid spots, and points distributions.
*   **Performance Tracking**: Drill down into a specific driver's performance across a single season or their entire career.

### 📊 Intelligence & Predictions
*   **Aggregated Statistics**: Real-time calculation of total points, team hierarchies, and career milestones.
*   **AI-Powered Predictions**: Advanced weighting logic to predict 2026 season champions and upcoming race winners based on historical trends.
*   **Premium Visualization**: Every data point is rendered in high-contrast, structured tables for a professional terminal experience.

---

## 🛠️ Technical Architecture

F1Track is built using a clean, multi-layered architecture following the **DAO (Data Access Object)** pattern to ensure scalability and maintainability.

*   **Models**: Immutable data representations of Drivers, Races, Results, and Constructors.
*   **DAO Layer**: Optimized SQL queries utilizing efficient JOINs to handle the 73MB+ historical dataset with sub-millisecond latency.
*   **Service Layer**: Encapsulated business logic for statistical processing and prediction algorithms.
*   **Utilities**: A custom-built `TableRenderer` for consistent UI/UX across all terminal interactions.

---

## 🚀 Getting Started

### Prerequisites
*   **Java Development Kit (JDK) 25** or higher.
*   **Apache Maven** 3.9+.
*   The **f1db.db** (73MB) SQLite database file located in the project root.

### Installation & Build
1.  Clone the repository.
2.  Place your `f1db.db` file in the root directory.
3.  Compile and install dependencies:
    ```bash
    mvn clean install
    ```

### Execution
Launch the application via Maven:
```bash
mvn exec:java -Dexec.mainClass="org.Formula1.Main"
```

---

## 📁 Repository Structure
```text
src/main/java/org/Formula1/
├── dao/        # Optimized SQLite data access
├── db/         # Connection pooling & logic
├── models/     # Domain entities
├── service/    # Business logic & algorithms
└── utils/      # UI rendering & table formatters
```

---

## 📄 License
This project is open-source and available under the **MIT License**.

*"In Formula 1, everything is possible." — Ayrton Senna*
