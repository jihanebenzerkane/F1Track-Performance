package org.Formula1.Controller;

import org.Formula1.dto.ConstructorStandingDTO;
import org.Formula1.dto.DriverStandingDTO;
import org.Formula1.dto.LeaderDTO;
import org.Formula1.service.StandingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for F1 Standings and Season KPI information.
 */
@RestController
@RequestMapping("/api")
public class StandingsController {

    @Autowired
    private StandingService standingService;

    /**
     * GET /api/standings/2023
     * Returns driver standings for a specific year.
     */
    @GetMapping("/standings/{year}")
    public List<DriverStandingDTO> getDriverStandings(
            @PathVariable int year,
            @RequestParam(required = false, defaultValue = "real") String mode) {
        return standingService.getDriverStandings(year, mode);
    }

    /**
     * GET /api/standings/2023/constructors
     * Returns constructor standings for a specific year.
     */
    @GetMapping("/standings/{year}/constructors")
    public List<ConstructorStandingDTO> getConstructorStandings(
            @PathVariable int year,
            @RequestParam(required = false, defaultValue = "real") String mode) {
        return standingService.getConstructorStandings(year, mode);
    }

    /**
     * GET /api/leader/2023
     * Returns summary KPI info (Champion, total races, etc.).
     */
    @GetMapping("/leader/{year}")
    public LeaderDTO getLeaderInfo(@PathVariable int year) {
        return standingService.getLeaderInfo(year);
    }

    /**
     * DEBUG: List all tables in the connected database.
     */
    @GetMapping("/debug/tables")
    public java.util.Map<String, Object> debugTables() {
        java.util.Map<String, Object> result = new java.util.LinkedHashMap<>();
        try (java.sql.Connection c = org.Formula1.db.DataBaseManager.connect();
                java.sql.Statement s = c.createStatement()) {
            // List all tables
            java.sql.ResultSet rs = s.executeQuery("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
            java.util.List<String> tables = new java.util.ArrayList<>();
            while (rs.next())
                tables.add(rs.getString(1));
            result.put("tables", tables);
            result.put("tableCount", tables.size());
            result.put("dbPath", c.getMetaData().getURL());

            // For each table, get row count
            java.util.Map<String, Integer> counts = new java.util.LinkedHashMap<>();
            for (String t : tables) {
                try {
                    java.sql.ResultSet rc = s.executeQuery("SELECT COUNT(*) FROM \"" + t + "\"");
                    if (rc.next())
                        counts.put(t, rc.getInt(1));
                } catch (Exception e) {
                    counts.put(t, -1);
                }
            }
            result.put("rowCounts", counts);
        } catch (Exception e) {
            result.put("error", e.getMessage());
        }
        return result;
    }

    /**
     * DEBUG: Show columns for key tables.
     */
    @GetMapping("/debug/columns")
    public java.util.Map<String, Object> debugColumns() {
        java.util.Map<String, Object> result = new java.util.LinkedHashMap<>();
        String[] tables = { "driver", "constructor", "race", "race_data", "race_driver_standing",
                "season_driver_standing", "season", "grand_prix" };
        try (java.sql.Connection c = org.Formula1.db.DataBaseManager.connect();
                java.sql.Statement s = c.createStatement()) {
            for (String t : tables) {
                try {
                    java.sql.ResultSet rs = s.executeQuery("PRAGMA table_info(\"" + t + "\")");
                    java.util.List<String> cols = new java.util.ArrayList<>();
                    while (rs.next())
                        cols.add(rs.getString("name") + " (" + rs.getString("type") + ")");
                    result.put(t, cols);
                } catch (Exception e) {
                    result.put(t, "ERROR: " + e.getMessage());
                }
            }
            // Also get a sample row from race_driver_standing
            try {
                java.sql.ResultSet rs = s.executeQuery("SELECT * FROM race_driver_standing LIMIT 2");
                java.sql.ResultSetMetaData md = rs.getMetaData();
                java.util.List<java.util.Map<String, Object>> rows = new java.util.ArrayList<>();
                while (rs.next()) {
                    java.util.Map<String, Object> row = new java.util.LinkedHashMap<>();
                    for (int i = 1; i <= md.getColumnCount(); i++) {
                        row.put(md.getColumnName(i), rs.getObject(i));
                    }
                    rows.add(row);
                }
                result.put("race_driver_standing_sample", rows);
            } catch (Exception e) {
                result.put("sample_error", e.getMessage());
            }
            // Sample from driver
            try {
                java.sql.ResultSet rs = s.executeQuery("SELECT * FROM driver LIMIT 2");
                java.sql.ResultSetMetaData md = rs.getMetaData();
                java.util.List<java.util.Map<String, Object>> rows = new java.util.ArrayList<>();
                while (rs.next()) {
                    java.util.Map<String, Object> row = new java.util.LinkedHashMap<>();
                    for (int i = 1; i <= md.getColumnCount(); i++) {
                        row.put(md.getColumnName(i), rs.getObject(i));
                    }
                    rows.add(row);
                }
                result.put("driver_sample", rows);
            } catch (Exception e) {
                result.put("driver_sample_error", e.getMessage());
            }
        } catch (Exception e) {
            result.put("error", e.getMessage());
        }
        return result;
    }
}