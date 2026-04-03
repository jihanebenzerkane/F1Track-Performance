package org.Formula1.dao;
import org.Formula1.db.DataBaseManager;
import org.Formula1.models.Driver;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
public class DriverDAO {
    private final String BASE_QUERY =
            "SELECT DISTINCT d.rowid AS db_id, d.id AS str_id, d.first_name, d.last_name, d.nationality_country_id AS nationality, d.permanent_number, " +
                    "(SELECT c.name FROM constructor c " +
                    " JOIN race_data rd ON rd.constructor_id = c.id " +
                    " WHERE rd.driver_id = d.id ORDER BY rd.race_id DESC LIMIT 1) AS team_name " +
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
                   "SELECT rd.driver_id FROM race_data rd " +
                   "JOIN constructor c ON rd.constructor_id = c.id " +
                   "WHERE c.name LIKE ? COLLATE NOCASE OR c.id LIKE ? COLLATE NOCASE)" + ORDER_LIMIT;
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

    public List<Driver> findBySeason(int year) {
    String query = BASE_QUERY +
        " WHERE d.id IN (" +
        "   SELECT DISTINCT rd.driver_id FROM race_data rd " +
        "   JOIN race r ON rd.race_id = r.id " +
        "   WHERE r.year = ?" +
        ") ORDER BY d.last_name ASC";
    List<Driver> drivers = new ArrayList<>();
    try (Connection c = DataBaseManager.connect();
         PreparedStatement ps = c.prepareStatement(query)) {
        ps.setInt(1, year);
        try (ResultSet rs = ps.executeQuery()) {
            while (rs.next()) drivers.add(map(rs));
        }
    } catch (SQLException e) { e.printStackTrace(); }
    return drivers;
}

    public List<Driver> findByName(String name) {
        return findByFilter("d.last_name LIKE ? OR d.first_name LIKE ?", "%" + name + "%");
    }
    public List<Driver> findByNationality(String nat) {
        return findByFilter("d.nationality_country_id LIKE ?", "%" + nat + "%");
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
        if (team == null) team = "Retired/None";
        return new Driver(
                rs.getString("first_name") + " " + rs.getString("last_name"),
                team, rs.getString("str_id"),
                rs.getString("permanent_number"), rs.getString("nationality")
        );
    }
}