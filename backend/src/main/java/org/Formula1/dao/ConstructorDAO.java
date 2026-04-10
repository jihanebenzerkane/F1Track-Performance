package org.Formula1.dao;
import org.Formula1.db.DataBaseManager;
import org.Formula1.models.Constructor;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
public class ConstructorDAO {
    public List<Constructor> findAll() {
        List<Constructor> constructors = new ArrayList<>();
        String query = "SELECT id, name, country_id FROM constructor LIMIT 100";
        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(query);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Constructor constructor = new Constructor(
                        rs.getString("id"),
                        rs.getString("name"),
                        rs.getString("country_id")
                );
                constructors.add(constructor);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return constructors;
    }
    public Constructor findById(String id) {
        String query = "SELECT id, name, country_id FROM constructor WHERE id = ?";
        Constructor constructor = null;
        try (Connection c = DataBaseManager.connect();
             PreparedStatement ps = c.prepareStatement(query)) {
            ps.setString(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    constructor = new Constructor(
                            rs.getString("id"),
                            rs.getString("name"),
                            rs.getString("country_id")
                    );
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return constructor;
    }
}