# F1Track: A Passenger on the Data Express 🏎️

Welcome to my passion project! **F1Track** is a labor of love born from two things: an obsession with Formula 1 technicalities and a drive to master the complex world of Full-Stack development. 

This isn't just a standings app,it's an engineering playground where I've experimented with real-time data integration, technical simulations, and high-end graphics.

---

## 🌟 The Vision
As a student of computer science, my goal was to build a professional-grade analysis tool that feels as fast and sophisticated as the cars on the grid. I wanted to handle everything from low-level SQL queries to high-level 3D animations, creating a bridge between raw sports data and a premium user experience.

---

## 🚀 Technical Deep Dive

### 🏗️ Backend: The Engine Room (Java & Spring Boot)
The "power unit" of this app is built on **Spring Boot 3.2.5**. 
- **The Persistence Layer:** I used **SQLite** to simulate a real-world relational dataset, practicing complex SQL joins for historical race results (1950-Present).
- **Predictive Modeling:** Since the 2026 season brings new FIA regulations, I built a custom **Simulation Engine** in Java. It uses weighted probabilities to forecast team performance, allowing me to explore the intersection of sports logic and algorithmic code.
- **Challenge Overcome:** One of my biggest learning moments was managing port conflicts with local services (like Apache) and implementing a clean DAO (Data Access Object) pattern to keep the code modular and "industry-ready."

### 🎨 Frontend: The Aerodynamics (React & Three.js)
The "chassis" is a cutting-edge **React (Vite)** application.
- **Human-Centric UI Refinement:** I refactored the entire analytical suite (Telemetry, Standings, H2H) to move away from rigid grid layouts toward a centered, vertical "Analysis Flow." This reduces cognitive load and mimics professional engineering dashboards.
- **3D Visualization:** I integrated **Three.js** to render 3D car models on the homepage, creating an immersive entry point that moves beyond static lists.
- **Global Pit Wall Aesthetic:** I implemented a unified design system where every dropdown and button follows a custom-crafted dark mode. By standardizing form elements application-wide, the tool feels like a single, cohesive piece of race equipment.
- **State Management:** Managing asynchronous fetches for multiple standings, predictions, and telemetry streams taught me the importance of robust error handling and loading states.
- **Engineering Depth:** Beyond just charts, I integrated "System Diagnostics" into the UI to provide a sense of the backend's real-time telemetry extraction process.

---

## 🧠 What I Learned
1. **Full-Stack Orchestration:** Connecting a Java Spring backend to a React frontend taught me the nuances of RESTful APIs, CORS, and JSON serialization.
2. **Data Integrity:** Cleaning and mapping historical F1 data (often messy!) into a clean SQLite schema was a masterclass in database design.
3. **UX for Data:** Learning how to display 70+ years of data without overwhelming the user led to the development of the "Awards & Insights" tab and the "Form Rating" system.

---

## 🛠️ How to Launch

### 1. Start the Backend
```bash
cd backend
mvn spring-boot:run
```
*Note: Configured to run on port 8085 by default to avoid system conflicts.*

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🎥 Demonstration

---

### 🏁 Final Thoughts
This project is a testament to my growth as a developer. It represents thousands of lines of code, several sleepless nights debugging port errors, and a genuine pride in creating something that combines my technical skills with my passion for racing.

**Developed with ❤️ and ☕ by Jihane Benzerkane.**
