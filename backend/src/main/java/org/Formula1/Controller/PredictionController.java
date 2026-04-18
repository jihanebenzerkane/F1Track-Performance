package org.Formula1.Controller;

import org.Formula1.db.DataBaseManager;
import org.Formula1.dao.DriverDAO;
import org.Formula1.dao.RaceResultDAO;
import org.Formula1.models.Driver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.sql.*;
import java.util.*;

@RestController
@RequestMapping("/api/predictions")
public class PredictionController {

    @Autowired
    private DriverDAO driverDAO;

    @Autowired
    private RaceResultDAO resultDAO;

    
    @GetMapping("/race/{circuitId}")
    public List<Map<String, Object>> predictRaceWinner(
            @PathVariable String circuitId) {

        int latestYear = resultDAO.getLatestSeasonYear();
        List<Driver> activeDrivers = driverDAO.findBySeason(latestYear);
        List<Map<String, Object>> predictions = new ArrayList<>();

        for (Driver driver : activeDrivers) {
            String driverId = driver.getId();

           
            double circuitWinRate = getCircuitWinRate(driverId, circuitId);

            
            double recentFormScore = getRecentFormScore(driverId);

            // Final score
            double predictionScore = (circuitWinRate * 0.6) + (recentFormScore * 0.4);

            if (predictionScore > 0) {
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("driver", driverId);
                entry.put("team", driver.getTeam());
                entry.put("circuitWinRate", Math.round(circuitWinRate * 1000.0) / 10.0 + "%");
                entry.put("recentFormScore", Math.round(recentFormScore * 100.0) / 100.0);
                entry.put("rawScore", predictionScore);
                predictions.add(entry);
            }
        }

        
        double totalRawScore = predictions.stream()
                .mapToDouble(p -> (double) p.get("rawScore"))
                .sum();

        for (Map<String, Object> p : predictions) {
            double raw = (double) p.get("rawScore");
            double normalized = totalRawScore > 0 ? (raw / totalRawScore) * 100.0 : (100.0 / predictions.size());
            p.put("predictionScore", Math.round(normalized * 10.0) / 10.0);
            p.remove("rawScore");
        }

       
        predictions.sort((a, b) -> Double.compare(
                (double) b.get("predictionScore"),
                (double) a.get("predictionScore")
        ));

        // add rank
        for (int i = 0; i < predictions.size(); i++) {
            predictions.get(i).put("rank", "#" + (i + 1));
        }

        return predictions;
    }

    
    @GetMapping("/form/{driverId}")
    public Map<String, Object> getDriverForm(@PathVariable String driverId) {
        Map<String, Object> response = new LinkedHashMap<>();
        List<Map<String, Object>> lastRaces = new ArrayList<>();

        String query =
                "SELECT gp.name as grand_prix, r.year, r.date, " +
                        "rd.position_number as finish, " +
                        "rd.race_points as points, " +
                        "rd.race_fastest_lap as fastest_lap " +
                        "FROM race_data rd " +
                        "JOIN race r ON rd.race_id = r.id " +
                        "JOIN grand_prix gp ON r.grand_prix_id = gp.id " +
                        "WHERE rd.driver_id = ? AND rd.type = 'RACE_RESULT' " +
                        "ORDER BY r.date DESC LIMIT 5";

        double weightedScore = 0;
        double[] weights = {0.35, 0.25, 0.20, 0.12, 0.08};
        int i = 0;

        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(query)) {
            ps.setString(1, driverId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    int finish = rs.getInt("finish");
                    double points = rs.getDouble("points");

                    
                    double posScore = finish > 0 ? Math.max(0, (21 - finish) / 20.0) : 0;
                    if (i < weights.length) {
                        weightedScore += posScore * weights[i];
                    }

                    Map<String, Object> race = new LinkedHashMap<>();
                    race.put("race", rs.getString("grand_prix"));
                    race.put("year", rs.getInt("year"));
                    race.put("finish", finish > 0 ? "P" + finish : "DNF");
                    race.put("points", points);
                    race.put("fastestLap", rs.getBoolean("fastest_lap"));
                    race.put("positionScore", Math.round(posScore * 100.0) / 100.0);
                    lastRaces.add(race);
                    i++;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        response.put("driver", driverId);
        response.put("formScore", Math.round(weightedScore * 100.0) / 100.0);
        response.put("formRating", getFormRating(weightedScore));
        response.put("last5Races", lastRaces);
        return response;
    }

    
    @GetMapping("/pitstop/{driverId}/{circuitId}")
    public Map<String, Object> predictOptimalPitStop(
            @PathVariable String driverId,
            @PathVariable String circuitId) {

        Map<String, Object> response = new LinkedHashMap<>();
        List<Map<String, Object>> historicalStops = new ArrayList<>();

        String query =
                "SELECT r.year, rd.race_pit_stops, rd.position_number AS finish_position " +
                        "FROM race_data rd " +
                        "JOIN race r ON rd.race_id = r.id " +
                        "JOIN circuit c ON r.circuit_id = c.id " +
                        "WHERE rd.driver_id = ? AND c.id = ? AND rd.type = 'RACE_RESULT' " +
                        "ORDER BY r.year DESC, r.round DESC";

        List<Integer> pitCounts = new ArrayList<>();

        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(query)) {
            ps.setString(1, driverId);
            ps.setString(2, circuitId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    int pits = rs.getInt("race_pit_stops");
                    if (!rs.wasNull() && pits >= 0) {
                        pitCounts.add(pits);
                    }
                    Map<String, Object> stop = new LinkedHashMap<>();
                    stop.put("year", rs.getInt("year"));
                    stop.put("stopNumber", Math.max(pits, 0));
                    stop.put("lap", null);
                    stop.put("duration", null);
                    stop.put("finishPosition", rs.getInt("finish_position"));
                    stop.put("racePitStops", pits);
                    historicalStops.add(stop);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        List<Map<String, Object>> recommendations = new ArrayList<>();
        if (!pitCounts.isEmpty()) {
            double avg = pitCounts.stream().mapToInt(i -> i).average().orElse(0);
            Map<String, Object> rec = new LinkedHashMap<>();
            rec.put("stopNumber", 1);
            rec.put("recommendedLap", 0);
            rec.put("basedOnRaces", pitCounts.size());
            rec.put("summary", "Average pit stops per race at this circuit: " + String.format("%.1f", avg));
            recommendations.add(rec);
        }

        response.put("driver", driverId);
        response.put("circuit", circuitId);
        response.put("strategy", recommendations.isEmpty() ?
                "No historical data for this driver at this circuit" :
                recommendations);
        response.put("historicalStops", historicalStops);
        return response;
    }

    

    private double getCircuitWinRate(String driverId, String circuitId) {
        String query =
                "SELECT " +
                        "COUNT(*) as total_races, " +
                        "SUM(CASE WHEN rd.position_number = 1 THEN 1 ELSE 0 END) as wins " +
                        "FROM race_data rd " +
                        "JOIN race r ON rd.race_id = r.id " +
                        "JOIN circuit c ON r.circuit_id = c.id " +
                        "WHERE rd.driver_id = ? AND c.id = ? " +
                        "AND rd.type = 'RACE_RESULT'";

        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(query)) {
            ps.setString(1, driverId);
            ps.setString(2, circuitId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    int total = rs.getInt("total_races");
                    int wins = rs.getInt("wins");
                    return total > 0 ? (double) wins / total : 0;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0;
    }

    private double getRecentFormScore(String driverId) {
        String query =
                "SELECT rd.position_number as finish " +
                        "FROM race_data rd " +
                        "JOIN race r ON rd.race_id = r.id " +
                        "WHERE rd.driver_id = ? AND rd.type = 'RACE_RESULT' " +
                        "ORDER BY r.date DESC LIMIT 5";

        double[] weights = {0.35, 0.25, 0.20, 0.12, 0.08};
        double score = 0;
        int i = 0;

        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(query)) {
            ps.setString(1, driverId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next() && i < weights.length) {
                    int finish = rs.getInt("finish");
                    double posScore = finish > 0 ? Math.max(0, (21 - finish) / 20.0) : 0;
                    score += posScore * weights[i];
                    i++;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return score;
    }

    private String getFormRating(double score) {
        if (score >= 0.7) return "EXCELLENT";
        if (score >= 0.5) return "GOOD";
        if (score >= 0.3) return "AVERAGE";
        return "POOR";
    }
}