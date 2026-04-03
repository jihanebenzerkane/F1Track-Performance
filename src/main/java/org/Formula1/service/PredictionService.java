package org.Formula1.service;

import org.Formula1.dao.DriverDAO;
import org.Formula1.dao.RaceResultDAO;
import org.Formula1.models.Driver;
import org.Formula1.utils.TableRenderer;
import java.util.ArrayList;
import java.util.List;

public class PredictionService {
    private final DriverDAO driverDAO;
    private final RaceResultDAO resultDAO;

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
        drivers.forEach(d -> d.setPoints(resultDAO.getTotalPointsByDriver(d.getId())));
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
        drivers.forEach(d -> d.setPoints(resultDAO.getTotalPointsByDriver(d.getId())));
        
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
}