package org.Formula1.Controller;

import org.Formula1.db.DataBaseManager;
import org.springframework.web.bind.annotation.*;
import java.sql.*;
import java.util.*;

@RestController
@RequestMapping("/api/analysis")
public class AnalysisController {

    @GetMapping("/driver/{driverId}/{year}")
    public List<Map<String, Object>> getDriverPerformance(
            @PathVariable String driverId,
            @PathVariable int year) {

        List<Map<String, Object>> results = new ArrayList<>();
        String query =
                "SELECT r.id as race_id, gp.name as grand_prix, r.date, " +
                        "rd.race_grid_position_number as grid, " +
                        "rd.position_number as finish, " +
                        "rd.race_positions_gained as positions_gained, " +
                        "rd.race_points as points, " +
                        "rd.race_pit_stops as pit_stops, " +
                        "rd.race_fastest_lap as fastest_lap, " +
                        "rd.race_time as race_time, " +
                        "rd.race_gap as gap_to_leader, " +
                        "rd.race_reason_retired as dnf_reason " +
                        "FROM race_data rd " +
                        "JOIN race r ON rd.race_id = r.id " +
                        "JOIN grand_prix gp ON r.grand_prix_id = gp.id " +
                        "WHERE rd.driver_id = ? AND r.year = ? " +
                        "AND rd.type = 'RACE_RESULT' " +
                        "ORDER BY r.date ASC";

        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(query)) {
            ps.setString(1, driverId);
            ps.setInt(2, year);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> entry = new LinkedHashMap<>();
                    entry.put("race", rs.getString("grand_prix"));
                    entry.put("date", rs.getString("date"));
                    entry.put("gridPosition", rs.getInt("grid"));
                    entry.put("finishPosition", rs.getInt("finish"));
                    entry.put("positionsGained", rs.getInt("positions_gained"));
                    entry.put("points", rs.getDouble("points"));
                    entry.put("pitStops", rs.getInt("pit_stops"));
                    entry.put("fastestLap", rs.getBoolean("fastest_lap"));
                    entry.put("raceTime", rs.getString("race_time"));
                    entry.put("gapToLeader", rs.getString("gap_to_leader"));
                    entry.put("dnfReason", rs.getString("dnf_reason"));
                    results.add(entry);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return results;
    }

