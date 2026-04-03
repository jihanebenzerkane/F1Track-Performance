# Formula 1 Track System

A comprehensive Java-based management system for Formula 1 data, powered by a rich SQLite database. This application allows users to explore historical F1 data, manage modern race results, and gain insights through statistics and predictions.

## 🏁 Features

### 🏎️ Driver Management
- **List Drivers by Season**: Filter the massive historical grid to view only drivers from a specific year.
- **Advanced Search**: Find drivers by name, nationality, or team.
- **Live Standings**: View driver standings based on recorded points.

### 🏁 Race Management
- **Seasonal Overview**: List all races for a specific season.
- **Race Search**: Search for specific Grand Prix events.
- **Chronological Standings**: View races sorted by date for any given year.

### ⏱️ Results & Standings
- **Manual Recording**: Add new race results manually to the local database.
- **Race Standings**: View the full finishing order, points earned, and grid positions for any race.
- **Driver History**: Track a specific driver's performance across a season.

### 📊 Analytics & Predictions
- **General Statistics**: Overview of total drivers, teams, and races in the system.
- **Team Insights**: Multi-dimensional statistics on constructor performance.
- **F1 Predictions**: AI-powered predictions for the next race winner and the season champion.

## 🛠️ Technology Stack
- **Language**: Java 25
- **Database**: SQLite (powered by `sqlite-jdbc`)
- **Build Tool**: Maven
- **JSON Parsing**: Jackson Databind
- **Networking**: OkHttp

## 📂 Project Structure
- `org.Formula1.Main`: Application entry point.
- `org.Formula1.dao`: Data Access Objects for database persistence.
- `org.Formula1.models`: Core domain entities (Driver, Race, Constructor, etc.).
- `org.Formula1.service`: Business logic layer for each major feature.
- `org.Formula1.db`: Database connection and table management.

## 🚀 Getting Started

### Prerequisites
- Java Development Kit (JDK) 25 or higher.
- Maven installed in your system.

### Installation
1. Clone the repository to your local machine.
2. Ensure the `f1db.db` file is present in the root directory.
3. Build the project using Maven:
   ```bash
   mvn clean install
   ```

### Running the App
Run the following command in your terminal:
```bash
mvn exec:java -Dexec.mainClass="org.Formula1.Main"
```

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
