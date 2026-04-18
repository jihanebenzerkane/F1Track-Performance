package org.Formula1.db;

import java.io.File;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class DataBaseManager {

    private static final String JDBC_SQLITE = "jdbc:sqlite:";
    private static String databasePath;

    static {
        String override = System.getProperty("f1track.db");
        if (override != null && !override.isBlank()) {
            databasePath = new File(override.trim()).getAbsolutePath();
        } else {
            databasePath = resolveDefaultDbPath();
        }
    }

    private static String resolveDefaultDbPath() {
        String[] candidates = {
                "f1db.db",
                "backend/f1db.db",
                "../f1db.db",
                "../backend/f1db.db",
        };
        for (String rel : candidates) {
            File f = new File(rel);
            if (f.exists() && f.isFile()) {
                return f.getAbsolutePath();
            }
        }
        return new File("f1db.db").getAbsolutePath();
    }

    public static Connection connect() throws SQLException {
        try {
            Class.forName("org.sqlite.JDBC");
        } catch (ClassNotFoundException e) {
            System.err.println("SQLite JDBC driver not on classpath: " + e.getMessage());
        }
        return DriverManager.getConnection(JDBC_SQLITE + databasePath);
    }

    public static boolean verifyData() {
        try (Connection conn = connect();
             Statement stmt = conn.createStatement();
             var rs = stmt.executeQuery("SELECT COUNT(*) FROM driver")) {
            if (rs.next()) {
                return rs.getInt(1) > 0;
            }
        } catch (SQLException e) {
            System.err.println("Database connectivity error: " + e.getMessage());
        }
        return false;
    }
}
