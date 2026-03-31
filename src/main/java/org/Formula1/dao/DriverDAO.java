package org.Formula1.dao;

import org.Formula1.db.DataBaseManager;
import org.Formula1.models.Driver;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;



public class DriverDAO {
    public List<Driver> findAll() {
        List<Driver> drivers = new ArrayList<>();
        String query = "SELECT * FROM driver";
        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(query);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Driver d = new Driver(
                        rs.getString("name"),
                        rs.getString("team"),
                        rs.getInt("id"),
                        rs.getInt("carNumber"),
                        rs.getString("nationality")
                );
                d.setPoints(rs.getInt("points"));
                drivers.add(d);
            }
            } catch(SQLException e){
                e.printStackTrace();
            }return drivers;

            }

    public List<Driver> findByName(String name) {
        List<Driver> drivers = new ArrayList<>();
        String query = "SELECT * FROM driver WHERE name LIKE ?";
        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(query)) {
            ps.setString(1, "%" + name + "%");
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Driver d = new Driver(
                            rs.getString("name"),
                            rs.getString("team"),
                            rs.getInt("id"),
                            rs.getInt("carNumber"),
                            rs.getString("nationality")
                    );
                    d.setPoints(rs.getInt("points"));
                    drivers.add(d);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return drivers;
    }

    public List<Driver> findByNationality(String nationality) {
        List<Driver> drivers = new ArrayList<>();
        String query = "SELECT * FROM driver WHERE nationality LIKE ?";
        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(query)) {
            ps.setString(1, "%" + nationality + "%");
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Driver d = new Driver(
                            rs.getString("name"),
                            rs.getString("team"),
                            rs.getInt("id"),
                            rs.getInt("carNumber"),
                            rs.getString("nationality")
                    );
                    d.setPoints(rs.getInt("points"));
                    drivers.add(d);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return drivers;
    }

    public List<Driver> findByTeam(String team) {
        List<Driver> drivers = new ArrayList<>();
        String query = "SELECT * FROM driver WHERE team LIKE ?";
        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(query)) {
            ps.setString(1, "%" + team + "%");
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Driver d = new Driver(
                            rs.getString("name"),
                            rs.getString("team"),
                            rs.getInt("id"),
                            rs.getInt("carNumber"),
                            rs.getString("nationality")
                    );
                    d.setPoints(rs.getInt("points"));
                    drivers.add(d);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return drivers;
    }

    public Driver findById(int id){
        String query = "SELECT * FROM driver WHERE id = ?";
        Driver driver = null;
        try (Connection c = DataBaseManager.connect();
        PreparedStatement ps = c.prepareStatement(query)) {
           ps.setInt(1, id);
           try (ResultSet rs = ps.executeQuery()){
               if (rs.next()){
                   driver = new Driver(
                           rs.getString("name"),
                           rs.getString("team"),
                           rs.getInt("id"),
                           rs.getInt("carNumber"),
                           rs.getString("nationality")
                   );
                   driver.setPoints(rs.getInt("points"));
               }
           }
            }catch (SQLException e){
            e.printStackTrace();
        }return driver;
        }

/* 
    public void update(Driver driver){
        String query = "UPDATE driver SET name = ?, team = ?, nationality = ?, carNumber = ? WHERE id = ?";
        try  (Connection c = DataBaseManager.connect();
              PreparedStatement ps =c.prepareStatement(query)){
            ps.setString(1, driver.getName());
            ps.setString(2, driver.getTeam());
            ps.setString(3, driver.getNationality());
            ps.setInt(4, driver.getCarNumber());
            ps.setInt(5, driver.getId());
            ps.executeUpdate();
            System.out.println("Driver " + driver.getName() + " updated successfully!");

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
    public void delete(int id){
        String query = "DELETE FROM driver WHERE id = ?";
        try  (Connection c = DataBaseManager.connect();
              PreparedStatement ps =c.prepareStatement(query)){
            ps.setInt(1, id);
            ps.executeUpdate();
            System.out.println("Driver with ID " + id + " has been deleted.");

        } catch (SQLException e) {
            e.printStackTrace();
        }

    }*/
}
