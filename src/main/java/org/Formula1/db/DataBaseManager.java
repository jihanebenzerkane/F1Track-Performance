package org.Formula1.db;

import java.io.File;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class DataBaseManager {
    private static String databasePath = "f1db.db";

    static {
        // Robust discovery: check current dir, then parent dir
        File dbFile = new File(databasePath);
        if (!dbFile.exists()) {
            File parentDirDb = new File("../" + databasePath);
            if (parentDirDb.exists()) {
                databasePath = parentDirDb.getAbsolutePath();
            }
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
