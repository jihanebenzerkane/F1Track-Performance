package org.Formula1.controller;

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

    // GET /api/predictions/race/monaco
    @GetMapping("/race/{circuitId}")
    public List<Map<String, Object>> predictRaceWinner(
            @PathVariable String circuitId) {

        int latestYear = resultDAO.getLatestSeasonYear();
        List<Driver> activeDrivers = driverDAO.findBySeason(latestYear);
        List<Map<String, Object>> predictions = new ArrayList<>();

        for (Driver driver : activeDrivers) {
            String driverId = driver.getId();

            // Component 1 — circuit win rate
            double circuitWinRate = getCircuitWinRate(driverId, circuitId);

            // Component 2 — recent form (last 5 races)
            double recentFormScore = getRecentFormScore(driverId);

            // Final score
            double predictionScore = (circuitWinRate * 0.6) + (recentFormScore * 0.4);

            if (predictionScore > 0) {
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("driver", driverId);
                entry.put("team", driver.getTeam());
                entry.put("circuitWinRate", Math.round(circuitWinRate * 1000.0) / 10.0 + "%");
                entry.put("recentFormScore", Math.round(recentFormScore * 100.0) / 100.0);
                entry.put("predictionScore", Math.round(predictionScore * 1000.0) / 10.0);
                predictions.add(entry);
            }
        }

        // sort by prediction score descending
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

    // GET /api/predictions/form/max-verstappen
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

                    // normalize finish position to 0-1 score
                    // P1 = 1.0, P20 = 0.05, DNF (0) = 0
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

    // GET /api/predictions/pitstop/max-verstappen/monaco
    @GetMapping("/pitstop/{driverId}/{circuitId}")
    public Map<String, Object> predictOptimalPitStop(
            @PathVariable String driverId,
            @PathVariable String circuitId) {

        Map<String, Object> response = new LinkedHashMap<>();
        List<Map<String, Object>> historicalStops = new ArrayList<>();

        String query =
                "SELECT r.year, ps.lap, ps.stop, ps.time as duration, " +
                        "rd.position_number as finish_position " +
                        "FROM pit_stop ps " +
                        "JOIN race r ON ps.race_id = r.id " +
                        "JOIN circuit c ON r.circuit_id = c.id " +
                        "JOIN race_data rd ON rd.race_id = r.id " +
                        "  AND rd.driver_id = ps.driver_id " +
                        "  AND rd.type = 'RACE_RESULT' " +
                        "WHERE ps.driver_id = ? AND c.id = ? " +
                        "ORDER BY r.year DESC, ps.stop ASC";

        Map<Integer, List<Integer>> stopLaps = new HashMap<>();

        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(query)) {
            ps.setString(1, driverId);
            ps.setString(2, circuitId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    int stopNum = rs.getInt("stop");
                    int lap = rs.getInt("lap");

                    stopLaps.computeIfAbsent(stopNum, k -> new ArrayList<>()).add(lap);

                    Map<String, Object> stop = new LinkedHashMap<>();
                    stop.put("year", rs.getInt("year"));
                    stop.put("stopNumber", stopNum);
                    stop.put("lap", lap);
                    stop.put("duration", rs.getString("duration"));
                    stop.put("finishPosition", rs.getInt("finish_position"));
                    historicalStops.add(stop);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        // calculate average optimal lap per stop number
        List<Map<String, Object>> recommendations = new ArrayList<>();
        stopLaps.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .forEach(entry -> {
                    int stopNum = entry.getKey();
                    List<Integer> laps = entry.getValue();
                    double avgLap = laps.stream()
                            .mapToInt(Integer::intValue)
                            .average()
                            .orElse(0);
                    Map<String, Object> rec = new LinkedHashMap<>();
                    rec.put("stopNumber", stopNum);
                    rec.put("recommendedLap", (int) Math.round(avgLap));
                    rec.put("basedOnRaces", laps.size());
                    recommendations.add(rec);
                });

        response.put("driver", driverId);
        response.put("circuit", circuitId);
        response.put("strategy", recommendations.isEmpty() ?
                "No historical data for this driver at this circuit" :
                recommendations);
        response.put("historicalStops", historicalStops);
        return response;
    }

    // ── private helpers ──────────────────────────────────────────────

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