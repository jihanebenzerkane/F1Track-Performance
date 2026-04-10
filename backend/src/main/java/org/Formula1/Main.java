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
            ResultSet rs = s.executeQuery("SELECT name FROM sqlite_master WHERE type='table'");
            System.out.println("=== Database Tables found ===");
            while(rs.next()) System.out.println("- " + rs.getString(1));
            
            ResultSet rs2 = s.executeQuery("SELECT COUNT(*) FROM drivers");
            if(rs2.next()) System.out.println("Driver count: " + rs2.getInt(1));
        } catch (Exception e) {
            System.err.println("Startup DB Diagnostic failed: " + e.getMessage());
        }
        SpringApplication.run(Main.class, args);
    }
}