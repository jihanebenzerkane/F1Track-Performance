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
        String query = "SELECT MAX(r.year) FROM driverStandings ds JOIN races r ON ds.raceId = r.raceId WHERE ds.points > 0";
        try (Connection c = DataBaseManager.connect();
                PreparedStatement ps = c.prepareStatement(query);
                ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                int year = rs.getInt(1);
                return year > 0 ? year : 2023;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 2023;
    }

    public int getTotalPointsByDriver(String driverId) {
        int latestYear = getLatestSeasonYear();
        String query = "SELECT ds.points FROM driverStandings ds " +
                "JOIN races r ON ds.raceId = r.raceId " +
                "WHERE ds.driverId = (SELECT d.driverId FROM drivers d WHERE d.driverId = ? OR d.number = ?) " +
                "AND r.year = ? ORDER BY r.round DESC LIMIT 1";
        try (Connection c = DataBaseManager.connect();
                PreparedStatement ps = c.prepareStatement(query)) {
            ps.setString(1, driverId);
            ps.setString(2, driverId);
            ps.setInt(3, latestYear);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next())
                    return rs.getInt("points");
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0;
    }

    public List<RaceResult> findByDriverAndSeason(String driverId, int year) {
        List<RaceResult> resultsList = new ArrayList<>();
        String query = "SELECT res.raceId, res.driverId, res.position, res.points " +
                "FROM results res " +
                "JOIN races r ON res.raceId = r.raceId " +
                "WHERE res.driverId = ? AND r.year = ? ORDER BY r.date ASC";
        try (Connection c = DataBaseManager.connect();
                PreparedStatement ps = c.prepareStatement(query)) {
            ps.setString(1, driverId);
            ps.setInt(2, year);
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
        String query = "SELECT res.raceId, res.driverId, res.position, res.points " +
                "FROM results res " +
                "WHERE res.driverId = ? ORDER BY res.raceId DESC LIMIT 50";
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
        String query = "SELECT res.raceId, res.driverId, res.position, res.points " +
                "FROM results res " +
                "WHERE res.raceId = ? ORDER BY res.positionOrder ASC";
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
