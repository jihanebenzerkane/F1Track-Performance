package org.Formula1.utils;

import org.Formula1.db.DataBaseManager;
import java.sql.*;

public class DbCheck {
    public static void main(String[] args) throws Exception {
        Connection c = DataBaseManager.connect();
        Statement stmt = c.createStatement();

        System.out.println("=== LAP TIME columns ===");
        ResultSet rs1 = stmt.executeQuery("PRAGMA table_info(lap_time)");
        while (rs1.next()) {
            System.out.println(rs1.getString("name") + " — " + rs1.getString("type"));
        }

        System.out.println("\n=== PIT STOP columns ===");
        ResultSet rs2 = stmt.executeQuery("PRAGMA table_info(pit_stop)");
        while (rs2.next()) {
            System.out.println(rs2.getString("name") + " — " + rs2.getString("type"));
        }

        System.out.println("\n=== RACE_DATA columns ===");
        ResultSet rs3 = stmt.executeQuery("PRAGMA table_info(race_data)");
        while (rs3.next()) {
            System.out.println(rs3.getString("name") + " — " + rs3.getString("type"));
        }
        ResultSet rs = stmt.executeQuery(
                "SELECT id, name, country_id FROM circuit " +
                        "WHERE id LIKE '%monaco%' OR id LIKE '%silverstone%' " +
                        "OR id LIKE '%monza%' OR id LIKE '%spa%' LIMIT 10"
        );
        while (rs.next()) {
            System.out.println(rs.getString("id") + " — " + rs.getString("name"));
        }

        System.out.println("\n=== ALL TABLES ===");
        ResultSet rs4 = stmt.executeQuery(
                "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
        );
        while (rs4.next()) {
            System.out.println(rs4.getString("name"));
        }

        c.close();
    }
}