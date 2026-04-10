package org.Formula1.dao;
import org.Formula1.db.DataBaseManager;
import org.Formula1.models.Driver;
import org.springframework.stereotype.Repository;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class DriverDAO {
    private final String BASE_QUERY =
            "SELECT d.id as driverId, d.first_name as forename, d.last_name as surname, d.nationality_country_id as nationality, d.permanent_number as number, " +
            "(SELECT c.name FROM race_data r " +
            " JOIN constructor c ON r.constructor_id = c.id " +
            " WHERE r.driver_id = d.id AND r.type = 'RACE_RESULT' ORDER BY r.race_id DESC LIMIT 1) AS team_name " +
            "FROM driver d";

    private final String ORDER_LIMIT = " ORDER BY d.last_name ASC LIMIT 100";

    public Driver findById(String id) {
        String query = BASE_QUERY + " WHERE d.id = ? OR d.permanent_number = ? LIMIT 1";
        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(query)) {
            ps.setString(1, id);
            ps.setString(2, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return map(rs);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return null;
    }

    public List<Driver> findAll() {
        List<Driver> drivers = new ArrayList<>();
        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(BASE_QUERY + ORDER_LIMIT);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) drivers.add(map(rs));
        } catch(SQLException e) { e.printStackTrace(); }
        return drivers;
    }

    public List<Driver> findByTeam(String team) {
        String query = BASE_QUERY + " WHERE d.id IN (" +
                       "SELECT res.driver_id FROM race_data res " +
                       "JOIN constructor c ON res.constructor_id = c.id " +
                       "WHERE (c.name LIKE ? OR c.id LIKE ?) AND res.type='RACE_RESULT')" + ORDER_LIMIT;
        List<Driver> results = new ArrayList<>();
        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(query)) {
            ps.setString(1, "%" + team + "%");
            ps.setString(2, "%" + team + "%");
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) results.add(map(rs));
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return results;
    }

    public List<Driver> findByNationality(String nat) {
        return findByFilter("d.nationality_country_id LIKE ?", "%" + nat + "%");
    }

    public List<Driver> findBySeason(int year) {
        String query =
            "SELECT DISTINCT d.id as driverId, d.first_name as forename, d.last_name as surname, d.nationality_country_id as nationality, d.permanent_number as number, " +
            "(SELECT c.name FROM race_data r2 " +
            " JOIN race ra2 ON r2.race_id = ra2.id " +
            " JOIN constructor c ON r2.constructor_id = c.id " +
            " WHERE r2.driver_id = d.id AND ra2.year = ? AND r2.type = 'RACE_RESULT' " +
            " ORDER BY ra2.date DESC LIMIT 1) AS team_name " +
            "FROM driver d " +
            "WHERE d.id IN (" +
            "   SELECT DISTINCT res.driver_id FROM race_data res " +
            "   JOIN race ra ON res.race_id = ra.id " +
            "   WHERE ra.year = ? AND res.type = 'RACE_RESULT'" +
            ") ORDER BY d.last_name ASC";
        List<Driver> drivers = new ArrayList<>();
        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(query)) {
            ps.setInt(1, year);
            ps.setInt(2, year);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) drivers.add(map(rs));
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return drivers;
    }

    public List<Driver> findByName(String name) {
        return findByFilter("d.last_name LIKE ? OR d.first_name LIKE ?", "%" + name + "%");
    }

    private List<Driver> findByFilter(String where, String param) {
        List<Driver> drivers = new ArrayList<>();
        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(BASE_QUERY + " WHERE " + where + ORDER_LIMIT)) {
            ps.setString(1, param);
            if (where.contains("OR")) ps.setString(2, param);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) drivers.add(map(rs));
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return drivers;
    }

    private Driver map(ResultSet rs) throws SQLException {
        String team = rs.getString("team_name");
        return new Driver(
                rs.getString("forename") + " " + rs.getString("surname"),
                team != null ? team : "Retired",
                rs.getString("driverId"),
                rs.getString("number"),
                rs.getString("nationality")
        );
    }
}