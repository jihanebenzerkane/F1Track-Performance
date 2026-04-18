package org.Formula1.dao;

import org.Formula1.db.DataBaseManager;
import org.Formula1.models.Race;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public class RaceDAO {
    private final String BASE_QUERY = "SELECT r.id, r.date AS raceDate, gp.name AS grandPrix, " +
            "r.year AS season, r.round AS round, c.name AS circuit, r.circuit_id AS circuitSlug " +
            "FROM race r " +
            "LEFT JOIN grand_prix gp ON r.grand_prix_id = gp.id " +
            "LEFT JOIN circuit c ON r.circuit_id = c.id ";

    public List<Race> findAll() {
        List<Race> races = new ArrayList<>();
        try (Connection c = DataBaseManager.connect();
                PreparedStatement ps = c.prepareStatement(
                        BASE_QUERY + " ORDER BY r.year DESC, r.date DESC LIMIT 50");
                ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                races.add(map(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return races;
    }

    public List<Race> findByName(String name) {
        List<Race> races = new ArrayList<>();
        try (Connection c = DataBaseManager.connect();
                PreparedStatement ps = c.prepareStatement(
                        BASE_QUERY + " WHERE gp.name LIKE ? ORDER BY r.year DESC, r.date DESC LIMIT 100")) {
            ps.setString(1, "%" + name + "%");
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    races.add(map(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return races;
    }

    public List<Race> findBySeason(int season) {
        List<Race> races = new ArrayList<>();
        try (Connection c = DataBaseManager.connect();
                PreparedStatement ps = c.prepareStatement(
                        BASE_QUERY + " WHERE r.year = ? ORDER BY r.round ASC")) {
            ps.setInt(1, season);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    races.add(map(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return races;
    }

    public Race findById(int id) {
        Race race = null;
        try (Connection c = DataBaseManager.connect();
                PreparedStatement ps = c.prepareStatement(BASE_QUERY + " WHERE r.id = ?")) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    race = map(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return race;
    }

    public List<java.util.Map<String, Object>> findAllCircuits() {
        List<java.util.Map<String, Object>> circuits = new ArrayList<>();
        String query = "SELECT DISTINCT id, name, country_id AS countryId FROM circuit ORDER BY name ASC";
        try (Connection c = DataBaseManager.connect();
                PreparedStatement ps = c.prepareStatement(query);
                ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                java.util.Map<String, Object> circuit = new java.util.HashMap<>();
                circuit.put("id", rs.getString("id"));
                circuit.put("name", rs.getString("name"));
                circuit.put("countryId", rs.getString("countryId"));
                circuits.add(circuit);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return circuits;
    }

    private Race map(ResultSet rs) throws SQLException {
        return new Race(
                rs.getInt("id"),
                rs.getString("raceDate"),
                rs.getString("grandPrix"),
                rs.getInt("season"),
                rs.getInt("round"),
                null,
                rs.getString("circuit"),
                rs.getString("circuitSlug"));
    }
}