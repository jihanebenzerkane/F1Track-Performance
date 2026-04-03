package org.Formula1.db;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
public class DataBaseManager {
    private static final String URL = "jdbc:sqlite:f1db.db";
    public static Connection connect() throws SQLException {
        try {
            Class.forName("org.sqlite.JDBC");
        } catch (ClassNotFoundException e) {
            System.err.println("Driver not found: " + e.getMessage());
        }
        return DriverManager.getConnection(URL);
    }
    public static void createTables() {
        try (Connection conn = connect();
             Statement stmt = conn.createStatement()) {
            stmt.execute("PRAGMA foreign_keys=ON");
            System.out.println("Connection successful to f1db.db");
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}