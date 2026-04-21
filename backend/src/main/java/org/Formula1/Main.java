package org.Formula1;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.Formula1.db.DataBaseManager;
import java.sql.*;
@SpringBootApplication
@EnableCaching
public class Main {
    public static void main(String[] args) {
        try (Connection c = DataBaseManager.connect();
             Statement s = c.createStatement()) {

            ResultSet rs = s.executeQuery("SELECT COUNT(*) FROM driver");
            if (rs.next()) {
                System.out.println("[DB] Connected — driver count: " + rs.getInt(1));
            }

            ResultSet rs2 = s.executeQuery("SELECT COUNT(*) FROM race_data");
            if (rs2.next()) {
                System.out.println("[DB] race_data rows: " + rs2.getInt(1));
            }

        } catch (Exception e) {
            System.err.println("[DB] Diagnostic failed: " + e.getMessage());
        }
        SpringApplication.run(Main.class, args);
    }
}