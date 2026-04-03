package org.Formula1.dao;

import org.Formula1.db.DataBaseManager;
import org.Formula1.models.RaceResult;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class RaceResultDAO {
    public int getLatestSeasonYear() {
        String query = "SELECT MAX(year) FROM season_driver_standing WHERE points_overall > 0";
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

    public int getTotalPointsByDriver(String driverId) {
        int latestYear = getLatestSeasonYear();
        String query = "SELECT points_overall FROM season_driver_standing WHERE driver_id = ? AND year = ?";
        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(query)) {
            ps.setString(1, driverId);
            ps.setInt(2, latestYear);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getInt("points_overall");
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return 0;
    }

    public List<RaceResult> findByDriverAndSeason(String driverId, int year) {
        List<RaceResult> results = new ArrayList<>();
        String query = "SELECT rd.race_id, rd.driver_id, rd.position_number, rs.points " +
                       "FROM race_data rd " +
                       "JOIN race r ON rd.race_id = r.id " +
                       "LEFT JOIN race_driver_standing rs ON rd.race_id = rs.race_id AND rd.driver_id = rs.driver_id " +
                       "WHERE rd.driver_id = ? AND r.year = ? ORDER BY r.date ASC";
        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(query)) {
            ps.setString(1, driverId);
            ps.setInt(2, year);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    results.add(map(rs));
                }
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return results;
    }

    public List<RaceResult> findByDriverId(String driverId) {
        List<RaceResult> results = new ArrayList<>();
        String query = "SELECT rd.race_id, rd.driver_id, rd.position_number, rs.points " +
                       "FROM race_data rd " +
                       "LEFT JOIN race_driver_standing rs ON rd.race_id = rs.race_id AND rd.driver_id = rs.driver_id " +
                       "WHERE rd.driver_id = ? ORDER BY rd.race_id DESC LIMIT 50";
        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(query)) {
            ps.setString(1, driverId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    results.add(map(rs));
                }
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return results;
    }

    public List<RaceResult> findByRaceId(int raceId) {
        List<RaceResult> results = new ArrayList<>();
        String query = "SELECT rd.race_id, rd.driver_id, rd.position_number, rs.points " +
                       "FROM race_data rd " +
                       "LEFT JOIN race_driver_standing rs ON rd.race_id = rs.race_id AND rd.driver_id = rs.driver_id " +
                       "WHERE rd.race_id = ? ORDER BY rd.position_display_order ASC";
        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(query)) {
            ps.setInt(1, raceId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    results.add(map(rs));
                }
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return results;
    }

    private RaceResult map(ResultSet rs) throws SQLException {
        int pos = rs.getInt("position_number");
        int points = rs.getInt("points");
        RaceResult res = new RaceResult(
                -1,
                rs.getInt("race_id"),
                pos,
                0,
                points
        );
        res.setDriverStrId(rs.getString("driver_id"));
        return res;
    }
}
