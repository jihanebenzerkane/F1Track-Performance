package org.Formula1.service;

import org.Formula1.dao.DriverDAO;
import org.Formula1.dao.RaceResultDAO;
import org.Formula1.dto.ConstructorStandingDTO;
import org.Formula1.dto.DriverStandingDTO;
import org.Formula1.models.Driver;
import org.Formula1.utils.TableRenderer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class PredictionService {
    private final DriverDAO driverDAO;
    private final RaceResultDAO resultDAO;

    @Autowired
    public PredictionService(DriverDAO driverDAO, RaceResultDAO resultDAO) {
        this.driverDAO = driverDAO;
        this.resultDAO = resultDAO;
    }

    public void predictNextRaceWinner() {
        int targetYear = resultDAO.getLatestSeasonYear();
        List<Driver> drivers = driverDAO.findBySeason(targetYear);
        if (drivers.isEmpty()) {
            System.out.println("No active drivers found for prediction.");
            return;
        }
        int year = resultDAO.getLatestSeasonYear();
        drivers.forEach(d -> d.setPoints(resultDAO.getTotalPointsByDriver(d.getId(), year)));
        drivers.sort((d1, d2) -> d2.getPoints() - d1.getPoints());
        
        System.out.println("\n--- AI Analysis: Race Win Probabilities ---");
        String[] headers = {"PROB", "DRIVER", "TEAM", "CONFIDENCE"};
        List<String[]> rows = new ArrayList<>();
        
        int totalTopPoints = drivers.stream().limit(5).mapToInt(Driver::getPoints).sum();
        drivers.stream().limit(5).forEach(d -> {
            double prob = (totalTopPoints > 0) ? (d.getPoints() / (double)totalTopPoints) * 100 : 20.0;
            rows.add(new String[]{
                String.format("%.1f%%", prob), d.getName(), d.getTeam(), (prob > 30 ? "High" : "Medium")
            });
        });
        TableRenderer.render("Win Predictions", headers, rows);
    }

    public void predictChampion() {
        int targetYear = resultDAO.getLatestSeasonYear();
        List<Driver> drivers = driverDAO.findBySeason(targetYear);
        int year = resultDAO.getLatestSeasonYear();
        drivers.forEach(d -> d.setPoints(resultDAO.getTotalPointsByDriver(d.getId(), year)));
        
        drivers.sort((d1, d2) -> d2.getPoints() - d1.getPoints());
        if (drivers.isEmpty()) {
            System.out.println("No data available for champion prediction.");
            return;
        }
        String[] headers = {"RANK", "DRIVER", "PTS (ESTIMATED)", "PROJECTED STATUS"};
        List<String[]> rows = new ArrayList<>();
        for (int i = 0; i < Math.min(5, drivers.size()); i++) {
            Driver d = drivers.get(i);
            rows.add(new String[]{
                "#" + (i + 1), d.getName(), String.valueOf((int)(d.getPoints() * 1.1)), (i == 0 ? "FAVORITE" : "CONTENDER")
            });
        }
        TableRenderer.render("WDC Prediction - " + targetYear, headers, rows);
    }

    /**
     * SIMULATION 2026: Monte Carlo logic for future seasons.
     */
    public List<DriverStandingDTO> simulateSeasonDrivers(int year) {
        List<Driver> baseDrivers = driverDAO.findBySeason(2024); // Use 2024 as baseline
        List<DriverStandingDTO> simulated = new ArrayList<>();
        
        for (Driver d : baseDrivers) {
            // Factor 2026: New rules shuffle (random variance)
            double skillFactor = 0.7 + (Math.random() * 0.6); // 0.7 to 1.3
            double luckFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
            int basePoints = resultDAO.getTotalPointsByDriver(d.getId(), 2024);
            int simulatedPoints = (int) (basePoints * skillFactor * luckFactor);
            
            simulated.add(new DriverStandingDTO(
                d.getId(), d.getName(), d.getTeam(), simulatedPoints, 
                d.getCarNumber(), d.getNationality(), 0, (int)(simulatedPoints/25)
            ));
        }
        
        simulated.sort((a, b) -> Integer.compare(b.getPoints(), a.getPoints()));
        for (int i = 0; i < simulated.size(); i++) {
            simulated.get(i).setPosition(i + 1);
        }
        return simulated;
    }

    public List<ConstructorStandingDTO> simulateSeasonConstructors(int year) {
        List<ConstructorStandingDTO> simulated = new ArrayList<>();
        // 2026 Stakeholders / Teams
        String[][] teams = {
           {"Red Bull", "Austrian"}, {"Ferrari", "Italian"}, {"Mercedes", "German"}, 
           {"McLaren", "British"}, {"Aston Martin", "British"}, {"Audi", "German"}, 
           {"Williams", "British"}, {"RB", "Italian"}, {"Alpine", "French"}, {"Haas", "American"}
        };

        for (String[] t : teams) {
            double aeroFactor = 0.5 + Math.random(); 
            int points = (int)(aeroFactor * 400);
            simulated.add(new ConstructorStandingDTO(
                t[0].toLowerCase().replace(" ", "-"), t[0], points, t[1], 0, points/50, null
            ));
        }
        simulated.sort((a, b) -> Double.compare(b.getPoints(), a.getPoints()));
        for (int i = 0; i < simulated.size(); i++) {
            simulated.get(i).setPosition(i + 1);
        }
        return simulated;
    }
}