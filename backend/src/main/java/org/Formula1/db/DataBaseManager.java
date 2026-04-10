package org.Formula1.db;

import java.io.File;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class DataBaseManager {
    private static String databasePath;

    static {
        // Search for f1db.db in multiple candidate locations
        String[] candidates = {
            "f1db.db",                    // current working directory
            "../f1db.db",                 // parent directory
            "backend/f1db.db",            // from project root
            System.getProperty("user.dir") + "/f1db.db",
            System.getProperty("user.dir") + "/../f1db.db",
        };

        databasePath = "f1db.db"; // fallback
        for (String path : candidates) {
            File f = new File(path);
            if (f.exists() && f.length() > 1000000) { // Must be > 1MB (the real DB is 73MB)
                databasePath = f.getAbsolutePath();
                System.out.println("[DB] Found f1db.db at: " + databasePath + " (" + (f.length() / 1024 / 1024) + " MB)");
                break;
            }
        }
        
        if (!new File(databasePath).exists() || new File(databasePath).length() < 1000000) {
            System.err.println("[DB] WARNING: f1db.db NOT FOUND or is empty! Working dir: " + System.getProperty("user.dir"));
        }
    }

    public static Connection connect() throws SQLException {
        try {
            Class.forName("org.sqlite.JDBC");
        } catch (ClassNotFoundException e) {
            System.err.println("Driver not found: " + e.getMessage());
        }
        return DriverManager.getConnection("jdbc:sqlite:" + databasePath);
    }
    
    public static boolean verifyData() {
        try (Connection conn = connect();
                Statement stmt = conn.createStatement();
                var rs = stmt.executeQuery("SELECT COUNT(*) FROM drivers")) {
            if (rs.next()) {
                return rs.getInt(1) > 0;
            }
        } catch (SQLException e) {
            System.err.println("Database connectivity error: " + e.getMessage());
        }
        return false;
    }
}

