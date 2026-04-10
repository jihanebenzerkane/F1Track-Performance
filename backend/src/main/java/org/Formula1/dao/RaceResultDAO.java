package org.Formula1.dao;

import org.Formula1.db.DataBaseManager;
import org.Formula1.models.RaceResult;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public class RaceResultDAO {
    public int getLatestSeasonYear() {
        String query = "SELECT MAX(year) FROM race";
        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(query);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                int year = rs.getInt(1);
                return year > 0 ? year : 2024;
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return 2024;
    }

    public int getTotalPointsByDriver(String driverId, int year) {
        String query =
                "SELECT ds.points " +
                        "FROM race_driver_standing ds " +
                        "JOIN race r ON ds.race_id = r.id " + 
                        "WHERE ds.driver_id = ? AND r.year = ? " +
                        "ORDER BY r.date DESC LIMIT 1";
        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(query)) {
            ps.setString(1, driverId);
            ps.setInt(2, year);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getInt("points");
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return 0;
    }
    
    public List<RaceResult> findByDriverAndSeason(String driverId, int year) {
        List<RaceResult> resultsList = new ArrayList<>();
        String query = "SELECT res.race_id as raceId, res.driver_id as driverId, " +
                "res.position_number as position, res.race_points as points " +
                "FROM race_data res " +
                "JOIN race r ON res.race_id = r.id " + 
                "WHERE res.driver_id = (SELECT d.id FROM driver d WHERE d.id = ? OR d.abbreviation = ?) " +
                "AND r.year = ? AND res.type = 'RACE_RESULT'" +
                "ORDER BY r.date ASC";
        try (Connection c = DataBaseManager.connect();
                 PreparedStatement ps = c.prepareStatement(query)) {
            ps.setString(1, driverId);
            ps.setString(2, driverId);
            ps.setInt(3, year);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    resultsList.add(map(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return resultsList;
    }

    public List<RaceResult> findByDriverId(String driverId) {
        List<RaceResult> resultsList = new ArrayList<>();
        String query = "SELECT rd.race_id AS raceId, rd.driver_id AS driverId, " +
                "rd.position_number AS position, rd.race_points AS points " +
                "FROM race_data rd " +
                "JOIN race r ON rd.race_id = r.id " +
                "WHERE rd.driver_id = ? AND rd.type = 'RACE_RESULT' " +
                "ORDER BY r.date DESC LIMIT 50";
        try (Connection c = DataBaseManager.connect();
                PreparedStatement ps = c.prepareStatement(query)) {
            ps.setString(1, driverId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    resultsList.add(map(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return resultsList;
    }

    public List<RaceResult> findByRaceId(int raceId) {
        List<RaceResult> resultsList = new ArrayList<>();
        String query = "SELECT rd.race_id AS raceId, rd.driver_id AS driverId, " +
                "rd.position_number AS position, rd.race_points AS points " +
                "FROM race_data rd " +
                "WHERE rd.race_id = ? AND rd.type = 'RACE_RESULT' " +
                "ORDER BY rd.position_display_order ASC";
        try (Connection c = DataBaseManager.connect();
                PreparedStatement ps = c.prepareStatement(query)) {
            ps.setInt(1, raceId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    resultsList.add(map(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return resultsList;
    }

    private RaceResult map(ResultSet rs) throws SQLException {
        int pos = rs.getInt("position");
        int points = rs.getInt("points");
        RaceResult res = new RaceResult(
                -1,
                rs.getInt("raceId"),
                pos,
                0,
                points);
        res.setDriverStrId(rs.getString("driverId"));
        return res;
    }
}