    @GetMapping("/race/{raceId}/pitstops")
    public List<Map<String, Object>> getRacePitStops(@PathVariable int raceId) {
        List<Map<String, Object>> results = new ArrayList<>();
        String query =
                "SELECT ps.driver_id, ps.stop, ps.lap, " +
                        "ps.time as duration, ps.tyre_manufacturer_id as tyre " +
                        "FROM pit_stop ps " +
                        "WHERE ps.race_id = ? " +
                        "ORDER BY ps.lap ASC, ps.stop ASC";

        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(query)) {
            ps.setInt(1, raceId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> entry = new LinkedHashMap<>();
                    entry.put("driver", rs.getString("driver_id"));
                    entry.put("stopNumber", rs.getInt("stop"));
                    entry.put("lap", rs.getInt("lap"));
                    entry.put("duration", rs.getString("duration"));
                    entry.put("tyre", rs.getString("tyre"));
                    results.add(entry);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return results;
    }

    @GetMapping("/race/{raceId}/qualifying")
    public List<Map<String, Object>> getRaceQualifying(@PathVariable int raceId) {
        List<Map<String, Object>> results = new ArrayList<>();
        String query =
                "SELECT rd.driver_id, rd.position_number as position, " +
                        "rd.qualifying_q1 as q1, rd.qualifying_q2 as q2, " +
                        "rd.qualifying_q3 as q3 " +
                        "FROM race_data rd " +
                        "WHERE rd.race_id = ? AND rd.type = 'QUALIFYING_RESULT' " +
                        "ORDER BY rd.position_display_order ASC";

        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(query)) {
            ps.setInt(1, raceId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> entry = new LinkedHashMap<>();
                    entry.put("driver", rs.getString("driver_id"));
                    entry.put("position", rs.getInt("position"));
                    entry.put("q1", rs.getString("q1"));
                    entry.put("q2", rs.getString("q2"));
                    entry.put("q3", rs.getString("q3"));
                    results.add(entry);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return results;
    }
    @GetMapping("/h2h/{driver1}/{driver2}/{year}")
    public Map<String, Object> headToHead(
            @PathVariable String driver1,
            @PathVariable String driver2,
            @PathVariable int year) {

        Map<String, Object> response = new LinkedHashMap<>();
        List<Map<String, Object>> races = new ArrayList<>();

        String query =
                "SELECT gp.name as grand_prix, r.date, " +
                        "d1.position_number as d1_finish, " +
                        "d1.race_grid_position_number as d1_grid, " +
                        "d1.race_points as d1_points, " +
                        "d1.race_fastest_lap as d1_fastest_lap, " +
                        "d1.race_reason_retired as d1_dnf, " +
                        "d2.position_number as d2_finish, " +
                        "d2.race_grid_position_number as d2_grid, " +
                        "d2.race_points as d2_points, " +
                        "d2.race_fastest_lap as d2_fastest_lap, " +
                        "d2.race_reason_retired as d2_dnf " +
                        "FROM race r " +
                        "JOIN grand_prix gp ON r.grand_prix_id = gp.id " +
                        "JOIN race_data d1 ON d1.race_id = r.id " +
                        "  AND d1.driver_id = ? AND d1.type = 'RACE_RESULT' " +
                        "JOIN race_data d2 ON d2.race_id = r.id " +
                        "  AND d2.driver_id = ? AND d2.type = 'RACE_RESULT' " +
                        "WHERE r.year = ? " +
                        "ORDER BY r.date ASC";

        int d1Wins = 0, d2Wins = 0;
        double d1TotalPoints = 0, d2TotalPoints = 0;

        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(query)) {
            ps.setString(1, driver1);
            ps.setString(2, driver2);
            ps.setInt(3, year);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> race = new LinkedHashMap<>();
                    race.put("race", rs.getString("grand_prix"));
                    race.put("date", rs.getString("date"));

                    int d1Finish = rs.getInt("d1_finish");
                    int d2Finish = rs.getInt("d2_finish");
                    double d1Pts = rs.getDouble("d1_points");
                    double d2Pts = rs.getDouble("d2_points");

                    Map<String, Object> d1Map = new LinkedHashMap<>();
                    d1Map.put("finish", d1Finish);
                    d1Map.put("grid", rs.getInt("d1_grid"));
                    d1Map.put("points", d1Pts);
                    d1Map.put("fastestLap", rs.getBoolean("d1_fastest_lap"));
                    d1Map.put("dnf", rs.getString("d1_dnf"));
                    race.put("driver1", d1Map);

                    Map<String, Object> d2Map = new LinkedHashMap<>();
                    d2Map.put("finish", d2Finish);
                    d2Map.put("grid", rs.getInt("d2_grid"));
                    d2Map.put("points", d2Pts);
                    d2Map.put("fastestLap", rs.getBoolean("d2_fastest_lap"));
                    d2Map.put("dnf", rs.getString("d2_dnf"));
                    race.put("driver2", d2Map);

                    String winner = "tied";
                    if (d1Finish > 0 && d2Finish > 0) {
                        if (d1Finish < d2Finish) { winner = driver1; d1Wins++; }
                        else if (d2Finish < d1Finish) { winner = driver2; d2Wins++; }
                    } else if (d1Finish > 0) { winner = driver1; d1Wins++; }
                    else if (d2Finish > 0) { winner = driver2; d2Wins++; }

                    race.put("betterFinish", winner);
                    d1TotalPoints += d1Pts;
                    d2TotalPoints += d2Pts;
                    races.add(race);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        response.put("driver1", driver1);
        response.put("driver2", driver2);
        response.put("season", year);
        response.put("racesCompared", races.size());
        response.put("driver1Wins", d1Wins);
        response.put("driver2Wins", d2Wins);
        response.put("driver1TotalPoints", d1TotalPoints);
        response.put("driver2TotalPoints", d2TotalPoints);
        response.put("races", races);
        return response;
    }
    @GetMapping("/circuit/{circuitId}/history")
    public Map<String, Object> getCircuitHistory(@PathVariable String circuitId) {

        Map<String, Object> response = new LinkedHashMap<>();
        List<Map<String, Object>> races = new ArrayList<>();

        String query =
                "SELECT r.year, gp.name as grand_prix, " +
                        "rd.driver_id, rd.position_number as finish, " +
                        "rd.race_time as race_time, " +
                        "rd.race_fastest_lap as fastest_lap, " +
                        "rd.race_grid_position_number as grid, " +
                        "rd.constructor_id " +
                        "FROM race_data rd " +
                        "JOIN race r ON rd.race_id = r.id " +
                        "JOIN grand_prix gp ON r.grand_prix_id = gp.id " +
                        "JOIN circuit c ON r.circuit_id = c.id " +
                        "WHERE c.id = ? " +
                        "AND rd.type = 'RACE_RESULT' " +
                        "AND rd.position_number = 1 " +
                        "ORDER BY r.year DESC";

        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(query)) {
            ps.setString(1, circuitId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> race = new LinkedHashMap<>();
                    race.put("year", rs.getInt("year"));
                    race.put("grandPrix", rs.getString("grand_prix"));
                    race.put("winner", rs.getString("driver_id"));
                    race.put("constructor", rs.getString("constructor_id"));
                    race.put("gridPosition", rs.getInt("grid"));
                    race.put("raceTime", rs.getString("race_time"));
                    race.put("fastestLap", rs.getBoolean("fastest_lap"));
                    races.add(race);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }


        Map<String, Integer> winsByDriver = new LinkedHashMap<>();
        for (Map<String, Object> race : races) {
            String winner = (String) race.get("winner");
            winsByDriver.put(winner, winsByDriver.getOrDefault(winner, 0) + 1);
        }


        List<Map.Entry<String, Integer>> sorted = new ArrayList<>(winsByDriver.entrySet());
        sorted.sort((a, b) -> b.getValue() - a.getValue());
        Map<String, Integer> topWinners = new LinkedHashMap<>();
        sorted.forEach(e -> topWinners.put(e.getKey(), e.getValue()));

        response.put("circuit", circuitId);
        response.put("totalRaces", races.size());
        response.put("winsByDriver", topWinners);
        response.put("history", races);
        return response;
    }
    @GetMapping("/constructor/{constructorId}/{year}")
    public Map<String, Object> getConstructorPerformance(
            @PathVariable String constructorId,
            @PathVariable int year) {

        Map<String, Object> response = new LinkedHashMap<>();
        List<Map<String, Object>> races = new ArrayList<>();

        String query =
                "SELECT gp.name as grand_prix, r.date, " +
                        "rd.driver_id, rd.position_number as finish, " +
                        "rd.race_grid_position_number as grid, " +
                        "rd.race_points as points, " +
                        "rd.race_fastest_lap as fastest_lap, " +
                        "rd.race_reason_retired as dnf_reason " +
                        "FROM race_data rd " +
                        "JOIN race r ON rd.race_id = r.id " +
                        "JOIN grand_prix gp ON r.grand_prix_id = gp.id " +
                        "WHERE rd.constructor_id = ? AND r.year = ? " +
                        "AND rd.type = 'RACE_RESULT' " +
                        "ORDER BY r.date ASC, rd.position_number ASC";

        int totalWins = 0;
        int totalPodiums = 0;
        double totalPoints = 0;
        int totalDnfs = 0;

        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(query)) {
            ps.setString(1, constructorId);
            ps.setInt(2, year);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    int finish = rs.getInt("finish");
                    double points = rs.getDouble("points");
                    String dnf = rs.getString("dnf_reason");

                    if (finish == 1) totalWins++;
                    if (finish >= 1 && finish <= 3) totalPodiums++;
                    totalPoints += points;
                    if (dnf != null) totalDnfs++;

                    Map<String, Object> race = new LinkedHashMap<>();
                    race.put("race", rs.getString("grand_prix"));
                    race.put("date", rs.getString("date"));
                    race.put("driver", rs.getString("driver_id"));
                    race.put("finish", finish);
                    race.put("grid", rs.getInt("grid"));
                    race.put("points", points);
                    race.put("fastestLap", rs.getBoolean("fastest_lap"));
                    race.put("dnfReason", dnf);
                    races.add(race);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        response.put("constructor", constructorId);
        response.put("season", year);
        response.put("totalWins", totalWins);
        response.put("totalPodiums", totalPodiums);
        response.put("totalPoints", totalPoints);
        response.put("totalDnfs", totalDnfs);
        response.put("races", races);
        return response;
    }
}