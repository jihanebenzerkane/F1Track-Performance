package org.Formula1.dao;

import org.Formula1.db.DataBaseManager;
import org.Formula1.models.Driver;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import static java.lang.reflect.Array.setInt;


public class DriverDAO {
    public void insert(Driver driver){

        try  (Connection c = DataBaseManager.connect();
            PreparedStatement ps =c.prepareStatement(
                    "INSERT INTO driver (name, team, nationality, carNumber) VALUES(?,?,?,?)",
                    PreparedStatement.RETURN_GENERATED_KEYS)){
            ps.setString(1, driver.getName());
            ps.setString(2, driver.getTeam());
            ps.setString(3, driver.getNationality());
            ps.setInt(4, driver.getCarNumber());
            ps.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }


    }
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
                        rs.getInt("car_number"),
                        rs.getString("nationality")
                );
                d.setPoints(rs.getInt("points"));
                drivers.add(d);
            }
            } catch(SQLException e){
                e.printStackTrace();
            }return drivers;
            }

    public Driver findById(int id){

    }
    public void update(Driver driver){

    }
    public void delete(int id){

    }
}
