package org.Formula1.service;

import org.Formula1.db.DataBaseManager;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class LocalTelemetryService {

    public Map<String, Object> pitStrategy(String circuitId, String driverId) {
        Map<String, Object> response = new LinkedHashMap<>();
        List<Map<String, Object>> historical = new ArrayList<>();
        List<Integer> pitCounts = new ArrayList<>();

        String sql = """
                SELECT r.year, rd.race_pit_stops, rd.position_number AS finish_position
                FROM race_data rd
                JOIN race r ON rd.race_id = r.id
                JOIN circuit c ON r.circuit_id = c.id
                WHERE rd.driver_id = ? AND c.id = ? AND rd.type = 'RACE_RESULT'
                ORDER BY r.year DESC, r.round DESC
                """;

        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, driverId);
            ps.setString(2, circuitId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    int pits = rs.getInt("race_pit_stops");
                    boolean pitsKnown = !rs.wasNull() && pits >= 0;
                    if (pitsKnown) {
                        pitCounts.add(pits);
                    }
                    int finish = rs.getInt("finish_position");
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("year", rs.getInt("year"));
                    row.put("lap", null);
                    row.put("finishPosition", finish);
                    row.put("racePitStops", pitsKnown ? pits : null);
                    historical.add(row);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            response.put("driver", driverId);
            response.put("circuit", circuitId);
            response.put("strategy", "Database error loading pit data.");
            response.put("historicalStops", List.of());
            response.put("stats", Map.of());
            response.put("source", "database");
            return response;
        }

        List<Map<String, Object>> strategy = new ArrayList<>();
        Map<String, Object> stats = buildPitStats(historical, pitCounts);
        
        @SuppressWarnings("unchecked")
        Map<Integer, Double> finishesByStops = (Map<Integer, Double>) stats.get("avgFinishByPits");
        
        if (finishesByStops != null && !finishesByStops.isEmpty()) {
            finishesByStops.entrySet().stream()
                .sorted(Map.Entry.comparingByValue())
                .forEach(entry -> {
                    int stops = entry.getKey();
                    double avgFinish = entry.getValue();
                    long basedOn = pitCounts.stream().filter(p -> p == stops).count();
                    
                    Map<String, Object> rec = new LinkedHashMap<>();
                    rec.put("stopNumber", stops);
                    rec.put("recommendedLap", 0); // Lap data unavailable in local DB
                    rec.put("basedOnRaces", basedOn);
                    String trend = avgFinish < (double) stats.getOrDefault("avgFinish", 20.0) ? "above average" : "below average";
                    rec.put("summary", String.format("A %d-stop strategy resulted in an average finish of P%.1f, which is %s for this circuit.", stops, avgFinish, trend));
                    strategy.add(rec);
                });
        } else if (!pitCounts.isEmpty()) {
            double avg = pitCounts.stream().mapToInt(i -> i).average().orElse(0);
            Map<String, Object> rec = new LinkedHashMap<>();
            rec.put("stopNumber", (int) Math.round(avg));
            rec.put("recommendedLap", 0);
            rec.put("basedOnRaces", pitCounts.size());
            rec.put("summary", "Historical average for this driver-circuit combination: " + String.format(java.util.Locale.US, "%.1f", avg) + " stops.");
            strategy.add(rec);
        }

        response.put("driver", driverId);
        response.put("circuit", circuitId);
        response.put("strategy", strategy.isEmpty() ? "Insufficient historical data to determine an optimal strategy." : strategy);
        response.put("historicalStops", historical);
        response.put("stats", stats);
        response.put("source", "database");
        return response;
    }

    public List<Map<String, Object>> sessionsForYear(int year) {
        List<Map<String, Object>> out = new ArrayList<>();
        String sql = """
                SELECT r.id AS race_id, r.year, r.round, gp.name AS grand_prix, c.name AS circuit_name, c.id AS circuit_id
                FROM race r
                JOIN grand_prix gp ON r.grand_prix_id = gp.id
                JOIN circuit c ON r.circuit_id = c.id
                WHERE r.year = ?
                ORDER BY r.round ASC
                """;
        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, year);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> row = new LinkedHashMap<>();
                    int raceId = rs.getInt("race_id");
                    row.put("session_key", raceId);
                    row.put("year", rs.getInt("year"));
                    row.put("round", rs.getInt("round"));
                    row.put("location", rs.getString("circuit_name"));
                    row.put("country_name", rs.getString("circuit_name"));
                    row.put("circuit_id", rs.getString("circuit_id"));
                    row.put("session_name", "Race — " + rs.getString("grand_prix"));
                    row.put("meeting_key", raceId);
                    out.add(row);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return out;
    }

    public List<Map<String, Object>> seasonLapsForDriver(int year, String driverId) {
        List<Map<String, Object>> out = new ArrayList<>();
        String sql = """
                SELECT r.id AS race_id, r.round, rd.race_time, rd.position_number, rd.race_grid_position_number
                FROM race_data rd
                JOIN race r ON rd.race_id = r.id
                WHERE r.year = ? AND rd.driver_id = ? AND rd.type = 'RACE_RESULT'
                ORDER BY r.round ASC
                """;
        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, year);
            ps.setString(2, driverId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    int round = rs.getInt("round");
                    String raceTime = rs.getString("race_time");
                    Double duration = parseRaceTimeSeconds(raceTime);
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("race_id", rs.getInt("race_id"));
                    row.put("lap_number", round);
                    row.put("lap_duration", duration);
                    row.put("lap_duration_raw", raceTime);
                    row.put("position", rs.getInt("position_number"));
                    row.put("grid", rs.getInt("race_grid_position_number"));
                    out.add(row);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return out;
    }

    public List<Map<String, Object>> raceSummaryForDriver(int raceId, String driverId) {
        List<Map<String, Object>> out = new ArrayList<>();
        String sql = """
                SELECT rd.race_pit_stops, rd.position_number, rd.race_grid_position_number,
                       rd.race_time, rd.race_points, rd.race_fastest_lap
                FROM race_data rd
                WHERE rd.race_id = ? AND rd.driver_id = ? AND rd.type = 'RACE_RESULT'
                """;
        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, raceId);
            ps.setString(2, driverId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("pit_stops", rs.getInt("race_pit_stops"));
                    row.put("finish", rs.getInt("position_number"));
                    row.put("grid", rs.getInt("race_grid_position_number"));
                    row.put("race_time", rs.getString("race_time"));
                    row.put("points", rs.getDouble("race_points"));
                    row.put("fastest_lap", rs.getBoolean("race_fastest_lap"));
                    out.add(row);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return out;
    }

    private static Map<String, Object> buildPitStats(List<Map<String, Object>> historical, List<Integer> pitCounts) {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("racesListed", historical.size());
        stats.put("racesWithPitData", pitCounts.size());
        if (!pitCounts.isEmpty()) {
            Collections.sort(pitCounts);
            int sum = pitCounts.stream().mapToInt(i -> i).sum();
            double overallAvg = sum / (double) pitCounts.size();
            stats.put("avgPitStops", Math.round(overallAvg * 10) / 10.0);
            stats.put("minPitStops", pitCounts.get(0));
            stats.put("maxPitStops", pitCounts.get(pitCounts.size() - 1));
            stats.put("medianPitStops", medianInt(pitCounts));
            Map<Integer, Long> dist = pitCounts.stream()
                    .collect(Collectors.groupingBy(i -> i, LinkedHashMap::new, Collectors.counting()));
            stats.put("pitStopDistribution", dist.entrySet().stream()
                    .sorted(Map.Entry.comparingByKey())
                    .map(e -> {
                        Map<String, Object> m = new LinkedHashMap<>();
                        m.put("stops", e.getKey());
                        m.put("races", e.getValue().intValue());
                        return m;
                    })
                    .toList());
            
            Map<Integer, List<Integer>> finishPositionsByPitCount = new LinkedHashMap<>();
            for (Map<String, Object> row : historical) {
                Integer pits = (Integer) row.get("racePitStops");
                Integer finish = (Integer) row.get("finishPosition");
                if (pits != null && finish != null && finish > 0) {
                    finishPositionsByPitCount.computeIfAbsent(pits, k -> new ArrayList<>()).add(finish);
                }
            }
            Map<Integer, Double> avgFinishByPits = new LinkedHashMap<>();
            finishPositionsByPitCount.forEach((pits, finishes) -> {
                double avg = finishes.stream().mapToInt(i -> i).average().orElse(0);
                avgFinishByPits.put(pits, Math.round(avg * 10) / 10.0);
            });
            stats.put("avgFinishByPits", avgFinishByPits);
        }
        List<Integer> finishes = new ArrayList<>();
        for (Map<String, Object> row : historical) {
            Object fp = row.get("finishPosition");
            if (fp instanceof Number n && n.intValue() > 0) {
                finishes.add(n.intValue());
            }
        }
        if (!finishes.isEmpty()) {
            stats.put("avgFinish", Math.round(finishes.stream().mapToInt(i -> i).average().orElse(0) * 10) / 10.0);
            stats.put("bestFinish", Collections.min(finishes));
            stats.put("worstFinish", Collections.max(finishes));
            long podiums = finishes.stream().filter(p -> p <= 3).count();
            stats.put("podiums", (int) podiums);
            stats.put("wins", (int) finishes.stream().filter(p -> p == 1).count());
        }
        if (!historical.isEmpty()) {
            int yMin = historical.stream().mapToInt(r -> ((Number) r.get("year")).intValue()).min().orElse(0);
            int yMax = historical.stream().mapToInt(r -> ((Number) r.get("year")).intValue()).max().orElse(0);
            stats.put("yearFrom", yMin);
            stats.put("yearTo", yMax);
        }
        return stats;
    }

    private static double medianInt(List<Integer> sortedCopy) {
        List<Integer> s = new ArrayList<>(sortedCopy);
        Collections.sort(s);
        int n = s.size();
        if (n == 0) {
            return 0;
        }
        if (n % 2 == 1) {
            return s.get(n / 2);
        }
        return (s.get(n / 2 - 1) + s.get(n / 2)) / 2.0;
    }

    static Double parseRaceTimeSeconds(String raceTime) {
        if (raceTime == null || raceTime.isBlank()) {
            return null;
        }
        String s = raceTime.trim();
        try {
            String[] parts = s.split(":");
            if (parts.length == 3) {
                double h = Double.parseDouble(parts[0]);
                double m = Double.parseDouble(parts[1]);
                double sec = Double.parseDouble(parts[2]);
                return h * 3600 + m * 60 + sec;
            }
            if (parts.length == 2) {
                double m = Double.parseDouble(parts[0]);
                double sec = Double.parseDouble(parts[1]);
                return m * 60 + sec;
            }
            return Double.parseDouble(s);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
