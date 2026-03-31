package org.Formula1.dao;

import org.Formula1.db.DataBaseManager;
import org.Formula1.models.Race;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;



public class RaceDAO {
    public List<Race> findByName(String name) {
        List<Race> races = new ArrayList<>();
        String query = "SELECT * FROM race WHERE grandPrix LIKE ?";
        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(query)) {
            ps.setString(1, "%" + name + "%");
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Race r = new Race(rs.getInt("id"),
                            rs.getDate("raceDate"),
                            rs.getString("grandPrix"),
                            rs.getInt("season"),
                            rs.getString("country"),
                            rs.getString("circuit")
                    );
                    races.add(r);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return races;
    }

    public List<Race> findBySeason(int season) {
        List<Race> races = new ArrayList<>();
        String query = "SELECT * FROM race WHERE season = ?";
        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(query)) {
            ps.setInt(1, season);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Race r = new Race(rs.getInt("id"),
                            rs.getDate("raceDate"),
                            rs.getString("grandPrix"),
                            rs.getInt("season"),
                            rs.getString("country"),
                            rs.getString("circuit")
                    );
                    races.add(r);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return races;
    }

    public List<Race> findAll() {
        List<Race> races = new ArrayList<>();
        String query = "SELECT * FROM race";
        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(query);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Race d = new Race(rs.getInt("id"),
                        rs.getDate("raceDate"),
                        rs.getString("grandPrix"),
                        rs.getInt("season"),
                        rs.getString("country"),
                        rs.getString("circuit")
                );
                races.add(d);
            }
        } catch(SQLException e){
            e.printStackTrace();
        }return races;
    }

    public Race findById(int id){
        String query = "SELECT * FROM race WHERE id = ?";
        Race race = null;
        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(query)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()){
                if (rs.next()){
                    race = new Race(
                            rs.getInt("id"),
                            rs.getDate("raceDate"),
                            rs.getString("grandPrix"),
                            rs.getInt("season"),
                            rs.getString("country"),
                            rs.getString("circuit")
                    );
                }
            }
        }catch (SQLException e){
            e.printStackTrace();
        }return race;
    }
}
