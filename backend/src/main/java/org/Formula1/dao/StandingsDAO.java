package org.Formula1.dao;

import org.Formula1.db.DataBaseManager;
import org.Formula1.dto.ConstructorStandingDTO;
import org.Formula1.dto.DriverStandingDTO;
import org.Formula1.dto.LeaderDTO;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for F1 Standings using the Ergast Schema.
 */
@Repository
public class StandingsDAO {

    public List<DriverStandingDTO> getDriverStandingsByYear(int year) {
        List<DriverStandingDTO> list = new ArrayList<>();
        String query = 
            "SELECT d.id as driverId, d.first_name, d.last_name, ds.points, d.permanent_number as number, d.nationality_country_id as nationality, ds.position_number as position, " +
            "(SELECT c.name FROM race_data rd2 JOIN constructor c ON rd2.constructor_id = c.id WHERE rd2.driver_id = d.id AND rd2.type = 'RACE_RESULT' AND rd2.race_id IN (SELECT id FROM race WHERE year = ?) ORDER BY rd2.race_id DESC LIMIT 1) as team, " +
            "(SELECT COUNT(*) FROM race_data rd JOIN race r3 ON rd.race_id = r3.id WHERE rd.driver_id = d.id AND rd.position_number = 1 AND rd.type = 'RACE_RESULT' AND r3.year = ?) as wins " +
            "FROM race_driver_standing ds " +
            "JOIN driver d ON ds.driver_id = d.id " +
            "JOIN race r ON ds.race_id = r.id " +
            "WHERE r.year = ? AND r.round = (SELECT MAX(r2.round) FROM race_driver_standing ds2 JOIN race r2 ON ds2.race_id = r2.id WHERE r2.year = ?) " +
            "ORDER BY ds.position_number ASC";

        try (Connection conn = DataBaseManager.connect();
             PreparedStatement ps = conn.prepareStatement(query)) {
            ps.setInt(1, year);
            ps.setInt(2, year);
            ps.setInt(3, year);
            ps.setInt(4, year);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(new DriverStandingDTO(
                        rs.getString("driverId"),
                        rs.getString("first_name") + " " + rs.getString("last_name"),
                        rs.getString("team"),
                        rs.getInt("points"),
                        rs.getString("number"),
                        rs.getString("nationality"),
                        rs.getInt("position"),
                        rs.getInt("wins")
                    ));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public List<ConstructorStandingDTO> getConstructorStandingsByYear(int year) {
        List<ConstructorStandingDTO> list = new ArrayList<>();
        String query = 
            "SELECT c.id as constructorId, c.name, cs.points, c.country_id as nationality, cs.position_number as position, " +
            "(SELECT COUNT(*) FROM race_data rd JOIN race r3 ON rd.race_id = r3.id WHERE rd.constructor_id = c.id AND rd.position_number = 1 AND rd.type = 'RACE_RESULT' AND r3.year = ?) as wins " +
            "FROM race_constructor_standing cs " +
            "JOIN constructor c ON cs.constructor_id = c.id " +
            "JOIN race r ON cs.race_id = r.id " +
            "WHERE r.year = ? AND r.round = (SELECT MAX(r2.round) FROM race_constructor_standing cs2 JOIN race r2 ON cs2.race_id = r2.id WHERE r2.year = ?) " +
            "ORDER BY cs.position_number ASC";

        try (Connection conn = DataBaseManager.connect();
             PreparedStatement ps = conn.prepareStatement(query)) {
            ps.setInt(1, year);
            ps.setInt(2, year);
            ps.setInt(3, year);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    String constructorId = rs.getString("constructorId");
                    List<String> drivers = getDriversForConstructorInYear(constructorId, year, conn);
                    list.add(new ConstructorStandingDTO(
                        constructorId,
                        rs.getString("name"),
                        rs.getDouble("points"),
                        rs.getString("nationality"),
                        rs.getInt("position"),
                        rs.getInt("wins"),
                        drivers
                    ));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    private List<String> getDriversForConstructorInYear(String constructorId, int year, Connection conn) throws SQLException {
        List<String> drivers = new ArrayList<>();
        String query = "SELECT DISTINCT d.last_name as surname FROM race_data res " +
                       "JOIN race r ON res.race_id = r.id " +
                       "JOIN driver d ON res.driver_id = d.id " +
                       "WHERE res.constructor_id = ? AND r.year = ? AND res.type = 'RACE_RESULT' LIMIT 2";
        try (PreparedStatement ps = conn.prepareStatement(query)) {
            ps.setString(1, constructorId);
            ps.setInt(2, year);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) drivers.add(rs.getString("surname"));
            }
        }
        return drivers;
    }

    public LeaderDTO getLeaderInfo(int year) {
        LeaderDTO leader = new LeaderDTO();
        try (Connection conn = DataBaseManager.connect()) {
            // World Champion
            String champQuery = "SELECT d.first_name || ' ' || d.last_name as name " +
                                "FROM race_driver_standing ds JOIN driver d ON ds.driver_id = d.id " +
                                "JOIN race r ON ds.race_id = r.id " +
                                "WHERE r.year = ? AND r.round = (SELECT MAX(r2.round) FROM race_driver_standing ds2 JOIN race r2 ON ds2.race_id = r2.id WHERE r2.year = ?) " +
                                "AND ds.position_number = 1 LIMIT 1";
            try (PreparedStatement ps = conn.prepareStatement(champQuery)) {
                ps.setInt(1, year);
                ps.setInt(2, year);
                ResultSet rs = ps.executeQuery();
                if (rs.next()) leader.setWorldChampion(rs.getString("name"));
            }

            // Total Races
            String racesQuery = "SELECT COUNT(*) FROM race WHERE year = ?";
            try (PreparedStatement ps = conn.prepareStatement(racesQuery)) {
                ps.setInt(1, year);
                ResultSet rs = ps.executeQuery();
                if (rs.next()) leader.setTotalRaces(rs.getInt(1));
            }

            // Most Wins
            String winsQuery = "SELECT d.first_name || ' ' || d.last_name as name " +
                               "FROM race_data res JOIN driver d ON res.driver_id = d.id " +
                               "JOIN race r ON res.race_id = r.id " +
                               "WHERE r.year = ? AND res.position_number = 1 AND res.type = 'RACE_RESULT' " +
                               "GROUP BY d.id " +
                               "ORDER BY COUNT(*) DESC LIMIT 1";
            try (PreparedStatement ps = conn.prepareStatement(winsQuery)) {
                ps.setInt(1, year);
                ResultSet rs = ps.executeQuery();
                if (rs.next()) leader.setMostWinsDriver(rs.getString("name"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return leader;
    }
}
