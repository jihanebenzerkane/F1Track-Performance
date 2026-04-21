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

    public List<DriverStandingDTO> simulateSeasonDrivers(int year) {
        List<DriverStandingDTO> simulated = new ArrayList<>();
        
        
        Object[][] grid = {
            {"kimi-antonelli", "Kimi Antonelli", "Mercedes", "12", "italy", 72, 1, 3},
            {"george-russell", "George Russell", "Mercedes", "63", "united-kingdom", 63, 1, 2},
            {"charles-leclerc", "Charles Leclerc", "Ferrari", "16", "monaco", 49, 0, 2},
            {"lewis-hamilton", "Lewis Hamilton", "Ferrari", "44", "united-kingdom", 41, 0, 1},
            {"lando-norris", "Lando Norris", "McLaren", "4", "united-kingdom", 25, 0, 0},
            {"oscar-piastri", "Oscar Piastri", "McLaren", "81", "australia", 21, 0, 0},
            {"oliver-bearman", "Oliver Bearman", "Haas", "87", "united-kingdom", 17, 0, 0},
            {"pierre-gasly", "Pierre Gasly", "Alpine", "10", "france", 15, 0, 0},
            {"max-verstappen", "Max Verstappen", "Red Bull", "1", "netherlands", 12, 0, 0},
            {"liam-lawson", "Liam Lawson", "Racing Bulls", "30", "new-zealand", 10, 0, 0},
            {"arvid-lindblad", "Arvid Lindblad", "Racing Bulls", "37", "united-kingdom", 4, 0, 0},
            {"isack-hadjar", "Isack Hadjar", "Red Bull", "6", "france", 4, 0, 0},
            {"gabriel-bortoleto", "Gabriel Bortoleto", "Audi", "5", "brazil", 2, 0, 0},
            {"carlos-sainz-jr", "Carlos Sainz Jr.", "Williams", "55", "spain", 2, 0, 0},
            {"esteban-ocon", "Esteban Ocon", "Haas", "31", "france", 1, 0, 0},
            {"franco-colapinto", "Franco Colapinto", "Alpine", "43", "argentina", 1, 0, 0},
            {"nico-hulkenberg", "Nico HAlkenberg", "Audi", "27", "germany", 0, 0, 0},
            {"alexander-albon", "Alexander Albon", "Williams", "23", "thailand", 0, 0, 0},
            {"valtteri-bottas", "Valtteri Bottas", "Cadillac", "77", "finland", 0, 0, 0},
            {"sergio-perez", "Sergio Perez", "Cadillac", "11", "mexico", 0, 0, 0},
            {"fernando-alonso", "Fernando Alonso", "Aston Martin", "14", "spain", 0, 0, 0},
            {"lance-stroll", "Lance Stroll", "Aston Martin", "18", "canada", 0, 0, 0}
        };

        for (int i = 0; i < grid.length; i++) {
            simulated.add(new DriverStandingDTO(
                (String) grid[i][0], (String) grid[i][1], (String) grid[i][2], 
                (Integer) grid[i][5], (String) grid[i][3], (String) grid[i][4], 
                i + 1, (Integer) grid[i][6], (Integer) grid[i][7]
            ));
        }
        return simulated;
    }

    public List<ConstructorStandingDTO> simulateSeasonConstructors(int year) {
        List<ConstructorStandingDTO> simulated = new ArrayList<>();
        Object[][] teams = {
            {"mercedes", "Mercedes", "germany", 135, List.of("Russell", "Antonelli")},
            {"ferrari", "Ferrari", "italy", 90, List.of("Leclerc", "Hamilton")},
            {"mclaren", "McLaren", "united-kingdom", 46, List.of("Norris", "Piastri")},
            {"haas", "Haas", "united-states-of-america", 18, List.of("Bearman", "Ocon")},
            {"alpine", "Alpine", "france", 16, List.of("Gasly", "Colapinto")},
            {"red-bull", "Red Bull", "austria", 16, List.of("Verstappen", "Hadjar")},
            {"rb", "Racing Bulls", "italy", 14, List.of("Lawson", "Lindblad")},
            {"williams", "Williams", "united-kingdom", 2, List.of("Sainz Jr.", "Albon")},
            {"audi", "Audi", "germany", 2, List.of("Bortoleto", "Hülkenberg")},
            {"cadillac", "Cadillac", "united-states-of-america", 0, List.of("Bottas", "Perez")},
            {"aston-martin", "Aston Martin", "united-kingdom", 0, List.of("Alonso", "Stroll")}
        };

        for (int i = 0; i < teams.length; i++) {
            simulated.add(new ConstructorStandingDTO(
                (String) teams[i][0], (String) teams[i][1], (Integer) teams[i][3], 
                (String) teams[i][2], i + 1, (Integer) teams[i][3] >= 60 ? 1 : 0, (List<String>) teams[i][4]
            ));
        }
        return simulated;
    }
}